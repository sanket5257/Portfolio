// Journey layout in normalized scroll progress. Every scene and overlay reads
// from here so the 3D and the DOM stay locked to the same beats.

export const SCROLL_SCREENS = 32; // total page height in viewports

export const T = {
  ruins: [0, 0.3],
  explode: [0.03, 0.13], // arch stones lift off and scatter
  ring: [0.1, 0.19], // stones settle into a floating ring, cracks ignite
  vortex: [0.14, 0.24], // portal swirls inside the ring
  dive: [0.21, 0.3], // camera flies through the portal
  projects: [0.3, 0.44],
  lines: [0.44, 0.72],
  flower: [0.7, 0.87],
  hand: [0.86, 1],
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// 0..1 progress of p within [a,b]
export const range = (p, [a, b]) => clamp((p - a) / (b - a));

// rises over [a, a+fade], holds, falls over [b-fade, b]
export const window01 = (p, [a, b], fade = 0.02) =>
  Math.min(clamp((p - a) / fade), clamp((b - p) / fade));

export const smooth = (t) => t * t * (3 - 2 * t);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t) => t * t * t;
export const lerp = (a, b, t) => a + (b - a) * t;

export const isIn = (p, [a, b], pad = 0.01) => p >= a - pad && p <= b + pad;

// Exactly one scene drives the camera at any moment.
export const OWNERS = [
  ["ruins", 0.3],
  ["projects", 0.44],
  ["lines", 0.705],
  ["flower", 0.87],
  ["hand", 1.01],
];
export const owner = (p) => OWNERS.find(([, end]) => p < end)[0];

// Scene hand-offs happen inside a dip to black so a camera/scene swap is never
// visible: [fade-in start, fully dark from, fully dark until, fade-out end, peak].
// Each dip brackets the matching OWNERS boundary.
export const DIPS = [
  [0.418, 0.434, 0.448, 0.462, 1], // projects -> strands
  [0.694, 0.702, 0.708, 0.718, 0.92], // stem -> blossom
  [0.846, 0.862, 0.878, 0.89, 1], // flower -> reach out
];
export const dipAmount = (p) =>
  DIPS.reduce((m, [a, b, c, d, peak]) => {
    if (p <= a || p >= d) return m;
    const v = p < b ? (p - a) / (b - a) : p > c ? (d - p) / (d - c) : 1;
    return Math.max(m, smooth(clamp(v)) * peak);
  }, 0);
