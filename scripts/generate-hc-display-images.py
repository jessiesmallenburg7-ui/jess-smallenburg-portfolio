"""Generate display-sized variants for healthcare consulting case study screenshots."""
from __future__ import annotations

import pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "images" / "healthcare-consulting"

DISPLAY_WIDTHS = (720, 1440)
CARD_WIDTHS = (720, 1440)


def save_png(img: Image.Image, path: pathlib.Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, format="PNG", optimize=True, compress_level=3)


def resize_to_width(img: Image.Image, width: int) -> Image.Image:
    w, h = img.size
    if w == width:
        return img.copy()
    height = round(h * (width / w))
    return img.resize((width, height), Image.Resampling.LANCZOS)


def make_variants(
    source: pathlib.Path,
    widths: tuple[int, ...],
    suffix: str,
    out_dir: pathlib.Path | None = None,
) -> list[pathlib.Path]:
    out_dir = out_dir or source.parent
    stem = source.stem
    img = Image.open(source).convert("RGB")
    written: list[pathlib.Path] = []
    for width in widths:
        out = out_dir / f"{stem}-{suffix}-{width}.png"
        save_png(resize_to_width(img, width), out)
        written.append(out)
        print(f"  {out.relative_to(ROOT)} ({width}px wide)")
    return written


def upscale_master(source: pathlib.Path, target_width: int = 2880) -> pathlib.Path:
    img = Image.open(source).convert("RGB")
    w, h = img.size
    if w >= target_width:
        return source
    out = source.with_name(f"{source.stem}-{target_width}.png")
    save_png(resize_to_width(img, target_width), out)
    print(f"  upscaled {out.relative_to(ROOT)}")
    return out


def main() -> None:
    print("Upscaling clean CTA mockup for sharper retina display…")
    clean_master = upscale_master(IMG / "After-without-callouts.png")

    display_sources = [
        IMG / "Before.png",
        IMG / "After.png",
        IMG / "Before-mega-menu.png",
        IMG / "After-mega-menu.png",
        IMG / "Pagination-before.png",
        IMG / "Pagination-after.png",
        clean_master,
    ]

    print("\nDesign-direction display variants…")
    for source in display_sources:
        print(source.name)
        make_variants(source, DISPLAY_WIDTHS, "display")

    overview_sources = [
        (IMG / "Before-mega-menu.png", CARD_WIDTHS),
        (clean_master, CARD_WIDTHS),
    ]

    print("\nOverview card variants…")
    for source, widths in overview_sources:
        print(source.name)
        out_dir = source.parent / "overview-cards"
        make_variants(source, widths, "card", out_dir=out_dir)

    # Keep prototype nav cards in sync if only full-size exists
    proto = IMG / "prototype-nav" / "Progressive-disclosure-get-coverage-nav.png"
    if proto.exists():
        print("\nPrototype nav card variants…")
        make_variants(proto, CARD_WIDTHS, "card", out_dir=proto.parent)

    print("\nDone.")


if __name__ == "__main__":
    main()
