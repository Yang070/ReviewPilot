from .diff_parser import build_evidence, parse_diff, summarize_files, summarize_priority_files
from .github_client import GitHubError, fetch_public_pr
from .qwen_client import QwenError, call_qwen
from .user_store import normalize_model
import json


class ReviewError(Exception):
    pass


MAX_EVIDENCE_LINES = 100


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
    priority = summarize_priority_files(files)
    evidence, evidence_truncated = build_evidence(files, MAX_EVIDENCE_LINES)
    context_coverage = build_context_coverage(file_changes, evidence, evidence_truncated)
    pr_overview = build_pr_overview(pr, file_changes)
    messages = build_messages(pr_overview, file_changes, priority, context_coverage, evidence)

    try:
        report = call_qwen(messages, api_key, model)
    except QwenError as exc:
        raise ReviewError(str(exc)) from exc

    return normalize_report(report, pr_overview, file_changes, priority, context_coverage, model)


def build_messages(
    pr_overview: dict,
    file_changes: list[dict],
    priority_files: list[dict],
    context_coverage: dict,
    evidence: list[dict],
) -> list[dict]:
    system = (
        "You are ReviewPilot, an evidence-first AI PR reviewer. "
        "Use only the provided PR overview, file changes, priority files, context coverage, and evidence. "
        "Do not invent files, APIs, database tables, dependencies, release status, or line numbers. "
        "Return JSON only."
    )
    user = {
        "task": "生成中文 PR Review 报告，体现真实开发者 Review 流程。",
        "rules": [
            "summary 必须总结完整 PR 变更，不只总结 risks。",
            "changed_modules 必须覆盖主要业务模块；即使没有风险，也要总结模块变更。",
            "risks 只输出有明确 evidence 的问题；不要为了凑数量输出泛泛建议。",
            "不确定的问题不要放进 risks，放进 review_comments，并标记 type 为 needs_human_check。",
            "不要基于过时模型记忆判断第三方库版本状态。",
            "不要把 package-lock.json、yarn.lock、pnpm-lock.yaml 作为主要风险来源。",
            "如果 context_coverage.context_truncated 为 true，必须在 limitations 中说明覆盖范围和人工复核建议。",
        ],
        "pr_overview": pr_overview,
        "file_changes": file_changes,
        "priority_files": priority_files,
        "context_coverage": context_coverage,
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
                "type": "bug | security | test | maintainability | performance | dependency",
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


def build_context_coverage(file_changes: list[dict], evidence: list[dict], truncated: bool) -> dict:
    analyzed = sorted({item["file"] for item in evidence})
    skipped = [file["filename"] for file in file_changes if file["filename"] not in analyzed]
    return {
        "total_files": len(file_changes),
        "analyzed_files": len(analyzed),
        "analyzed_file_list": analyzed,
        "skipped_files": skipped,
        "context_truncated": bool(truncated),
        "strategy": (
            "优先分析 src/app/server/backend/frontend 下的源代码文件，以及 router、store、context、"
            "provider、api、service、auth、permission 等关键路径；降低 lock 文件、dist/build 产物和静态资源权重。"
        ),
    }


def normalize_report(
    report: dict,
    pr_overview: dict,
    file_changes: list[dict],
    priority_files: list[dict],
    context_coverage: dict,
    model: str,
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
        "file_changes": file_changes,
        "files": file_changes,
        "priority_files": priority_files,
        "context_coverage": context_coverage,
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
        risks.append({
            "file": file,
            "risk_level": risk_level,
            "severity": risk_level,
            "type": item.get("type", "maintainability"),
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
        limitations.append("本次 PR 较大，系统按文件优先级筛选了重点上下文，未分析文件需人工复核。")
    if context_coverage["skipped_files"]:
        limitations.append("部分低优先级文件未进入模型上下文，主要包括 lock 文件、构建产物或静态资源。")
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
