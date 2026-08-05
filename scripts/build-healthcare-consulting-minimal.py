import pathlib
import re

SRC = pathlib.Path(r"c:\Users\jessa\Downloads\healthcare-consulting-case-study (1).html")
ROOT = pathlib.Path(__file__).resolve().parents[1]
text = SRC.read_text(encoding="utf-8")

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
css = css.replace("section.tint2", "section.hc-tint2")
css = css.replace("section.tint", "section.hc-tint")
css = css.replace("section.dark", "section.hc-dark")
css = css.replace(".topbar", ".hc-topbar")
css = css.replace(".topnav", ".hc-topnav")
css = css.replace(".brand", ".hc-topbar-brand")
css = css.replace(".hero", ".hc-hero")
css = re.sub(r"\.lb\{", ".hc-lb{", css)
css = re.sub(r"\.lb-", ".hc-lb-", css)
css = re.sub(r"\.lb\.open", ".hc-lb.open", css)

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
  border: 1px solid rgba(31, 95, 168, 0.18);
  background:
    linear-gradient(135deg, rgba(31, 95, 168, 0.08), rgba(30, 140, 124, 0.04)),
    rgba(255, 255, 255, 0.72);
}

html[data-theme="light"] .case-version-banner {
  border-color: rgba(31, 95, 168, 0.2);
  background:
    linear-gradient(135deg, rgba(31, 95, 168, 0.07), rgba(30, 140, 124, 0.03)),
    #f5f8fc;
}

.case-version-banner-text {
  margin: 0;
  font-family: "Lato", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(19, 35, 57, 0.72);
}

html[data-theme="light"] .case-version-banner-text {
  color: #3b5170;
}

.case-version-banner-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: "Lato", sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1f5fa8;
  text-decoration: none;
  white-space: nowrap;
}

.case-version-banner-link:hover {
  color: #153f73;
  text-decoration: underline;
}
"""


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
        if sel.startswith(".hc-lb"):
            scoped.append(sel)
        else:
            scoped.append(".hc-case " + sel)
    return ", ".join(scoped) + "{" + rest


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


scoped_css = f"""/* Healthcare consulting — concise case study layout */

{banner_css}

.hc-case {{
  {root_vars}
  scroll-padding-top: 5.5rem;
  color: var(--ink);
  font-family: "Lato", sans-serif;
  font-size: 17px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}}

.hc-case img {{
  max-width: 100%;
  display: block;
}}

.hc-case a {{
  color: var(--blue);
  text-decoration: none;
}}

.hc-case a:hover {{
  text-decoration: underline;
}}

.hc-case h1,
.hc-case h2,
.hc-case h3,
.hc-case h4 {{
  line-height: 1.18;
  margin: 0;
  letter-spacing: -0.02em;
  font-weight: 650;
  font-family: "Cormorant", Georgia, serif;
}}

.hc-case .wrap {{
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 28px;
}}

.hc-case section {{
  padding: 84px 0;
}}

.hc-topbar {{
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--line);
  margin: 0 -28px;
}}

.hc-topbar .wrap {{
  display: flex;
  align-items: center;
  gap: 22px;
  min-height: 60px;
  padding-top: 10px;
  padding-bottom: 10px;
}}

.hc-topbar-label {{
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
}}

"""

scoped_css += scope_rules(css)

lightbox_extra = """
.hc-lb {
  position: fixed;
  inset: 0;
  background: rgba(10, 17, 28, 0.86);
  z-index: 100;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 26px;
}

.hc-lb.open {
  display: flex;
}

.hc-lb-inner {
  background: #fff;
  border-radius: 16px;
  max-width: min(1200px, 94vw);
  max-height: 92vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hc-lb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #dce3ed;
}

.hc-lb-head h4,
.hc-lb-head .t {
  font-size: 15px;
  margin: 0;
  font-family: "Lato", sans-serif;
}

.hc-lb-tools {
  display: flex;
  gap: 8px;
}

.hc-lb-tools button {
  border: 1px solid #dce3ed;
  background: #fff;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 15px;
}

.hc-lb-body {
  overflow: auto;
  padding: 16px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hc-lb-body.img img {
  transition: transform 0.12s ease;
  max-width: 100%;
}
"""

css_out = ROOT / "assets" / "css" / "healthcare-consulting-minimal.css"
css_out.write_text(scoped_css + lightbox_extra, encoding="utf-8")

body = text[text.index('<header class="hero">'): text.index("<footer>")]
body = body.replace('class="hero"', 'class="hc-hero"')
body = re.sub(r'<section id="([^"]+)" class="tint"', r'<section id="\1" class="hc-tint"', body)
body = re.sub(r'<section id="([^"]+)" class="tint2"', r'<section id="\1" class="hc-tint2"', body)
body = body.replace('<section class="tint2"', '<section class="hc-tint2"')
body = body.replace('<section class="tint"', '<section class="hc-tint"')
body = body.replace(
    "https://jessiesmallenburg7-ui.github.io/jess-smallenburg-portfolio/assets/images/healthcare-consulting/",
    "../../../assets/images/healthcare-consulting/",
)

head = """<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>(function(){try{localStorage.removeItem('theme');localStorage.setItem('portfolio-theme','light');}catch(e){}document.documentElement.setAttribute('data-theme','light');})();</script>
  <title>Healthcare Consulting (Concise) &mdash; Jessie Smallenburg</title>
  <meta name="description" content="Concise healthcare UX consulting case study: behavioral analytics and survey synthesis to improve eligibility and enrollment findability on a public health benefits portal.">
  <link rel="canonical" href="https://www.jessamynsmallenburg.com/projects/healthcare-consulting/minimal">
  <link rel="icon" href="../../../assets/images/image-extra-1.png" media="(prefers-color-scheme: light)">
  <link rel="icon" href="../../../assets/images/image-extra-2.png" media="(prefers-color-scheme: dark)">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;1,500;1,600&amp;family=IBM+Plex+Mono:wght@400;500&amp;family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400;1,700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../../assets/css/styles.css?v=20260801hcmin">
  <link rel="stylesheet" href="../../../assets/css/healthcare-consulting-minimal.css?v=20260801hcmin">
  <link rel="stylesheet" href="../../../assets/css/theme-light.css?v=20260801hcmin">
</head>
<body>
  <div id="main">
    <header class="site-header container-content pt-8 pb-4 md:flex md:items-center md:justify-between md:gap-6">
      <div class="flex items-center justify-between md:contents">
        <a href="../../../" class="site-logo relative z-50 font-serif text-[22px] font-semibold text-white">Jessie Smallenburg</a>
        <div class="header-actions relative z-50 md:order-last">
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
        <a href="https://www.linkedin.com/in/jessamynellen/" target="_blank" rel="noopener" aria-label="LinkedIn" class="nav-link gap-3">
          <span class="nav-linkedin-badge md:hidden" aria-hidden="true">in</span>
          <svg class="icon-linkedin hidden h-[18px] w-[18px] shrink-0 md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
          <span class="md:hidden">LinkedIn</span>
        </a>
      </nav>
    </header>
    <main class="container-content pb-16 pt-6 lg:pt-12">
      <div class="case-version-banner" role="note">
        <p class="case-version-banner-text">You&rsquo;re viewing the <strong>concise</strong> healthcare consulting case study &mdash; banded sections, progressive disclosure, shorter scan path.</p>
        <a class="case-version-banner-link" href="../">View full case study &rarr;</a>
      </div>
      <div class="hc-case">
        <div class="hc-topbar">
          <div class="wrap">
            <span class="hc-topbar-label">On this page</span>
            <nav class="hc-topnav" aria-label="Case study sections">
              <a href="#challenge">Challenge</a>
              <a href="#methods">Methods</a>
              <a href="#insights">Insights</a>
              <a href="#recommendations">Recommendations</a>
              <a href="#visuals">Design directions</a>
              <a href="#outcomes">Outcomes</a>
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
          <p class="font-sans text-[18px] text-white/50">&copy; 2026 Jessie Smallenburg. Anonymized consulting case study</p>
          <p class="font-sans text-[17px] text-white/40"><a href="../" class="text-white/55 hover:text-white/80">Full healthcare consulting case study</a></p>
        </div>
      </div>
    </footer>
  </div>
  <div class="hc-lb" id="hc-lb" role="dialog" aria-modal="true" aria-labelledby="hc-lbTitle">
    <div class="hc-lb-inner">
      <div class="hc-lb-head">
        <span class="t" id="hc-lbTitle">Detail</span>
        <span class="hc-lb-tools">
          <button id="hc-lbOut" type="button" title="Zoom out" aria-label="Zoom out">&minus;</button>
          <button id="hc-lbIn" type="button" title="Zoom in" aria-label="Zoom in">+</button>
          <button id="hc-lbClose" type="button" title="Close" aria-label="Close">&times;</button>
        </span>
      </div>
      <div class="hc-lb-body" id="hc-lbBody"></div>
    </div>
  </div>
  <script src="../../../assets/js/theme.js"></script>
  <script src="../../../assets/js/nav.js"></script>
  <script src="../../../assets/js/healthcare-consulting-minimal.js?v=20260801hcmin"></script>
</body>
</html>
"""

out_dir = ROOT / "projects" / "healthcare-consulting" / "minimal"
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / "index.html").write_text(head + body + foot, encoding="utf-8")
print("Wrote", css_out)
print("Wrote", out_dir / "index.html")
