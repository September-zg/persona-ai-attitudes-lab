"""Small same-origin assessment server using only the Python standard library."""
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.parse import unquote, urlsplit
import hashlib
import json
import math
import os
import re
import secrets
import uuid
from scoring import compute_scores

ROOT = Path(__file__).resolve().parent
DATA = Path(os.environ.get('DATA_FILE', ROOT / 'data.json')).resolve()
DATA_LOCK = Lock()
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', '').strip()
ASSETS = {'/': 'index.html', '/index.html': 'index.html', '/admin': 'index.html',
          '/app.js': 'app.js', '/questionnaire.js': 'questionnaire.js',
          '/analysis.js': 'analysis.js', '/styles.css': 'styles.css'}
FEEDBACK_KEYS = {'instructions', 'questions', 'results', 'satisfaction'}

def admin_authorized(token):
    return bool(ADMIN_TOKEN and token) and secrets.compare_digest(token.encode(), ADMIN_TOKEN.encode())

def now():
    return datetime.now(timezone.utc).isoformat()

def load_data():
    if not DATA.exists():
        return {'responses': [], 'feedback': []}
    value = json.loads(DATA.read_text(encoding='utf-8'))
    if not isinstance(value, dict) or any(not isinstance(value.get(k), list) for k in ('responses', 'feedback')):
        raise ValueError('Invalid stored data; preserve the file and investigate.')
    return value

def save_data(value):
    DATA.parent.mkdir(parents=True, exist_ok=True)
    temporary = DATA.with_name(DATA.name + '.tmp')
    with temporary.open('w', encoding='utf-8') as file:
        json.dump(value, file, ensure_ascii=False, indent=2, allow_nan=False)
        file.flush()
        os.fsync(file.fileno())
    os.chmod(temporary, 0o600)
    temporary.replace(DATA)

def integer_rating(value):
    return type(value) is int and 1 <= value <= 5

def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9_-]{8,80}', value):
        raise ValueError('匿名编号格式无效。')
    return value

def normalize_item(raw, bucket, importing=False):
    if not isinstance(raw, dict):
        raise ValueError('需要 JSON 对象。')
    item = {}
    if bucket == 'responses':
        item['scores'] = compute_scores(raw.get('answers'))
        item['answers'] = dict(raw['answers'])
        if 'durationSeconds' in raw:
            duration = raw['durationSeconds']
            if type(duration) not in (int, float) or not math.isfinite(duration) or not 0 <= duration <= 604800:
                raise ValueError('完成用时无效。')
            item['durationSeconds'] = round(duration, 1)
        item['questionnaireVersion'] = raw.get('questionnaireVersion', 'assessment-v1')
        if item['questionnaireVersion'] != 'assessment-v1':
            raise ValueError('不支持的问卷版本。')
    else:
        if not integer_rating(raw.get('rating')):
            raise ValueError('操作易用性评分必须为 1–5 的整数。')
        comment = raw.get('comment', '')
        if not isinstance(comment, str) or len(comment) > 2000:
            raise ValueError('文字意见不能超过 2000 个字符。')
        item.update(rating=raw['rating'], comment=comment)
        if 'ratings' in raw:
            ratings = raw['ratings']
            if not isinstance(ratings, dict) or set(ratings) != FEEDBACK_KEYS or not all(integer_rating(v) for v in ratings.values()):
                raise ValueError('请完整填写反馈评分。')
            item['ratings'] = dict(ratings)
            item['feedbackVersion'] = 'feedback-v2'
    if 'participantId' in raw:
        item['participantId'] = identifier(raw['participantId'])
    item['submittedAt'] = now()
    if importing and raw.get('submittedAt'):
        stamp = raw['submittedAt']
        if not isinstance(stamp, str):
            raise ValueError('备份时间格式无效。')
        parsed = datetime.fromisoformat(stamp.replace('Z', '+00:00'))
        if parsed.tzinfo is None:
            raise ValueError('备份时间须包含时区。')
        item['submittedAt'] = stamp
    if raw.get('syntheticTest') is True:
        item['syntheticTest'] = True
    if raw.get('id'):
        item['id'] = identifier(raw['id'])
    elif importing:
        item['id'] = legacy_id(raw, bucket)
    else:
        item['id'] = str(uuid.uuid4())
    return item

def legacy_id(item, bucket):
    # Existing v1 records have no ID. Timestamp + content identifies a saved event.
    core = {'submittedAt':item.get('submittedAt'), 'bucket':bucket}
    core.update({'answers':item.get('answers')} if bucket == 'responses' else {'rating':item.get('rating'), 'comment':item.get('comment', '')})
    return 'legacy-' + hashlib.sha256(json.dumps(core, sort_keys=True, ensure_ascii=False).encode()).hexdigest()

def merge_backup(data, backup):
    if not isinstance(backup, dict) or any(not isinstance(backup.get(k), list) for k in ('responses', 'feedback')):
        raise ValueError('备份须包含 responses 和 feedback 数组。')
    normalized = {bucket:[normalize_item(r, bucket, importing=True) for r in backup[bucket]] for bucket in ('responses', 'feedback')}
    added = {}
    for bucket in normalized:
        known = {r.get('id') or legacy_id(r, bucket) for r in data[bucket]}
        added[bucket] = 0
        for row in normalized[bucket]:
            if row['id'] not in known:
                data[bucket].append(row)
                known.add(row['id'])
                added[bucket] += 1
    return added

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *_):
        # Do not log respondent IP addresses, query strings or submitted content.
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        super().end_headers()

    def json_response(self, status, payload, head=False):
        body = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if not head:
            self.wfile.write(body)

    def route_read(self, head=False):
        path = unquote(urlsplit(self.path).path)
        if path == '/api/summary':
            if not admin_authorized(self.headers.get('X-Admin-Token', '')):
                return self.json_response(401, {'error':'需要正确的研究者密码。'}, head)
            with DATA_LOCK:
                payload = load_data()
            return self.json_response(200, payload, head)
        if path == '/api/health':
            return self.json_response(200, {'ok':True, 'version':'20260913-review-v2'}, head)
        if path not in ASSETS:
            return self.json_response(404, {'error':'页面不存在。'}, head)
        self.path = '/' + ASSETS[path]
        return super().do_HEAD() if head else super().do_GET()

    def do_GET(self):
        self.route_read()

    def do_HEAD(self):
        self.route_read(head=True)

    def do_POST(self):
        path = urlsplit(self.path).path
        if path not in ('/api/responses', '/api/feedback', '/api/import'):
            return self.json_response(404, {'error':'接口不存在。'})
        importing = path == '/api/import'
        if importing and not admin_authorized(self.headers.get('X-Admin-Token', '')):
            return self.json_response(401, {'error':'需要正确的研究者密码。'})
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= (5_000_000 if importing else 100_000):
                return self.json_response(413, {'error':'提交大小无效。'})
            raw = json.loads(self.rfile.read(length))
            if importing:
                with DATA_LOCK:
                    data = load_data()
                    added = merge_backup(data, raw)
                    save_data(data)
                return self.json_response(200, {'ok':True, 'added':added})
            bucket = 'responses' if path.endswith('responses') else 'feedback'
            item = normalize_item(raw, bucket)
            with DATA_LOCK:
                data = load_data()
                existing = next((r for r in data[bucket] if r.get('id') == item['id']), None)
                if existing:
                    identity_fields = ('answers', 'participantId') if bucket == 'responses' else ('rating', 'comment', 'ratings', 'participantId')
                    if any(existing.get(k) != item.get(k) for k in identity_fields):
                        return self.json_response(409, {'error':'编号已用于另一份提交，请返回首页重新开始。'})
                    return self.json_response(200, {'ok':True, 'item':existing, 'duplicate':True})
                data[bucket].append(item)
                save_data(data)
            self.json_response(201, {'ok':True, 'item':item})
        except (ValueError, TypeError) as exc:
            self.json_response(400, {'error':str(exc)})
        except OSError:
            self.json_response(503, {'error':'暂时无法保存，请保留页面并重试。'})

if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0' if os.environ.get('PORT') else '127.0.0.1')
    port = int(os.environ.get('PORT', '8000'))
    print(f'Assessment server: http://{host}:{port}/index.html', flush=True)
    print('Researcher access: ' + ('password configured' if ADMIN_TOKEN else 'disabled until ADMIN_TOKEN is set'), flush=True)
    ThreadingHTTPServer((host, port), Handler).serve_forever()
