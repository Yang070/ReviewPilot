from pathlib import Path
from .rule_checker import default_rules, rule_from_template, RULE_TEMPLATES
import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time


class UserError(Exception):
    pass


PROVIDERS = {
    "OpenAI": "https://api.openai.com/v1",
    "Qwen": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "DeepSeek": "https://api.deepseek.com",
    "Claude": "https://api.anthropic.com/v1",
    "Custom OpenAI-Compatible": "",
}


class UserStore:
    def __init__(self, path: Path, secret_path: Path):
        self.path = path
        self.secret_path = secret_path
        self.secret = self.load_secret()

    def register(self, username: str, email: str, password: str, confirm_password: str) -> dict:
        username = normalize_username(username)
        email = normalize_email(email)
        validate_password(password)
        if password != confirm_password:
            raise UserError("两次输入的密码不一致。")
        users = self.load()
        if username in users:
            raise UserError("该账号已存在。")
        now = int(time.time())
        salt = os.urandom(16)
        users[username] = {
            "username": username,
            "email": email,
            "passwordSalt": b64(salt),
            "passwordHash": b64(hash_password(password, salt)),
            "modelConfigs": [],
            "history": [],
            "reviewRules": default_rules(),
            "createdAt": now,
            "updatedAt": now,
        }
        self.save(users)
        return self.public_user(users[username])

    def authenticate(self, username: str, password: str) -> dict:
        username = normalize_username(username)
        users = self.load()
        user = users.get(username)
        if not user:
            raise UserError("账号或密码错误。")
        salt = b64decode(user["passwordSalt"])
        expected = b64decode(user["passwordHash"])
        if not hmac.compare_digest(hash_password(password, salt), expected):
            raise UserError("账号或密码错误。")
        changed = self.migrate_legacy_user(user)
        if changed:
            user["updatedAt"] = int(time.time())
            self.save(users)
        return self.session_user(user)

    def get_user(self, username: str) -> dict:
        user = self.require_user(username)
        return self.public_user(user)

    def update_username(self, username: str, new_username: str) -> dict:
        old_username = normalize_username(username)
        new_username = normalize_username(new_username)
        users = self.load()
        user = users.get(old_username)
        if not user:
            raise UserError("账号不存在。")
        if new_username != old_username and new_username in users:
            raise UserError("该账号已存在。")
        if new_username != old_username:
            users.pop(old_username)
            user["username"] = new_username
            users[new_username] = user
        user["updatedAt"] = int(time.time())
        self.save(users)
        return self.public_user(user)

    def update_password(self, username: str, current_password: str, new_password: str, confirm_password: str):
        username = normalize_username(username)
        validate_password(new_password)
        if new_password != confirm_password:
            raise UserError("两次输入的新密码不一致。")
        users = self.load()
        user = users.get(username)
        if not user:
            raise UserError("账号不存在。")
        salt = b64decode(user["passwordSalt"])
        expected = b64decode(user["passwordHash"])
        if not hmac.compare_digest(hash_password(current_password, salt), expected):
            raise UserError("当前密码不正确。")
        new_salt = os.urandom(16)
        user["passwordSalt"] = b64(new_salt)
        user["passwordHash"] = b64(hash_password(new_password, new_salt))
        user["updatedAt"] = int(time.time())
        self.save(users)

    def list_model_configs(self, username: str) -> list[dict]:
        user = self.require_user(username)
        return [self.public_model_config(item) for item in user.get("modelConfigs", [])]

    def list_rules(self, username: str) -> list[dict]:
        user = self.require_user(username)
        return user.setdefault("reviewRules", default_rules())

    def add_rule(self, username: str, payload: dict) -> dict:
        users = self.load()
        user = self.require_user_from(users, username)
        rule = self.build_rule(payload)
        user.setdefault("reviewRules", default_rules()).append(rule)
        user["updatedAt"] = int(time.time())
        self.save(users)
        return rule

    def update_rule(self, username: str, rule_id: str, payload: dict) -> dict:
        users = self.load()
        user = self.require_user_from(users, username)
        rule = self.find_rule(user, rule_id)
        for key in ("name", "description", "category", "language", "severity", "message", "suggestion"):
            if key in payload:
                rule[key] = str(payload.get(key, "")).strip()
        for key in ("file_patterns", "include_keywords", "exclude_keywords"):
            if key in payload:
                rule[key] = normalize_string_list(payload.get(key))
        if "enabled" in payload:
            rule["enabled"] = bool(payload.get("enabled"))
        user["updatedAt"] = int(time.time())
        self.save(users)
        return rule

    def delete_rule(self, username: str, rule_id: str):
        users = self.load()
        user = self.require_user_from(users, username)
        before = len(user.setdefault("reviewRules", default_rules()))
        user["reviewRules"] = [rule for rule in user["reviewRules"] if rule.get("id") != rule_id]
        if len(user["reviewRules"]) == before:
            raise UserError("规则不存在。")
        user["updatedAt"] = int(time.time())
        self.save(users)

    def copy_rule_template(self, username: str, template_id: str) -> dict:
        template = next((item for item in RULE_TEMPLATES if item["template_id"] == template_id), None)
        if not template:
            raise UserError("规则模板不存在。")
        users = self.load()
        user = self.require_user_from(users, username)
        rule = rule_from_template(template)
        user.setdefault("reviewRules", default_rules()).append(rule)
        user["updatedAt"] = int(time.time())
        self.save(users)
        return rule

    def add_model_config(self, username: str, payload: dict) -> dict:
        users = self.load()
        user = self.require_user_from(users, username)
        config = self.build_model_config(payload)
        configs = user.setdefault("modelConfigs", [])
        if config["isDefault"] or not configs:
            for item in configs:
                item["isDefault"] = False
            config["isDefault"] = True
        configs.append(config)
        user["updatedAt"] = int(time.time())
        self.save(users)
        return self.public_model_config(config)

    def update_model_config(self, username: str, config_id: str, payload: dict) -> dict:
        users = self.load()
        user = self.require_user_from(users, username)
        config = self.find_model_config(user, config_id)
        provider = payload.get("provider")
        if provider is not None:
            config["provider"] = normalize_provider(provider)
        base_url = payload.get("base_url")
        if base_url is not None:
            config["baseUrl"] = normalize_base_url(config["provider"], base_url)
        elif provider is not None:
            config["baseUrl"] = normalize_base_url(config["provider"], "")
        model_name = payload.get("model_name")
        if model_name is not None:
            config["modelName"] = normalize_model(model_name)
        api_key = payload.get("api_key")
        if api_key is not None and api_key.strip():
            config["apiKey"] = encrypt_text(api_key.strip(), self.secret)
            config["apiKeyMask"] = mask_secret(api_key.strip())
        if bool(payload.get("is_default")):
            self.mark_default(user, config_id)
        config["updatedAt"] = int(time.time())
        user["updatedAt"] = int(time.time())
        self.save(users)
        return self.public_model_config(config)

    def delete_model_config(self, username: str, config_id: str):
        users = self.load()
        user = self.require_user_from(users, username)
        configs = user.get("modelConfigs", [])
        target = next((item for item in configs if item["id"] == config_id), None)
        if not target:
            raise UserError("模型配置不存在。")
        was_default = bool(target.get("isDefault"))
        user["modelConfigs"] = [item for item in configs if item["id"] != config_id]
        if was_default and user["modelConfigs"]:
            user["modelConfigs"][0]["isDefault"] = True
        user["updatedAt"] = int(time.time())
        self.save(users)

    def set_default_model_config(self, username: str, config_id: str) -> dict:
        users = self.load()
        user = self.require_user_from(users, username)
        self.mark_default(user, config_id)
        user["updatedAt"] = int(time.time())
        self.save(users)
        return self.public_model_config(self.find_model_config(user, config_id))

    def get_model_config_secret(self, username: str, config_id: str | None = None) -> dict:
        user = self.require_user(username)
        configs = user.get("modelConfigs", [])
        if not configs:
            raise UserError("当前账号还没有模型配置，请先进入模型设置中心添加。")
        if config_id:
            config = self.find_model_config(user, config_id)
        else:
            config = next((item for item in configs if item.get("isDefault")), configs[0])
        return {
            "id": config["id"],
            "provider": config["provider"],
            "baseUrl": config["baseUrl"],
            "apiKey": decrypt_text(config["apiKey"], self.secret),
            "modelName": config["modelName"],
            "isDefault": bool(config.get("isDefault")),
            "displayName": model_display_name(config),
        }

    def build_rule(self, payload: dict) -> dict:
        name = str(payload.get("name", "")).strip()
        if not name:
            raise UserError("规则名称不能为空。")
        return {
            "id": secrets.token_urlsafe(8),
            "name": name,
            "description": str(payload.get("description", "")).strip(),
            "category": normalize_rule_choice(payload.get("category", "common"), {"frontend", "backend", "common"}, "common"),
            "language": normalize_rule_choice(payload.get("language", "common"), {"javascript/typescript", "javascript", "typescript", "python", "java", "common"}, "common"),
            "file_patterns": normalize_string_list(payload.get("file_patterns", ["*"])),
            "include_keywords": normalize_string_list(payload.get("include_keywords", [])),
            "exclude_keywords": normalize_string_list(payload.get("exclude_keywords", [])),
            "severity": normalize_rule_choice(payload.get("severity", "medium"), {"low", "medium", "high"}, "medium"),
            "message": str(payload.get("message", "")).strip() or "规则预检命中候选关注点。",
            "suggestion": str(payload.get("suggestion", "")).strip() or "请人工确认该候选关注点是否成立。",
            "enabled": bool(payload.get("enabled", True)),
        }

    def find_rule(self, user: dict, rule_id: str) -> dict:
        for rule in user.setdefault("reviewRules", default_rules()):
            if rule.get("id") == rule_id:
                return rule
        raise UserError("规则不存在。")

    def add_history(self, username: str, result: dict, pr_url: str, model_config: dict) -> dict:
        users = self.load()
        user = self.require_user_from(users, username)
        item = {
            "id": secrets.token_urlsafe(10),
            "prUrl": pr_url,
            "prTitle": result.get("pr_overview", {}).get("title") or result.get("pr", {}).get("title", "粘贴 diff 分析"),
            "overallRisk": result.get("riskLevel", "low"),
            "riskCount": len(result.get("risks", [])),
            "model": model_config.get("displayName") or model_config.get("modelName", ""),
            "analyzedAt": int(time.time()),
            "report": result,
            "ask_threads": [],
        }
        history = user.setdefault("history", [])
        history.insert(0, item)
        del history[30:]
        user["updatedAt"] = int(time.time())
        self.save(users)
        return self.public_history_item(item)

    def list_history(self, username: str) -> list[dict]:
        user = self.require_user(username)
        return [self.public_history_item(item) for item in user.get("history", [])]

    def get_history(self, username: str, history_id: str) -> dict:
        user = self.require_user(username)
        item = next((item for item in user.get("history", []) if item["id"] == history_id), None)
        if not item:
            raise UserError("历史记录不存在。")
        item.setdefault("ask_threads", [])
        return item

    def add_ask_thread(self, username: str, history_id: str, question: str, answer: dict, model_config: dict) -> dict:
        users = self.load()
        user = self.require_user_from(users, username)
        item = next((item for item in user.get("history", []) if item["id"] == history_id), None)
        if not item:
            raise UserError("历史记录不存在。")
        thread = {
            "id": "ask_" + secrets.token_urlsafe(8),
            "history_id": history_id,
            "question": str(question or "").strip(),
            "answer": answer.get("answer", ""),
            "related_files": answer.get("related_files", []),
            "related_risks": answer.get("related_risks", []),
            "confidence": answer.get("confidence", 50),
            "limitations": answer.get("limitations", []),
            "model": model_config.get("displayName") or model_config.get("modelName", ""),
            "created_at": int(time.time()),
        }
        item.setdefault("ask_threads", []).append(thread)
        item["updatedAt"] = int(time.time())
        user["updatedAt"] = int(time.time())
        self.save(users)
        return thread

    def delete_history(self, username: str, history_id: str):
        users = self.load()
        user = self.require_user_from(users, username)
        before = len(user.get("history", []))
        user["history"] = [item for item in user.get("history", []) if item["id"] != history_id]
        if len(user["history"]) == before:
            raise UserError("历史记录不存在。")
        user["updatedAt"] = int(time.time())
        self.save(users)

    def build_model_config(self, payload: dict) -> dict:
        provider = normalize_provider(payload.get("provider", "Qwen"))
        base_url = normalize_base_url(provider, payload.get("base_url", ""))
        api_key = str(payload.get("api_key", "")).strip()
        if not api_key:
            raise UserError("API Key 不能为空。")
        model_name = normalize_model(payload.get("model_name", "qwen-plus"))
        now = int(time.time())
        return {
            "id": secrets.token_urlsafe(10),
            "provider": provider,
            "baseUrl": base_url,
            "apiKey": encrypt_text(api_key, self.secret),
            "apiKeyMask": mask_secret(api_key),
            "modelName": model_name,
            "isDefault": bool(payload.get("is_default")),
            "createdAt": now,
            "updatedAt": now,
        }

    def require_user(self, username: str) -> dict:
        users = self.load()
        return self.require_user_from(users, username)

    def require_user_from(self, users: dict, username: str) -> dict:
        username = normalize_username(username)
        user = users.get(username)
        if not user:
            raise UserError("账号不存在。")
        changed = self.migrate_legacy_user(user)
        if changed:
            user["updatedAt"] = int(time.time())
            self.save(users)
        return user

    def find_model_config(self, user: dict, config_id: str) -> dict:
        for item in user.get("modelConfigs", []):
            if item["id"] == config_id:
                return item
        raise UserError("模型配置不存在。")

    def mark_default(self, user: dict, config_id: str):
        found = False
        for item in user.get("modelConfigs", []):
            item["isDefault"] = item["id"] == config_id
            found = found or item["isDefault"]
        if not found:
            raise UserError("模型配置不存在。")

    def migrate_legacy_user(self, user: dict) -> bool:
        if "modelConfigs" in user:
            user.setdefault("history", [])
            user.setdefault("email", "")
            user.setdefault("reviewRules", default_rules())
            return False
        api_key = user.get("apiKey")
        if not api_key:
            user["modelConfigs"] = []
        else:
            model = user.get("defaultModel", "qwen-plus")
            user["modelConfigs"] = [{
                "id": secrets.token_urlsafe(10),
                "provider": "Qwen",
                "baseUrl": PROVIDERS["Qwen"],
                "apiKey": api_key,
                "apiKeyMask": "已保存",
                "modelName": model,
                "isDefault": True,
                "createdAt": user.get("createdAt", int(time.time())),
                "updatedAt": int(time.time()),
            }]
        user.setdefault("history", [])
        user.setdefault("email", "")
        user.setdefault("reviewRules", default_rules())
        user.pop("apiKey", None)
        user.pop("defaultModel", None)
        return True

    def public_user(self, user: dict) -> dict:
        configs = user.get("modelConfigs", [])
        default = next((item for item in configs if item.get("isDefault")), configs[0] if configs else None)
        return {
            "username": user["username"],
            "email": user.get("email", ""),
            "hasModelConfigs": bool(configs),
            "defaultModelConfig": self.public_model_config(default) if default else None,
        }

    def session_user(self, user: dict) -> dict:
        return self.public_user(user)

    def public_model_config(self, config: dict | None) -> dict | None:
        if not config:
            return None
        return {
            "id": config["id"],
            "provider": config["provider"],
            "base_url": config.get("baseUrl", ""),
            "api_key_mask": config.get("apiKeyMask", "已保存"),
            "model_name": config["modelName"],
            "is_default": bool(config.get("isDefault")),
            "display_name": model_display_name(config),
        }

    def public_history_item(self, item: dict) -> dict:
        return {
            "id": item["id"],
            "prUrl": item.get("prUrl", ""),
            "prTitle": item.get("prTitle", ""),
            "overallRisk": item.get("overallRisk", "low"),
            "riskCount": item.get("riskCount", 0),
            "askCount": len(item.get("ask_threads", [])),
            "model": item.get("model", ""),
            "analyzedAt": item.get("analyzedAt", 0),
        }

    def load(self) -> dict:
        if not self.path.exists():
            return {}
        return json.loads(self.path.read_text(encoding="utf-8"))

    def save(self, users: dict):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.path.with_suffix(".tmp")
        tmp_path.write_text(json.dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp_path.replace(self.path)

    def load_secret(self) -> bytes:
        self.secret_path.parent.mkdir(parents=True, exist_ok=True)
        if self.secret_path.exists():
            return b64decode(self.secret_path.read_text(encoding="utf-8").strip())
        secret = os.urandom(32)
        self.secret_path.write_text(b64(secret), encoding="utf-8")
        return secret


class SessionStore:
    def __init__(self):
        self.sessions = {}

    def create(self, user: dict) -> str:
        token = secrets.token_urlsafe(32)
        self.sessions[token] = {
            "username": user["username"],
            "createdAt": int(time.time()),
        }
        return token

    def get(self, token: str) -> dict | None:
        return self.sessions.get(token)

    def update(self, token: str, data: dict):
        if token in self.sessions:
            self.sessions[token].update(data)

    def delete(self, token: str):
        self.sessions.pop(token, None)


def normalize_username(username: str) -> str:
    username = username.strip()
    if not re.fullmatch(r"[A-Za-z0-9_]{3,24}", username):
        raise UserError("账号只能包含字母、数字和下划线，长度为 3 到 24 位。")
    return username


def normalize_email(email: str) -> str:
    email = (email or "").strip()
    if email and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise UserError("邮箱格式不正确。")
    return email


def validate_password(password: str):
    if len(password) < 6:
        raise UserError("密码长度至少需要 6 位。")


def normalize_provider(provider: str) -> str:
    provider = (provider or "Qwen").strip()
    if provider not in PROVIDERS:
        raise UserError("暂不支持该模型 Provider。")
    return provider


def normalize_base_url(provider: str, base_url: str) -> str:
    base_url = (base_url or "").strip() or PROVIDERS.get(provider, "")
    if provider == "Custom OpenAI-Compatible" and not base_url:
        raise UserError("自定义 OpenAI-Compatible Provider 需要填写 base_url。")
    if base_url and not re.match(r"^https?://", base_url):
        raise UserError("base_url 必须以 http:// 或 https:// 开头。")
    return base_url.rstrip("/")


def normalize_model(model: str) -> str:
    model = (model or "qwen-plus").strip()
    if not re.fullmatch(r"[A-Za-z0-9_.:/-]{2,120}", model):
        raise UserError("模型名称格式不正确。")
    return model


def normalize_string_list(value) -> list[str]:
    if isinstance(value, str):
        value = [item.strip() for item in value.replace("\n", ",").split(",")]
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def normalize_rule_choice(value: str, allowed: set[str], fallback: str) -> str:
    value = str(value or fallback).strip()
    return value if value in allowed else fallback


def model_display_name(config: dict) -> str:
    return f"{config.get('provider', 'Provider')} / {config.get('modelName', '')}"


def mask_secret(value: str) -> str:
    if len(value) <= 8:
        return "********"
    return value[:4] + "..." + value[-4:]


def hash_password(password: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)


def encrypt_text(text: str, secret: bytes) -> dict:
    nonce = os.urandom(16)
    data = text.encode("utf-8")
    stream = key_stream(secret, nonce, len(data))
    cipher = bytes(a ^ b for a, b in zip(data, stream))
    return {"nonce": b64(nonce), "cipher": b64(cipher)}


def decrypt_text(payload: dict, secret: bytes) -> str:
    nonce = b64decode(payload["nonce"])
    cipher = b64decode(payload["cipher"])
    stream = key_stream(secret, nonce, len(cipher))
    data = bytes(a ^ b for a, b in zip(cipher, stream))
    return data.decode("utf-8")


def key_stream(secret: bytes, nonce: bytes, size: int) -> bytes:
    blocks = []
    counter = 0
    while sum(len(block) for block in blocks) < size:
        msg = nonce + counter.to_bytes(4, "big")
        blocks.append(hmac.new(secret, msg, hashlib.sha256).digest())
        counter += 1
    return b"".join(blocks)[:size]


def b64(data: bytes) -> str:
    return base64.b64encode(data).decode("ascii")


def b64decode(value: str) -> bytes:
    return base64.b64decode(value.encode("ascii"))
