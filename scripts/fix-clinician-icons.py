from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SCREENS = ROOT / "projects" / "path-compass" / "screens"
ASSETS = ROOT / "assets" / "images" / "path-compass"

LOGO_BLOCK = """<rect x="40" y="16" width="28" height="28" rx="6" fill="#5C7A8A"/>
<g transform="translate(54 30)" aria-hidden="true">
  <circle r="6.667" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M0 -4.25 L1.05 0 L0 4.25 L-1.05 0 Z" fill="white" transform="rotate(45)"/>
</g>"""

COMPASS_RING_FIX = (
    '<g clip-path="url(#clip0_2_535)">\n'
    '<path d="M54 36.6672C57.6822 36.6672 60.6672 33.6822 60.6672 30C60.6672 26.3178 57.6822 23.3328 54 23.3328C50.3178 23.3328 47.3328 26.3178 47.3328 30C47.3328 33.6822 50.3178 36.6672 54 36.6672Z" stroke="white" stroke-width="2" stroke-linecap="round"/>\n'
    "</g>"
)
COMPASS_RING_REPLACEMENT = """<g transform="translate(54 30)" aria-hidden="true">
  <circle r="6.667" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M0 -4.25 L1.05 0 L0 4.25 L-1.05 0 Z" fill="white" transform="rotate(45)"/>
</g>"""

TIP_ICON_FIX = (
    '<g clip-path="url(#clip1_2_535)">\n'
    '<path d="M66 370.5C66 372.433 64.433 374 62.5 374C60.567 374 59 372.433 59 370.5C59 368.567 60.567 367 62.5 367C64.433 367 66 368.567 66 370.5Z" stroke="white" stroke-width="1.8" stroke-linecap="round"/>\n'
    '<path d="M62.5 371.5V374.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>\n'
    '<path d="M62.5 369.2H62.506" stroke="white" stroke-width="1.8" stroke-linecap="round"/>\n'
    "</g>"
)
TIP_ICON_REPLACEMENT = """<circle cx="62.5" cy="370.5" r="3.5" stroke="white" stroke-width="1.8" fill="none"/>
<path d="M62.5 372.2V374" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="62.5" cy="369.5" r="0.6" fill="white"/>"""

OKAY_FACE = """<g transform="translate(84 327.54)" aria-hidden="true">
  <circle cx="0" cy="0" r="11" fill="#F4C790"/>
  <circle cx="-3.8" cy="-2.4" r="1.3" fill="#1F3330"/>
  <circle cx="3.8" cy="-2.4" r="1.3" fill="#1F3330"/>
  <path d="M-4.5 3.2C-2.8 5.2 2.8 5.2 4.5 3.2" stroke="#1F3330" stroke-width="1.3" stroke-linecap="round" fill="none"/>
</g>"""

TOFU_OKAY = '<path d="M73 338.54H95V316.54H73V338.54Z" fill="black"/>'


def fix_dashboard(text: str) -> str:
    if COMPASS_RING_FIX in text:
        text = text.replace(COMPASS_RING_FIX, COMPASS_RING_REPLACEMENT)
    else:
        text = text.replace(
            '<g clip-path="url(#clip0_2_535)">',
            "<g>",
            1,
        )
        text = re.sub(
            r'<path d="M54 36\.6672[^"]*" stroke="white" stroke-width="2" stroke-linecap="round"/>',
            """<g transform="translate(54 30)" aria-hidden="true">
  <circle r="6.667" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M0 -4.25 L1.05 0 L0 4.25 L-1.05 0 Z" fill="white" transform="rotate(45)"/>
</g>""",
            text,
            count=1,
        )

    if TIP_ICON_FIX in text:
        text = text.replace(TIP_ICON_FIX, TIP_ICON_REPLACEMENT)
    else:
        text = text.replace('<g clip-path="url(#clip1_2_535)">', "<g>", 1)

    return text


def fix_fidelity(text: str) -> str:
    return text.replace(TOFU_OKAY, OKAY_FACE)


def sync(path: Path, updater) -> None:
    text = path.read_text(encoding="utf-8")
    updated = updater(text)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        print(f"updated {path.relative_to(ROOT)}")


def main() -> None:
    dashboard_files = [
        SCREENS / "clinician-dashboard-updated.svg",
        SCREENS / "clinician-dashboard.svg",
        ASSETS / "clinician-dashboard-updated.svg",
    ]
    fidelity_files = [
        SCREENS / "clinician-fidelity-checklist.svg",
        ASSETS / "clinician-fidelity-checklist.svg",
    ]

    for path in dashboard_files:
        if path.exists():
            sync(path, fix_dashboard)

    for path in fidelity_files:
        if path.exists():
            sync(path, fix_fidelity)


if __name__ == "__main__":
    main()
