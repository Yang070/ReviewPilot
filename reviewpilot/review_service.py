import re

from .diff_parser import build_evidence, parse_diff, summarize_files
from .github_client import GitHubError, fetch_public_pr
from .qwen_client import QwenError, call_qwen


class ReviewError(Exception):
    pass


def review_change(pr_url: str, diff_text: str) -> dict:
    pr = {}
    if pr_url.strip():
        try:
            pr = fetch_public_pr(pr_url)
            diff_text = pr["diff"]
        except GitHubError as exc:
            raise ReviewError(str(exc)) from exc

    if not diff_text.strip():
        raise ReviewError("Provide a public GitHub PR URL or paste a unified diff.")

    files = parse_diff(diff_text)
    if not files:
        raise ReviewError("No changed files were parsed from the diff.")

    file_summary = summarize_files(files)
    evidence = build_evidence(files)
    language = detect_language(pr, diff_text)
    messages = build_messages(pr, file_summary, evidence, language)

    try:
        report = call_qwen(messages)
    except QwenError as exc:
        raise ReviewError(str(exc)) from exc

    return normalize_report(report, pr, file_summary, evidence, language)


def build_messages(pr: dict, files: list[dict], evidence: list[dict], language: str) -> list[dict]:
    system = (
        "You are ReviewPilot, an AI PR reviewer. Review only the provided PR diff evidence. "
        "Do not invent files, functions, APIs, database tables, or line numbers. "
        "If evidence is weak, mark confidence below 0.6 and use severity low. "
        "Return JSON only."
    )
    user = {
        "task": f"Generate an evidence-based code review report in {language}.",
        "pr": {
            "title": pr.get("title", ""),
            "body": pr.get("body", ""),
            "url": pr.get("html_url", ""),
        },
        "changedFiles": files,
        "evidence": evidence,
        "schema": {
            "summary": "string",
            "riskLevel": "low | medium | high",
            "findings": [{
                "file": "changed file path",
                "line": "line number or null",
                "severity": "low | medium | high",
                "type": "bug | security | test | maintainability | performance",
                "evidence": "exact code evidence or evidence description",
                "message": "why this matters",
                "suggestion": "concrete fix or check",
                "confidence": "number between 0 and 1",
            }],
            "testSuggestions": ["string"],
        },
    }
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": json_dumps(user)},
    ]


def normalize_report(report: dict, pr: dict, files: list[dict], evidence: list[dict], language: str) -> dict:
    file_paths = {file["path"] for file in files}
    findings = []

    for item in report.get("findings", []):
        file = str(item.get("file", ""))
        if file not in file_paths:
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
        findings.append({
            "file": file,
            "line": item.get("line"),
            "severity": severity,
            "type": item.get("type", "maintainability"),
            "evidence": item.get("evidence", ""),
            "message": item.get("message", ""),
            "suggestion": item.get("suggestion", ""),
            "confidence": confidence,
        })

    return {
        "pr": {
            "title": pr.get("title", ""),
            "url": pr.get("html_url", ""),
        },
        "summary": report.get("summary", ""),
        "riskLevel": report.get("riskLevel", "low"),
        "files": files,
        "findings": findings,
        "testSuggestions": report.get("testSuggestions", []),
        "evidenceCount": len(evidence),
        "language": language,
        "rawEvidencePreview": evidence[:12],
    }


def detect_language(pr: dict, diff_text: str) -> str:
    text = " ".join([
        pr.get("title", ""),
        pr.get("body", ""),
        diff_text[:3000],
    ])
    return "Chinese" if re.search(r"[\u4e00-\u9fff]", text) else "English"


def json_dumps(data: dict) -> str:
    import json
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))
