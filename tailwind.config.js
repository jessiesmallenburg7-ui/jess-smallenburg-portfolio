/** @type {import('tailwindcss').Config} */
//
// Responsive breakpoint convention
// --------------------------------
//   base (< 768px)   → MOBILE    : single-column, stacked layouts
//   md    (≥ 768px)  → TABLET    : multi-column rows begin, nav goes horizontal
//   lg    (≥ 1024px) → DESKTOP   : full multi-column hero grids, larger type
//
// Tailwind defaults used: sm=640, md=768, lg=1024, xl=1280.
// Primary switches happen at md (tablet) and lg (desktop).
//
module.exports = {
  content: [
    "./*.html",
    "./**/index.html",
  ],
  theme: {
    extend: {
      colors: {
        // Deep navy background gradient ends
        navy: {
          950: "#020713",
          900: "#060f27",
        },
        // Accent sky blue (résumé dates / labels)
        sky: {
          accent: "#7dd3fc",
        },
        // Accent teal (status pills, contact gradient start)
        teal: {
          accent: "#5fd3e0",
        },
        // Purple (contact gradient end)
        violet: {
          accent: "#a78bfa",
        },
      },
          fontFamily: {
            serif: ['Cormorant', 'Cormorant Placeholder', 'serif'],
            sans: ['Lato', 'Lato Placeholder', 'sans-serif'],
          },
      backgroundImage: {
        'site-gradient': 'linear-gradient(180deg, #04060e 0%, #0b1626 48%, #05070e 100%)',
        'cta-gradient': 'linear-gradient(90deg, #5fd3e0 0%, #a78bfa 100%)',
      },
      maxWidth: {
        content: "1200px",
      },
      screens: {
        'tab-max': { max: "1199.98px" },
      },
    },
  },
  plugins: [],
};
