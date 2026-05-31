from dataclasses import dataclass, field
import re


@dataclass
class ChangedLine:
    kind: str
    content: str
    new_line: int | None
    hunk: str


@dataclass
class ChangedFile:
    path: str
    status: str = "modified"
    additions: int = 0
    deletions: int = 0
    hunks: list[str] = field(default_factory=list)
    lines: list[ChangedLine] = field(default_factory=list)


HUNK_RE = re.compile(r"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")


def parse_diff(diff_text: str) -> list[ChangedFile]:
    files: list[ChangedFile] = []
    current: ChangedFile | None = None
    current_hunk = ""
    new_line = None

    for raw_line in diff_text.splitlines():
        file_match = re.match(r"^diff --git a/(.+?) b/(.+)$", raw_line)
        if file_match:
            current = ChangedFile(path=file_match.group(2))
            files.append(current)
            current_hunk = ""
            new_line = None
            continue

        if current is None:
            continue

        if raw_line.startswith("new file mode"):
            current.status = "added"
            continue

        if raw_line.startswith("deleted file mode"):
            current.status = "deleted"
            continue

        if raw_line.startswith("rename to "):
            current.status = "renamed"
            current.path = raw_line.removeprefix("rename to ").strip()
            continue

        if raw_line.startswith("@@"):
            current_hunk = raw_line
            current.hunks.append(raw_line)
            hunk_match = HUNK_RE.match(raw_line)
            new_line = int(hunk_match.group(1)) if hunk_match else None
            continue

        if raw_line.startswith("+++") or raw_line.startswith("---"):
            continue

        if raw_line.startswith("+"):
            current.additions += 1
            current.lines.append(ChangedLine("add", raw_line[1:], new_line, current_hunk))
            if new_line is not None:
                new_line += 1
            continue

        if raw_line.startswith("-"):
            current.deletions += 1
            current.lines.append(ChangedLine("delete", raw_line[1:], None, current_hunk))
            continue

        if raw_line.startswith(" ") and new_line is not None:
            new_line += 1

    return files


SOURCE_EXTENSIONS = (
    ".ts", ".tsx", ".js", ".jsx", ".vue", ".py", ".java", ".go", ".rs",
    ".php", ".rb", ".cs", ".cpp", ".c", ".kt", ".swift",
)
PRIORITY_KEYWORDS = (
    "router", "store", "context", "provider", "api", "service", "auth",
    "permission", "controller", "middleware", "login", "token", "session",
    "payment", "order", "billing",
)
LOW_VALUE_PARTS = ("dist/", "build/", "coverage/", "public/", "assets/", "static/")
STATIC_EXTENSIONS = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".mp4", ".woff", ".woff2")
LOCK_FILENAMES = ("package-lock.json", "yarn.lock", "pnpm-lock.yaml")


def build_evidence(files: list[ChangedFile], max_lines=80) -> tuple[list[dict], bool]:
    evidence = []
    truncated = False
    ordered_files = risk_ranked_files(files)
    for file in ordered_files:
        for line in file.lines:
            if line.kind != "add":
                continue
            text = line.content.strip()
            if not text:
                continue
            signals = detect_signals(file.path, text)
            if is_lock_file(file.path) and set(signals) <= {"lockfile-file"}:
                continue
            evidence.append({
                "file": file.path,
                "line": line.new_line,
                "hunk": line.hunk,
                "code": text[:240],
                "signals": signals,
            })
            if len(evidence) >= max_lines:
                truncated = True
                return evidence, truncated
    return evidence, truncated


def priority_files(files: list[ChangedFile]) -> list[ChangedFile]:
    return risk_ranked_files(files)


def risk_ranked_files(files: list[ChangedFile]) -> list[ChangedFile]:
    return sorted(files, key=lambda file: (-risk_score(file), file.path))


def summarize_files(files: list[ChangedFile]) -> list[dict]:
    return [{
        "filename": file.path,
        "path": file.path,
        "status": file.status,
        "additions": file.additions,
        "deletions": file.deletions,
        "hunks": len(file.hunks),
        "category": classify_file(file.path),
        "isLockFile": is_lock_file(file.path),
        "risk_score": risk_score(file),
        "risk_reasons": risk_reasons(file),
        "priority": risk_score(file),
    } for file in files]


def summarize_priority_files(files: list[ChangedFile], limit=8) -> list[dict]:
    selected = []
    for file in risk_ranked_files(files):
        score = risk_score(file)
        if score <= 0:
            continue
        selected.append({
            "filename": file.path,
            "status": file.status,
            "additions": file.additions,
            "deletions": file.deletions,
            "category": classify_file(file.path),
            "risk_score": score,
            "risk_reasons": risk_reasons(file),
            "priority": score,
            "reason": "；".join(risk_reasons(file)) or "普通变更文件",
        })
        if len(selected) >= limit:
            break
    return selected


def classify_file(path: str) -> str:
    lowered = path.lower()
    if is_lock_file(path):
        return "lockfile"
    if re.search(r"auth|login|token|session|permission|acl|role", lowered):
        return "auth"
    if re.search(r"pay|payment|order|billing|charge|refund", lowered):
        return "payment"
    if re.search(r"sql|migration|schema|repository|dao|model", lowered):
        return "data"
    if re.search(r"test|spec|__tests__", lowered):
        return "test"
    if re.search(r"config|env|secret|credential", lowered):
        return "config"
    if re.search(r"\.(tsx|jsx|vue|css|html)$", lowered):
        return "frontend"
    return "general"


def priority_score(file: ChangedFile) -> int:
    return risk_score(file)


def risk_score(file: ChangedFile) -> int:
    path = file.path.replace("\\", "/")
    lowered = path.lower()
    score = 8
    if lowered.startswith(("src/", "app/", "server/", "backend/", "frontend/")):
        score += 16
    if lowered.endswith(SOURCE_EXTENSIONS):
        score += 28
    if any(keyword in lowered for keyword in PRIORITY_KEYWORDS):
        score += 22
    if classify_file(path) in {"auth", "payment", "data", "config", "frontend"}:
        score += 12
    changed = file.additions + file.deletions
    if changed >= 200:
        score += 22
    elif changed >= 80:
        score += 16
    elif changed >= 20:
        score += 10
    elif changed > 0:
        score += 4
    if file.status in {"deleted", "removed"}:
        score += 14
    elif file.status == "renamed":
        score += 10
    if is_test_file(path):
        score -= 12
    if is_lock_file(path):
        score -= 60
    if is_static_asset(path):
        score -= 50
    if is_generated_path(path):
        score -= 35
    return max(0, min(100, score))


def risk_reasons(file: ChangedFile) -> list[str]:
    reasons = []
    path = file.path.replace("\\", "/")
    lowered = path.lower()
    changed = file.additions + file.deletions
    if lowered.startswith(("src/", "app/", "server/", "backend/", "frontend/")):
        reasons.append("位于核心代码目录")
    if lowered.endswith(SOURCE_EXTENSIONS):
        reasons.append("源代码文件")
    matched = [keyword for keyword in PRIORITY_KEYWORDS if keyword in lowered]
    if matched:
        reasons.append("命中关键路径：" + "、".join(matched[:4]))
    if changed >= 20:
        reasons.append(f"变更规模较大：{changed} 行")
    elif changed > 0:
        reasons.append(f"存在 {changed} 行变更")
    if file.status in {"deleted", "removed"}:
        reasons.append("删除文件需要确认引用同步")
    elif file.status == "renamed":
        reasons.append("重命名文件需要确认引用同步")
    if is_test_file(path):
        reasons.append("测试文件适当降权")
    if is_lock_file(path):
        reasons.append("lock 文件默认不作为主要 Review 对象")
    if is_static_asset(path) or is_generated_path(path):
        reasons.append("构建产物或静态资源降权")
    return reasons


def priority_reason(file: ChangedFile) -> str:
    return "；".join(risk_reasons(file)) or "普通变更文件"


def build_selected_context(files: list[ChangedFile], max_chars=18000) -> tuple[list[dict], bool]:
    selected = []
    used_chars = 0
    truncated = False
    for file in risk_ranked_files(files):
        score = risk_score(file)
        deep = score >= 35 and not should_skip_deep_review(file.path)
        char_budget = 2600 if score >= 70 else 1600 if score >= 50 else 700
        patch = patch_excerpt(file, char_budget) if deep else ""
        entry = {
            "file": file.path,
            "status": file.status,
            "additions": file.additions,
            "deletions": file.deletions,
            "risk_score": score,
            "risk_reasons": risk_reasons(file),
            "mode": "deep" if deep else "summary",
            "summary": f"{file.status}，+{file.additions}/-{file.deletions}，{len(file.hunks)} 个 hunk",
        }
        if patch:
            if used_chars + len(patch) > max_chars:
                truncated = True
                entry["mode"] = "summary"
            else:
                entry["patch"] = patch
                used_chars += len(patch)
        selected.append(entry)
    return selected, truncated


def patch_excerpt(file: ChangedFile, max_chars: int) -> str:
    lines = []
    current_hunk = None
    for line in file.lines:
        if line.hunk and line.hunk != current_hunk:
            current_hunk = line.hunk
            lines.append(current_hunk)
        prefix = "+" if line.kind == "add" else "-"
        lineno = "" if line.new_line is None else f"L{line.new_line}:"
        lines.append(f"{prefix}{lineno}{line.content}")
        text = "\n".join(lines)
        if len(text) >= max_chars:
            return text[:max_chars] + "\n...已按文件风险分数截断该文件 patch"
    return "\n".join(lines)


def is_lock_file(path: str) -> bool:
    lowered = path.lower()
    return lowered.endswith(LOCK_FILENAMES)


def is_test_file(path: str) -> bool:
    lowered = path.lower()
    return bool(re.search(r"(^|/)(__tests__|tests?|specs?)/", lowered) or lowered.endswith((".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".test.js", ".spec.js")))


def is_static_asset(path: str) -> bool:
    return path.lower().endswith(STATIC_EXTENSIONS)


def is_generated_path(path: str) -> bool:
    lowered = path.replace("\\", "/").lower()
    return any(part in lowered for part in LOW_VALUE_PARTS)


def should_skip_deep_review(path: str) -> bool:
    return is_lock_file(path) or is_static_asset(path) or is_generated_path(path)


def detect_signals(path: str, code: str) -> list[str]:
    checks = [
        ("eval", r"\beval\s*\("),
        ("html-write", r"\.innerHTML\s*="),
        ("debug-log", r"console\.(log|debug|warn|error)\s*\("),
        ("todo", r"TODO|FIXME"),
        ("secret", r"(api[_-]?key|secret|password|token)\s*="),
        ("client-user-id", r"(req\.body|request\.body|params)\.(userId|user_id)"),
    ]
    signals = [name for name, pattern in checks if re.search(pattern, code, re.I)]
    category = classify_file(path)
    if category != "general":
        signals.append(f"{category}-file")
    return signals
