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


SOURCE_EXTENSIONS = (".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".php", ".rb", ".cs", ".cpp", ".c")
PRIORITY_KEYWORDS = (
    "router", "store", "context", "provider", "api", "service", "auth",
    "permission", "login", "token", "session", "payment", "order", "billing",
)
LOW_VALUE_PARTS = ("dist/", "build/", "coverage/", "public/", "assets/", "static/")


def build_evidence(files: list[ChangedFile], max_lines=80) -> tuple[list[dict], bool]:
    evidence = []
    truncated = False
    ordered_files = priority_files(files)
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
    return sorted(files, key=lambda file: (-priority_score(file), file.path))


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
        "priority": priority_score(file),
    } for file in files]


def summarize_priority_files(files: list[ChangedFile], limit=8) -> list[dict]:
    selected = []
    for file in priority_files(files):
        score = priority_score(file)
        if score <= 0:
            continue
        selected.append({
            "filename": file.path,
            "status": file.status,
            "additions": file.additions,
            "deletions": file.deletions,
            "category": classify_file(file.path),
            "priority": score,
            "reason": priority_reason(file),
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
    path = file.path.replace("\\", "/")
    lowered = path.lower()
    score = 0
    if lowered.startswith(("src/", "app/", "server/", "backend/", "frontend/")):
        score += 30
    if lowered.endswith(SOURCE_EXTENSIONS):
        score += 28
    if any(keyword in lowered for keyword in PRIORITY_KEYWORDS):
        score += 24
    if classify_file(path) in {"auth", "payment", "data", "config", "frontend"}:
        score += 14
    changed = file.additions + file.deletions
    if changed >= 80:
        score += 12
    elif changed >= 20:
        score += 8
    elif changed > 0:
        score += 4
    if is_lock_file(path):
        score -= 60
    if lowered.endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp")):
        score -= 50
    if any(part in lowered for part in LOW_VALUE_PARTS):
        score -= 35
    return max(0, score)


def priority_reason(file: ChangedFile) -> str:
    reasons = []
    path = file.path.replace("\\", "/")
    lowered = path.lower()
    if lowered.startswith(("src/", "app/", "server/", "backend/", "frontend/")):
        reasons.append("核心代码目录")
    if lowered.endswith(SOURCE_EXTENSIONS):
        reasons.append("源代码文件")
    matched = [keyword for keyword in PRIORITY_KEYWORDS if keyword in lowered]
    if matched:
        reasons.append("命中关键路径：" + ", ".join(matched[:3]))
    changed = file.additions + file.deletions
    if changed >= 20:
        reasons.append(f"变更规模 {changed} 行")
    if is_lock_file(path):
        reasons.append("lock 文件降权")
    return "；".join(reasons) or "普通变更文件"


def is_lock_file(path: str) -> bool:
    lowered = path.lower()
    return lowered.endswith(("package-lock.json", "yarn.lock", "pnpm-lock.yaml"))


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
