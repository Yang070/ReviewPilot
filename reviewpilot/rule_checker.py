from fnmatch import fnmatch
import secrets

from .diff_parser import ChangedFile, is_lock_file


RULE_TEMPLATES = [
    {
        "template_id": "react-router-fallback",
        "name": "React Router 兜底路由检查",
        "description": "新增路由时提醒确认是否存在 NotFound 或 path=\"*\" 兜底路由。",
        "category": "frontend",
        "language": "javascript/typescript",
        "file_patterns": ["*.tsx", "*.jsx", "*.ts", "*.js"],
        "include_keywords": ["<Route", "createBrowserRouter", "path:"],
        "exclude_keywords": ["path=\"*\"", "path: \"*\"", "NotFound", "Fallback"],
        "severity": "medium",
        "message": "新增路由代码，但新增片段中没有看到兜底路由。",
        "suggestion": "请确认路由表中是否已有 path=\"*\"、NotFound 或等价兜底页面。",
        "enabled": True,
    },
    {
        "template_id": "async-error-handling",
        "name": "异步错误处理检查",
        "description": "新增 async/await 或网络请求时提醒确认错误处理。",
        "category": "common",
        "language": "javascript/typescript",
        "file_patterns": ["*.ts", "*.tsx", "*.js", "*.jsx"],
        "include_keywords": ["async ", "await ", "fetch(", "axios."],
        "exclude_keywords": ["try", "catch", ".catch("],
        "severity": "medium",
        "message": "新增异步逻辑，但新增片段中没有看到错误处理。",
        "suggestion": "请补充 try/catch、.catch()，或说明上层调用链已经统一处理异常。",
        "enabled": True,
    },
    {
        "template_id": "context-provider",
        "name": "Context Provider 检查",
        "description": "新增 Context/Provider 时提醒确认入口组件包裹关系。",
        "category": "frontend",
        "language": "javascript/typescript",
        "file_patterns": ["*.tsx", "*.jsx", "*.ts", "*.js"],
        "include_keywords": ["createContext", "Context.Provider", "Provider>"],
        "exclude_keywords": [],
        "severity": "low",
        "message": "新增 Context/Provider，需要确认是否正确包裹入口组件。",
        "suggestion": "请确认 App、Layout 或 Router 入口已正确包裹 Provider，并补充必要测试。",
        "enabled": True,
    },
    {
        "template_id": "removed-renamed-import",
        "name": "删除或重命名文件引用检查",
        "description": "删除或重命名文件时提醒确认 import、路由和测试引用是否同步。",
        "category": "common",
        "language": "common",
        "file_patterns": ["*"],
        "include_keywords": ["__file_deleted_or_renamed__"],
        "exclude_keywords": [],
        "severity": "medium",
        "message": "文件被删除或重命名，需要确认引用是否同步更新。",
        "suggestion": "请确认 import、路由配置、构建入口和测试引用已同步调整。",
        "enabled": True,
    },
    {
        "template_id": "package-lock-sync",
        "name": "package.json 与 lock 文件同步检查",
        "description": "依赖声明变化时提醒确认 lock 文件是否同步提交。",
        "category": "common",
        "language": "common",
        "file_patterns": ["package.json"],
        "include_keywords": ["__package_lock_sync__"],
        "exclude_keywords": [],
        "severity": "medium",
        "message": "package.json 依赖发生变化，但没有看到 lock 文件同步变更。",
        "suggestion": "请提交对应 lock 文件，或在 PR 描述中说明项目不提交 lock 文件。",
        "enabled": True,
    },
    {
        "template_id": "form-validation",
        "name": "表单校验检查",
        "description": "新增表单提交逻辑时提醒确认必填项和输入校验。",
        "category": "frontend",
        "language": "javascript/typescript",
        "file_patterns": ["*.tsx", "*.jsx", "*.ts", "*.js"],
        "include_keywords": ["onSubmit", "submit", "FormData", "input"],
        "exclude_keywords": ["required", "validate", "schema", "zod", "yup"],
        "severity": "medium",
        "message": "新增表单相关逻辑，但新增片段中没有看到明显校验。",
        "suggestion": "请确认必填项、格式校验和错误提示是否完整。",
        "enabled": True,
    },
    {
        "template_id": "backend-permission",
        "name": "后端接口权限检查",
        "description": "新增接口或 Controller 时提醒确认鉴权和权限校验。",
        "category": "backend",
        "language": "common",
        "file_patterns": ["*.py", "*.java", "*.ts", "*.js"],
        "include_keywords": ["router.", "@Get", "@Post", "app.post", "app.get", "Controller"],
        "exclude_keywords": ["auth", "permission", "authorize", "login_required", "RequireAuth"],
        "severity": "high",
        "message": "新增后端接口，但新增片段中没有看到明显鉴权或权限校验。",
        "suggestion": "请确认接口是否需要登录态、角色权限或资源归属校验。",
        "enabled": True,
    },
    {
        "template_id": "env-secret-leak",
        "name": "环境变量泄露检查",
        "description": "新增密钥、token、password 等字段时提醒确认是否泄露敏感信息。",
        "category": "common",
        "language": "common",
        "file_patterns": ["*"],
        "include_keywords": ["api_key", "apikey", "secret", "password", "token=", "AKIA"],
        "exclude_keywords": ["placeholder", "example", "mock", "test"],
        "severity": "high",
        "message": "新增内容疑似包含密钥、Token 或敏感配置。",
        "suggestion": "请确认没有提交真实密钥；如为示例，请使用明显占位符并写入文档说明。",
        "enabled": True,
    },
]


def default_rules() -> list[dict]:
    return [rule_from_template(item) for item in RULE_TEMPLATES]


def rule_from_template(template: dict) -> dict:
    rule = dict(template)
    rule.pop("template_id", None)
    rule["id"] = secrets.token_urlsafe(8)
    return rule


def run_rule_checks(files: list[ChangedFile], rules: list[dict] | None = None) -> list[dict]:
    active_rules = [rule for rule in (rules or default_rules()) if rule.get("enabled", True)]
    package_lock_changed = any(is_lock_file(file.path) for file in files)
    findings = []
    for rule in active_rules:
        for file in files:
            finding = evaluate_rule(rule, file, package_lock_changed)
            if finding:
                findings.append(finding)
    return findings


def evaluate_rule(rule: dict, file: ChangedFile, package_lock_changed: bool) -> dict | None:
    if not matches_patterns(file.path, rule.get("file_patterns", ["*"])):
        return None
    include_keywords = normalize_list(rule.get("include_keywords", []))
    exclude_keywords = normalize_list(rule.get("exclude_keywords", []))
    added = added_text(file)

    if "__file_deleted_or_renamed__" in include_keywords:
        if file.status not in {"deleted", "removed", "renamed"}:
            return None
        evidence = f"文件状态：{file.status}"
    elif "__package_lock_sync__" in include_keywords:
        if not file.path.endswith("package.json") or package_lock_changed:
            return None
        if not any(keyword in added for keyword in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies")):
            return None
        evidence = first_added_line(file) or "package.json 依赖字段变化"
    else:
        if not any(keyword and keyword in added for keyword in include_keywords):
            return None
        if any(keyword and keyword in added for keyword in exclude_keywords):
            return None
        evidence = first_keyword_line(file, include_keywords) or first_added_line(file) or rule.get("message", "")

    return {
        "rule_id": rule.get("id", ""),
        "rule_name": rule.get("name", "未命名规则"),
        "description": rule.get("description", ""),
        "category": rule.get("category", "common"),
        "language": rule.get("language", "common"),
        "file": file.path,
        "risk_level": normalize_severity(rule.get("severity", "medium")),
        "type": "needs_human_check",
        "evidence": evidence,
        "issue": rule.get("message", "规则预检命中候选关注点。"),
        "reason": "新增代码命中了规则的触发关键词，且没有命中排除关键词。",
        "suggestion": rule.get("suggestion", "请人工确认该候选关注点是否成立。"),
        "confidence": 0.55,
        "source": "rule_precheck",
        "status": "待 AI 判断",
    }


def matches_patterns(path: str, patterns: list[str]) -> bool:
    return any(fnmatch(path, pattern) or fnmatch(path.split("/")[-1], pattern) for pattern in patterns or ["*"])


def normalize_list(value) -> list[str]:
    return [str(item) for item in value if str(item).strip()] if isinstance(value, list) else []


def normalize_severity(value: str) -> str:
    return value if value in {"low", "medium", "high"} else "medium"


def added_text(file: ChangedFile) -> str:
    return "\n".join(line.content for line in file.lines if line.kind == "add")


def first_added_line(file: ChangedFile) -> str:
    for line in file.lines:
        if line.kind == "add":
            prefix = "" if line.new_line is None else f"L{line.new_line}: "
            return prefix + line.content.strip()
    return ""


def first_keyword_line(file: ChangedFile, keywords: list[str]) -> str:
    for line in file.lines:
        if line.kind == "add" and any(keyword in line.content for keyword in keywords):
            prefix = "" if line.new_line is None else f"L{line.new_line}: "
            return prefix + line.content.strip()
    return ""
