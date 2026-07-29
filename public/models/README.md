# 3D model slots

The hero renders an **original procedural desk workspace** with no files here —
so the site works immediately.

To use your own 3D models:

1. Put a `.glb` file in this folder, e.g. `desk.glb`, `monitor.glb`, `lamp.glb`,
   `plant.glb`, `cup.glb`, `turntable.glb`, `chair.glb`.
2. Open `lib/models.js` and for that object set `enabled: true` (and adjust
   `url`, `position`, `rotationY`, `scale` to taste).
3. Reload — your GLB replaces the procedural stand-in for that object only.

Use models you own or that are licensed for your use (e.g. CC0 from
poly.pizza / Sketchfab / Poly Haven). Don't rehost another site's assets.

Tip: compress GLBs with Draco/meshopt via `gltf-transform` for fast loads.
