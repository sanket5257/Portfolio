/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
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
