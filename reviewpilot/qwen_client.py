from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import json
import re


class QwenError(Exception):
    pass


def call_qwen(messages: list[dict], api_key: str, model: str, base_url=None) -> dict:
    api_key = api_key.strip()
    if not api_key:
        raise QwenError("当前账号未配置千问 API Key，请先在设置中填写。")

    base_url = base_url or "https://dashscope.aliyuncs.com/compatible-mode/v1"
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
        raise QwenError(f"千问请求失败：HTTP {exc.code} {detail[:300]}") from exc
    except URLError as exc:
        raise QwenError(f"千问网络错误：{exc.reason}") from exc

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
        raise QwenError("千问返回了非 JSON 格式的评审内容。") from exc
