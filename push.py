import subprocess
import sys
from datetime import datetime


def run(command: list[str]) -> None:
    print(f"\n> {' '.join(command)}")
    result = subprocess.run(command, text=True)

    if result.returncode != 0:
        print("\nเกิดข้อผิดพลาด: คำสั่งทำงานไม่สำเร็จ")
        sys.exit(result.returncode)


message = " ".join(sys.argv[1:]).strip()

if not message:
    message = f"update: {datetime.now().strftime('%Y-%m-%d %H:%M')}"

run(["git", "add", "."])

check = subprocess.run(["git", "diff", "--cached", "--quiet"], text=True)

if check.returncode == 0:
    print("\nไม่มีการแก้ไขไฟล์ จึงไม่มีอะไรให้ Push")
    sys.exit(0)

run(["git", "commit", "-m", message])
run(["git", "push", "origin", "main"])

print("\nสำเร็จ: Push โค้ดขึ้น GitHub เรียบร้อย")