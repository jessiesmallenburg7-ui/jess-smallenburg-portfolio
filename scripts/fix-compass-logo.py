from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCREENS = ROOT / "projects" / "path-compass" / "screens"
ASSETS = ROOT / "assets" / "images" / "path-compass"

OLD_LOGO = """<rect x="40" y="16" width="28" height="28" rx="6" fill="#5C7A8A"/>
<circle cx="54" cy="30" r="6.667" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>"""

NEW_LOGO = """<rect x="40" y="16" width="28" height="28" rx="6" fill="#5C7A8A"/>
<g transform="translate(54 30)" aria-hidden="true">
  <circle r="6.667" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M0 -4.25 L1.05 0 L0 4.25 L-1.05 0 Z" fill="white" transform="rotate(45)"/>
</g>"""

# Baseline export still has the clipped ring-only variant.
OLD_LOGO_BASELINE = """<rect x="40" y="16" width="28" height="28" rx="6" fill="#5C7A8A"/>
<g clip-path="url(#clip0_2_434)">
<path d="M54 36.6672C57.6822 36.6672 60.6672 33.6822 60.6672 30C60.6672 26.3178 57.6822 23.3328 54 23.3328C50.3178 23.3328 47.3328 26.3178 47.3328 30C47.3328 33.6822 50.3178 36.6672 54 36.6672Z" stroke="white" stroke-width="2" stroke-linecap="round"/>
</g>"""

FILES = [
    SCREENS / "clinician-dashboard-updated.svg",
    SCREENS / "clinician-dashboard.svg",
    ASSETS / "clinician-dashboard-updated.svg",
]


def update(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    updated = text
    for old in (OLD_LOGO, OLD_LOGO_BASELINE):
        if old in updated:
            updated = updated.replace(old, NEW_LOGO, 1)
            break
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        print(f"updated {path.relative_to(ROOT)}")
    else:
        print(f"no change {path.relative_to(ROOT)}")


if __name__ == "__main__":
    for file in FILES:
        if file.exists():
            update(file)
