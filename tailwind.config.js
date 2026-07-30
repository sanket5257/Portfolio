/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    /* Declared in full rather than via `extend` because the order matters and
       `extend` can only append. Tailwind emits variants in the order they are
       listed, and later rules win — so `xs` has to precede `sm`, and the two
       height-aware screens have to come last so they can override the
       width-based ones on a short window. (sm–2xl are Tailwind's own defaults,
       repeated verbatim.) */
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      /* /work flips from stacked to side-by-side here. Width alone isn't the
         right test: a landscape phone (844×390) has plenty of width but
         stacking leaves the copy pane ~240px tall, so it needs the two-column
         layout as much as a desktop does. */
      split: {
        raw: '(min-width: 1280px), (min-width: 700px) and (max-height: 560px)',
      },
      // Landscape phones and other stub-height windows.
      short: { raw: '(max-height: 560px)' },
    },
    extend: {
      colors: {
        // growon-style dark palette
        ink: '#0c1117',       // page background
        ink2: '#0e141c',
        paper: '#f2f5f8',     // near-white text
        muted: '#9aa7b4',
        accent: '#7dd3c0',    // soft teal (swap to taste)
      },
      fontFamily: {
        sans: ['var(--font-urbanist)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        floaty: 'floaty 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
