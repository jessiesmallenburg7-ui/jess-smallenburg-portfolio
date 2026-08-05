from pathlib import Path

path = Path(__file__).resolve().parents[1] / "assets/images/healthcare-consulting/After-without-callouts.svg"
text = path.read_text(encoding="utf-8")

old_filter = """<filter id="filter1_d_260_2" x="85.8" y="502" width="361.4" height="105.2" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="4" dy="8"/>
<feGaussianBlur stdDeviation="2.6"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_260_2"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_260_2" result="shape"/>
</filter>"""

new_filter = """<filter id="filter1_d_260_2" x="75" y="494" width="376" height="118" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feDropShadow dx="4" dy="8" stdDeviation="2.6" flood-color="#000000" flood-opacity="0.25"/>
</filter>"""

if old_filter not in text:
    raise SystemExit("Expected filter block not found")

path.write_text(text.replace(old_filter, new_filter), encoding="utf-8")
print("Updated filter1_d_260_2 in After-without-callouts.svg")
