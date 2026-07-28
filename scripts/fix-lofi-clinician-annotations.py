#!/usr/bin/env python3
"""Size and wrap clinician lofi annotations so they stay inside the column frame."""

from __future__ import annotations

import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)

ANNOTATION_X = 714.0
FONT_SIZE = "16"
LINE_DY = "16"
CLIP_ID = "pc-lofi-clinician-annotation-clip"

WRAPPED_ANNOTATIONS: dict[float, list[str]] = {
    98.0: [
        "Live indicator — fidelity",
        "marked during the session,",
        "not after",
    ],
    198.0: [
        "Composite score updates in",
        "real time as rows are marked",
    ],
    298.0: [
        "NEW: Nia's check-in surfaced",
        "here — only entries she's",
        "shared appear; unshared",
        "entries never show up",
    ],
    398.0: [
        "Single flat list, not",
        "collapsible sections —",
        "tested against grouped/",
        "collapsible; visible,",
        "always-on list reads",
        "progress at a glance",
    ],
    498.0: [
        "Checkbox marks fidelity —",
        "separate control from the note",
    ],
    598.0: [
        "Expandable row, not a modal —",
        "tested against a modal;",
        "reduces context switching",
        "mid-session",
    ],
}

TARGETS = [
    Path("projects/path-compass/screens/lofi-clinician-fidelity.svg"),
    Path("assets/images/path-compass/lofi-clinician-fidelity.svg"),
]


def ensure_clip_path(root: ET.Element) -> None:
    defs = root.find(f"{{{SVG_NS}}}defs")
    if defs is None:
        defs = ET.Element(f"{{{SVG_NS}}}defs")
        root.insert(0, defs)

    for child in list(defs):
        if child.get("id") == CLIP_ID:
            defs.remove(child)

    clip_path = ET.SubElement(defs, f"{{{SVG_NS}}}clipPath", id=CLIP_ID)
    ET.SubElement(
        clip_path,
        f"{{{SVG_NS}}}rect",
        x="700",
        y="74",
        width="350",
        height="682",
        rx="0",
    )


def set_wrapped_lines(text_el: ET.Element, lines: list[str]) -> None:
    for child in list(text_el):
        text_el.remove(child)

    text_el.set("font-size", FONT_SIZE)
    text_el.set("clip-path", f"url(#{CLIP_ID})")

    for index, line in enumerate(lines):
        tspan = ET.SubElement(text_el, f"{{{SVG_NS}}}tspan")
        tspan.set("x", str(ANNOTATION_X))
        tspan.set("dy", "0.0" if index == 0 else LINE_DY)
        tspan.text = line


def fix_file(path: Path) -> None:
    tree = ET.parse(path)
    root = tree.getroot()
    ensure_clip_path(root)

    for text_el in root.iter(f"{{{SVG_NS}}}text"):
        if text_el.get("font-style") != "italic":
            continue
        if float(text_el.get("x", 0)) != ANNOTATION_X:
            continue

        y = float(text_el.get("y", 0))
        if y not in WRAPPED_ANNOTATIONS:
            continue

        set_wrapped_lines(text_el, WRAPPED_ANNOTATIONS[y])

    tree.write(path, encoding="unicode", xml_declaration=False)


def main() -> None:
    source = TARGETS[0]
    fix_file(source)

    for target in TARGETS[1:]:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)

    print(f"Updated annotations in {source}")


if __name__ == "__main__":
    main()
