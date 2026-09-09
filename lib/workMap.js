/* ──────────────────────────────────────────────────────────────────────
   Map generation for /work — Kolhapur.

   The reference (hubtown.co.in/projects) renders a real Mumbai map from
   .glb geometry: water, a contour field and a glowing road network, with
   one extruded cube per project on top. This is the same thing for
   Kolhapur, drawn from real OpenStreetMap geometry.

   public/hub/kolhapur.json holds the extracted network — every way is a
   flat [x0,y0,x1,y1,…] polyline already projected and normalised to 0..1
   over a 22.4 km square centred on the city:

     major   362 ways  motorway · trunk · primary · secondary
     minor  9250 ways  tertiary · residential · unclassified · living_street
     rivers    7 ways  the Panchganga
     water    89 rings Rankala, Kalamba and the rest
     rail     12 ways

   It was pulled from the Overpass API over bbox 16.62,74.14 → 16.80,74.35,
   decimated (~9 m major, ~18 m minor) and rounded to 4 dp. OSM data is
   ODbL — attribution belongs in the page footer if this ships publicly.
   ────────────────────────────────────────────────────────────────────── */

/* The plane is much wider than the view frustum at any zoom level, so the
   edge of the plate is never on screen — the reference's map has no visible
   boundary either, you simply run out of city. At 1x the view spans ~10 km,
   which frames the whole of central Kolhapur. */
export const MAP_SIZE = 190;

/* Bounding box of the extract, and the projection used to build it. Kept
   here so marker coordinates can be derived from real lat/lon. */
const BBOX = { s: 16.62, w: 74.14, n: 16.8, e: 74.35 };
const MPD = 111320;
const C_LAT = (BBOX.s + BBOX.n) / 2;
const C_LON = (BBOX.w + BBOX.e) / 2;
const KX = Math.cos((C_LAT * Math.PI) / 180);
const SPAN_M = Math.max((BBOX.e - BBOX.w) * KX, BBOX.n - BBOX.s) * MPD;

/** Real lat/lon to world (x, z) on the map plane. */
export function latLonToWorld(lat, lon) {
  const nx = 0.5 + ((lon - C_LON) * KX * MPD) / SPAN_M;
  const ny = 0.5 - ((lat - C_LAT) * MPD) / SPAN_M;
  return [(nx - 0.5) * MAP_SIZE, (ny - 0.5) * MAP_SIZE];
}

/* Each project sits on a real Kolhapur locality. */
export const PLACES = {
  'evoleotion-studio': { name: 'Rankala', lat: 16.691, lon: 74.22 },
  'kvell-dynamics': { name: 'Mahalaxmi', lat: 16.6947, lon: 74.2317 },
  ramscript: { name: 'Shahupuri', lat: 16.702, lon: 74.236 },
  'shivneri-systems': { name: 'Tarabai Park', lat: 16.708, lon: 74.242 },
  codesage: { name: 'Nagala Park', lat: 16.706, lon: 74.25 },
  'vidya-bharati': { name: 'Shivaji University', lat: 16.665, lon: 74.248 },
  'portfolio-v2': { name: 'Kasba Bawada', lat: 16.72, lon: 74.26 },
  'zentry-clone': { name: 'New Palace', lat: 16.713, lon: 74.227 },
};

export const MAP_POINTS = Object.fromEntries(
  Object.entries(PLACES).map(([slug, p]) => [slug, latLonToWorld(p.lat, p.lon)])
);

/** World position (x, z) for a project. */
export function worldPos(slug) {
  return MAP_POINTS[slug] || [0, 0];
}

let cache = null;
/** Fetch the street network once per session. */
export async function loadMapData() {
  if (!cache) {
    const res = await fetch('/hub/kolhapur.json');
    if (!res.ok) throw new Error('map data ' + res.status);
    cache = await res.json();
  }
  return cache;
}

/* mulberry32 — deterministic PRNG for the decorative terrain layer only. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Trace a flat [x0,y0,x1,y1,…] way, scaled to the canvas. */
function trace(ctx, way, size) {
  ctx.beginPath();
  ctx.moveTo(way[0] * size, way[1] * size);
  for (let i = 2; i < way.length; i += 2) ctx.lineTo(way[i] * size, way[i + 1] * size);
}

/**
 * Paint Kolhapur onto a canvas. Returns the canvas so the caller can hand
 * it straight to a THREE.CanvasTexture.
 */
export function drawMap(data, size = 3072) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const px = size / 3072; // stroke widths are authored at 3072

  ctx.fillStyle = '#04101f';
  ctx.fillRect(0, 0, size, size);

  // ── decorative terrain ──────────────────────────────────────────────
  // Not survey data: the extract carries no elevation, and these rings are
  // generated. They exist because the reference's contour field is a large
  // part of how its map reads. Faint enough to be texture, not information.
  const r = rng(16702443);
  ctx.strokeStyle = 'rgba(120,175,255,0.055)';
  ctx.lineWidth = 1.4 * px;
  for (let h = 0; h < 26; h++) {
    const hx = r() * size;
    const hy = r() * size;
    const rings = 4 + Math.floor(r() * 7);
    const step = size * (0.01 + r() * 0.016);
    const ph = r() * 6.28;
    for (let k = 1; k <= rings; k++) {
      ctx.beginPath();
      for (let i = 0; i <= 44; i++) {
        const a = (i / 44) * Math.PI * 2;
        const rad =
          k * step * (1 + 0.22 * Math.sin(a * 3 + ph) + 0.12 * Math.sin(a * 5 + ph * 2));
        const x = hx + Math.cos(a) * rad;
        const y = hy + Math.sin(a) * rad * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ── water ───────────────────────────────────────────────────────────
  // Lakes fill dark against the land with a lit rim — the same read the
  // reference gives its coastline. Rankala is the big one, west of centre.
  ctx.save();
  ctx.shadowColor = 'rgba(70,150,255,0.7)';
  ctx.shadowBlur = 22 * px;
  ctx.fillStyle = '#010912';
  ctx.strokeStyle = 'rgba(110,175,255,0.5)';
  ctx.lineWidth = 2.4 * px;
  for (const w of data.water) {
    trace(ctx, w, size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // The Panchganga, as a channel rather than a hairline.
  ctx.strokeStyle = 'rgba(90,160,255,0.55)';
  ctx.lineWidth = 7 * px;
  for (const w of data.rivers) {
    trace(ctx, w, size);
    ctx.stroke();
  }
  ctx.restore();

  // ── minor streets ───────────────────────────────────────────────────
  // 9,250 real ways. This is what gives the plate its grain.
  ctx.strokeStyle = 'rgba(150,195,255,0.32)';
  ctx.lineWidth = 1.6 * px;
  for (const w of data.minor) {
    trace(ctx, w, size);
    ctx.stroke();
  }

  // ── railway ─────────────────────────────────────────────────────────
  ctx.save();
  ctx.setLineDash([10 * px, 8 * px]);
  ctx.strokeStyle = 'rgba(170,200,255,0.3)';
  ctx.lineWidth = 2 * px;
  for (const w of data.rail) {
    trace(ctx, w, size);
    ctx.stroke();
  }
  ctx.restore();

  // ── major roads ─────────────────────────────────────────────────────
  // Two passes: a wide soft glow, then a bright core.
  for (const pass of [
    { w: 6, color: 'rgba(45,110,235,0.18)', blur: 26 },
    { w: 2.2, color: 'rgba(130,190,255,0.62)', blur: 12 },
  ]) {
    ctx.save();
    ctx.strokeStyle = pass.color;
    ctx.lineWidth = pass.w * px;
    ctx.shadowColor = 'rgba(60,140,255,0.8)';
    ctx.shadowBlur = pass.blur * px;
    for (const w of data.major) {
      trace(ctx, w, size);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── graticule ───────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(120,170,255,0.04)';
  ctx.lineWidth = 1 * px;
  for (let i = 0; i <= 38; i++) {
    const t = (i / 38) * size;
    ctx.beginPath();
    ctx.moveTo(t, 0);
    ctx.lineTo(t, size);
    ctx.moveTo(0, t);
    ctx.lineTo(size, t);
    ctx.stroke();
  }

  return c;
}
