#!/usr/bin/env python3
"""Remove dark-mode toggle from live portfolio HTML pages (light mode only)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {
    ROOT / "assets" / "netlify-hosted-prototype" / "index.html",
    ROOT / "projects" / "clinician-flow" / "index.backup-before-last-push.html",
}
LIGHT_BOOT = (
    "<script>(function(){try{localStorage.removeItem('theme');"
    "localStorage.setItem('portfolio-theme','light');}catch(e){}"
    "document.documentElement.setAttribute('data-theme','light');})();</script>"
)
TOGGLE_RE = re.compile(
    r'\s*<button type="button" class="theme-toggle"[\s\S]*?</button>\s*',
    re.MULTILINE,
)
OLD_BOOT_INLINE = re.compile(
    r"<script>\(function\(\)\{try\{localStorage\.removeItem\('theme'\);"
    r"var t=localStorage\.getItem\('portfolio-theme'\);"
    r"if\(t!=='light'&&t!=='dark'\)\{t='light';\}"
    r"document\.documentElement\.setAttribute\('data-theme',t\);\}"
    r"catch\(e\)\{document\.documentElement\.setAttribute\('data-theme','light'\);\}\}\)\(\);</script>"
)
OLD_BOOT_404 = re.compile(
    r"localStorage\.removeItem\('theme'\);\s*"
    r"var t = localStorage\.getItem\('portfolio-theme'\);\s*"
    r"if \(t !== 'light' && t !== 'dark'\) t = 'light';\s*"
    r"document\.documentElement\.setAttribute\('data-theme', t\);",
    re.MULTILINE,
)
NEW_BOOT_404 = (
    "localStorage.removeItem('theme'); "
    "localStorage.setItem('portfolio-theme', 'light'); "
    "document.documentElement.setAttribute('data-theme', 'light');"
)


def strip_dark_mode(text: str) -> str:
    if "theme-toggle" not in text and "portfolio-theme" not in text:
        return text
    text = TOGGLE_RE.sub("\n", text)
    text = OLD_BOOT_INLINE.sub(LIGHT_BOOT, text)
    text = OLD_BOOT_404.sub(NEW_BOOT_404, text)
    return text


def main() -> None:
    changed: list[str] = []
    for path in ROOT.rglob("*.html"):
        if path in SKIP or "node_modules" in path.parts:
            continue
        original = path.read_text(encoding="utf-8")
        updated = strip_dark_mode(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8", newline="\n")
            changed.append(str(path.relative_to(ROOT)))
    print(f"Updated {len(changed)} files:")
    for rel in sorted(changed):
        print(f"  - {rel}")


if __name__ == "__main__":
    main()
