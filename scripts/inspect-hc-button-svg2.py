from pathlib import Path

path = Path(__file__).resolve().parents[1] / "assets/images/healthcare-consulting/After-without-callouts.svg"
lines = path.read_text(encoding="utf-8").splitlines()
for i in range(28, 38):
    line = lines[i]
    print(f"{i+1:3}: {line[:120]}{'...' if len(line)>120 else ''}")
