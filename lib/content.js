// ─────────────────────────────────────────────────────────────
//  EDIT YOUR PORTFOLIO CONTENT HERE — this is the only file you
//  need to touch for names, taglines and copy.
// ─────────────────────────────────────────────────────────────

export const site = {
  // Browser tab + SEO
  title: 'Sanket Chougule — Creative Web Developer',
  description:
    'Portfolio of Sanket Chougule, a creative web developer and frontend engineer based in Maharashtra, India. Immersive digital experiences with clean code, smooth animations and pixel-perfect UI.',
};

export const hero = {
  // Small eyebrow label above the headline (optional — set '' to hide)
  eyebrow: 'Sanket Chougule',

  // Main headline. Use \n to control line breaks.
  headline: 'Creative web developer\n& frontend engineer.',

  // One-line subheading under the headline
  subheading:
    'I craft immersive, visually captivating digital experiences with clean code, smooth animations, and pixel-perfect UI.',

  // Bottom-center copyright / credit
  footer: `© ${new Date().getFullYear()} Sanket Chougule. All rights reserved.`,

  // Small scroll hint text
  scrollHint: 'scroll',
};

// Overlay panels opened by clicking objects in the scene.
// (The monitor no longer opens a panel — it routes to /work.)
// `href` on an item makes it a link; omit it for plain rows.
export const panels = {
  about: {
    tag: 'Notebook',
    title: 'About',
    intro:
      "Hi, I'm Sanket — a creative web developer based in Maharashtra. I specialize in frontend development and crafting immersive digital experiences with clean code, smooth animations, and pixel-perfect UI that makes brands go from “meh” to “woah”.",
    items: [
      { name: 'Shivneri Systems', meta: 'Frontend Developer · Jun 2025 — Present' },
      { name: 'RS Soft Tech', meta: 'Frontend Developer · Mar — May 2025' },
      { name: 'Stormsofts Technology', meta: 'Frontend Developer Intern · Jun — Aug 2024' },
      { name: 'Stack', meta: 'React · Next.js · Tailwind · GSAP · Framer Motion · Lenis · Figma' },
    ],
  },
  contact: {
    tag: 'Coffee',
    title: 'Let’s talk',
    intro: 'Grab a coffee — tell me about the scene you want to build.',
    items: [
      {
        name: 'Email',
        meta: 'chougulesanket30@gmail.com',
        href: 'mailto:chougulesanket30@gmail.com',
      },
      {
        name: 'GitHub',
        meta: '@sanket5257',
        href: 'https://github.com/sanket5257',
      },
      {
        name: 'LinkedIn',
        meta: 'sanket-chougule5257',
        href: 'https://linkedin.com/in/sanket-chougule5257',
      },
      {
        name: 'Dribbble',
        meta: 'sanket-chougule',
        href: 'https://dribbble.com/sanket-chougule',
      },
      {
        name: 'Instagram',
        meta: '@ft.leo_o',
        href: 'https://instagram.com/ft.leo_o',
      },
      { name: 'Based in', meta: 'Maharashtra, India' },
    ],
  },
};
