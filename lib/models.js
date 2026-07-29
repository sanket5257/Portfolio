// ─────────────────────────────────────────────────────────────
//  3D SCENE — EXACT LAYOUT (mirrors growon.kr)
//
//  Every object is recentered on load (base sits on y=0, centered
//  in x/z) then placed with the transform below. `rotationY` is in
//  radians here (the source table used degrees). `scale` is a plain
//  multiplier on the recentered GLB / procedural model.
//
//  Desk-top items sit at DESK_TOP_Y. Floor items sit at y=0.
// ─────────────────────────────────────────────────────────────

const D = Math.PI / 180;

// Desktop surface height (desk y 1.3 + top thickness 0.3542).
export const DESK_TOP_Y = 1.3 + 0.3542; // 1.6542

// Elevated 3/4 camera, framed to the scene's bounding sphere.
export const camera = {
  fov: 30,
  // Look-at target and the (normalized) direction the camera sits along.
  target: [0, 1.7, 0],
  dir: [0.66, 0.46, 0.76],
  // Bounding radius used by the fit; multiplier varies by breakpoint.
  radius: 3.95,
};

// Mouse parallax (subtle): yaw on the whole tableau, pitch on the camera.
export const parallax = { yaw: 0.14, pitch: 5 * D };

// id === file → /models/<file>.glb, unless `procedural` (notebook, pencil).
export const SCENE_OBJECTS = [
  { id: 'desk',      file: 'desk',      position: [0, 1.3, 0],               rotationY: 0,        scale: 1.8,  interaction: 'none' },
  { id: 'lamp',      file: 'lamp',      position: [1.8, 0, -0.8],            rotationY: -90 * D,  scale: 1.7,  interaction: 'lamp' },
  { id: 'chair',     file: 'chair',     position: [1.2, 0, 1.2],             rotationY: 75 * D,   scale: 1.2,  interaction: 'sfx',   sound: '/audio/chair_squeaking.mp3' },
  { id: 'plant',     file: 'plant',     position: [-0.9, 0, 2.5],            rotationY: 60 * D,   scale: 1.8,  interaction: 'sfx',   sound: '/audio/leaves.mp3' },
  { id: 'monitor',   file: 'monitor',   position: [-1, DESK_TOP_Y, -1],      rotationY: 40 * D,   scale: 0.9,  interaction: 'route', href: '/work',    sound: '/audio/whoosh.mp3' },
  { id: 'turntable', file: 'turntable', position: [-0.9, DESK_TOP_Y, 1],     rotationY: 90 * D,   scale: 0.55, interaction: 'music' },
  { id: 'notebook',  file: 'notebook',  position: [0.6, DESK_TOP_Y, -0.8],   rotationY: 90 * D,   scale: 0.45, procedural: true, interaction: 'panel', panel: 'about', sound: '/audio/book.mp3' },
  { id: 'cup',       file: 'cup',       position: [-0.8, DESK_TOP_Y, -0.05], rotationY: 140 * D,  scale: 0.2,  interaction: 'panel', panel: 'contact', sound: '/audio/coffee.mp3' },
];

// Panel routing (which object opens which overlay).
export const PANEL_OF = Object.fromEntries(
  SCENE_OBJECTS.filter((o) => o.panel).map((o) => [o.id, o.panel])
);
