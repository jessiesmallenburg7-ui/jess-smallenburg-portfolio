# Laura's User Flow — Build Spec

A vertical flowchart documenting Dr. Laura Mitchell's (Attending Physician) workflow from
opening a patient chart through signing a completed note. Build this as a single
self-contained component (SVG or HTML/CSS) that reproduces the layout, colors, and content
below exactly.

## 1. Canvas

| Property | Value |
|---|---|
| Artboard width | `1500px` (vector — scales losslessly, keep as SVG or scalable HTML) |
| Artboard height | `3015px` (grows/shrinks automatically with content — treat as auto, not fixed) |
| Page background | `#F5F5F0` |
| Card background (the white panel the flow sits on) | `#FFFFFF`, corner radius `18px`, `1px` border `#E5E3DA` |
| Card padding | `18px` inset from the flow's outer bounds on all sides |
| Outer page margin | `72px` on all sides (`PAD`) |

## 2. Color tokens

| Token | Fill | Stroke | Used for |
|---|---|---|---|
| `gray` (start/end) | `#F1EFE8` | `#5F5E5A` | Start/End pills |
| `neutral` (action/decision) | `#F5F4ED` | `rgba(31,30,29,0.3)` | Action boxes, decision diamonds, legend "Action"/"Decision" |
| `green` (visit step) | `#E1F5EE` | `#0F6E56` | Visit-phase boxes |
| `purple` (doc step) | `#EEEDFE` | `#534AB7` | Documentation-phase boxes |
| `amber` (pain point, heavy) | `#FAEEDA` | `#854F0B` | Pain-point-bordered flow boxes (thicker stroke) |
| `amber-2` (pain point callout) | `#FAEEDA` | `#EF9F27` | Pain point / "Edit & re-review" callout boxes |
| `lane-purple` | `#EEEDFE` | `#AFA9EC` | Review + Documentation lane bars |
| `lane-green` | `#E1F5EE` | `#5DCAA5` | Visit lane bar |
| Ink (headings/body) | `#1F1E1D` | — | Primary text |
| Ink-soft (subtext) | `#5F5E5A` | — | Box subtitles, callout body text |
| Muted (captions) | `#87867F` | — | Header description, "~15 min" / "End" sidebar labels |
| Arrow gray | `#73726C` | — | Solid connector arrows |
| Dashed connector gray | `#9A988F` | — | Dashed "No"-branch reroute paths |
| Accent (eyebrow / "Yes" text on decisions) | `#534AB7` (eyebrow), `#0F6E56` ("Yes"/"No" labels) | — | — |

**Lane label text is solid black (`#1F1E1D`)** — not tinted to match the lane color — for readability against the light purple/green fills.

## 3. Typography

- Font stack: `-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`
- Eyebrow (top-left, above title): `15px`, weight `700`, color `#534AB7`, letter-spacing `0.8px`, uppercase
- Page title: `30px`, weight `600`, color `#1F1E1D`
- Description paragraph: `16px`, weight `400`, color `#87867F`, line-height `~23px`
- Legend chip labels: `13.5px`, weight `500`
- Flow box titles: `17px`, weight `600`, color `#1F1E1D`
- Flow box subtitles: `14px`, weight `400`, color `#5F5E5A`
- Decision diamond labels: `15.5px`, weight `600`, centered, 2-line wrap
- Callout titles: `13.5px`, weight `700`, colored to match stroke
- Callout body: `13.5px`, weight `400`, color `#5F5E5A`
- Yes/No branch labels: `14px`, weight `600` (green `#0F6E56` for the branch that continues the main flow down, amber `#854F0B` for the branch that reroutes)
- Lane labels: `15px`, weight `700`, letter-spacing `2px`, uppercase, rotated **-90°**, color `#1F1E1D`
- "~15 min" / "End" sidebar: `14.5px` / `13.5px`, weight `700`/`500`, color `#87867F`

## 4. Header content (exact copy)

```
DR. LAURA MITCHELL · ATTENDING PHYSICIAN   ← eyebrow

Laura's user flow — chart review to signed note   ← title

From opening a patient's chart through conducting the visit, drafting the note, and
reviewing the AI-generated summary before signing. Two friction points are called out
along the way, and any decision to make changes loops back for another edit and
re-review pass before the note can close.   ← description paragraph
```

## 5. Legend (single row, below the header)

Six chips, left to right, each a small labeled swatch:

1. **Pain point** — amber box, heavier border (`1.3px`)
2. **Start / end** — gray pill
3. **Action** — neutral box
4. **Visit step** — green box
5. **Doc step** — purple box
6. **Decision** — small neutral diamond

## 6. Layout structure

Three vertical **phase lanes** run down the left edge, each a rounded color bar with a
rotated, centered label in solid black. The main flow is a single vertical column of
nodes centered to the right of the lanes, connected top-to-bottom by arrows. Two
pain-point callouts branch off to the **right** of the column; two decision "No"
branches and one "Yes"-loop branch off to the **left**/**right** with dashed connectors.

### Lane bars (left edge)

| Lane label | Covers (top → bottom) | Color |
|---|---|---|
| **REVIEW** | Start pill → end of "Info clear & prioritized?" decision | `lane-purple` |
| **VISIT** | Step 4 → end of "Use AI-suggested summary?" decision | `lane-green` |
| **DOCUMENTATION** | "Review AI draft" → End pill | `lane-purple` |

*(Note: label reads "DOCUMENTATION" in full, not "DOC".)*

### Right-edge duration sidebar

A thin dashed vertical rounded bar running the full height of the flow, labeled
`~15 min` at the top and `End` at the bottom (both muted gray, right-aligned outside the
main card).

## 7. Flow nodes, top to bottom (exact copy + type + color)

| # | Type | Title | Subtitle | Style |
|---|---|---|---|---|
| 1 | Start pill | Start — open patient chart | — | gray |
| 2 | Action box | Step 2 — Patient summary loads | Labs · meds · problems · last note | neutral |
| 3 | Action box (pain point) | Step 3 — Scan & synthesize chart | Labs · meds · problems · last note | amber, thick border |
| — | ↳ callout (right, dashed) | **Pain point 1** | Info overload | amber-2 |
| 4 | Decision | Info clear & prioritized? | — | neutral diamond |
| — | ↳ "No" callout (left, dashed) | **No — tab-switch overload** | Clinician toggles between EHR windows to compile the picture | amber |
| — | ↳ dashed reroute | rejoins flow at the top of Step 4 | — | gray dashed |
| — | "Yes" (down arrow label) | Yes | — | green text |
| 5 | Action box | Step 4 — Conduct patient visit | Gather history & exam findings | green (visit) |
| 6 | Action box | Step 5 — Open note entry screen | Auto-populated data pre-fills fields | green (visit) |
| 7 | Action box (pain point) | Step 6 — Write / dictate note | Review auto-populated + add findings | amber, thick border |
| — | ↳ callout (right, dashed) | **Pain point 2** | Template friction | amber-2 |
| 8 | Decision | Use AI-suggested summary? | — | neutral diamond |
| — | ↳ "No" callout (left, dashed) | **No — manual template entry** | — | neutral |
| — | ↳ annotation (dashed border, left, below callout) | skips AI draft → goes to step 7 | — | neutral, dashed outline, no fill |
| — | ↳ dashed reroute | rejoins flow at Step 7 (bypassing "Review AI draft") | — | gray dashed |
| — | "Yes" (down arrow label) | Yes | — | green text |
| 9 | Action box (**AI review gate**) | **AI REVIEW GATE 1 — Per-section Accept** | Amber draft · edit · Accept each SOAP section | purple, thick border |
| 10 | Action box | Step 7 — Review full note | Accuracy · completeness · ICD codes | purple (doc) |
| 11 | Decision | Changes needed? | — | neutral diamond |
| — | ↳ "Yes" loop (right, dashed) | **Edit & re-review** | loops back up to Gate 1 | amber-2 |
| — | "No" (down arrow label) | No | — | green text |
| 12 | Action box (**AI review gate**) | **AI REVIEW GATE 2 — Pre-sign confirmation** | Two-gate acknowledgments · sign & close · orders release | purple, thick border |
| 13 | End pill | Return to schedule / next patient | — | gray |

## 8. Connector rules

- All same-column, sequential steps connect with a **solid** downward arrow, gray
  (`#73726C`), arrowhead landing just above the next box (not touching either shape —
  leave a visible gap on both ends).
- Pain-point callouts connect with a **short dashed horizontal line** (no arrowhead) in
  the callout's stroke color.
- "No" branches and reroutes use **dashed** lines/paths (gray `#9A988F` for neutral
  reroutes, amber `#854F0B`/`#EF9F27` for pain-point-flavored branches), with an
  arrowhead only where the branch rejoins the main column.
- The "Changes needed? → Yes" loop is a dashed amber path that runs right, up, and back
  left into the side of the "Review AI draft" box.
- "Yes"/"No" text labels sit beside (not on top of) the arrow that continues the main
  flow downward; the branch that reroutes is labeled inside its callout title instead
  (e.g. "No — tab-switch overload") rather than with a separate Yes/No tag.

## 9. Build notes for Cursor

- Prefer a single SVG (or an HTML/CSS layout using flex/grid for the boxes and absolutely
  positioned SVG/CSS connectors) — this is a static diagram, not an interactive app.
- Keep it vector-based / resolution-independent so it stays crisp at any zoom level.
- Rounded corners throughout: pills fully rounded, boxes `~10px` radius, callouts
  `~8px` radius, lane bars `~12px` radius.
- Decision diamonds are centered on the same vertical axis as the flow boxes, narrower
  than the boxes (roughly half the column width on each side).
- Maintain generous whitespace between nodes (roughly one box-height worth of gap) so
  arrows and side labels have room to breathe.
- Text content must match Section 7 exactly — this spec is the source of truth for copy.
