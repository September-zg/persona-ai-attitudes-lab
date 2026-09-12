# Data dictionary

The repository may include `synthetic_responses_10.json` for reproducible scoring checks. Every record is marked `syntheticTest: true` and must be excluded from any real pilot count or report.

| Field | Meaning | Handling |
|---|---|---|
| `submittedAt` | ISO 8601 submission timestamp | Synthetic fixture only; do not use as participant identity |
| `syntheticTest` | Whether the record is generated test data | Must remain `true` for fixture records |
| `testGroup` | Synthetic pattern identifier | Used only to reproduce expected score patterns |
| `answers` | Item IDs mapped to integer responses from 1 to 5 | Required for all 28 items in a complete submission |
| `scores` | Server-computed dimension means on the 1–5 scale | Never accept client scores as authoritative |

The runtime server file `data.json` is local operational storage and is excluded from version control. Real pilot exports must be de-identified, access-controlled, and stored according to the documented retention and deletion plan.
