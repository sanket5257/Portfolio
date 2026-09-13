/* ─────────────────────────────────────────────────────────────────────────
   The portfolio, as chapters of the scrolling world.

   Order matters: this is the sequence the visitor flies through once the
   phoenix leaves the peak, one project per beat of the flight.
   ───────────────────────────────────────────────────────────────────────── */

const NEXT_STACK = 'Next.js · GSAP · Lenis · Tailwind CSS';

export const projects = [
  {
    slug: 'evoleotion-studio',
    title: 'Evoleotion Studio',
    type: 'Creative Studio',
    year: '2025',
    overview:
      'Creative studio site with immersive motion and a bold visual identity — ' +
      'gradient-led art direction, scroll-driven reveals and a hero that sets ' +
      'the tone before a single word is read.',
    stack: NEXT_STACK,
    live: 'https://evoleotionstudio.com/',
    image: '/work/evoleotion-studio.jpeg',
  },
  {
    slug: 'kvell-dynamics',
    title: 'Kvell Dynamics',
    type: 'Agency Website',
    year: '2025',
    overview:
      'AI and automation agency site with premium UI/UX — a restrained, ' +
      'confident layout where the motion carries the pitch rather than ' +
      'decorating it.',
    stack: NEXT_STACK,
    live: 'https://kvelld-beta.vercel.app/',
    image: '/work/kvell-dynamics.jpeg',
  },
  {
    slug: 'ramscript',
    title: 'RamScript',
    type: 'Software Agency',
    year: '2024',
    overview:
      'Software development agency positioned as a virtual CTO and long-term ' +
      'tech partner — structured, credibility-first storytelling from hero to ' +
      'contact.',
    stack: NEXT_STACK,
    live: 'https://ramscript.com/',
    image: '/work/ramscript.jpeg',
  },
  {
    slug: 'shivneri-systems',
    title: 'Shivneri Systems',
    type: 'Engineering Agency',
    year: '2024',
    overview:
      'Full-stack engineering agency offering on-demand product teams — built ' +
      'to make a technical service feel tangible and immediate.',
    stack: NEXT_STACK,
    live: 'https://shivneri.vercel.app/',
    image: '/work/shivneri-systems.jpeg',
  },
  {
    slug: 'codesage',
    title: 'CodeSage',
    type: 'Agency Website',
    year: '2024',
    overview:
      'Web design and development agency with an AI solutions focus — clear ' +
      'service architecture wrapped in a calm, systems-led interface.',
    stack: NEXT_STACK,
    live: 'https://codesage5.vercel.app/',
    image: '/work/codesage.jpeg',
  },
  {
    slug: 'vidya-bharati',
    title: 'Vidya Bharati School',
    type: 'Education',
    year: '2024',
    overview:
      'School website covering admissions, academics and a campus showcase — ' +
      'a large information surface kept warm, navigable and parent-friendly.',
    stack: NEXT_STACK,
    live: 'https://education-kappa-eight.vercel.app/',
    image: '/work/vidya-bharati.jpeg',
  },
  {
    slug: 'portfolio-v2',
    title: 'Portfolio v2',
    type: 'Personal Portfolio',
    year: '2024',
    overview:
      'Personal portfolio built around cinematic GSAP sequences — pacing, ' +
      'type and easing tuned so the whole page reads as one continuous shot.',
    stack: NEXT_STACK,
    live: 'https://portfolioleo-o.vercel.app/',
    image: '/work/portfolio-v2.jpeg',
  },
  {
    slug: 'zentry-clone',
    title: 'Zentry Clone',
    type: 'Concept Build',
    year: '2024',
    overview:
      'High-fidelity recreation of a cinematic homepage — a study in scroll ' +
      'choreography, video masking and getting the details exactly right.',
    stack: 'React · GSAP · Lenis · Tailwind CSS',
    live: 'https://zentry-clone-indol.vercel.app/',
    image: '/work/zentry-clone.jpeg',
  },
];
