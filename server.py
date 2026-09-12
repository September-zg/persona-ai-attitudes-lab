from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import secrets
from threading import Lock
from scoring import compute_scores

ROOT = Path(__file__).parent
DATA = ROOT / "data.json"
DATA_LOCK = Lock()
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "").strip()


def admin_authorized(token):
    """如果配置了管理员令牌，就要求请求提供正确令牌；本地未配置时允许预览。"""
    if not ADMIN_TOKEN:
        return True
    return bool(token) and secrets.compare_digest(token, ADMIN_TOKEN)

def load_data():
    if not DATA.exists():
        return {"responses": [], "feedback": []}
    return json.loads(DATA.read_text(encoding="utf-8"))

def save_data(value):
    DATA.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204); self.end_headers()

    def do_GET(self):
        if self.path == "/api/summary":
            if not admin_authorized(self.headers.get("X-Admin-Token", "")):
                self.send_error(401, "需要管理员令牌")
                return
            body = json.dumps(load_data(), ensure_ascii=False).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body); return
        super().do_GET()

    def do_POST(self):
        if self.path not in ("/api/responses", "/api/feedback"):
            self.send_error(404); return
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length <= 0 or length > 100_000:
                self.send_error(413, "提交内容过大"); return
            item = json.loads(self.rfile.read(length))
            if not isinstance(item, dict):
                self.send_error(400, "需要 JSON 对象"); return
            if self.path.endswith("responses"):
                if not isinstance(item.get("answers"), dict):
                    self.send_error(400, "需要提供全部回答"); return
                try:
                    # 分数始终由服务器根据原始回答重新计算。
                    item["scores"] = compute_scores(item["answers"])
                except ValueError as exc:
                    self.send_error(400, str(exc)); return
                bucket = "responses"
            else:
                if not isinstance(item.get("rating"), (int, float)) or not 1 <= item["rating"] <= 5:
                    self.send_error(400, "评分必须在 1 到 5 之间"); return
                if len(str(item.get("comment", ""))) > 2_000:
                    self.send_error(400, "文字意见不能超过 2000 个字符"); return
                bucket = "feedback"
            with DATA_LOCK:
                data = load_data(); data[bucket].append(item); save_data(data)
            self.send_response(201); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(b'{"ok":true}')
        except (ValueError, json.JSONDecodeError):
            self.send_error(400, "JSON 格式无效")

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0" if os.environ.get("PORT") else "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    print(f"Assessment server: http://{host}:{port}/index.html")
    print(f"管理员令牌状态: {'已配置' if ADMIN_TOKEN else '未配置'}")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
