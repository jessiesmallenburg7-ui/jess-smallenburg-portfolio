#!/usr/bin/env python3
"""Promote minimal/ case study pages to project index.html (concise as primary)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = [
    "clinician-flow",
    "path-compass",
    "healthcare-consulting",
]

DEV_NAV_RE = re.compile(
    r"\s*<!-- TEMPORARY: remove concise-dev-nav before launch -->\s*"
    r"<nav class=\"concise-dev-nav\"[\s\S]*?</nav>\s*",
    re.MULTILINE,
)
VERSION_BANNER_RE = re.compile(
    r"\s*<div class=\"(?:lumen-version-banner|case-version-banner)\"[\s\S]*?</div>\s*",
    re.MULTILINE,
)
FOOTER_FULL_LINK_RE = re.compile(
    r"\s*<p class=\"font-sans text-\[17px\] text-white/40\">"
    r"<a href=\"\.\./\" class=\"text-white/55 hover:text-white/80\">"
    r"Full [^<]+</a></p>\s*",
    re.MULTILINE,
)


def promote_project(slug: str) -> None:
    minimal = ROOT / "projects" / slug / "minimal" / "index.html"
    target = ROOT / "projects" / slug / "index.html"
    text = minimal.read_text(encoding="utf-8")

    text = DEV_NAV_RE.sub("\n", text)
    text = VERSION_BANNER_RE.sub("\n", text)
    text = FOOTER_FULL_LINK_RE.sub("\n", text)

    # Cross-project links first.
    text = text.replace("/minimal/", "/")
    text = text.replace("../../clinician-flow/", "../clinician-flow/")
    text = text.replace("../../path-compass/", "../path-compass/")
    text = text.replace("../../healthcare-consulting/", "../healthcare-consulting/")

    text = text.replace("../../../assets/", "../../assets/")
    text = text.replace('href="../../../', 'href="../../')
    text = text.replace(
        'href="../../" class="nav-link nav-link-active"',
        'href="../" class="nav-link nav-link-active"',
    )

    for sub in ("mockups", "reports", "screenshots", "screens", "pattern-comparisons"):
        text = text.replace(f"../{sub}/", f"{sub}/")
    text = text.replace("../user-flow-", "user-flow-")
    text = text.replace("../ehr-provider-sitemap", "ehr-provider-sitemap")

    text = re.sub(
        r"https://www\.jessamynsmallenburg\.com/projects/([^\"]+)/minimal",
        r"https://www.jessamynsmallenburg.com/projects/\1",
        text,
    )

    text = text.replace(" (Concise)", "")
    text = text.replace("Concise ", "")
    text = text.replace(
        "content=\"Concise Lumen Chart case study:",
        "content=\"Lumen Chart case study:",
    )
    text = text.replace(
        "content=\"Concise Path Compass case study:",
        "content=\"Path Compass case study:",
    )
    text = text.replace(
        "content=\"Concise healthcare UX consulting case study:",
        "content=\"Healthcare UX consulting case study:",
    )

    target.write_text(text, encoding="utf-8")
    print(f"Promoted {slug} -> {target.relative_to(ROOT)}")


def remove_minimal_dirs() -> None:
    for slug in PROJECTS:
        minimal_dir = ROOT / "projects" / slug / "minimal"
        if minimal_dir.is_dir():
            for child in sorted(minimal_dir.rglob("*"), reverse=True):
                if child.is_file():
                    child.unlink()
                elif child.is_dir():
                    child.rmdir()
            minimal_dir.rmdir()
            print(f"Removed {minimal_dir.relative_to(ROOT)}")


def main() -> None:
    for slug in PROJECTS:
        promote_project(slug)
    remove_minimal_dirs()


if __name__ == "__main__":
    main()
