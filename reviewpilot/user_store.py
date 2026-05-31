from pathlib import Path
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


class UserStore:
    def __init__(self, path: Path, secret_path: Path):
        self.path = path
        self.secret_path = secret_path
        self.secret = self.load_secret()

    def register(self, username: str, password: str, api_key: str, default_model: str) -> dict:
        username = normalize_username(username)
        validate_password(password)
        api_key = api_key.strip()
        if not api_key:
            raise UserError("注册时需要填写千问 API Key。")
        users = self.load()
        if username in users:
            raise UserError("该账号已存在。")
        now = int(time.time())
        salt = os.urandom(16)
        users[username] = {
            "username": username,
            "passwordSalt": b64(salt),
            "passwordHash": b64(hash_password(password, salt)),
            "apiKey": encrypt_text(api_key, self.secret),
            "defaultModel": normalize_model(default_model),
            "createdAt": now,
            "updatedAt": now,
        }
        self.save(users)
        return {"username": username, "apiKey": api_key, "defaultModel": users[username]["defaultModel"]}

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
        return {
            "username": username,
            "apiKey": decrypt_text(user["apiKey"], self.secret),
            "defaultModel": user.get("defaultModel", "qwen-plus"),
        }

    def update_settings(self, username: str, api_key: str | None, default_model: str | None) -> dict:
        username = normalize_username(username)
        users = self.load()
        user = users.get(username)
        if not user:
            raise UserError("账号不存在。")
        if api_key is not None and api_key.strip():
            user["apiKey"] = encrypt_text(api_key.strip(), self.secret)
        if default_model is not None and default_model.strip():
            user["defaultModel"] = normalize_model(default_model)
        user["updatedAt"] = int(time.time())
        self.save(users)
        return {
            "username": username,
            "apiKey": decrypt_text(user["apiKey"], self.secret),
            "defaultModel": user.get("defaultModel", "qwen-plus"),
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
            "apiKey": user["apiKey"],
            "defaultModel": user.get("defaultModel", "qwen-plus"),
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


def validate_password(password: str):
    if len(password) < 6:
        raise UserError("密码长度至少需要 6 位。")


def normalize_model(model: str) -> str:
    model = (model or "qwen-plus").strip()
    if not re.fullmatch(r"[A-Za-z0-9_.:-]{2,80}", model):
        raise UserError("模型名称格式不正确。")
    return model


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
