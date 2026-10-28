// Journey layout in normalized scroll progress. Every scene and overlay reads
// from here so the 3D and the DOM stay locked to the same beats.

export const SCROLL_SCREENS = 32; // total page height in viewports

export const T = {
  ruins: [0, 0.3],
  explode: [0.03, 0.13], // arch stones lift off and scatter
  ring: [0.1, 0.19], // stones settle into a floating ring, cracks ignite
  vortex: [0.14, 0.24], // portal swirls inside the ring
  dive: [0.21, 0.3], // camera flies through the portal
  whiteout: [0.26, 0.335],
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
