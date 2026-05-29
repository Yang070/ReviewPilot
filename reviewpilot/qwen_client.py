from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import json
import os
import re


class QwenError(Exception):
    pass


def call_qwen(messages: list[dict]) -> dict:
    api_key = (os.getenv("DASHSCOPE_API_KEY") or os.getenv("QWEN_API_KEY") or "").strip()
    if not api_key:
        raise QwenError("Missing DASHSCOPE_API_KEY or QWEN_API_KEY environment variable.")

    base_url = os.getenv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
    model = os.getenv("QWEN_MODEL", "qwen-plus")
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
    }
    req = Request(
        f"{base_url.rstrip('/')}/chat/completions",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise QwenError(f"Qwen request failed: HTTP {exc.code} {detail[:300]}") from exc
    except URLError as exc:
        raise QwenError(f"Qwen network error: {exc.reason}") from exc

    content = data["choices"][0]["message"]["content"]
    return parse_json_content(content)


def parse_json_content(content: str) -> dict:
    text = content.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if fenced:
        text = fenced.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise QwenError("Qwen returned non-JSON review content.") from exc
