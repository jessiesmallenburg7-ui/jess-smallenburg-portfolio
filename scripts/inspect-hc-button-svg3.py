import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "assets/images/healthcare-consulting/After-without-callouts.svg"
text = path.read_text(encoding="utf-8")

# enroll label path
m = re.search(
    r'<path d="M120\.744 556\.768[^"]*" fill="white"/>',
    text,
)
if m:
    d = re.search(r'd="([^"]+)"', m.group(0)).group(1)
    ys = [float(n) for n in re.findall(r"(?:^|[^\d.-])(-?\d*\.?\d+)(?=(?:[,\s]|$))", " " + d.replace("M", " M ").replace("L", " L ").replace("H", " H ").replace("V", " V ")) if n]
    # simpler: find all numbers after V or as y in pairs
    nums = re.findall(r"-?\d+\.?\d*", d)
    coords = [float(x) for x in nums]
    # path uses implicit x,y pairs after M and L; also V y only
    print("enroll text path length", len(d))
    print("max number", max(coords))
    # extract V commands
    vs = [float(v) for v in re.findall(r"V(-?\d+\.?\d*)", d)]
    print("V values max", max(vs) if vs else None)
    # look for points near 594
    print("numbers between 590-600:", [n for n in coords if 590 <= n <= 600])

# cursor path max y
m2 = re.search(r'<path d="M421\.812 588\.938[^"]*" fill="#1D1C1C"/>', text)
if m2:
    d2 = re.search(r'd="([^"]+)"', m2.group(0)).group(1)
    vs2 = [float(v) for v in re.findall(r"V(-?\d+\.?\d*)", d2)]
    nums2 = [float(x) for x in re.findall(r"-?\d+\.?\d*", d2)]
    print("cursor V max", max(vs2) if vs2 else None)
    print("cursor nums 590-632:", [n for n in nums2 if 590 <= n <= 632][:20])
