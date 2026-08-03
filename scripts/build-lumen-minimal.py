import re
import pathlib

src = pathlib.Path(r"c:\Users\jessa\Downloads\index (13).html").read_text(encoding="utf-8")
start = src.index('<header class="hero">')
end = src.index("<footer>")
body = src[start:end]

body = body.replace('class="hero"', 'class="lm-hero"')
body = re.sub(r'<section id="([^"]+)" class="tint"', r'<section id="\1" class="lm-tint"', body)
body = re.sub(r'<section id="([^"]+)" class="tint2"', r'<section id="\1" class="lm-tint2"', body)
body = re.sub(r'<section class="tint2"', r'<section class="lm-tint2"', body)
body = re.sub(r'<section class="tint"', r'<section class="lm-tint"', body)
body = body.replace('<section class="dark">', '<section class="lm-dark">')
body = body.replace('<div style="height:34px"></div>', '<div class="lm-spacer-sm"></div>')
body = body.replace('<div style="height:44px"></div>', '<div class="lm-spacer-md"></div>')
body = body.replace('<div style="height:38px"></div>', '<div class="lm-spacer-sm"></div>')

body = body.replace(
    "https://jessiesmallenburg7-ui.github.io/jess-smallenburg-portfolio/projects/clinician-flow/",
    "../",
)

hs_start = src.index('<div class="hidden-src">')
hs_end = src.index("</div>\n\n<script>", hs_start)
hidden = src[hs_start:hs_end].replace('class="hidden-src"', 'class="lm-hidden-src" id="lm-hidden-src"')

shell_head = pathlib.Path(__file__).parent / "lumen-minimal-head.html"
shell_foot = pathlib.Path(__file__).parent / "lumen-minimal-foot.html"

head = """<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>(function(){try{localStorage.removeItem('theme');var t=localStorage.getItem('portfolio-theme');if(t!=='light'&&t!=='dark'){t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();</script>
  <title>Lumen Chart (Concise) &mdash; Jessie Smallenburg</title>
  <meta name="description" content="Concise Lumen Chart case study: reducing cognitive load in EHR workflows with accountable AI documentation, shallow navigation, and plain-language caregiver summaries.">
  <link rel="canonical" href="https://www.jessamynsmallenburg.com/projects/clinician-flow/minimal">
  <link rel="icon" href="../../../assets/images/image-extra-1.png" media="(prefers-color-scheme: light)">
  <link rel="icon" href="../../../assets/images/image-extra-2.png" media="(prefers-color-scheme: dark)">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,500;0,600;1,500;1,600&amp;family=IBM+Plex+Mono:wght@400;500&amp;family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400;1,700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../../assets/css/styles.css?v=20260801minimal">
  <link rel="stylesheet" href="../../../assets/css/lumen-minimal.css?v=20260801minimal">
  <link rel="stylesheet" href="../../../assets/css/theme-light.css?v=20260801minimal">
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
      <div class="lumen-version-banner" role="note">
        <p class="lumen-version-banner-text">You&rsquo;re viewing the <strong>concise</strong> Lumen Chart case study &mdash; banded sections, progressive disclosure, shorter scan path.</p>
        <a class="lumen-version-banner-link" href="../">View full case study &rarr;</a>
      </div>
      <div class="lm-case">
        <div class="lm-topbar">
          <div class="wrap">
            <span class="lm-topbar-label">On this page</span>
            <nav class="lm-topnav" aria-label="Case study sections">
              <a href="#problem">Problem</a>
              <a href="#process">Process</a>
              <a href="#research">Research</a>
              <a href="#structure">Structure</a>
              <a href="#design">Design</a>
              <a href="#testing">Testing</a>
              <a href="#refine">Refine</a>
              <a href="#launch">Prototype</a>
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
          <p class="font-sans text-[18px] text-white/50">&copy; 2026 Jessie Smallenburg. Academic case study &middot; No real patient data</p>
          <p class="font-sans text-[17px] text-white/40"><a href="../" class="text-white/55 hover:text-white/80">Full Lumen Chart case study</a></p>
        </div>
      </div>
    </footer>
  </div>
  <div class="lm-lb" id="lm-lb" role="dialog" aria-modal="true" aria-labelledby="lm-lbTitle">
    <div class="lm-lb-inner">
      <div class="lm-lb-bar">
        <span class="t" id="lm-lbTitle">Detail</span>
        <span class="lm-lb-tools">
          <button id="lm-lbOut" type="button" title="Zoom out" aria-label="Zoom out">&minus;</button>
          <button id="lm-lbIn" type="button" title="Zoom in" aria-label="Zoom in">+</button>
          <button id="lm-lbClose" type="button" title="Close" aria-label="Close">&times;</button>
        </span>
      </div>
      <div class="lm-lb-body" id="lm-lbBody"></div>
    </div>
  </div>
"""

out_dir = pathlib.Path(__file__).resolve().parents[1] / "projects" / "clinician-flow" / "minimal"
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / "index.html").write_text(
    head + body + foot + hidden + '\n  <script src="../../../assets/js/theme.js"></script>\n  <script src="../../../assets/js/nav.js"></script>\n  <script src="../../../assets/js/lumen-minimal.js?v=20260801minimal"></script>\n</body>\n</html>\n',
    encoding="utf-8",
)
print("Wrote", out_dir / "index.html")
