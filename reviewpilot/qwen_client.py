from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import json
import re


class QwenError(Exception):
    def __init__(self, message: str, raw_text: str = ""):
        super().__init__(message)
        self.raw_text = raw_text


def call_qwen(messages: list[dict], api_key: str, model: str, base_url=None, timeout: int = 60) -> dict:
    return call_chat_model(messages, api_key, model, base_url, timeout=timeout)


def call_chat_model(messages: list[dict], api_key: str, model: str, base_url=None, provider="", timeout: int = 60) -> dict:
    api_key = api_key.strip()
    if not api_key:
        raise QwenError("当前模型配置没有 API Key，请先在模型设置中心检查。")
    if provider == "Claude":
        return call_claude(messages, api_key, model, base_url, timeout=timeout)

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
        with urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise QwenError(f"模型调用失败：HTTP {exc.code}。请检查 API Key、模型名称、API 额度或切换模型配置。{detail[:240]}") from exc
    except URLError as exc:
        raise QwenError(f"模型网络错误：{exc.reason}。请检查 base_url 或切换模型配置。") from exc
    except TimeoutError as exc:
        raise QwenError("模型调用超时。深度审计需要连续调用初审和审计模型，请稍后重试，或切换更快的模型配置。") from exc

    content = data["choices"][0]["message"]["content"]
    return parse_json_content(content)


def call_claude(messages: list[dict], api_key: str, model: str, base_url=None, timeout: int = 60) -> dict:
    base_url = base_url or "https://api.anthropic.com/v1"
    system = "\n".join(item["content"] for item in messages if item.get("role") == "system")
    user_messages = [
        {"role": "user" if item.get("role") == "system" else item.get("role", "user"), "content": item.get("content", "")}
        for item in messages if item.get("role") != "system"
    ]
    payload = {
        "model": model,
        "max_tokens": 3000,
        "temperature": 0.2,
        "system": system,
        "messages": user_messages or [{"role": "user", "content": "Return {\"ok\":true}"}],
    }
    req = Request(
        f"{base_url.rstrip('/')}/messages",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise QwenError(f"Claude 调用失败：HTTP {exc.code}。请检查 API Key、模型名称、API 额度或切换模型配置。{detail[:240]}") from exc
    except URLError as exc:
        raise QwenError(f"Claude 网络错误：{exc.reason}。请检查 base_url 或切换模型配置。") from exc
    except TimeoutError as exc:
        raise QwenError("Claude 调用超时。深度审计需要连续调用初审和审计模型，请稍后重试，或切换更快的模型配置。") from exc
    content = "".join(block.get("text", "") for block in data.get("content", []) if block.get("type") == "text")
    return parse_json_content(content)


def test_chat_connection(api_key: str, model: str, base_url: str, provider="") -> bool:
    messages = [
        {"role": "system", "content": "Return JSON only."},
        {"role": "user", "content": "{\"ok\":true}"},
    ]
    call_chat_model(messages, api_key, model, base_url, provider, timeout=30)
    return True


def parse_json_content(content: str) -> dict:
    text = content.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if fenced:
        text = fenced.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise QwenError("模型返回了非 JSON 格式的内容。", text) from exc
