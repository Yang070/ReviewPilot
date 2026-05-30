from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import json
import mimetypes
import os
import sys

from reviewpilot.qwen_client import QwenError, test_chat_connection
from reviewpilot.review_service import ReviewError, deep_audit_review, review_change
from reviewpilot.rule_checker import RULE_TEMPLATES
from reviewpilot.user_store import SessionStore, UserError, UserStore

ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
PORT = int(os.getenv("REVIEWPILOT_PORT", "8770"))
USER_STORE = UserStore(ROOT / "data" / "users.json", ROOT / "data" / "app_secret.key")
SESSIONS = SessionStore()
PROVIDERS = ["OpenAI", "Qwen", "DeepSeek", "Claude", "Custom OpenAI-Compatible"]


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.route_path()
        if path == "/api/health":
            self.send_json({"ok": True})
            return
        if path == "/api/me":
            session = self.require_session()
            if session:
                self.send_json(USER_STORE.get_user(session["username"]))
            return
        if path == "/api/providers":
            self.send_json({"providers": PROVIDERS})
            return
        if path == "/api/model-configs":
            session = self.require_session()
            if session:
                self.send_json({"configs": USER_STORE.list_model_configs(session["username"])})
            return
        if path == "/api/history":
            session = self.require_session()
            if session:
                self.send_json({"items": USER_STORE.list_history(session["username"])})
            return
        if path == "/api/rules":
            session = self.require_session()
            if session:
                self.send_json({"rules": USER_STORE.list_rules(session["username"])})
            return
        if path == "/api/rule-templates":
            self.send_json({"templates": RULE_TEMPLATES})
            return
        if path.startswith("/api/history/"):
            session = self.require_session()
            if session:
                self.handle_history_detail(path.rsplit("/", 1)[-1])
            return
        if path.startswith("/api/"):
            self.send_json({"error": "接口不存在，请检查当前服务版本是否已更新。"}, status=404)
            return
        self.serve_static()

    def do_POST(self):
        path = self.route_path()
        if path == "/api/register":
            self.handle_register()
            return
        if path == "/api/login":
            self.handle_login()
            return
        if path == "/api/logout":
            self.handle_logout()
            return
        if path == "/api/review":
            self.handle_review()
            return
        if path == "/api/review/deep-audit":
            self.handle_deep_audit_review()
            return
        if path == "/api/rules":
            self.handle_add_rule()
            return
        if path == "/api/rules/copy-template":
            self.handle_copy_rule_template()
            return
        if path == "/api/model-configs":
            self.handle_add_model_config()
            return
        if path == "/api/model-configs/test":
            self.handle_test_model_config()
            return
        if path.startswith("/api/model-configs/") and path.endswith("/default"):
            self.handle_set_default_model_config(path.split("/")[-2])
            return
        if path.startswith("/api/"):
            self.send_json({"error": "接口不存在，请确认服务已重启并使用最新代码。"}, status=404)
            return
        self.send_error(404)

    def do_PATCH(self):
        path = self.route_path()
        if path.startswith("/api/model-configs/"):
            self.handle_update_model_config(path.rsplit("/", 1)[-1])
            return
        if path.startswith("/api/rules/"):
            self.handle_update_rule(path.rsplit("/", 1)[-1])
            return
        if path.startswith("/api/"):
            self.send_json({"error": "接口不存在，请确认服务已重启并使用最新代码。"}, status=404)
            return
        self.send_error(404)

    def do_DELETE(self):
        path = self.route_path()
        if path.startswith("/api/model-configs/"):
            self.handle_delete_model_config(path.rsplit("/", 1)[-1])
            return
        if path.startswith("/api/history/"):
            self.handle_delete_history(path.rsplit("/", 1)[-1])
            return
        if path.startswith("/api/rules/"):
            self.handle_delete_rule(path.rsplit("/", 1)[-1])
            return
        if path.startswith("/api/"):
            self.send_json({"error": "接口不存在，请确认服务已重启并使用最新代码。"}, status=404)
            return
        self.send_error(404)

    def handle_register(self):
        try:
            payload = self.read_json()
            user = USER_STORE.register(
                payload.get("username", ""),
                payload.get("email", ""),
                payload.get("password", ""),
                payload.get("confirmPassword", ""),
            )
            token = SESSIONS.create(user)
            self.send_json({"token": token, "user": USER_STORE.get_user(user["username"])})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_login(self):
        try:
            payload = self.read_json()
            user = USER_STORE.authenticate(payload.get("username", ""), payload.get("password", ""))
            token = SESSIONS.create(user)
            self.send_json({"token": token, "user": USER_STORE.get_user(user["username"])})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_logout(self):
        token = self.auth_token()
        if token:
            SESSIONS.delete(token)
        self.send_json({"ok": True})

    def handle_add_model_config(self):
        session = self.require_session()
        if not session:
            return
        try:
            payload = self.read_json()
            config = USER_STORE.add_model_config(session["username"], payload)
            self.send_json({"config": config})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_update_model_config(self, config_id: str):
        session = self.require_session()
        if not session:
            return
        try:
            config = USER_STORE.update_model_config(session["username"], config_id, self.read_json())
            self.send_json({"config": config})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_delete_model_config(self, config_id: str):
        session = self.require_session()
        if not session:
            return
        try:
            USER_STORE.delete_model_config(session["username"], config_id)
            self.send_json({"ok": True})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_set_default_model_config(self, config_id: str):
        session = self.require_session()
        if not session:
            return
        try:
            config = USER_STORE.set_default_model_config(session["username"], config_id)
            self.send_json({"config": config})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_test_model_config(self):
        session = self.require_session()
        if not session:
            return
        try:
            payload = self.read_json()
            if payload.get("configId"):
                config = USER_STORE.get_model_config_secret(session["username"], payload.get("configId"))
            else:
                config = USER_STORE.build_model_config(payload)
                config = {
                    "apiKey": payload.get("api_key", ""),
                    "modelName": config["modelName"],
                    "baseUrl": config["baseUrl"],
                    "provider": config["provider"],
                }
            test_chat_connection(config["apiKey"], config["modelName"], config["baseUrl"], config.get("provider", ""))
            self.send_json({"ok": True, "message": "连接测试成功。"})
        except (UserError, QwenError) as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_review(self):
        session = self.require_session()
        if not session:
            return
        try:
            payload = self.read_json()
            pr_url = payload.get("prUrl", "")
            diff = payload.get("diff", "")
            model_config_id = payload.get("modelConfigId", "")
            if not isinstance(pr_url, str) or not isinstance(diff, str):
                raise ReviewError("请求字段 prUrl 和 diff 必须是字符串。")
            if not isinstance(model_config_id, str):
                raise ReviewError("模型配置 ID 必须是字符串。")
            model_config = USER_STORE.get_model_config_secret(session["username"], model_config_id or None)
            rules = USER_STORE.list_rules(session["username"])
            result = review_change(pr_url, diff, model_config=model_config, rules=rules)
            history = USER_STORE.add_history(session["username"], result, pr_url, model_config)
            result["history_id"] = history["id"]
            self.send_json(result)
        except (ReviewError, UserError) as exc:
            self.send_json({"error": str(exc)}, status=400)
        except Exception as exc:
            self.send_json({"error": f"服务端发生未预期错误：{exc}"}, status=500)

    def handle_deep_audit_review(self):
        session = self.require_session()
        if not session:
            return
        try:
            payload = self.read_json()
            pr_url = payload.get("pr_url", payload.get("prUrl", ""))
            diff_text = payload.get("diff_text", payload.get("diff", ""))
            reviewer_id = payload.get("reviewer_model_config_id", "")
            auditor_id = payload.get("auditor_model_config_id", "")
            reviewer_config = USER_STORE.get_model_config_secret(session["username"], reviewer_id or None)
            auditor_config = USER_STORE.get_model_config_secret(session["username"], auditor_id or reviewer_id or None)
            rules = USER_STORE.list_rules(session["username"])
            result = deep_audit_review(pr_url, diff_text, reviewer_config, auditor_config, rules)
            history = USER_STORE.add_history(session["username"], result, pr_url, reviewer_config)
            result["history_id"] = history["id"]
            self.send_json(result)
        except (ReviewError, UserError) as exc:
            self.send_json({"error": str(exc)}, status=400)
        except Exception as exc:
            self.send_json({"error": f"服务端发生未预期错误：{exc}"}, status=500)

    def handle_add_rule(self):
        session = self.require_session()
        if not session:
            return
        try:
            self.send_json({"rule": USER_STORE.add_rule(session["username"], self.read_json())})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_update_rule(self, rule_id: str):
        session = self.require_session()
        if not session:
            return
        try:
            self.send_json({"rule": USER_STORE.update_rule(session["username"], rule_id, self.read_json())})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_delete_rule(self, rule_id: str):
        session = self.require_session()
        if not session:
            return
        try:
            USER_STORE.delete_rule(session["username"], rule_id)
            self.send_json({"ok": True})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_copy_rule_template(self):
        session = self.require_session()
        if not session:
            return
        try:
            template_id = self.read_json().get("template_id", "")
            self.send_json({"rule": USER_STORE.copy_rule_template(session["username"], template_id)})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=400)

    def handle_history_detail(self, history_id: str):
        session = self.require_session()
        if not session:
            return
        try:
            self.send_json(USER_STORE.get_history(session["username"], history_id))
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=404)

    def handle_delete_history(self, history_id: str):
        session = self.require_session()
        if not session:
            return
        try:
            USER_STORE.delete_history(session["username"], history_id)
            self.send_json({"ok": True})
        except UserError as exc:
            self.send_json({"error": str(exc)}, status=404)

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
            file_path = WEB_DIR / "index.html"
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

    def route_path(self):
        return urlparse(self.path).path


def main():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"ReviewPilot 已启动：http://127.0.0.1:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
