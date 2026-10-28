// Tiny mutable store shared between the DOM (Lenis/GSAP) and the R3F render loop.
// Hot values (progress, pointer) are read every frame without React re-renders;
// coarse UI flags go through subscribe() so overlays can re-render on change.

const listeners = new Set();

export const state = {
  progress: 0, // 0..1 over the whole journey (Lenis)
  velocity: 0,
  pointer: { x: 0, y: 0 }, // -1..1, smoothed in the scene
  loaded: false,
  entered: false,
  lite: false,
  sound: false,
  project: 0,
  projectOpen: false,
  dragging: false,
};

export function set(patch) {
  Object.assign(state, patch);
  listeners.forEach((l) => l());
}

export function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getSnapshot() {
  return snapshot;
}

// useSyncExternalStore needs a stable snapshot between changes
let snapshot = { ...state };
listeners.add(() => {
  snapshot = { ...state };
});
