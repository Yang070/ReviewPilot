from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import mimetypes
import os
import sys

from reviewpilot.review_service import ReviewError, review_change

ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
PORT = int(os.getenv("REVIEWPILOT_PORT", "8770"))


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/health":
            self.send_json({"ok": True})
            return
        self.serve_static()

    def do_POST(self):
        if self.path != "/api/review":
            self.send_error(404)
            return
        try:
            payload = self.read_json()
            pr_url = payload.get("prUrl", "")
            diff = payload.get("diff", "")
            if not isinstance(pr_url, str) or not isinstance(diff, str):
                raise ReviewError("请求字段 prUrl 和 diff 必须是字符串。")
            result = review_change(pr_url, diff)
            self.send_json(result)
        except ReviewError as exc:
            self.send_json({"error": str(exc)}, status=400)
        except Exception as exc:
            self.send_json({"error": f"Unexpected server error: {exc}"}, status=500)

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


def main():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"ReviewPilot 已启动：http://127.0.0.1:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
