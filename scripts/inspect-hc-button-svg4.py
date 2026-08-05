import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "assets/images/healthcare-consulting/After-without-callouts.svg"
text = path.read_text(encoding="utf-8")

for m in re.finditer(r"<path[^>]+>", text):
    tag = m.group(0)
    if not re.search(r"fill=\"white\"", tag):
        continue
    d = re.search(r'd="([^"]+)"', tag)
    if not d:
        continue
    d = d.group(1)
    nums = [float(x) for x in re.findall(r"-?\d+\.?\d*", d)]
    if any(580 <= n <= 610 for n in nums):
        print("WHITE PATH near button:")
        print(tag[:180])
        print("sample nums 580-610:", [n for n in nums if 580 <= n <= 610][:15])
