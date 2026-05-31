import re

from .diff_parser import ChangedFile, is_lock_file


def run_rule_checks(files: list[ChangedFile]) -> list[dict]:
    findings = []
    findings.extend(check_react_router_fallback(files))
    findings.extend(check_async_error_handling(files))
    findings.extend(check_context_provider(files))
    findings.extend(check_removed_or_renamed(files))
    findings.extend(check_package_lock_sync(files))
    return findings


def check_react_router_fallback(files: list[ChangedFile]) -> list[dict]:
    findings = []
    for file in files:
        added = added_text(file)
        lowered = file.path.lower()
        route_added = re.search(r"(<Route\b|createBrowserRouter|path\s*:)", added)
        if not route_added:
            continue
        if not any(keyword in lowered for keyword in ("route", "router", "app", "main")):
            continue
        has_fallback = re.search(r'(path\s*=\s*["\']\*["\']|path\s*:\s*["\']\*["\']|NotFound|Fallback)', added)
        if not has_fallback:
            findings.append(rule_finding(
                file.path,
                "medium",
                "potential_risk",
                "检测到新增路由代码，但新增片段中没有看到 fallback route。",
                "新增 React Router 路由时确认是否已有兜底路由",
                "缺少 fallback 可能导致未知路径展示空白或错误页面。",
                "请确认路由表中是否已有 path=\"*\" 或等价 NotFound/Fallback 处理。",
                0.72,
            ))
    return findings


def check_async_error_handling(files: list[ChangedFile]) -> list[dict]:
    findings = []
    for file in files:
        added = added_text(file)
        if not re.search(r"\b(async\s+function|async\s*\(|await\s+)", added):
            continue
        has_error_handling = re.search(r"\btry\s*{|\.catch\s*\(|catch\s*\(", added)
        if not has_error_handling:
            findings.append(rule_finding(
                file.path,
                "medium",
                "potential_risk",
                first_matching_line(file, r"\b(async\s+function|async\s*\(|await\s+)") or "新增 async/await 逻辑",
                "新增异步逻辑需要确认错误处理",
                "异步调用失败时如果没有 try/catch 或 .catch，用户流程可能静默失败。",
                "请补充错误处理，或说明上层调用链已经统一捕获异常。",
                0.68,
            ))
    return findings


def check_context_provider(files: list[ChangedFile]) -> list[dict]:
    findings = []
    for file in files:
        added = added_text(file)
        if not re.search(r"(createContext|Context\.Provider|<\w+Provider\b|Provider>)", added):
            continue
        findings.append(rule_finding(
            file.path,
            "low",
            "needs_human_check",
            first_matching_line(file, r"(createContext|Context\.Provider|<\w+Provider\b|Provider>)") or "新增 Context/Provider",
            "新增 Context/Provider 后需要确认入口组件包裹关系",
            "Provider 未包裹到实际入口时，页面可能拿不到上下文状态。",
            "请确认 App、Layout、Router 入口已正确包裹 Provider，并补充必要的默认值或测试。",
            0.61,
        ))
    return findings


def check_removed_or_renamed(files: list[ChangedFile]) -> list[dict]:
    findings = []
    for file in files:
        if file.status not in {"deleted", "removed", "renamed"}:
            continue
        findings.append(rule_finding(
            file.path,
            "medium",
            "needs_human_check",
            f"文件状态：{file.status}",
            "删除或重命名文件后需要确认 import 是否同步更新",
            "diff 只能看到当前文件变更，无法完全证明所有引用都已同步调整。",
            "请确认相关 import、路由配置、构建入口和测试引用已同步更新。",
            0.7,
        ))
    return findings


def check_package_lock_sync(files: list[ChangedFile]) -> list[dict]:
    package_changed = any(file.path.endswith("package.json") and has_dependency_change(file) for file in files)
    lock_changed = any(is_lock_file(file.path) for file in files)
    if not package_changed or lock_changed:
        return []
    return [rule_finding(
        "package.json",
        "medium",
        "potential_risk",
        "package.json 中依赖字段发生变化，但本次 diff 未发现 package-lock/yarn.lock/pnpm-lock 同步变更。",
        "依赖变更需要确认 lock 文件同步",
        "依赖声明和 lock 文件不一致可能导致本地、CI、部署环境安装结果不同。",
        "请确认使用的包管理器，并提交对应 lock 文件变更；如果项目不提交 lock 文件，请在 PR 描述中说明。",
        0.76,
    )]


def has_dependency_change(file: ChangedFile) -> bool:
    text = "\n".join(line.content for line in file.lines if line.kind in {"add", "delete"})
    return bool(re.search(r'"(dependencies|devDependencies|peerDependencies|optionalDependencies)"\s*:', text))


def added_text(file: ChangedFile) -> str:
    return "\n".join(line.content for line in file.lines if line.kind == "add")


def first_matching_line(file: ChangedFile, pattern: str) -> str:
    for line in file.lines:
        if line.kind == "add" and re.search(pattern, line.content):
            prefix = "" if line.new_line is None else f"L{line.new_line}: "
            return prefix + line.content.strip()
    return ""


def rule_finding(
    file: str,
    risk_level: str,
    finding_type: str,
    evidence: str,
    issue: str,
    reason: str,
    suggestion: str,
    confidence: float,
) -> dict:
    return {
        "file": file,
        "risk_level": risk_level,
        "type": finding_type,
        "evidence": evidence,
        "issue": issue,
        "reason": reason,
        "suggestion": suggestion,
        "confidence": confidence,
        "source": "rule",
    }
