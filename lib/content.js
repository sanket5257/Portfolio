// Everything a visitor reads lives here. Replace the placeholders with your own
// name, projects and links — the layout and animations adapt to the lengths.

export const site = {
  name: "SANKET",
  fullName: "Sanket Chougule",
  role: "CREATIVE DEVELOPER",
  domain: "SANKET.DEV",
  email: "chougulesanket30@gmail.com",
  available: true,
  from: "from maharashtra",
  basedIn: "based in india",
  coords: "19.751° N, 75.713° E",
  status: "FRONTEND ENGINEER",
  year: 2026,
  socials: [
    { label: "GitHub", href: "https://github.com/sanket5257", icon: "github" },
    { label: "LinkedIn", href: "https://linkedin.com/in/sanket-chougule5257", icon: "linkedin" },
    { label: "Dribbble", href: "https://dribbble.com/sanket-chougule", icon: "dribbble" },
    { label: "Instagram", href: "https://instagram.com/ft.leo_o", icon: "instagram" },
  ],
};

// Scene 3 — subtitles that ride the light strands. Each line: [dim lead, bright rest]
export const story = [
  ["Every", "interface starts as a feeling"],
  ["I shape", "light, motion and code around it…"],
  ["…until the", "screen stops feeling like a screen"],
  ["And it all", "grows from one small idea…"],
  ["…that refuses", "to stay flat"],
];

export const about = {
  // the last word decodes into titleWordAlt when the scanner fills the frame
  titleLead: "I BUILD THE ",
  titleWord: "INVISIBLE",
  titleWordAlt: "FEELING",
  role: "CREATIVE DEVELOPER",
  body:
    "I'm a creative web developer from Maharashtra. I build immersive websites and interactive experiences with clean code, smooth motion and pixel-perfect UI, carrying each idea from the first sketch to the last frame.",
};

// Scene 2 — projects shown inside the crystal. `image` is the screen texture; add `video` to override.
export const projects = [
  {
    title: "EVOLEOTION STUDIO",
    year: "2025",
    tagline: "A creative studio site with immersive motion and a bold identity",
    role: "creative studio",
    stack: "Next.js · GSAP · Lenis · Tailwind CSS",
    body: "Gradient-led art direction, scroll-driven reveals and a hero that sets the tone before a single word is read.",
    href: "https://evoleotionstudio.com/",
    image: "/work/evoleotion-studio.jpeg",
    video: null,
    tint: [0.75, 0.45, 1],
  },
  {
    title: "KVELL DYNAMICS",
    year: "2025",
    tagline: "An AI and automation agency site with premium UI/UX",
    role: "agency website",
    stack: "Next.js · GSAP · Lenis · Tailwind CSS",
    body: "A restrained, confident layout where the motion carries the pitch rather than decorating it.",
    href: "https://kvelld-beta.vercel.app/",
    image: "/work/kvell-dynamics.jpeg",
    video: null,
    tint: [0.25, 0.6, 1],
  },
  {
    title: "RAMSCRIPT",
    year: "2024",
    tagline: "A software agency positioned as a virtual CTO and long-term tech partner",
    role: "software agency",
    stack: "Next.js · GSAP · Lenis · Tailwind CSS",
    body: "Structured, credibility-first storytelling from hero to contact.",
    href: "https://ramscript.com/",
    image: "/work/ramscript.jpeg",
    video: null,
    tint: [0.2, 0.85, 0.8],
  },
  {
    title: "SHIVNERI SYSTEMS",
    year: "2024",
    tagline: "A full-stack engineering agency offering on-demand product teams",
    role: "engineering agency",
    stack: "Next.js · GSAP · Lenis · Tailwind CSS",
    body: "Built to make a technical service feel tangible and immediate.",
    href: "https://shivneri.vercel.app/",
    image: "/work/shivneri-systems.jpeg",
    video: null,
    tint: [1, 0.6, 0.3],
  },
  {
    title: "CODESAGE",
    year: "2024",
    tagline: "A web design and development agency with an AI solutions focus",
    role: "agency website",
    stack: "Next.js · GSAP · Lenis · Tailwind CSS",
    body: "Clear service architecture wrapped in a calm, systems-led interface.",
    href: "https://codesage5.vercel.app/",
    image: "/work/codesage.jpeg",
    video: null,
    tint: [0.4, 0.9, 0.5],
  },
  {
    title: "VIDYA BHARATI",
    year: "2024",
    tagline: "A school website covering admissions, academics and campus life",
    role: "education",
    stack: "Next.js · GSAP · Lenis · Tailwind CSS",
    body: "A large information surface kept warm, navigable and parent-friendly.",
    href: "https://education-kappa-eight.vercel.app/",
    image: "/work/vidya-bharati.jpeg",
    video: null,
    tint: [1, 0.8, 0.35],
  },
  {
    title: "PORTFOLIO V2",
    year: "2024",
    tagline: "A personal portfolio built around cinematic GSAP sequences",
    role: "personal portfolio",
    stack: "Next.js · GSAP · Lenis · Tailwind CSS",
    body: "Pacing, type and easing tuned so the whole page reads as one continuous shot.",
    href: "https://portfolioleo-o.vercel.app/",
    image: "/work/portfolio-v2.jpeg",
    video: null,
    tint: [0.95, 0.35, 0.55],
  },
  {
    title: "ZENTRY CLONE",
    year: "2024",
    tagline: "A high-fidelity recreation of a cinematic homepage",
    role: "concept build",
    stack: "React · GSAP · Lenis · Tailwind CSS",
    body: "A study in scroll choreography, video masking and getting the details exactly right.",
    href: "https://zentry-clone-indol.vercel.app/",
    image: "/work/zentry-clone.jpeg",
    video: null,
    tint: [0.55, 0.5, 1],
  },
];

export const loaderSteps = [
  "COMPILING SHADERS",
  "RESOLVING SCENE GRAPH",
  "LOADING",
  "WARMING TEXTURES",
  "READY",
];
