#!/usr/bin/env python3
import sys
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"


def inspect(path: str, min_x: float) -> None:
    root = ET.parse(path).getroot()
    print(f"\n=== {path} (x >= {min_x}) ===")
    for i, text in enumerate(root.iter(f"{{{SVG_NS}}}text")):
        x = float(text.get("x", 0))
        if x < min_x:
            continue
        y = text.get("y", "")
        fs = text.get("font-size", "")
        content = "".join(text.itertext())
        print(f"--- #{i} x={x} y={y} fs={fs}")
        print(content[:200])
        for tsp in text:
            if tsp.tag == f"{{{SVG_NS}}}tspan":
                print(
                    f"  tspan x={tsp.get('x')} dy={tsp.get('dy')} | {tsp.text}"
                )


if __name__ == "__main__":
    inspect(sys.argv[1], float(sys.argv[2]))
