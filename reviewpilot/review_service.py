from .diff_parser import build_evidence, build_selected_context, parse_diff, summarize_files, summarize_priority_files
from .github_client import GitHubError, fetch_public_pr
from .qwen_client import QwenError, call_chat_model
from .rule_checker import run_rule_checks
from .user_store import normalize_model
import json


class ReviewError(Exception):
    pass


MAX_EVIDENCE_LINES = 100


def review_change(
    pr_url: str,
    diff_text: str,
    api_key: str = "",
    model: str = "",
    model_config: dict | None = None,
    rules: list[dict] | None = None,
) -> dict:
    api_key, model, base_url, provider, model_display = resolve_model(model_config, api_key, model)
    model = normalize_model(model)
    context = prepare_review_context(pr_url, diff_text, rules)
    messages = build_messages(
        context["pr_overview"],
        context["file_changes"],
        context["priority_files"],
        context["context_coverage"],
        context["evidence"],
        context["selected_context"],
        context["rule_findings"],
    )

    try:
        report = call_chat_model(messages, api_key, model, base_url, provider)
    except QwenError as exc:
        raise ReviewError(str(exc)) from exc

    return normalize_report(
        report,
        context["pr_overview"],
        context["file_changes"],
        context["priority_files"],
        context["context_coverage"],
        context["rule_findings"],
        model_display,
        provider,
    )


def resolve_model(model_config: dict | None, api_key: str = "", model: str = "") -> tuple[str, str, str, str, str]:
    if not model_config:
        return api_key, model, "", "Qwen", model
    provider = model_config.get("provider", "")
    model_name = model_config.get("modelName", "")
    return (
        model_config.get("apiKey", ""),
        model_name,
        model_config.get("baseUrl", ""),
        provider,
        model_config.get("displayName") or f"{provider} / {model_name}",
    )


def prepare_review_context(pr_url: str, diff_text: str, rules: list[dict] | None = None) -> dict:
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
    rule_findings = run_rule_checks(files, rules)
    context_coverage = build_context_coverage(file_changes, selected_context, evidence_truncated or context_truncated)
    pr_overview = build_pr_overview(pr, file_changes)
    return {
        "pr_overview": pr_overview,
        "file_changes": file_changes,
        "priority_files": priority,
        "evidence": evidence,
        "selected_context": selected_context,
        "rule_findings": rule_findings,
        "context_coverage": context_coverage,
    }


def deep_audit_review(
    pr_url: str,
    diff_text: str,
    reviewer_model_config: dict,
    auditor_model_config: dict,
    rules: list[dict] | None = None,
) -> dict:
    context = prepare_review_context(pr_url, diff_text, rules)
    reviewer_key, reviewer_model, reviewer_base, reviewer_provider, reviewer_display = resolve_model(reviewer_model_config)
    auditor_key, auditor_model, auditor_base, auditor_provider, auditor_display = resolve_model(auditor_model_config)

    reviewer_messages = build_reviewer_messages(context)
    try:
        reviewer_raw = call_chat_model(reviewer_messages, reviewer_key, normalize_model(reviewer_model), reviewer_base, reviewer_provider)
    except QwenError as exc:
        raise ReviewError(f"初审模型调用失败：{exc}") from exc

    reviewer_result = normalize_reviewer_result(reviewer_raw, context["file_changes"])
    auditor_result = {}
    auditor_error = ""
    try:
        auditor_messages = build_auditor_messages(context, reviewer_result)
        auditor_result = call_chat_model(auditor_messages, auditor_key, normalize_model(auditor_model), auditor_base, auditor_provider)
    except QwenError as exc:
        auditor_error = f"审计模型调用失败，当前结果未经过二次校验：{exc}"

    final_result = merge_review_and_audit(reviewer_result, auditor_result, context)
    if auditor_error:
        final_result["limitations"].append(auditor_error)

    return {
        "review_mode": "deep_audit",
        "pr": {"title": context["pr_overview"]["title"], "url": context["pr_overview"].get("url", "")},
        "summary": final_result["summary"],
        "riskLevel": max_risk_level(final_result["final_risks"]),
        "model": f"初审：{reviewer_display}；审计：{auditor_display}",
        "pr_overview": context["pr_overview"],
        "file_changes": context["file_changes"],
        "files": context["file_changes"],
        "priority_files": context["priority_files"],
        "risk_ranking": context["priority_files"],
        "context_coverage": context["context_coverage"],
        "rule_findings": update_rule_statuses(context["rule_findings"], final_result["final_risks"]),
        "reviewer_result": reviewer_result,
        "auditor_result": auditor_result or {"audit_summary": auditor_error, "audit_notes": [auditor_error]},
        "final_result": final_result,
        "changed_modules": final_result["changed_modules"],
        "risks": final_result["final_risks"],
        "findings": final_result["final_risks"],
        "review_comments": final_result["review_comments"],
        "overall_score": 80,
        "limitations": final_result["limitations"],
        "context_truncated": context["context_coverage"]["context_truncated"],
    }


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


def build_reviewer_messages(context: dict) -> list[dict]:
    return build_messages(
        context["pr_overview"],
        context["file_changes"],
        context["priority_files"],
        context["context_coverage"],
        context["evidence"],
        context["selected_context"],
        context["rule_findings"],
    )


def build_auditor_messages(context: dict, reviewer_result: dict) -> list[dict]:
    system = (
        "You are ReviewPilot Auditor. Do not write a new full review. "
        "Audit the reviewer_result only. Check evidence, over-inference, stale dependency claims, "
        "lock-file overfocus, missed rule findings, missed high-risk files, risk level, and confidence. "
        "Return Chinese JSON only."
    )
    user = {
        "task": "审计初审模型输出质量，指出可能误检、漏检和置信度调整。Auditor 只是辅助校验层，不是绝对裁判。",
        "rules": [
            "没有明确 diff evidence 的问题建议降级。",
            "可能遗漏的问题只放入 missed_risk_candidates，不直接认定 confirmed_issue。",
            "不要基于过时知识判断第三方依赖版本状态。",
            "不要把 lock 文件作为主要风险来源。",
        ],
        "pr_overview": context["pr_overview"],
        "selected_diff": context["selected_context"],
        "rule_findings": context["rule_findings"],
        "reviewer_result": reviewer_result,
        "schema": {
            "audit_summary": "string",
            "false_positive_candidates": [{
                "risk_id": "risk_1",
                "file": "path",
                "reason": "why maybe false positive",
                "audit_action": "keep | downgrade | remove | needs_human_check",
                "suggested_type": "confirmed_issue | potential_risk | needs_human_check",
                "suggested_confidence": "0-100",
            }],
            "missed_risk_candidates": [{
                "file": "path",
                "evidence": "diff or rule evidence",
                "issue": "possible missed issue",
                "reason": "why maybe missed",
                "suggestion": "suggestion",
                "risk_level": "high | medium | low",
                "confidence": "0-100",
                "source": "auditor_model",
            }],
            "confidence_adjustments": [{
                "risk_id": "risk_1",
                "old_confidence": "0-100",
                "new_confidence": "0-100",
                "reason": "reason",
            }],
            "audit_notes": ["string"],
            "final_recommendation": "string",
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
    rule_findings = update_rule_statuses(rule_findings, risks)
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
            "id": item.get("id") or f"risk_{len(risks) + 1}",
            "file": file,
            "risk_level": risk_level,
            "severity": risk_level,
            "type": risk_type,
            "evidence": item.get("evidence", ""),
            "issue": item.get("issue", item.get("message", "")),
            "reason": item.get("reason", ""),
            "suggestion": item.get("suggestion", ""),
            "confidence": confidence,
            "source": item.get("source", "reviewer_model"),
        })
    return risks


def normalize_reviewer_result(report: dict, file_changes: list[dict]) -> dict:
    file_paths = {file["filename"] for file in file_changes}
    risks = normalize_risks(report.get("risks", []), file_paths)
    for risk in risks:
        risk["confidence"] = confidence_to_100(risk.get("confidence", 50))
        risk["reviewer_confidence"] = risk["confidence"]
    modules = []
    for item in report.get("changed_modules", []) if isinstance(report.get("changed_modules", []), list) else []:
        if not isinstance(item, dict):
            continue
        modules.append({
            "name": item.get("name", item.get("module", "未命名模块")),
            "files": item.get("files", []),
            "summary": item.get("summary", item.get("change", "")),
        })
    comments = normalize_review_comments(report.get("review_comments", []), file_paths)
    return {
        "summary": report.get("summary", ""),
        "changed_modules": modules,
        "risks": risks,
        "review_comments": comments,
    }


def merge_review_and_audit(reviewer_result: dict, auditor_result: dict, context: dict) -> dict:
    actions = {
        item.get("risk_id"): item
        for item in auditor_result.get("false_positive_candidates", [])
        if isinstance(item, dict)
    } if isinstance(auditor_result, dict) else {}
    adjustments = {
        item.get("risk_id"): item
        for item in auditor_result.get("confidence_adjustments", [])
        if isinstance(item, dict)
    } if isinstance(auditor_result, dict) else {}
    final_risks = []
    dismissed = []

    for risk in reviewer_result.get("risks", []):
        risk_id = risk.get("id")
        audit = actions.get(risk_id, {})
        adjustment = adjustments.get(risk_id, {})
        old_conf = confidence_to_100(risk.get("confidence", 50))
        auditor_conf = confidence_to_100(audit.get("suggested_confidence", adjustment.get("new_confidence", old_conf)))
        final_conf = min(old_conf, auditor_conf) if audit else confidence_to_100(adjustment.get("new_confidence", old_conf))
        final_type = audit.get("suggested_type", risk.get("type", "potential_risk"))
        status = "accepted"
        note = audit.get("reason", adjustment.get("reason", "审计模型未提出降级意见。"))

        if is_lock_only_risk(risk, context):
            final_type = "needs_human_check"
            status = "downgraded"
            note = "该风险主要来自 lock 文件，缺少 package.json 或源代码证据支撑，已降级为待人工确认。"
        if final_conf < 60 and final_type == "confirmed_issue":
            final_type = "needs_human_check"
            status = "downgraded"
            note = "最终置信度低于 60，不能作为 confirmed_issue。"
        if audit.get("audit_action") in {"downgrade", "needs_human_check"}:
            final_type = "needs_human_check"
            status = "downgraded"
        if audit.get("audit_action") == "remove":
            dismissed.append({
                "risk_id": risk_id,
                "file": risk.get("file", ""),
                "issue": risk.get("issue", ""),
                "dismiss_reason": note or "审计模型认为证据不足，作为误检候选移除。",
            })
            continue

        final_risks.append({
            **risk,
            "type": final_type if final_type in {"confirmed_issue", "potential_risk", "needs_human_check"} else "needs_human_check",
            "reviewer_confidence": old_conf,
            "auditor_confidence": auditor_conf,
            "final_confidence": final_conf,
            "audit_status": status,
            "audit_note": note,
        })

    for item in auditor_result.get("missed_risk_candidates", []) if isinstance(auditor_result, dict) else []:
        if not isinstance(item, dict):
            continue
        confidence = confidence_to_100(item.get("confidence", 50))
        final_risks.append({
            "id": f"auditor_{len(final_risks) + 1}",
            "file": item.get("file", ""),
            "risk_level": item.get("risk_level", "medium"),
            "type": "potential_risk" if confidence >= 60 else "needs_human_check",
            "evidence": item.get("evidence", ""),
            "issue": item.get("issue", ""),
            "reason": item.get("reason", ""),
            "suggestion": item.get("suggestion", ""),
            "reviewer_confidence": 0,
            "auditor_confidence": confidence,
            "final_confidence": confidence,
            "audit_status": "added_by_auditor",
            "audit_note": "审计模型补充的可能漏检项，需人工复核。",
            "source": "auditor_model",
        })

    return {
        "summary": reviewer_result.get("summary", ""),
        "changed_modules": reviewer_result.get("changed_modules", []),
        "final_risks": final_risks,
        "dismissed_risks": dismissed,
        "review_comments": reviewer_result.get("review_comments", []),
        "limitations": [
            "AI Review 结果仅作为预审建议，最终结论需要人工 Reviewer 结合完整 diff 判断。",
            "Auditor Model 不能完全保证发现所有误检和漏检，只用于降低单模型输出的不确定性。",
        ],
    }


def update_rule_statuses(rule_findings: list[dict], final_risks: list[dict]) -> list[dict]:
    updated = []
    for finding in rule_findings:
        status = "待 AI 判断"
        same_file = [risk for risk in final_risks if risk.get("file") == finding.get("file")]
        if any(risk.get("audit_status") == "accepted" for risk in same_file):
            status = "已采纳为风险"
        elif any(risk.get("type") == "needs_human_check" for risk in same_file):
            status = "已降级为待确认"
        elif final_risks:
            status = "已忽略"
        updated.append({**finding, "status": status})
    return updated


def confidence_to_100(value) -> int:
    try:
        value = float(value)
        if value <= 1:
            value *= 100
        return max(0, min(100, int(value)))
    except (TypeError, ValueError):
        return 50


def is_lock_only_risk(risk: dict, context: dict) -> bool:
    file = risk.get("file", "").lower()
    if not file.endswith(("package-lock.json", "yarn.lock", "pnpm-lock.yaml")):
        return False
    evidence = str(risk.get("evidence", "")).lower()
    return "package.json" not in evidence and not any(
        changed.get("filename") == "package.json" for changed in context.get("file_changes", [])
    )


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


# Deep-audit v2 implementations. They intentionally reuse the same public
# function names so /api/review and /api/review/deep-audit keep their API shape.
def deep_audit_review(
    pr_url: str,
    diff_text: str,
    reviewer_model_config: dict,
    auditor_model_config: dict,
    rules: list[dict] | None = None,
) -> dict:
    context = prepare_review_context(pr_url, diff_text, rules)
    reviewer_key, reviewer_model, reviewer_base, reviewer_provider, reviewer_display = resolve_model(reviewer_model_config)
    auditor_key, auditor_model, auditor_base, auditor_provider, auditor_display = resolve_model(auditor_model_config)

    try:
        reviewer_raw = call_chat_model(
            build_reviewer_messages(context),
            reviewer_key,
            normalize_model(reviewer_model),
            reviewer_base,
            reviewer_provider,
        )
    except QwenError as exc:
        raise ReviewError(f"初审模型调用失败，请检查模型配置或 API Key：{exc}") from exc

    reviewer_result = normalize_reviewer_result(reviewer_raw, context["file_changes"])
    warning = ""
    try:
        auditor_result = call_chat_model(
            build_auditor_messages(context, reviewer_result),
            auditor_key,
            normalize_model(auditor_model),
            auditor_base,
            auditor_provider,
        )
    except QwenError as exc:
        raw_text = getattr(exc, "raw_text", "")
        if raw_text:
            warning = "审计结果解析失败，已保留初审结果。当前结果未经过有效二次校验。"
            auditor_result = {
                "audit_summary": warning,
                "auditor_raw_text": raw_text[:4000],
                "audit_notes": [warning],
                "final_recommendation": "建议人工 Reviewer 结合完整 diff 复核初审结果。",
            }
        else:
            warning = f"审计模型调用失败，当前结果未经过二次校验：{exc}"
            auditor_result = {
                "audit_summary": warning,
                "audit_notes": [warning],
                "final_recommendation": "建议人工 Reviewer 结合完整 diff 复核初审结果。",
            }

    final_result = merge_review_and_audit(reviewer_result, auditor_result, context)
    if warning:
        final_result["limitations"].append(warning)

    return {
        "review_mode": "deep_audit",
        "pr": {"title": context["pr_overview"]["title"], "url": context["pr_overview"].get("url", "")},
        "summary": final_result["summary"],
        "riskLevel": max_risk_level(final_result["final_risks"]),
        "model": f"初审：{reviewer_display}；审计：{auditor_display}",
        "pr_overview": context["pr_overview"],
        "file_changes": context["file_changes"],
        "files": context["file_changes"],
        "priority_files": context["priority_files"],
        "risk_ranking": context["priority_files"],
        "context_coverage": context["context_coverage"],
        "rule_findings": update_rule_statuses(context["rule_findings"], final_result["final_risks"]),
        "reviewer_result": reviewer_result,
        "auditor_result": auditor_result,
        "final_result": final_result,
        "changed_modules": final_result["changed_modules"],
        "risks": final_result["final_risks"],
        "findings": final_result["final_risks"],
        "review_comments": final_result["review_comments"],
        "overall_score": 80,
        "limitations": final_result["limitations"],
        "warning": warning,
        "context_truncated": context["context_coverage"]["context_truncated"],
    }


def build_reviewer_messages(context: dict) -> list[dict]:
    system = (
        "你是 ReviewPilot 的 Reviewer Model，负责生成初步 PR Review。"
        "只能基于提供的 diff、rule_findings、PR 上下文和文件风险排序判断。"
        "每条风险必须有 evidence；不确定的问题标记为 needs_human_check；"
        "不要为了凑数量输出泛泛建议；不要基于过时模型知识判断第三方依赖版本状态；"
        "不要把 package-lock.json、yarn.lock、pnpm-lock.yaml 作为主要风险来源。"
        "如果没有明确风险，可以返回空 risks。只返回中文 JSON。"
    )
    user = {
        "task": "生成初步 PR Review，输出 summary、changed_modules、risks、review_comments。",
        "pr_overview": context["pr_overview"],
        "file_changes": context["file_changes"],
        "priority_files": context["priority_files"],
        "context_coverage": context["context_coverage"],
        "selected_diff": context["selected_context"],
        "rule_findings": context["rule_findings"],
        "schema": {
            "summary": "PR 总结",
            "changed_modules": [{
                "module": "模块名称",
                "files": ["相关文件"],
                "change": "变更说明",
            }],
            "risks": [{
                "id": "risk_1",
                "file": "文件路径",
                "risk_level": "high | medium | low",
                "type": "confirmed_issue | potential_risk | needs_human_check",
                "evidence": "diff 中可见的证据",
                "issue": "问题描述",
                "reason": "为什么这是风险",
                "suggestion": "修改建议",
                "confidence": "0-100",
                "source": "reviewer_model",
            }],
            "review_comments": [{
                "file": "文件路径",
                "comment": "可复制到 PR 的 Review Comment",
            }],
        },
    }
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": json.dumps(user, ensure_ascii=False, separators=(",", ":"))},
    ]


def build_auditor_messages(context: dict, reviewer_result: dict) -> list[dict]:
    system = (
        "你是 ReviewPilot 的 Auditor Model。你不是绝对裁判，也可能出错。"
        "你不重新生成完整 Review，只审计 Reviewer Model 的输出质量。"
        "检查误检、漏检、证据不足、过度推断、过时依赖判断、lock 文件过度关注、"
        "规则预检遗漏、高风险文件遗漏、风险等级和 confidence 是否合理。"
        "缺乏证据的问题建议降级为 needs_human_check；可能遗漏的问题只进入 missed_risk_candidates，"
        "不能直接认定为 confirmed_issue。只返回中文 JSON。"
    )
    user = {
        "task": "审计 reviewer_result，不要重写 summary、changed_modules、review_comments。",
        "pr_overview": context["pr_overview"],
        "selected_diff": context["selected_context"],
        "rule_findings": context["rule_findings"],
        "reviewer_result": reviewer_result,
        "schema": {
            "audit_summary": "审计总结",
            "false_positive_candidates": [{
                "risk_id": "risk_1",
                "file": "文件路径",
                "reason": "为什么可能是误检",
                "audit_action": "keep | downgrade | remove | needs_human_check",
                "suggested_type": "confirmed_issue | potential_risk | needs_human_check",
                "suggested_confidence": "0-100",
            }],
            "missed_risk_candidates": [{
                "file": "文件路径",
                "evidence": "diff 或规则预检中的证据",
                "issue": "可能遗漏的问题",
                "reason": "为什么认为可能遗漏",
                "suggestion": "建议人工确认或修改",
                "risk_level": "high | medium | low",
                "confidence": "0-100",
                "source": "auditor_model",
            }],
            "confidence_adjustments": [{
                "risk_id": "risk_1",
                "old_confidence": 80,
                "new_confidence": 62,
                "reason": "调整原因",
            }],
            "audit_notes": ["其他审计说明"],
            "final_recommendation": "整体审计结论",
        },
    }
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": json.dumps(user, ensure_ascii=False, separators=(",", ":"))},
    ]


def normalize_risks(items: list, file_paths: set[str]) -> list[dict]:
    risks = []
    allowed_types = {"confirmed_issue", "potential_risk", "needs_human_check"}
    for item in items if isinstance(items, list) else []:
        if not isinstance(item, dict):
            continue
        file = str(item.get("file", ""))
        if file not in file_paths:
            continue
        evidence = str(item.get("evidence", "")).strip()
        if not evidence:
            continue
        risk_level = item.get("risk_level", item.get("severity", "low"))
        if risk_level not in {"low", "medium", "high"}:
            risk_level = "low"
        risk_type = item.get("type", "potential_risk")
        if risk_type not in allowed_types:
            risk_type = "potential_risk"
        risks.append({
            "id": item.get("id") or f"risk_{len(risks) + 1}",
            "file": file,
            "risk_level": risk_level,
            "severity": risk_level,
            "type": risk_type,
            "evidence": evidence,
            "issue": item.get("issue", item.get("message", "")),
            "reason": item.get("reason", ""),
            "suggestion": item.get("suggestion", ""),
            "confidence": confidence_to_100(item.get("confidence", 50)),
            "source": item.get("source", "reviewer_model"),
        })
    return risks


def merge_review_and_audit(reviewer_result: dict, auditor_result: dict, context: dict | None = None) -> dict:
    context = context or {}
    audit_items = auditor_result if isinstance(auditor_result, dict) else {}
    actions = {
        item.get("risk_id"): item
        for item in audit_items.get("false_positive_candidates", [])
        if isinstance(item, dict)
    }
    adjustments = {
        item.get("risk_id"): item
        for item in audit_items.get("confidence_adjustments", [])
        if isinstance(item, dict)
    }
    has_effective_audit = bool(actions or adjustments or audit_items.get("missed_risk_candidates"))
    final_risks = []
    dismissed = []

    for risk in reviewer_result.get("risks", []):
        risk_id = risk.get("id")
        audit = actions.get(risk_id, {})
        adjustment = adjustments.get(risk_id, {})
        action = audit.get("audit_action", "keep" if has_effective_audit else "needs_human_check")
        reviewer_conf = confidence_to_100(risk.get("reviewer_confidence", risk.get("confidence", 50)))
        auditor_conf = confidence_to_100(audit.get("suggested_confidence", adjustment.get("new_confidence", reviewer_conf)))
        final_conf = min(reviewer_conf, auditor_conf) if audit else confidence_to_100(adjustment.get("new_confidence", reviewer_conf))
        final_type = audit.get("suggested_type", risk.get("type", "potential_risk"))
        audit_note = audit.get("reason") or adjustment.get("reason") or "审计模型未提出降级意见。"
        audit_status = "accepted"

        if not has_effective_audit:
            audit_note = "审计模型未完成有效二次校验，建议人工复核。"
            audit_status = "needs_human_check"
        elif action == "downgrade":
            final_type = "needs_human_check"
            audit_status = "downgraded"
        elif action == "needs_human_check":
            final_type = "needs_human_check"
            audit_status = "needs_human_check"
        elif action == "remove":
            dismissed.append({
                "risk_id": risk_id,
                "file": risk.get("file", ""),
                "issue": risk.get("issue", ""),
                "dismiss_reason": audit_note or "Auditor 认为该风险证据不足，作为可能误检移除。",
            })
            continue

        if is_lock_only_risk(risk, context):
            final_type = "needs_human_check"
            audit_status = "downgraded"
            audit_note = "该风险主要来自 lock 文件，缺少 package.json 或源代码证据支撑，已降级为待人工确认。"
        if final_conf < 60 and final_type == "confirmed_issue":
            final_type = "needs_human_check"
            audit_status = "downgraded"
            audit_note = "最终置信度低于 60，不能作为 confirmed_issue。"
        if final_type == "confirmed_issue" and not str(risk.get("evidence", "")).strip():
            final_type = "needs_human_check"
            audit_status = "downgraded"
            audit_note = "confirmed_issue 必须有明确 diff evidence，当前证据不足。"

        final_risks.append({
            **risk,
            "type": final_type if final_type in {"confirmed_issue", "potential_risk", "needs_human_check"} else "needs_human_check",
            "reviewer_confidence": reviewer_conf,
            "auditor_confidence": auditor_conf,
            "final_confidence": final_conf,
            "audit_status": audit_status,
            "audit_note": audit_note,
        })

    for item in audit_items.get("missed_risk_candidates", []):
        if not isinstance(item, dict):
            continue
        evidence = str(item.get("evidence", "")).strip()
        confidence = confidence_to_100(item.get("confidence", 50))
        final_risks.append({
            "id": f"auditor_{len(final_risks) + 1}",
            "file": item.get("file", ""),
            "risk_level": item.get("risk_level", "medium") if item.get("risk_level") in {"low", "medium", "high"} else "medium",
            "type": "potential_risk" if confidence >= 70 else "needs_human_check",
            "evidence": evidence,
            "issue": item.get("issue", ""),
            "reason": item.get("reason", ""),
            "suggestion": item.get("suggestion", ""),
            "reviewer_confidence": 0,
            "auditor_confidence": confidence,
            "final_confidence": confidence,
            "audit_status": "added_by_auditor",
            "audit_note": "审计模型补充的可能漏检项，不直接认定为 confirmed_issue，需要人工复核。",
            "source": "auditor_model",
        })

    return {
        "summary": reviewer_result.get("summary", ""),
        "changed_modules": reviewer_result.get("changed_modules", []),
        "final_risks": final_risks,
        "dismissed_risks": dismissed,
        "review_comments": reviewer_result.get("review_comments", []),
        "limitations": [
            "AI Review 结果仅作为预审建议，最终结论需要人工 Reviewer 结合完整 diff 判断。",
            "Auditor Model 不能完全保证发现所有误检和漏检，只用于降低单模型输出的不确定性。",
        ],
    }
