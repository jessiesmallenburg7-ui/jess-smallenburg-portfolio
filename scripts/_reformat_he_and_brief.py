"""Rebuild HE summary + design brief with hanging bullets and clearer hierarchy."""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor, Twips

ROOT = Path(__file__).resolve().parents[1]
HE_DOCX = ROOT / "projects/clinician-flow/reports/Lumen_Chart_HE_Summary_Report.docx"
HE_PDF = ROOT / "projects/clinician-flow/reports/Lumen_Chart_HE_Summary_Report.pdf"
BRIEF_DOCX = ROOT / "projects/clinician-flow/reports/Lumen_Chart_Design_Brief.docx"
BRIEF_PDF = ROOT / "projects/clinician-flow/reports/Lumen_Chart_Design_Brief.pdf"
FONT = "Calibri"


def set_run_font(run, size_pt: float, *, bold: bool = False) -> None:
    run.font.name = FONT
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(attr), FONT)


def apply_spacing(p, *, before=0, after=80, line=1.15, left=0.0, first=0.0) -> None:
    pf = p.paragraph_format
    pf.space_before = Twips(before)
    pf.space_after = Twips(after)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = line
    pf.left_indent = Inches(left)
    pf.first_line_indent = Inches(first)


def add_tab_stop(p, pos_twips: int) -> None:
    pPr = p._p.get_or_add_pPr()
    for child in list(pPr):
        if child.tag == qn("w:tabs"):
            pPr.remove(child)
    tabs = OxmlElement("w:tabs")
    tab = OxmlElement("w:tab")
    tab.set(qn("w:val"), "left")
    tab.set(qn("w:pos"), str(pos_twips))
    tabs.append(tab)
    pPr.append(tabs)


def force_defaults(doc: Document, *, margin: float = 0.85) -> None:
    style = doc.styles["Normal"]
    style.font.name = FONT
    style.font.size = Pt(12)
    rPr = style.element.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(attr), FONT)
    for section in doc.sections:
        section.top_margin = Inches(margin)
        section.bottom_margin = Inches(margin)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)


def add_text(doc, text, *, size=12, bold=False, before=0, after=80, line=1.15, left=0.0) -> None:
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_run_font(run, size, bold=bold)
    apply_spacing(p, before=before, after=after, line=line, left=left)
    return p


def add_labeled(doc, label, body, *, size=12, before=80, after=120) -> None:
    p = doc.add_paragraph()
    r1 = p.add_run(label)
    set_run_font(r1, size, bold=True)
    r2 = p.add_run(body)
    set_run_font(r2, size, bold=False)
    apply_spacing(p, before=before, after=after, line=1.2)
    return p


def add_bullet(doc, text, *, size=12, before=50, after=50, indent=0.4, hang=0.18) -> None:
    """Hanging bullet: wrap aligns with text. ~0.18in gap after the marker."""
    p = doc.add_paragraph()
    apply_spacing(p, before=before, after=after, line=1.18, left=indent, first=-hang)
    add_tab_stop(p, int(indent * 1440))
    r_mark = p.add_run("•\t")
    set_run_font(r_mark, size, bold=False)
    r_text = p.add_run(text)
    set_run_font(r_text, size, bold=False)
    return p


def add_lettered_item(doc, letter, title, subtitle, body) -> None:
    head = doc.add_paragraph()
    apply_spacing(head, before=140, after=40, line=1.12, left=0.0)
    r = head.add_run(f"{letter}.  {title}")
    set_run_font(r, 13, bold=True)

    sub = doc.add_paragraph()
    apply_spacing(sub, before=20, after=20, line=1.12, left=0.4)
    r = sub.add_run(subtitle)
    set_run_font(r, 12, bold=True)

    para = doc.add_paragraph()
    apply_spacing(para, before=10, after=80, line=1.18, left=0.4)
    r = para.add_run(body)
    set_run_font(r, 12, bold=False)


def export_pdf(docx_path: Path, pdf_path: Path) -> None:
    ps = f"""
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open('{docx_path}')
$doc.SaveAs([ref] '{pdf_path}', [ref] 17)
$doc.Close()
$word.Quit()
"""
    subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True)
    print("PDF:", pdf_path)


def build_design_brief() -> None:
    doc = Document()
    force_defaults(doc, margin=0.85)

    add_text(
        doc,
        "Lumen Chart: EHR Clinical Documentation Redesign",
        size=18,
        bold=True,
        before=0,
        after=200,
        line=1.2,
    )

    add_labeled(
        doc,
        "Project Overview: ",
        "Lumen Chart is a conceptual clinician-facing EHR redesign created for "
        "the Foster Healthcare UX class. This case study is grounded in real-world research, "
        "including heuristic evaluations, personas derived from clinical workflows, and competitive "
        "analysis. All research citations are included on the project page.",
        before=80,
        after=140,
    )

    add_labeled(
        doc,
        "Challenge: ",
        "Clinicians spend 6–7 hours per day in the EHR — more time charting than "
        "seeing patients. Existing systems suffer from alert fatigue, fragmented information, poor AI "
        "transparency, and high documentation burden, leading to burnout and safety risks.",
        before=80,
        after=140,
    )

    add_text(doc, "Goals:", size=13, bold=True, before=160, after=80)
    for g in [
        "Reduce documentation time while maintaining safety and accuracy",
        "Improve AI transparency and clinician trust through clear provenance",
        "Support interrupted workflows with progressive disclosure and contextual tools",
        "Surface SDOH factors early without adding cognitive load",
    ]:
        add_bullet(doc, g, before=40, after=40)

    add_labeled(
        doc,
        "Research & Insights: ",
        "Conducted heuristic evaluation (Nielsen + PAIR + HAX + NIST + "
        "WCAG), research-grounded personas, and competitive analysis of Epic, Cerner, and "
        "Athenahealth. Key findings: alert fatigue, fragmented documentation, and the need for "
        "deliberate AI review gates.",
        before=140,
        after=140,
    )

    add_text(doc, "Personas", size=13, bold=True, before=160, after=80)
    for pers in [
        "Dr. Laura Mitchell – Attending Physician (high skepticism of AI, alert fatigue)",
        "Kevin Hartley, RN – Charge Nurse (bedside constraints, real-time handoff needs)",
        "Diane Santos – Family Caregiver (plain-language needs, coordination across family)",
    ]:
        add_bullet(doc, pers, before=40, after=40)

    add_text(doc, "Key Design Decisions", size=13, bold=True, before=160, after=80)
    for d in [
        "Contextual Progressive Disclosure: Only the most relevant information is shown "
        "initially; additional details expand on demand",
        "Amber AI Diff Highlighting: Clear visual distinction between AI-generated and "
        "verified chart content",
        "Per-Section Accept Gates + Two-Gate Signing: Forces deliberate review before "
        "permanent signing",
        "Alert Hierarchy: Critical alerts are visually distinct and actionable from the dashboard",
        "SDOH Surfacing: Visible at queue and snapshot level with linked resources",
    ]:
        add_bullet(doc, d, before=40, after=40)

    add_labeled(
        doc,
        "Solution: ",
        "A high-fidelity interactive HTML prototype covering the full clinician workflow: "
        "smart daily dashboard, AI patient snapshot with SDOH panel, SOAP note editor with amber "
        "diffs and transcript toggle, and pre-sign confirmation with mandatory acknowledgments.",
        before=140,
        after=140,
    )

    add_labeled(doc, "Interactive Prototype: ", "Live Interactive Prototype →", before=80, after=60)
    add_text(
        doc,
        "A short interactive tutorial (based on user feedback) is included in the Quick Actions "
        "panel on the right to help visitors learn the key features and interactivity.",
        before=20,
        after=140,
    )

    add_labeled(
        doc,
        "Outcomes & Learnings: ",
        "Heuristic evaluation identified no catastrophic issues but "
        "revealed several usability concerns (e.g., missing Unaccept controls, weak error recovery "
        "paths, and pre-sign gate vulnerabilities). These issues are documented on the project page "
        "along with targeted solutions implemented in the prototype.",
        before=80,
        after=100,
    )
    add_text(
        doc,
        "A separate moderated think-aloud session confirmed strong learnability for core flows "
        "while surfacing distinct learnability gaps—amber semantics, overlooked edit affordances, "
        "and first-use onboarding—that complemented heuristic findings on reversibility and recovery.",
        before=40,
        after=120,
    )
    add_text(
        doc,
        "The redesign demonstrates how progressive disclosure, provenance, and safety gates can "
        "meaningfully improve AI-assisted documentation in real clinical environments, though "
        "continued iteration is needed before production use.",
        before=40,
        after=40,
    )

    doc.save(str(BRIEF_DOCX))
    print("Saved", BRIEF_DOCX)
    export_pdf(BRIEF_DOCX, BRIEF_PDF)


SEV_COLS = [
    # fill, left-border, text — original HE report palette
    ("CCFBF1", "0D9488", "0F766E"),  # 0 Positive
    ("F3F4F6", "6B7280", "4B5563"),  # 1 Cosmetic
    ("DBEAFE", "2563EB", "1D4ED8"),  # 2 Minor
    ("FEF3C7", "D97706", "B45309"),  # 3 Major
    ("FEE2E2", "DC2626", "B91C1C"),  # 4 Catastrophe
]


def _hex_rgb(hex_color: str) -> RGBColor:
    h = hex_color.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def _set_cell_shading(cell, fill: str, border: str) -> None:
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag in (qn("w:shd"), qn("w:tcBorders")):
            tcPr.remove(child)
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)
    borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        if edge == "left":
            el.set(qn("w:val"), "single")
            el.set(qn("w:sz"), "18")
            el.set(qn("w:space"), "0")
            el.set(qn("w:color"), border)
        else:
            el.set(qn("w:val"), "single")
            el.set(qn("w:sz"), "4")
            el.set(qn("w:space"), "0")
            el.set(qn("w:color"), "E5E7EB")
        borders.append(el)
    tcPr.append(borders)


def _write_cell(cell, text: str, *, fill: str | None, border: str | None, color: str, bold: bool) -> None:
    cell.text = ""
    p = cell.paragraphs[0]
    r = p.add_run(text)
    set_run_font(r, 11, bold=bold)
    r.font.color.rgb = _hex_rgb(color)
    apply_spacing(p, before=40, after=40, line=1.0)
    if fill and border:
        _set_cell_shading(cell, fill, border)


def add_severity_table(doc: Document) -> None:
    table = doc.add_table(rows=3, cols=5)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Severity 0", "Severity 1", "Severity 2", "Severity 3", "Severity 4"]
    labels = ["Positive", "Cosmetic", "Minor", "Major", "Catastrophe"]
    counts = ["14 findings", "3 findings", "7 findings", "4 findings", "0 findings"]
    for i, text in enumerate(headers):
        fill, border, color = SEV_COLS[i]
        _write_cell(table.rows[0].cells[i], text, fill=fill, border=border, color=color, bold=True)
    for i, text in enumerate(labels):
        fill, border, color = SEV_COLS[i]
        _write_cell(table.rows[1].cells[i], text, fill=fill, border=border, color=color, bold=False)
    for i, text in enumerate(counts):
        _write_cell(
            table.rows[2].cells[i],
            text,
            fill=None,
            border=None,
            color="0B1626",
            bold=False,
        )


def build_he() -> None:
    doc = Document()
    force_defaults(doc, margin=0.7)

    add_text(doc, "HEURISTIC EVALUATION SUMMARY", size=20, bold=True, before=0, after=80)
    add_text(
        doc,
        "Lumen Chart — EHR Clinical Documentation Redesign",
        size=16,
        bold=True,
        before=0,
        after=50,
    )
    add_text(
        doc,
        "Interactive Prototype (Clinician Flow)  ·  Expert Heuristic Review  ·  July 2026",
        size=12,
        before=0,
        after=20,
    )
    add_text(
        doc,
        "Jessie Smallenburg  ·  Portfolio / Class Deliverable  ·  Foster Healthcare UX",
        size=12,
        before=0,
        after=140,
    )

    add_text(doc, "Method", size=15, bold=True, before=80, after=60)
    add_text(
        doc,
        "Expert heuristic evaluation using Nielsen’s 10 Usability Heuristics (with 2020 refinements), "
        "Google PAIR Guidebook, Microsoft HAX Toolkit, WCAG 2.2 AA, NIST EHR usability guidance, "
        "and the project Evidence Wall design recommendations (D1–D5).",
        before=20,
        after=60,
    )
    add_text(
        doc,
        "Scope: Dashboard → Snapshot → SOAP → Pre-sign  ·  Date: July 10, 2026",
        before=0,
        after=120,
    )

    add_text(doc, "1. Severity Summary", size=15, bold=True, before=80, after=60)
    add_text(
        doc,
        "Findings were rated using Nielsen’s 0–4 severity scale.",
        before=20,
        after=80,
    )
    add_severity_table(doc)
    add_text(
        doc,
        "No catastrophic (Severity 4) issues were found. The prototype is safe for pilot testing with "
        "clinicians. Fourteen Severity 0 (positive) findings were identified; the five strongest are "
        "highlighted below.",
        before=120,
        after=80,
    )

    add_text(doc, "2. Top Positive Findings (Severity 0)", size=15, bold=True, before=160, after=60)
    add_text(
        doc,
        "These five are the strongest examples of design decisions that directly address research "
        "insights and clinical workflow needs.",
        before=20,
        after=40,
    )

    positives = [
        (
            "AI transparency & trust calibration",
            "Amber AI provenance + per-section Accept gates + two-gate signing",
            "Exemplary implementation of AI transparency that makes AI-generated content visually "
            "distinct, requires per-section clinician verification, and gates final sign-off. Directly "
            "addresses Evidence Wall recommendations D1–D5 on provenance, verification, and "
            "liability-aware review.",
        ),
        (
            "Alert hierarchy at the point of care",
            "Queue-level critical alert surfacing with clear visual severity",
            "Strong visual hierarchy for critical alerts reduces classic alert-fatigue risk by "
            "surfacing high-severity flags at the queue/row level rather than burying them inside "
            "the chart.",
        ),
        (
            "Match between system and the real world",
            "Clinical language and guideline-sourced “Why?” tooltips",
            "Interface copy and explanatory tooltips use clinical language and guideline-backed "
            "rationale, creating an excellent match to how clinicians actually think and work.",
        ),
        (
            "Visibility of system status",
            "Real-time feedback: badge flips, toasts, and disabled Sign button",
            "Immediate feedback communicates progress and blocking states clearly—what has been "
            "accepted, what remains, and when signing is not yet available—supporting safe "
            "completion of the flow.",
        ),
        (
            "Flexibility and efficiency of use",
            "Simplified view toggle and Accept All accelerator",
            "Supports both novice and expert paths: a simplified view for reduced cognitive load "
            "and an Accept All accelerator for experienced clinicians who still retain per-section "
            "control when needed.",
        ),
    ]
    for i, (title, sub, body) in enumerate(positives):
        add_lettered_item(doc, chr(ord("a") + i), title, sub, body)

    add_text(
        doc,
        "Nine additional positive findings were also recorded (not detailed here), spanning "
        "navigation clarity, consistency of interaction patterns, and support for interrupted "
        "bedside workflows.",
        before=40,
        after=80,
    )

    add_text(
        doc,
        "3. Highest-Priority Findings (Severity 3 · Major)",
        size=15,
        bold=True,
        before=160,
        after=60,
    )
    add_text(
        doc,
        "The following issues were rated Severity 3 (Major) and should be addressed before broader testing.",
        before=20,
        after=40,
    )

    majors = [
        (
            "H3 · User Control & Freedom",
            "No Unaccept / Re-open control after a SOAP section is Accepted",
            "Impact: Creates a false sense of completion and undermines trust for high-skepticism clinicians.",
        ),
        (
            "H5 · Error Prevention",
            "Pre-sign acknowledgments could be clicked through without reading",
            "Impact: Weakens the two-gate safety model intended to prevent signing of unreviewed AI content.",
        ),
        (
            "H9 · Error Recovery",
            "Weak failure + retry path for “Writing to chart…” and gate failures",
            "Impact: Users can become stuck with no clear recovery if a network or state error occurs.",
        ),
        (
            "H3 · User Control & Freedom",
            "No clear Cancel visit / Discard ambient draft path mid-flow",
            "Impact: Clinicians have limited freedom if they decide the capture is unusable.",
        ),
    ]
    for i, (title, sub, body) in enumerate(majors):
        add_lettered_item(doc, chr(ord("a") + i), title, sub, body)

    add_text(doc, "4. Priority Recommendations", size=15, bold=True, before=160, after=60)

    add_text(doc, "High priority", size=13, bold=True, before=80, after=50)
    for t in [
        "Add Unaccept / Re-open for review control on each SOAP section (and a global option).",
        "Strengthen the pre-sign gate so speed-clicking through checkboxes without reading is harder "
        "(micro-scroll, hold-to-confirm, or progressive disclosure).",
        "Add explicit failure + retry UI for the “Writing to chart…” state and any failed gate.",
    ]:
        add_bullet(doc, t, before=40, after=40)

    add_text(doc, "Medium priority", size=13, bold=True, before=120, after=50)
    add_bullet(
        doc,
        "Persist a Visit Context sticky (checked agenda + open SDOH + patient header) while in SOAP and Pre-sign.",
        before=40,
        after=40,
    )

    add_text(doc, "Polish", size=13, bold=True, before=120, after=50)
    for t in [
        "Show exact remaining sections (“2 of 4 still need Accept”) in the disabled Sign button or progress indicator.",
        "Add keyboard accelerators (Accept next, toggle transcript, jump to next unreviewed).",
        "Expose a lightweight “How this AI works / Trust model” drawer.",
    ]:
        add_bullet(doc, t, before=40, after=40)

    add_text(doc, "5. Evaluation Method (Brief)", size=15, bold=True, before=160, after=60)
    add_text(
        doc,
        "This summary is based on a full expert heuristic evaluation using:",
        before=20,
        after=50,
    )
    for t in [
        "Nielsen’s 10 Usability Heuristics (2020 refined explanations)",
        "Google PAIR Guidebook + Microsoft HAX Toolkit (AI-specific transparency, control, and trust)",
        "WCAG 2.2 AA (accessibility)",
        "NIST EHR usability guidance (clinical safety)",
        "Project Evidence Wall design recommendations (D1–D5)",
    ]:
        add_bullet(doc, t, before=36, after=36)

    add_text(
        doc,
        "6. Relationship to Moderated Usability Testing",
        size=15,
        bold=True,
        before=160,
        after=60,
    )
    add_text(
        doc,
        "This heuristic evaluation was conducted separately from one moderated think-aloud session "
        "on the same prototype. Complementary findings informed a single refinement pass. Only the "
        "updates that shipped in the live prototype are listed below.",
        before=20,
        after=80,
    )

    add_text(doc, "From the moderated session", size=13, bold=True, before=80, after=50)
    add_bullet(
        doc,
        "Skippable first-load onboarding wizard that clarifies amber AI drafts, edit affordances, "
        "and per-section Accept with two-gate signing.",
        before=40,
        after=40,
    )

    add_text(doc, "From heuristic review (shipped in the prototype)", size=13, bold=True, before=120, after=50)
    for t in [
        "Unaccept / re-review control on SOAP sections",
        "Strengthened pre-sign gate: Sign stays locked until both acknowledgments are checked, with specific guidance when one is missing",
        "Persistent visit-context sticky across SOAP and Pre-sign",
        "Keyboard shortcuts, clearer aria-live announcements, and remaining-section feedback on the disabled Sign control",
    ]:
        add_bullet(doc, t, before=40, after=40)

    add_text(
        doc,
        "Full before/after detail is documented on the Lumen Chart case study site.",
        before=80,
        after=80,
    )
    add_text(
        doc,
        "Prepared for Foster Healthcare UX · Lumen Chart Case Study · July 2026",
        size=11,
        before=40,
        after=0,
    )

    doc.save(str(HE_DOCX))
    print("Saved", HE_DOCX)
    export_pdf(HE_DOCX, HE_PDF)


def main() -> int:
    build_he()
    build_design_brief()
    from pypdf import PdfReader

    he = PdfReader(str(HE_PDF))
    brief = PdfReader(str(BRIEF_PDF))
    print("HE pages:", len(he.pages))
    print("Brief pages:", len(brief.pages))
    return 0


if __name__ == "__main__":
    sys.exit(main())
