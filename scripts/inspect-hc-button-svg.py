import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "assets/images/healthcare-consulting/After-without-callouts.svg"
text = path.read_text(encoding="utf-8")

# All top-level elements between button group and defs
idx = text.find('<g filter="url(#filter1_d_260_2)">')
chunk = text[idx : text.find("<defs>", idx)]

for m in re.finditer(r"<(path|rect)[^>]+>", chunk):
    tag = m.group(0)
    if len(tag) > 120:
        tag = tag[:80] + "..." + tag[-40:]
    print(tag)

print("\n--- paths with fill white/ff in button y-range ---")
for m in re.finditer(r"<path[^>]+>", text):
    tag = m.group(0)
    if "fill=" not in tag:
        continue
    fill_match = re.search(r'fill="([^"]+)"', tag)
    if not fill_match:
        continue
    fill = fill_match.group(1).lower()
    if fill in ("white", "#fff", "#ffffff"):
        if any(y in tag for y in ("588", "589", "590", "591", "592", "593", "594", "595", "596", "597", "598", "599", "600")):
            print(tag[:200])

print("\n--- filter1 definition ---")
m = re.search(r'<filter id="filter1_d_260_2"[^>]*>.*?</filter>', text, re.S)
print(m.group(0) if m else "not found")

print("\n--- paint3 ---")
m = re.search(r'<linearGradient id="paint3_linear_260_2"[^>]*>.*?</linearGradient>', text, re.S)
print(m.group(0) if m else "not found")
