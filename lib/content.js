// Everything a visitor reads lives here. Replace the placeholders with your own
// name, projects and links — the layout and animations adapt to the lengths.

export const site = {
  name: "SANKET",
  role: "CREATIVE DEVELOPER",
  domain: "SANKET.DEV",
  email: "hello@sanket.dev",
  available: true,
  from: "from india",
  basedIn: "based in india",
  coords: "19.076° N, 72.877° E",
  status: "FREELANCER",
  socials: [
    { label: "GitHub", href: "https://github.com/sanket5257", icon: "github" },
    { label: "X", href: "https://x.com/", icon: "x" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
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
  title: "I BUILD WHAT YOU FEEL",
  role: "CREATIVE DEVELOPER",
  body:
    "I design and develop immersive websites, WebGL experiences and interactive campaigns. From the first sketch to the last shader, I carry an idea the whole way so nothing gets lost between design and code.",
};

// Scene 2 — projects shown inside the crystal. `video` is optional (put files in /public/projects).
export const projects = [
  {
    title: "PROJECT ONE",
    year: "2026",
    tagline: "Replace with a one-line description of the project",
    role: "creative developer",
    stack: "Three.js, GSAP, Next.js",
    body: "Describe the problem, what you built and the part you are proudest of. Two or three short paragraphs read best in this panel.",
    href: "#",
    video: null,
    tint: [0.18, 0.62, 1.0],
  },
  {
    title: "PROJECT TWO",
    year: "2025",
    tagline: "Replace with a one-line description of the project",
    role: "front-end & motion",
    stack: "React, WebGL, Lenis",
    body: "Describe the problem, what you built and the part you are proudest of.",
    href: "#",
    video: null,
    tint: [0.45, 0.4, 1.0],
  },
  {
    title: "PROJECT THREE",
    year: "2025",
    tagline: "Replace with a one-line description of the project",
    role: "design & development",
    stack: "Next.js, Tailwind, GSAP",
    body: "Describe the problem, what you built and the part you are proudest of.",
    href: "#",
    video: null,
    tint: [0.1, 0.85, 0.75],
  },
  {
    title: "PROJECT FOUR",
    year: "2024",
    tagline: "Replace with a one-line description of the project",
    role: "creative developer",
    stack: "Three.js, GLSL",
    body: "Describe the problem, what you built and the part you are proudest of.",
    href: "#",
    video: null,
    tint: [1.0, 0.55, 0.25],
  },
  {
    title: "PROJECT FIVE",
    year: "2024",
    tagline: "Replace with a one-line description of the project",
    role: "front-end",
    stack: "React, Framer",
    body: "Describe the problem, what you built and the part you are proudest of.",
    href: "#",
    video: null,
    tint: [0.95, 0.3, 0.6],
  },
  {
    title: "PROJECT SIX",
    year: "2023",
    tagline: "Replace with a one-line description of the project",
    role: "creative developer",
    stack: "WebGL, Node",
    body: "Describe the problem, what you built and the part you are proudest of.",
    href: "#",
    video: null,
    tint: [0.6, 0.9, 0.3],
  },
];

export const loaderSteps = [
  "COMPILING SHADERS",
  "RESOLVING SCENE GRAPH",
  "LOADING",
  "WARMING TEXTURES",
  "READY",
];
