from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import mimetypes
import os
import sys

from reviewpilot.review_service import ReviewError, review_change
from reviewpilot.user_store import SessionStore, UserError, UserStore

ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
PORT = int(os.getenv("REVIEWPILOT_PORT", "8770"))
USER_STORE = UserStore(ROOT / "data" / "users.json", ROOT / "data" / "app_secret.key")
SESSIONS = SessionStore()
MODELS = ["qwen-plus", "qwen-plus-2025-07-28", "qwen-long", "qwen-max"]


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/health":
            self.send_json({"ok": True})
            return
        if self.path == "/api/me":
            session = self.require_session()
            if session:
                self.send_json(public_session(session))
            return
        if self.path == "/api/models":
            self.send_json({"models": MODELS})
            return
        self.serve_static()

    def do_POST(self):
        if self.path == "/api/register":
            self.handle_register()
            return
        if self.path == "/api/login":
            self.handle_login()
            return
        if self.path == "/api/logout":
            self.handle_logout()
            return
        if self.path == "/api/review":
            self.handle_review()
            return
        self.send_error(404)

    def do_PATCH(self):
        if self.path == "/api/settings":
            self.handle_settings()
            return
        self.send_error(404)

    def handle_register(self):
        try:
            payload = self.read_json()
            user = USER_STORE.register(
                payload.get("username", ""),
                payload.get("password", ""),
                payload.get("apiKey", ""),
                payload.get("defaultModel", "qwen-plus"),
            )
            token = SESSIONS.create(user)
            self.send_json({"token": token, "user": public_session(SESSIONS.get(token))})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_login(self):
        try:
            payload = self.read_json()
            user = USER_STORE.authenticate(payload.get("username", ""), payload.get("password", ""))
            token = SESSIONS.create(user)
            self.send_json({"token": token, "user": public_session(SESSIONS.get(token))})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_logout(self):
        token = self.auth_token()
        if token:
            SESSIONS.delete(token)
        self.send_json({"ok": True})

    def handle_settings(self):
        session = self.require_session()
        if not session:
            return
        try:
            payload = self.read_json()
            settings = USER_STORE.update_settings(
                session["username"],
                payload.get("apiKey"),
                payload.get("defaultModel"),
            )
            token = self.auth_token()
            SESSIONS.update(token, {
                "apiKey": settings["apiKey"],
                "defaultModel": settings["defaultModel"],
            })
            self.send_json({"user": public_session(SESSIONS.get(token))})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_review(self):
        session = self.require_session()
        if not session:
            return
        try:
            payload = self.read_json()
            pr_url = payload.get("prUrl", "")
            diff = payload.get("diff", "")
            model = payload.get("model") or session.get("defaultModel") or "qwen-plus"
            if not isinstance(pr_url, str) or not isinstance(diff, str):
                raise ReviewError("请求字段 prUrl 和 diff 必须是字符串。")
            if not isinstance(model, str):
                raise ReviewError("模型名称必须是字符串。")
            result = review_change(pr_url, diff, session["apiKey"], model)
            self.send_json(result)
        except (ReviewError, UserError) as exc:
            self.send_json({"error": str(exc)}, status=400)
        except Exception as exc:
            self.send_json({"error": f"服务端发生未预期错误：{exc}"}, status=500)

    def require_session(self):
        token = self.auth_token()
        session = SESSIONS.get(token) if token else None
        if not session:
            self.send_json({"error": "请先登录。"}, status=401)
            return None
        return session

    def auth_token(self):
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return ""
        return auth[7:].strip()

    def serve_static(self):
        rel_path = self.path.split("?", 1)[0].lstrip("/") or "index.html"
        file_path = (WEB_DIR / rel_path).resolve()
        if not str(file_path).startswith(str(WEB_DIR.resolve())) or not file_path.is_file():
            self.send_error(404)
            return
        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        sys.stdout.write("%s - %s\n" % (self.address_string(), fmt % args))


def public_session(session: dict) -> dict:
    return {
        "username": session["username"],
        "defaultModel": session.get("defaultModel", "qwen-plus"),
        "hasApiKey": bool(session.get("apiKey")),
    }


def main():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"ReviewPilot 已启动：http://127.0.0.1:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
