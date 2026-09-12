"""Append the clearly marked synthetic validation fixture to the local server.
This never deletes or overwrites existing records.
"""
import json
from pathlib import Path
from urllib.request import Request, urlopen

URL = "http://127.0.0.1:8000/api/responses"
fixture = Path(__file__).parent / "test-fixtures" / "synthetic_responses_10.json"
rows = json.loads(fixture.read_text(encoding="utf-8"))
for row in rows:
    request = Request(URL, data=json.dumps(row, ensure_ascii=False).encode("utf-8"), headers={"Content-Type":"application/json"}, method="POST")
    with urlopen(request) as response:
        if response.status != 201:
            raise RuntimeError(f"server returned {response.status}")
print(f"Appended {len(rows)} clearly marked synthetic test responses.")
print("These are validation records, not real participants. Review the dashboard, then remove them only through your approved test-data cleanup process before the pilot.")
