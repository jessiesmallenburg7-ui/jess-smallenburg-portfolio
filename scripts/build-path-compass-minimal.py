import pathlib
import re

SRC = pathlib.Path(r"c:\Users\jessa\Downloads\path-compass-case-study.html")
ROOT = pathlib.Path(__file__).resolve().parents[1]
text = SRC.read_text(encoding="utf-8")

# --- CSS ---
css_start = text.index("<style>") + len("<style>")
css_end = text.index("</style>")
raw_css = text[css_start:css_end].strip()

root_match = re.search(r":root\{([^}]+)\}", raw_css)
root_vars = root_match.group(1) if root_match else ""
raw_css = re.sub(r":root\{[^}]+\}", "", raw_css)
for drop in (
    r"\*\{[^}]+\}",
    r"html\{[^}]+\}",
    r"body\{[^}]+\}",
    r"img\{[^}]+\}",
    r"a\{[^}]+\}",
    r"a:hover\{[^}]+\}",
    r"h1,h2,h3,h4\{[^}]+\}",
):
    raw_css = re.sub(drop, "", raw_css)

raw_css = re.sub(r"/\* footer \*/.*?(?=/\* lightbox \*/)", "", raw_css, flags=re.S)

raw_css = re.sub(r"/\*[^*]*\*+(?:[^/*][^*]*\*+)*/", "", raw_css)

css = raw_css
css = css.replace("section.tint2", "section.pc-tint2")
css = css.replace("section.tint", "section.pc-tint")
css = css.replace("section.dark", "section.pc-dark")
css = css.replace(".topbar", ".pc-topbar")
css = css.replace(".topnav", ".pc-topnav")
css = css.replace(".brand", ".pc-topbar-brand")
css = css.replace(".hero", ".pc-hero")
css = re.sub(r"\.pc\.p", ".pc-persona.p", css)
css = css.replace(".pc .body", ".pc-persona .body")
css = css.replace(".pc h5", ".pc-persona h5")
css = re.sub(r"(?<![\w-])\.pc\{", ".pc-persona{", css)
css = re.sub(r"(?<![\w-])\.pc:hover", ".pc-persona:hover", css)
css = re.sub(r"(?<![\w-])\.pc ", ".pc-persona ", css)
css = css.replace(".lb", ".pc-lb")
css = css.replace(".lb-", ".pc-lb-")

banner_css = """
.case-version-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.25rem;
  margin: 0 0 1.25rem;
  padding: 0.85rem 1.15rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(110, 79, 160, 0.18);
  background:
    linear-gradient(135deg, rgba(110, 79, 160, 0.08), rgba(217, 119, 87, 0.04)),
    rgba(255, 255, 255, 0.72);
}

html[data-theme="light"] .case-version-banner {
  border-color: rgba(110, 79, 160, 0.2);
  background:
    linear-gradient(135deg, rgba(110, 79, 160, 0.07), rgba(217, 119, 87, 0.03)),
    #faf8fc;
}

.case-version-banner-text {
  margin: 0;
  font-family: "Lato", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(36, 30, 51, 0.72);
}

html[data-theme="light"] .case-version-banner-text {
  color: #4e4666;
}

.case-version-banner-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: "Lato", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #6e4fa0;
  text-decoration: none;
  white-space: nowrap;
}

.case-version-banner-link:hover {
  color: #4e3475;
  text-decoration: underline;
}
"""

scoped_css = f"""/* Path Compass — concise case study layout */

{banner_css}

.pc-case {{
  {root_vars}
  scroll-padding-top: 5.5rem;
  color: var(--ink);
  font-family: "Lato", sans-serif;
  font-size: 17px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}}

.pc-case img {{
  max-width: 100%;
  display: block;
}}

.pc-case a {{
  color: var(--violet);
  text-decoration: none;
}}

.pc-case a:hover {{
  text-decoration: underline;
}}

.pc-case h1,
.pc-case h2,
.pc-case h3,
.pc-case h4 {{
  line-height: 1.18;
  margin: 0;
  letter-spacing: -0.02em;
  font-weight: 650;
  font-family: "Cormorant", Georgia, serif;
}}

.pc-case .wrap {{
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 28px;
}}

.pc-case section {{
  padding: 84px 0;
}}

.pc-topbar {{
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--line);
  margin: 0 -28px;
}}

.pc-topbar .wrap {{
  display: flex;
  align-items: center;
  gap: 22px;
  min-height: 60px;
  padding-top: 10px;
  padding-bottom: 10px;
}}

.pc-topbar-label {{
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}}

"""

def scope_rule_block(block: str) -> str:
    block = block.strip()
    if not block:
        return ""
    if block.startswith("@media"):
        inner_start = block.index("{") + 1
        inner_end = block.rindex("}")
        media = block[:inner_start]
        inner = block[inner_start:inner_end]
        return media + scope_rules(inner) + "}"
    return scope_single(block)


def scope_single(rule: str) -> str:
    rule = rule.strip()
    if not rule or rule.startswith("@"):
        return rule
    if "{" not in rule:
        return rule
    selector, rest = rule.split("{", 1)
    selectors = [s.strip() for s in selector.split(",")]
    scoped = []
    for sel in selectors:
        if not sel:
            continue
        if sel.startswith(".pc-lb"):
            scoped.append(sel)
        else:
            scoped.append(".pc-case " + sel)
    return ", ".join(scoped) + "{" + rest


def scope_rules(css_text: str) -> str:
    parts = []
    depth = 0
    current = []
    for ch in css_text:
        current.append(ch)
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                parts.append("".join(current))
                current = []
    return "\n".join(scope_rule_block(p) for p in parts if p.strip())

scoped_css += scope_rules(css)
scoped_css = scoped_css.replace(
    ".pc-case .pc-persona .\n.pc-persona h5",
    ".pc-case .pc-persona .body{padding:20px 22px 22px}\n.pc-case .pc-persona h5",
)

lightbox_extra = """
.pc-lb {
  position: fixed;
  inset: 0;
  background: rgba(20, 15, 28, 0.86);
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 26px;
}

.pc-lb.open {
  display: flex;
}

.pc-lb-inner {
  background: #fff;
  border-radius: 16px;
  max-width: min(1200px, 94vw);
  max-height: 92vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pc-lb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #e4deef;
}

.pc-lb-head h4,
.pc-lb-head .t {
  font-size: 15px;
  margin: 0;
  font-family: "Lato", sans-serif;
}

.pc-lb-tools {
  display: flex;
  gap: 8px;
}

.pc-lb-tools button {
  border: 1px solid #e4deef;
  background: #fff;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 15px;
}

.pc-lb-body {
  overflow: auto;
  padding: 26px 30px;
  flex: 1;
}

.pc-lb-body.img {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: auto;
}

.pc-lb-body.img img {
  transition: transform 0.12s ease;
  max-width: 100%;
}
"""

css_out = ROOT / "assets" / "css" / "path-compass-minimal.css"
css_out.write_text(scoped_css + lightbox_extra, encoding="utf-8")

# --- HTML body ---
body = text[text.index('<header class="hero">'): text.index("<footer>")]
body = body.replace('class="hero"', 'class="pc-hero"')
body = re.sub(r'class="pc p', 'class="pc-persona p', body)
body = re.sub(r'<section id="([^"]+)" class="tint"', r'<section id="\1" class="pc-tint"', body)
body = re.sub(r'<section id="([^"]+)" class="tint2"', r'<section id="\1" class="pc-tint2"', body)
body = body.replace('<section class="tint2"', '<section class="pc-tint2"')
body = body.replace('<section class="tint"', '<section class="pc-tint"')
body = body.replace(
    "https://jessiesmallenburg7-ui.github.io/jess-smallenburg-portfolio/projects/path-compass/",
    "../",
)
body = body.replace(
    "https://jessiesmallenburg7-ui.github.io/jess-smallenburg-portfolio/assets/images/path-compass/",
    "../../../assets/images/path-compass/",
)

head = """<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>(function(){try{localStorage.removeItem('theme');var t=localStorage.getItem('portfolio-theme');if(t!=='light'&&t!=='dark'){t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();</script>
  <title>Path Compass (Concise) &mdash; Jessie Smallenburg</title>
  <meta name="description" content="Concise Path Compass case study: trauma-informed TF-CBT fidelity tooling, youth privacy controls, and clinician documentation support.">
  <link rel="canonical" href="https://www.jessamynsmallenburg.com/projects/path-compass/minimal">
  <link rel="icon" href="../../../assets/images/image-extra-1.png" media="(prefers-color-scheme: light)">
  <link rel="icon" href="../../../assets/images/image-extra-2.png" media="(prefers-color-scheme: dark)">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;0,700;1,500;1,600&amp;family=IBM+Plex+Mono:wght@400;500&amp;family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400;1,700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../../assets/css/styles.css?v=20260801pcmin">
  <link rel="stylesheet" href="../../../assets/css/path-compass-minimal.css?v=20260801pcmin">
  <link rel="stylesheet" href="../../../assets/css/theme-light.css?v=20260801pcmin">
</head>
<body>
  <div id="main">
    <header class="site-header container-content pt-8 pb-4 md:flex md:items-center md:justify-between md:gap-6">
      <div class="flex items-center justify-between md:contents">
        <a href="../../../" class="site-logo relative z-50 font-serif text-[22px] font-semibold text-white">Jessie Smallenburg</a>
        <div class="header-actions relative z-50 md:order-last">
          <button type="button" class="theme-toggle" data-theme-toggle aria-label="Switch to dark mode" aria-pressed="true">
            <svg class="theme-toggle-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            <svg class="theme-toggle-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z"/></svg>
          </button>
          <button type="button" class="nav-toggle flex h-11 w-11 shrink-0 items-center justify-center text-white md:hidden" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">
            <svg class="nav-toggle-open h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            <svg class="nav-toggle-close hidden h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <nav id="primary-nav" class="site-nav hidden flex-col md:flex md:flex-row md:items-center md:gap-2.5" aria-label="Primary">
        <a href="../../../" class="nav-link">Home</a>
        <a href="../../" class="nav-link nav-link-active">Projects</a>
        <a href="../../../resume" class="nav-link">Résumé</a>
        <a href="../../../about" class="nav-link">About</a>
        <a href="../../../contact" class="nav-link">Contact</a>
      </nav>
    </header>
    <main class="container-content pb-16 pt-6 lg:pt-12">
      <div class="case-version-banner" role="note">
        <p class="case-version-banner-text">You&rsquo;re viewing the <strong>concise</strong> Path Compass case study &mdash; banded sections, progressive disclosure, shorter scan path.</p>
        <a class="case-version-banner-link" href="../">View full case study &rarr;</a>
      </div>
      <div class="pc-case">
        <div class="pc-topbar">
          <div class="wrap">
            <span class="pc-topbar-label">On this page</span>
            <nav class="pc-topnav" aria-label="Case study sections">
              <a href="#problem">Problem</a>
              <a href="#research">Research</a>
              <a href="#personas">Personas</a>
              <a href="#compete">Landscape</a>
              <a href="#design">Design</a>
              <a href="#validation">Validation</a>
              <a href="#reflection">Reflection</a>
            </nav>
          </div>
        </div>
"""

foot = """
      </div>
    </main>
    <footer class="site-footer mt-auto">
      <div class="container-content flex flex-col gap-6 py-10">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p class="font-sans text-[18px] text-white/50">&copy; 2026 Jessie Smallenburg. Conceptual case study &middot; No real patient data</p>
          <p class="font-sans text-[17px] text-white/40"><a href="../" class="text-white/55 hover:text-white/80">Full Path Compass case study</a></p>
        </div>
      </div>
    </footer>
  </div>
  <div class="pc-lb" id="pc-lb" role="dialog" aria-modal="true" aria-labelledby="pc-lbTitle">
    <div class="pc-lb-inner">
      <div class="pc-lb-head">
        <span class="t" id="pc-lbTitle">Detail</span>
        <span class="pc-lb-tools">
          <button id="pc-lbOut" type="button" title="Zoom out" aria-label="Zoom out">&minus;</button>
          <button id="pc-lbIn" type="button" title="Zoom in" aria-label="Zoom in">+</button>
          <button id="pc-lbClose" type="button" title="Close" aria-label="Close">&times;</button>
        </span>
      </div>
      <div class="pc-lb-body" id="pc-lbBody"></div>
    </div>
  </div>
  <script src="../../../assets/js/theme.js"></script>
  <script src="../../../assets/js/nav.js"></script>
  <script src="../../../assets/js/path-compass-minimal.js?v=20260801pcmin"></script>
</body>
</html>
"""

out_dir = ROOT / "projects" / "path-compass" / "minimal"
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / "index.html").write_text(head + body + foot, encoding="utf-8")
print("Wrote", css_out)
print("Wrote", out_dir / "index.html")
