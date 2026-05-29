from .diff_parser import build_evidence, build_selected_context, parse_diff, summarize_files, summarize_priority_files
from .github_client import GitHubError, fetch_public_pr
from .qwen_client import QwenError, call_chat_model
from .rule_checker import run_rule_checks
from .user_store import normalize_model
import json


class ReviewError(Exception):
    pass


MAX_EVIDENCE_LINES = 100


def review_change(pr_url: str, diff_text: str, api_key: str = "", model: str = "", model_config: dict | None = None) -> dict:
    if model_config:
        api_key = model_config.get("apiKey", "")
        model = model_config.get("modelName", "")
        base_url = model_config.get("baseUrl", "")
        provider = model_config.get("provider", "")
        model_display = model_config.get("displayName") or f"{provider} / {model}"
    else:
        base_url = ""
        provider = "Qwen"
        model_display = model
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
    priority = summarize_priority_files(files)
    evidence, evidence_truncated = build_evidence(files, MAX_EVIDENCE_LINES)
    selected_context, context_truncated = build_selected_context(files)
    rule_findings = run_rule_checks(files)
    context_coverage = build_context_coverage(file_changes, selected_context, evidence_truncated or context_truncated)
    pr_overview = build_pr_overview(pr, file_changes)
    messages = build_messages(
        pr_overview,
        file_changes,
        priority,
        context_coverage,
        evidence,
        selected_context,
        rule_findings,
    )

    try:
        report = call_chat_model(messages, api_key, model, base_url, provider)
    except QwenError as exc:
        raise ReviewError(str(exc)) from exc

    return normalize_report(report, pr_overview, file_changes, priority, context_coverage, rule_findings, model_display, provider)


def build_messages(
    pr_overview: dict,
    file_changes: list[dict],
    priority_files: list[dict],
    context_coverage: dict,
    evidence: list[dict],
    selected_context: list[dict] | None = None,
    rule_findings: list[dict] | None = None,
) -> list[dict]:
    system = (
        "You are ReviewPilot, an evidence-first AI PR reviewer. "
        "Use only the provided PR overview, risk-aware file ranking, context coverage, selected diff context, "
        "rule findings, and evidence. "
        "Do not invent files, APIs, database tables, dependencies, release status, or line numbers. "
        "Return Chinese JSON only."
    )
    user = {
        "task": "生成中文 PR Review 报告，体现风险感知型 AI PR Review 流程。",
        "rules": [
            "summary 必须总结完整 PR 变更，不只总结 risks。",
            "changed_modules 必须覆盖主要业务模块；即使没有风险，也要总结模块变更。",
            "必须结合 selected_context 与 rule_findings，但不要机械照抄规则结果。",
            "risks 只输出有明确 evidence 或 rule_finding 支撑的问题；不要为了凑数量输出泛泛建议。",
            "type 只能是 confirmed_issue、potential_risk、needs_human_check。",
            "没有明确证据的问题不要输出为 confirmed_issue。",
            "不确定的问题标记为 needs_human_check。",
            "不要基于过时模型记忆判断第三方库版本状态。",
            "不要把 package-lock.json、yarn.lock、pnpm-lock.yaml 作为主要风险来源。",
            "如果 context_coverage.context_truncated 为 true，必须在 limitations 中说明覆盖范围和人工复核建议。",
        ],
        "pr_overview": pr_overview,
        "file_changes": file_changes,
        "priority_files": priority_files,
        "context_coverage": context_coverage,
        "selected_context": selected_context or [],
        "rule_findings": rule_findings or [],
        "evidence": evidence,
        "schema": {
            "summary": "string",
            "changed_modules": [{
                "name": "module or area name",
                "files": ["changed file path"],
                "summary": "what changed in this module",
            }],
            "risks": [{
                "file": "changed file path",
                "risk_level": "low | medium | high",
                "type": "confirmed_issue | potential_risk | needs_human_check",
                "evidence": "exact diff evidence",
                "issue": "what is wrong",
                "reason": "why this is a real risk",
                "suggestion": "concrete fix or check",
                "confidence": "number between 0 and 1",
            }],
            "review_comments": [{
                "file": "changed file path or null",
                "comment": "copyable review comment in Chinese",
                "type": "test | maintainability | needs_human_check | follow_up",
            }],
            "overall_score": "integer from 0 to 100",
            "limitations": ["string"],
        },
    }
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": json.dumps(user, ensure_ascii=False, separators=(",", ":"))},
    ]


def build_pr_overview(pr: dict, file_changes: list[dict]) -> dict:
    return {
        "title": pr.get("title", "") or "粘贴 diff 分析",
        "url": pr.get("html_url", ""),
        "changed_files": len(file_changes),
        "additions": sum(file["additions"] for file in file_changes),
        "deletions": sum(file["deletions"] for file in file_changes),
    }


def build_context_coverage(file_changes: list[dict], context_items: list[dict], truncated: bool) -> dict:
    analyzed = sorted({
        item["file"] for item in context_items
        if item.get("mode", "deep") == "deep" and item.get("file")
    })
    skipped = [file["filename"] for file in file_changes if file["filename"] not in analyzed]
    return {
        "total_files": len(file_changes),
        "analyzed_files": len(analyzed),
        "analyzed_file_list": analyzed,
        "skipped_files": skipped,
        "context_truncated": bool(truncated),
        "strategy": (
            "风险感知型上下文选择：先为每个文件计算 risk_score，再按分数从高到低选择重点上下文；"
            "高风险源代码保留更多 patch，低风险文件仅保留摘要；lock 文件、dist/build 产物和静态资源默认不进入深度 AI Review。"
        ),
    }


def normalize_report(
    report: dict,
    pr_overview: dict,
    file_changes: list[dict],
    priority_files: list[dict],
    context_coverage: dict,
    rule_findings: list[dict],
    model: str,
    provider: str = "",
) -> dict:
    file_paths = {file["filename"] for file in file_changes}
    risks = normalize_risks(report.get("risks", []), file_paths)
    changed_modules = normalize_changed_modules(report.get("changed_modules", []), file_paths, file_changes)
    review_comments = normalize_review_comments(report.get("review_comments", []), file_paths)
    limitations = normalize_limitations(report.get("limitations", []), context_coverage)

    return {
        "pr": {
            "title": pr_overview["title"],
            "url": pr_overview.get("url", ""),
        },
        "pr_overview": pr_overview,
        "summary": report.get("summary", ""),
        "riskLevel": max_risk_level(risks),
        "model": model,
        "provider": provider,
        "file_changes": file_changes,
        "files": file_changes,
        "priority_files": priority_files,
        "risk_ranking": priority_files,
        "context_coverage": context_coverage,
        "rule_findings": rule_findings,
        "changed_modules": changed_modules,
        "risks": risks,
        "findings": risks,
        "review_comments": review_comments,
        "testSuggestions": [item["comment"] for item in review_comments if item.get("type") == "test"],
        "overall_score": normalize_score(report.get("overall_score", 80)),
        "limitations": limitations,
        "context_truncated": context_coverage["context_truncated"],
    }


def normalize_risks(items: list, file_paths: set[str]) -> list[dict]:
    risks = []
    allowed_types = {"confirmed_issue", "potential_risk", "needs_human_check"}
    for item in items if isinstance(items, list) else []:
        if not isinstance(item, dict):
            continue
        file = str(item.get("file", ""))
        if file not in file_paths:
            continue
        if not str(item.get("evidence", "")).strip():
            continue
        risk_level = item.get("risk_level", item.get("severity", "low"))
        if risk_level not in {"low", "medium", "high"}:
            risk_level = "low"
        confidence = item.get("confidence", 0.5)
        try:
            confidence = max(0, min(1, float(confidence)))
        except (TypeError, ValueError):
            confidence = 0.5
        risk_type = item.get("type", "potential_risk")
        if risk_type not in allowed_types:
            risk_type = "potential_risk"
        risks.append({
            "file": file,
            "risk_level": risk_level,
            "severity": risk_level,
            "type": risk_type,
            "evidence": item.get("evidence", ""),
            "issue": item.get("issue", item.get("message", "")),
            "reason": item.get("reason", ""),
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
        modules.append({
            "name": item.get("name", "未命名模块"),
            "files": files,
            "summary": item.get("summary", ""),
        })

    if modules:
        return modules

    grouped = {}
    for file in file_changes:
        if file.get("isLockFile"):
            continue
        grouped.setdefault(file["category"], []).append(file["filename"])
    return [{
        "name": category,
        "files": paths,
        "summary": "该区域存在代码变更，模型未返回模块总结，已由后端补充展示。",
    } for category, paths in grouped.items()]


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


def normalize_limitations(items: list, context_coverage: dict) -> list[str]:
    limitations = [str(item).strip() for item in items if str(item).strip()] if isinstance(items, list) else []
    limitations.append("AI Review 只能辅助发现问题，不能替代人工 Review 和测试验证。")
    if context_coverage["context_truncated"]:
        limitations.append(
            f"本次共有 {context_coverage['total_files']} 个变更文件，模型重点分析了 "
            f"{context_coverage['analyzed_files']} 个文件；由于上下文较大，系统按文件优先级筛选了重点内容。"
        )
    if context_coverage["skipped_files"]:
        skipped = context_coverage["skipped_files"]
        sample = "、".join(skipped[:5])
        suffix = f" 等 {len(skipped)} 个文件" if len(skipped) > 5 else ""
        limitations.append(
            f"本次有 {len(skipped)} 个低优先级文件未进入模型重点上下文：{sample}{suffix}。"
            "这些文件通常是 lock 文件、构建产物或静态资源，建议人工快速确认是否存在异常变更。"
        )
    return dedupe(limitations)


def max_risk_level(risks: list[dict]) -> str:
    if any(item["risk_level"] == "high" for item in risks):
        return "high"
    if any(item["risk_level"] == "medium" for item in risks):
        return "medium"
    return "low"


def normalize_score(value) -> int:
    try:
        return max(0, min(100, int(value)))
    except (TypeError, ValueError):
        return 80


def dedupe(items: list[str]) -> list[str]:
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
