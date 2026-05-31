from .qwen_client import QwenError, call_chat_model
from .review_service import resolve_model
from .user_store import normalize_model
import json


class AskError(Exception):
    pass


def ask_pr(report: dict, question: str, model_config: dict) -> dict:
    question = str(question or "").strip()
    if not question:
        raise AskError("请输入要追问的问题。")
    if not report:
        raise AskError("没有找到可用于追问的 Review 报告。")

    api_key, model, base_url, provider, _display = resolve_model(model_config)
    messages = build_ask_messages(report, question)
    try:
        raw = call_chat_model(messages, api_key, normalize_model(model), base_url, provider)
    except QwenError as exc:
        raise AskError(f"Ask PR 调用模型失败：{exc}") from exc
    return normalize_ask_answer(raw)


def build_ask_messages(report: dict, question: str) -> list[dict]:
    context = extract_ask_context(report)
    context_json = compact_json(context, 22000)
    return [
        {
            "role": "system",
            "content": (
                "你是 ReviewPilot 的 Ask PR 助手，只负责解释当前 PR Review 报告。"
                "必须使用中文，必须只基于用户提供的报告上下文回答。"
                "如果上下文不足，明确说“当前上下文无法确认”。"
                "不要重新抓取 PR，不要编造 diff、文件、规则预检或风险报告中没有出现的事实。"
                "如果问题涉及风险，需要说明相关文件、证据和置信度。"
                "如果用户问是否一定有 bug，需要说明 AI Review 只是预审建议，最终需要人工复核。"
                "只返回 JSON，不要 Markdown 代码块。"
            ),
        },
        {
            "role": "user",
            "content": (
                "请基于下面的 Review 报告上下文回答用户追问。\n"
                "返回结构必须为："
                "{\"answer\":\"回答内容\",\"related_files\":[\"相关文件\"],"
                "\"related_risks\":[\"相关风险 ID\"],\"confidence\":0-100,"
                "\"limitations\":[\"上下文不足或人工复核说明\"]}\n\n"
                f"Review 报告上下文：\n{context_json}\n\n"
                f"用户问题：{question}"
            ),
        },
    ]


def extract_ask_context(report: dict) -> dict:
    final_result = report.get("final_result") or {}
    return {
        "review_mode": report.get("review_mode", "fast"),
        "pr_overview": report.get("pr_overview") or {},
        "file_changes": report.get("file_changes") or [],
        "priority_files": report.get("priority_files") or report.get("risk_ranking") or [],
        "context_coverage": report.get("context_coverage") or {},
        "rule_findings": report.get("rule_findings") or [],
        "reviewer_result": report.get("reviewer_result") or {},
        "auditor_result": report.get("auditor_result") or {},
        "summary": final_result.get("summary") or report.get("summary", ""),
        "changed_modules": final_result.get("changed_modules") or report.get("changed_modules") or [],
        "final_risks": final_result.get("final_risks") or report.get("risks") or [],
        "review_comments": final_result.get("review_comments") or report.get("review_comments") or [],
        "limitations": final_result.get("limitations") or report.get("limitations") or [],
    }


def normalize_ask_answer(raw: dict) -> dict:
    answer = str(raw.get("answer", "")).strip()
    if not answer:
        answer = "当前上下文无法确认。建议人工 Reviewer 结合完整 diff 和测试结果复核。"
    return {
        "answer": answer,
        "related_files": normalize_string_list(raw.get("related_files")),
        "related_risks": normalize_string_list(raw.get("related_risks")),
        "confidence": confidence_to_100(raw.get("confidence", 50)),
        "limitations": normalize_string_list(raw.get("limitations")),
    }


def normalize_string_list(value) -> list[str]:
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def confidence_to_100(value) -> int:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 50
    if number <= 1:
        number *= 100
    return max(0, min(100, round(number)))


def compact_json(data: dict, max_chars: int) -> str:
    text = json.dumps(data, ensure_ascii=False, indent=2)
    if len(text) <= max_chars:
        return text
    trimmed = dict(data)
    for key in ("file_changes", "priority_files", "rule_findings", "review_comments"):
        items = trimmed.get(key)
        if isinstance(items, list):
            trimmed[key] = items[:20]
    text = json.dumps(trimmed, ensure_ascii=False, indent=2)
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n...上下文过长，已截断。"
