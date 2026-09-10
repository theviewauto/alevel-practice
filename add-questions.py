"""
ใช้แปลงไฟล์ JSON (ชุดโจทย์ใหม่ที่ได้ในแต่ละสัปดาห์) ให้เป็นไฟล์ .sql
พร้อมยิงเข้า D1 ด้วย wrangler

วิธีใช้:
    python add-questions.py new-batch-week02.json
จะได้ไฟล์ new-batch-week02.sql ออกมาในโฟลเดอร์เดียวกัน
แล้วรัน:
    npx wrangler d1 execute alevel-practice-db --remote --file=./new-batch-week02.sql

รูปแบบไฟล์ JSON ที่ต้องใช้ (array ของ object ต่อ 1 ข้อ):
[
  {
    "id": "math1-fn-w02-001",          <- ต้องไม่ซ้ำกับ id เดิมทั้งหมด แนะนำใส่เลขสัปดาห์ (w02) กันชนกัน
    "subject": "math1",                 <- math1 | phy | chem | bio
    "section": "จำนวนและพีชคณิต",
    "topic": "ฟังก์ชัน",
    "integrates_with": [],              <- ไม่บังคับ
    "difficulty": "medium",
    "skill_measured": "...",
    "skill_type": null,                 <- ใช้เฉพาะเคมี ไม่บังคับ
    "diagram_type": null,               <- ใช้เฉพาะฟิสิกส์ ไม่บังคับ
    "novel_scenario": 0,                <- 0/1 ไม่บังคับ
    "format": "mc5",                    <- mc5 | numeric | complex_choice
    "question": "...",
    "choices": ["...", "...", "...", "...", "..."],
    "answer": "...",
    "sub_items": null,                  <- ใช้เฉพาะชีวะเลือกตอบเชิงซ้อน ไม่บังคับ
    "solution_steps": ["...", "..."],
    "common_mistakes": ["..."]
  },
  ...
]
"""

import json
import sys


def esc(value) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, (list, dict)):
        value = json.dumps(value, ensure_ascii=False)
    return "'" + str(value).replace("'", "''") + "'"


def build_insert(q: dict) -> str:
    columns = [
        "id", "subject", "section", "topic", "integrates_with", "difficulty",
        "skill_measured", "skill_type", "diagram_type", "novel_scenario",
        "format", "question", "choices", "answer", "sub_items",
        "solution_steps", "common_mistakes",
    ]
    values = []
    for col in columns:
        v = q.get(col)
        if col == "integrates_with" and v is None:
            v = []
        if col in ("solution_steps", "common_mistakes") and v is None:
            v = []
        if col == "novel_scenario":
            v = 1 if v else 0
        values.append(esc(v))
    return f"INSERT INTO questions ({', '.join(columns)}) VALUES ({', '.join(values)});"


def main():
    if len(sys.argv) != 2:
        print("วิธีใช้: python add-questions.py <ไฟล์.json>")
        sys.exit(1)

    in_path = sys.argv[1]
    out_path = in_path.rsplit(".", 1)[0] + ".sql"

    with open(in_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    lines = [build_insert(q) for q in questions]

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"แปลงเสร็จ {len(questions)} ข้อ -> {out_path}")
    print(f"ขั้นต่อไป: npx wrangler d1 execute alevel-practice-db --remote --file=./{out_path}")


if __name__ == "__main__":
    main()
