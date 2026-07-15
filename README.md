# Jessie Smallenburg — Healthcare UX Portfolio

A clean, modern, fully responsive static site for Jessie Smallenburg's healthcare UX
portfolio. Rebuilt from a Framer static export into hand-written semantic HTML +
[Tailwind CSS](https://tailwindcss.com). No frameworks, no JavaScript bundles, no
heavy animations — just fast, editable static pages.

---

## Pages

| Route          | File               | Purpose                                            |
| -------------- | ------------------ | -------------------------------------------------- |
| `/`            | `index.html`       | Home — hero, expertise, testimonial, skill cards   |
| `/projects`    | `projects/index.html` | Selected work (in-progress case studies)        |
| `/resume`      | `resume/index.html`| Full résumé                                        |
| `/about`       | `about/index.html` | Bio, credentials, testimonials, LinkedIn CTA       |
| `/contact`     | `contact/index.html` | Contact form (Formspree-ready)                   |

---

## Tech stack

- **HTML** — semantic, hand-written, one file per page
- **Tailwind CSS v3** — utility-first, compiled to a single purged stylesheet
- **Google Fonts** — Cormorant (serif headings/quotes) + Montserrat (sans body/UI)
- **No JS frameworks** — the site is fully static

### Design tokens (in `tailwind.config.js`)

| Token            | Value                                  | Use                         |
| ---------------- | -------------------------------------- | --------------------------- |
| `navy-900`       | `#060f27`                              | Background gradient start   |
| `navy-950`       | `#020713`                              | Background gradient end     |
| `sky-accent`     | `#7dd3fc`                              | Résumé dates / labels       |
| `teal-accent`    | `#5fd3e0`                              | Status pills, accent bars   |
| `violet-accent`  | `#a78bfa`                              | Contact button gradient end |
| `bg-site-gradient` | `linear-gradient(180deg, #04060e, #0b1626, #05070e)` | Page background (dark top → navy mid → dark bottom) |
| `bg-cta-gradient`  | `linear-gradient(90deg, #5fd3e0, #a78bfa)`   | Contact submit button  |

Shared component classes (`.btn`, `.card`, `.testimonial`, `.nav-link`,
`.resume-section`, `.eyebrow`, `.h-display`, etc.) live in `src/input.css` under
`@layer components`, so the HTML stays clean and easy to edit.

---

## Project structure

```
.
├── index.html                 ← Home
├── about/index.html
├── projects/index.html
├── resume/index.html
├── contact/index.html
├── src/input.css              ← Tailwind source (directives + component classes)
├── tailwind.config.js         ← Theme tokens (colors, fonts, gradients)
├── package.json               ← build / dev / serve scripts
├── assets/
│   ├── css/styles.css         ← Compiled Tailwind output (committed)
│   └── images/                ← Portraits + SVG icons/dividers
└── README.md
```

---

## Run locally

Requires [Node.js](https://nodejs.org) (v18+).

```bash
npm install        # one-time, installs Tailwind
npm run serve      # preview at http://localhost:3000
```

You can also open the HTML files directly in a browser — they work without a server
(unlike the old Framer export), because there are no ES modules.

---

## Editing

### Change text / content
Open the relevant `index.html` and edit directly. Content is plain HTML — no templating
system to learn.

### Change colors / fonts / spacing
- **Colors & fonts:** edit `tailwind.config.js` (`theme.extend`).
- **Shared component styles** (buttons, cards, nav, footer): edit `src/input.css`
  under `@layer components`.
- **One-off styling:** use Tailwind utility classes directly in the HTML.

### Rebuild the CSS after changes

```bash
npm run build      # one-time compile (minified)
# or
npm run dev        # watch mode — recompiles on save
```

`assets/css/styles.css` is the compiled output and is committed, so the site works
even if you never run a build. Rebuild only after changing `src/input.css` or
`tailwind.config.js`.

### Responsive breakpoints

The site follows a three-tier layout convention (defined in `tailwind.config.js`):

| Tier       | Width           | Tailwind prefix | Layout behavior                                   |
| ---------- | --------------- | --------------- | ------------------------------------------------- |
| Mobile     | `< 768px`       | base            | Single-column, stacked, nav wraps below the name  |
| Tablet     | `≥ 768px`       | `md:`           | Nav goes horizontal, card rows begin, icons grow  |
| Desktop    | `≥ 1024px`      | `lg:`           | Full multi-column hero grids, largest type sizes  |

Primary layout switches happen at `md` (tablet) and `lg` (desktop). `sm` (640px) is
only used for minor type scaling.

---

## Contact form setup

The contact form (`contact/index.html`) posts to [Formspree](https://formspree.io) so
it works on static hosting with no backend.

1. Create a free form at https://formspree.io — you'll get an endpoint like
   `https://formspree.io/f/abcdwxyz`.
2. Open `contact/index.html` and replace the `action` value:
   ```html
   <form action="https://formspree.io/f/your-form-id" method="POST">
   ```
3. Rebuild is not needed (HTML change only).

Submissions are emailed to the address you configure in Formspree.

---

## Deploy

This is a plain static site — deploy the folder as-is to any static host.

- **Netlify:** drag-and-drop the folder onto https://app.netlify.com/drop
- **Vercel:** `npx vercel` in this folder, or import the repo at https://vercel.com/new
- **GitHub Pages / Cloudflare Pages / Render:** push to a repo and point the static
  host at the root directory.

No build command is required by the host (the CSS is precompiled). If you want the host
to build Tailwind on every deploy, set build command `npm run build` and output
directory `.` (root).

---

## Notes

- Fonts load from Google Fonts (Cormorant + Montserrat) — identical to the original design.
  To go fully self-hosted, download the woff2 files and add `@font-face` rules in
  `src/input.css`.
- The original Framer runtime, React/Motion bundles, editor bar, analytics, and hashed
  CSS have been removed.
- All text, images, layout intent, and visual design are preserved from the original.
