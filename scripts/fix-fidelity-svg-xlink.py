from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ROOT / "assets/images/path-compass/clinician-fidelity-checklist.svg",
    ROOT / "projects/path-compass/screens/clinician-fidelity-checklist.svg",
]


def fix(text: str) -> str:
    if "xmlns:xlink" not in text:
        text = text.replace(
            'xmlns="http://www.w3.org/2000/svg">',
            'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
            1,
        )
    return text


def main() -> None:
    for path in FILES:
        if not path.exists():
            print(f"missing {path}")
            continue
        updated = fix(path.read_text(encoding="utf-8"))
        path.write_text(updated, encoding="utf-8")
        ET.parse(path)
        print(f"fixed and validated {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
