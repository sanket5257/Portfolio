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

/* ── Camera framing per breakpoint ────────────────────────────────────────
   The fit distance is `radius / sin(min(vfov, hfov) / 2)`, i.e. the distance
   at which the bounding sphere exactly fills whichever field of view is the
   tighter one. `mult` scales that: below 1 trades padding for size, and far
   below 1 clips the tableau.

   That matters most on a phone. In portrait the *horizontal* FOV is the tight
   one (14° at 390px wide vs 30° vertical), so the fit distance is already
   ~32 units — and multiplying it by the old flat 0.62 pulled the camera in
   until the desk ran off both edges. Wide screens have the opposite problem:
   the vertical FOV binds and there is horizontal room to spare, so they can
   afford a much smaller multiplier.

   `lookLift` offsets the look-at point vertically, as a fraction of the fit
   distance. Aiming higher pushes the tableau *down* the frame — which is how
   the top third of a phone screen gets freed up for the headline instead of
   the desk sitting behind it.

   Rules are tested in order; the first match wins, and the last is the
   desktop default. */
export const cameraFrames = [
  { name: 'phone', maxWidth: 480, mult: 0.84, lookLift: 0.062 },
  { name: 'phone-lg', maxWidth: 640, mult: 0.8, lookLift: 0.055 },
  // Short/landscape windows: the vertical FOV binds no matter how wide the
  // window is, so these need their own rule ahead of the width buckets.
  { name: 'short', maxHeight: 480, mult: 0.9, lookLift: 0.015 },
  { name: 'tablet', maxWidth: 1024, mult: 0.85, lookLift: 0.04 },
  { name: 'laptop', maxWidth: 1536, mult: 0.75, lookLift: -0.015 },
  { name: 'desktop', mult: 0.98, lookLift: -0.03 },
];

export function frameFor(width, height) {
  return cameraFrames.find(
    (f) =>
      (f.maxWidth === undefined || width < f.maxWidth) &&
      (f.maxHeight === undefined || height < f.maxHeight)
  );
}

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
