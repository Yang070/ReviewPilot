from .diff_parser import build_evidence, parse_diff, summarize_files
from .github_client import GitHubError, fetch_public_pr
from .qwen_client import QwenError, call_qwen
from .user_store import normalize_model
import json


class ReviewError(Exception):
    pass


def review_change(pr_url: str, diff_text: str, api_key: str, model: str) -> dict:
    model = normalize_model(model)
    pr = {}
    if pr_url.strip():
        try:
            pr = fetch_public_pr(pr_url)
            diff_text = pr["diff"]
        except GitHubError as exc:
            raise ReviewError(str(exc)) from exc

    if not diff_text.strip():
        raise ReviewError("请提供公开 GitHub PR 链接，或粘贴 unified diff。")

    files = parse_diff(diff_text)
    if not files:
        raise ReviewError("没有从 diff 中解析到变更文件。")

    file_changes = summarize_files(files)
    evidence, evidence_truncated = build_evidence(files)
    context_truncated = evidence_truncated or len(diff_text) > 120_000
    messages = build_messages(pr, file_changes, evidence, context_truncated)

    try:
        report = call_qwen(messages, api_key, model)
    except QwenError as exc:
        raise ReviewError(str(exc)) from exc

    return normalize_report(report, pr, file_changes, evidence, model, context_truncated)


def build_messages(pr: dict, file_changes: list[dict], evidence: list[dict], context_truncated: bool) -> list[dict]:
    system = (
        "You are ReviewPilot, an evidence-first AI PR reviewer. "
        "Use only the provided PR metadata, file_changes and evidence. "
        "Do not invent files, APIs, database tables, dependencies, release status, or line numbers. "
        "Return JSON only."
    )
    user = {
        "task": "生成中文 PR Review 报告。必须覆盖主要业务变更，但不要为了凑数制造风险。",
        "rules": [
            "summary 概括整个 PR 的主要变化。",
            "changed_modules 必须覆盖主要业务变更；即使没有风险，也要总结该模块做了什么。",
            "risks 只列有明确 diff 证据的问题；没有证据就不要输出。",
            "review_comments 给出可执行的 Review 建议，可以包含测试建议、可维护性建议和人工确认点。",
            "package-lock.json、yarn.lock、pnpm-lock.yaml 只作为依赖背景，不要作为主要 Review 对象。",
            "不要基于模型记忆判断第三方依赖版本是 alpha、beta 或 stable，除非 diff 或输入证据明确说明。",
            "如果 context_truncated 为 true，必须在 summary 或 review_comments 中提示分析可能不完整。",
        ],
        "pr": {
            "title": pr.get("title", ""),
            "body": pr.get("body", ""),
            "url": pr.get("html_url", ""),
        },
        "context_truncated": context_truncated,
        "file_changes": file_changes,
        "evidence": evidence,
        "schema": {
            "summary": "string",
            "changed_modules": [{
                "name": "module or area name",
                "files": ["changed file path"],
                "summary": "what changed in this module",
                "risk_level": "low | medium | high",
            }],
            "risks": [{
                "file": "changed file path",
                "line": "line number or null",
                "severity": "low | medium | high",
                "type": "bug | security | test | maintainability | performance | dependency",
                "evidence": "exact diff evidence",
                "message": "why this is a real risk",
                "suggestion": "concrete fix or check",
                "confidence": "number between 0 and 1",
            }],
            "review_comments": [{
                "file": "changed file path or null",
                "comment": "review suggestion in Chinese",
                "type": "test | maintainability | question | praise | follow_up",
            }],
            "overall_score": "integer from 0 to 100",
            "context_truncated": "boolean",
        },
    }
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": json.dumps(user, ensure_ascii=False, separators=(",", ":"))},
    ]


def normalize_report(
    report: dict,
    pr: dict,
    file_changes: list[dict],
    evidence: list[dict],
    model: str,
    context_truncated: bool,
) -> dict:
    file_paths = {file["path"] for file in file_changes}
    risks = normalize_risks(report.get("risks", report.get("findings", [])), file_paths)
    changed_modules = normalize_changed_modules(report.get("changed_modules", []), file_paths, file_changes)
    review_comments = normalize_review_comments(report.get("review_comments", report.get("testSuggestions", [])), file_paths)

    return {
        "pr": {
            "title": pr.get("title", ""),
            "url": pr.get("html_url", ""),
        },
        "summary": report.get("summary", ""),
        "riskLevel": max_risk_level(risks),
        "model": model,
        "file_changes": file_changes,
        "files": file_changes,
        "changed_modules": changed_modules,
        "risks": risks,
        "findings": risks,
        "review_comments": review_comments,
        "testSuggestions": [item["comment"] for item in review_comments if item.get("type") == "test"],
        "overall_score": normalize_score(report.get("overall_score", 80)),
        "context_truncated": bool(report.get("context_truncated", context_truncated)),
        "evidenceCount": len(evidence),
        "rawEvidencePreview": evidence[:12],
    }


def normalize_risks(items: list, file_paths: set[str]) -> list[dict]:
    risks = []
    for item in items if isinstance(items, list) else []:
        if not isinstance(item, dict):
            continue
        file = str(item.get("file", ""))
        if file not in file_paths:
            continue
        if is_lock_file(file) and not str(item.get("evidence", "")).strip():
            continue
        if not str(item.get("evidence", "")).strip():
            continue
        severity = item.get("severity", "low")
        if severity not in {"low", "medium", "high"}:
            severity = "low"
        confidence = item.get("confidence", 0.5)
        try:
            confidence = max(0, min(1, float(confidence)))
        except (TypeError, ValueError):
            confidence = 0.5
        risks.append({
            "file": file,
            "line": item.get("line"),
            "severity": severity,
            "type": item.get("type", "maintainability"),
            "evidence": item.get("evidence", ""),
            "message": item.get("message", ""),
            "suggestion": item.get("suggestion", ""),
            "confidence": confidence,
        })
    return risks


def normalize_changed_modules(items: list, file_paths: set[str], file_changes: list[dict]) -> list[dict]:
    modules = []
    for item in items if isinstance(items, list) else []:
        if not isinstance(item, dict):
            continue
        files = [file for file in item.get("files", []) if file in file_paths]
        if not files:
            continue
        risk_level = item.get("risk_level", "low")
        if risk_level not in {"low", "medium", "high"}:
            risk_level = "low"
        modules.append({
            "name": item.get("name", "未命名模块"),
            "files": files,
            "summary": item.get("summary", ""),
            "risk_level": risk_level,
        })

    if modules:
        return modules

    by_category = {}
    for file in file_changes:
        if file.get("isLockFile"):
            continue
        by_category.setdefault(file["category"], []).append(file["path"])
    return [{
        "name": category,
        "files": paths,
        "summary": "该区域存在代码变更，模型未返回模块总结，已由后端补充展示。",
        "risk_level": "low",
    } for category, paths in by_category.items()]


def normalize_review_comments(items: list, file_paths: set[str]) -> list[dict]:
    comments = []
    for item in items if isinstance(items, list) else []:
        if isinstance(item, str):
            comments.append({"file": None, "comment": item, "type": "follow_up"})
            continue
        if not isinstance(item, dict):
            continue
        file = item.get("file")
        if file is not None and file not in file_paths:
            file = None
        comment = str(item.get("comment", "")).strip()
        if not comment:
            continue
        comments.append({
            "file": file,
            "comment": comment,
            "type": item.get("type", "follow_up"),
        })
    return comments


def max_risk_level(risks: list[dict]) -> str:
    if any(item["severity"] == "high" for item in risks):
        return "high"
    if any(item["severity"] == "medium" for item in risks):
        return "medium"
    return "low"


def normalize_score(value) -> int:
    try:
        return max(0, min(100, int(value)))
    except (TypeError, ValueError):
        return 80


def is_lock_file(path: str) -> bool:
    lowered = path.lower()
    return lowered.endswith(("package-lock.json", "yarn.lock", "pnpm-lock.yaml"))
