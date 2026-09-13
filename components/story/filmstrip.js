'use client';

import { STRIP, WIDTHS, composition, frameSrc } from './sequence';
import { createGLRenderer } from './glRenderer';

/* ─────────────────────────────────────────────────────────────────────────
   Loading and drawing the filmstrip.

   The loader is deliberately not all-or-nothing. The opening sixty frames
   are enough to start the journey; the rest keeps arriving while the visitor
   is still watching the wings open, which on a phone is the difference
   between a two-second wait and a fifteen-second one. `nearest()` covers the
   gap if the visitor scrubs ahead of the download.
   ───────────────────────────────────────────────────────────────────────── */

/** The widest strip that is worth the bytes on this screen and connection. */
export function pickWidth() {
  if (typeof window === 'undefined') return WIDTHS[1];
  /* Ask for the full device ratio, capped at 2. The earlier version capped
     the request at 1.5× to save bytes, which on any retina display meant the
     browser was handed fewer source pixels than the canvas had to fill and
     upscaled every single frame — the whole take looked soft and only the
     stillest shots survived it. Sharpness is the product here; bytes are
     negotiable and the loader covers them. */
  const need = window.innerWidth * Math.min(2, window.devicePixelRatio || 1);
  let i = WIDTHS.findIndex((w) => w >= need);
  if (i === -1) i = WIDTHS.length - 1;

  // Three hundred frames is the wrong thing to insist on over a metered link.
  const net = navigator.connection;
  if (net?.saveData || /2g|3g/.test(net?.effectiveType ?? '')) i = Math.max(0, i - 1);

  return WIDTHS[i];
}

function load(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    // A dropped frame must not wedge the loader — nearest() will cover it.
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/* Enough of the take to open on — a fifth of it. The autopilot burns about
   eleven frames a second, so sixty is several seconds of head start, and the
   remaining lanes stay comfortably ahead of the playhead from there. */
const GATE = 60;

/**
 * Downloads the strip. `onProgress` fires with 0→1 over the frames needed
 * before the journey can start; the promise resolves at that point, and the
 * remainder continues to fill in behind it.
 */
export async function loadFilmstrip({ width, onProgress, signal }) {
  const strip = new Array(STRIP.count).fill(null);

  let done = 0;
  let released = false;
  let release;
  const ready = new Promise((r) => {
    release = r;
  });

  /* Six at a time. Serial loading wastes the connection; unbounded loading
     makes the browser interleave all 300 requests so nothing finishes first,
     which is the one thing a gated loader cannot tolerate. */
  const LANES = 6;
  let cursor = 0;

  async function lane() {
    while (cursor < STRIP.count) {
      if (signal?.aborted) return;
      const i = cursor;
      cursor += 1;
      strip[i] = await load(frameSrc(i, width));
      done += 1;
      if (!released) {
        onProgress?.(Math.min(1, done / GATE));
        if (done >= GATE) {
          released = true;
          release();
        }
      }
    }
    if (!released) {
      released = true;
      release();
    }
  }

  const lanes = Array.from({ length: LANES }, lane);
  await ready;
  Promise.all(lanes).catch(() => {});
  return strip;
}

/** The requested frame, or the closest one that has actually arrived. */
function nearest(strip, index) {
  if (strip[index]) return strip[index];
  for (let d = 1; d < strip.length; d += 1) {
    if (strip[index - d]) return strip[index - d];
    if (strip[index + d]) return strip[index + d];
  }
  return null;
}

/* ── Renderer ───────────────────────────────────────────────────────────── */

const BG = '#05040c';

function create2DRenderer(canvas, strip) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let w = 0;
  let h = 0;
  let dpr = 1;

  /* The natural size of the strip, taken off the first frame that has
     actually arrived. Needed before the backing store can be sized. */
  function source() {
    for (let i = 0; i < strip.length; i += 1) {
      if (strip[i]) return strip[i];
    }
    return null;
  }

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;

    /* Backing-store resolution, capped so the frames are never upscaled.

       A 1920-wide master covering a 1440px viewport is already being drawn
       at 0.8×; multiply the canvas by a device ratio of 2 and it is suddenly
       being drawn at 1.6×, i.e. every frame resampled up 60% before it ever
       reaches the screen. That is what made the flight look soft while a
       still frame looked fine — the resample is invisible on a static shot
       and obvious on a moving one.

       So the ratio is clamped to whatever keeps the draw at or below 1:1,
       never below 1 (going under would resample twice, once down and once
       back up by the compositor) and never above 2. */
    const img = source();
    const dev = Math.min(2, window.devicePixelRatio || 1);
    if (img) {
      // MAX_PUSH is the largest scale composition() ever asks for.
      const MAX_PUSH = 1.1;
      const cover = Math.max(w / img.width, h / img.height) * MAX_PUSH;
      dpr = Math.max(1, Math.min(dev, 1 / cover));
    } else {
      dpr = dev;
    }

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* Resetting the canvas size clears these, which is why they are set here
       rather than once at construction. */
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  /* Cover fit, then the camera's push, then a few pixels of pointer parallax
     so a paused world still breathes. */
  function drawFrame(img, scale, mx, my) {
    const cover = Math.max(w / img.width, h / img.height) * scale;
    const dw = img.width * cover;
    const dh = img.height * cover;
    ctx.drawImage(img, (w - dw) / 2 + mx, (h - dh) / 2 + my, dw, dh);
  }

  function render(p, mouse) {
    if (!w || !h) resize();
    const shot = composition(p);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    /* Exactly one frame, drawn sharp. No dissolve with its neighbour and no
       canvas blur filter anywhere: at 300 frames the strip does not need
       either, and both of them cost the master its detail — which is the
       whole reason for shipping 300 frames instead of 150. */
    const img = nearest(strip, shot.frame);
    if (img) {
      /* The parallax is stronger when the camera is pushed in, for the same
         reason a long lens shakes more than a wide one. */
      const push = Math.max(0, shot.scale - 1);
      const mx = mouse.x * (12 + push * 120);
      const my = mouse.y * (9 + push * 80);
      drawFrame(img, shot.scale, mx, my);
    }

    /* Moonlight. Screen-blended, cool violet, swelling while the moon is
       actually in frame — it lifts the grade at exactly the point the footage
       gets darkest, which is also where the copy has to stay readable. */
    if (shot.bloom > 0.01) {
      const cx = w * 0.3;
      const cy = h * 0.3;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.85);
      g.addColorStop(0, `rgba(206, 196, 255, ${0.4 * shot.bloom})`);
      g.addColorStop(0.4, `rgba(138, 108, 226, ${0.2 * shot.bloom})`);
      g.addColorStop(1, 'rgba(30, 8, 72, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  return { render, resize };
}

/* ── Renderer selection ──────────────────────────────────────────────────
   WebGL is the real path: it is the only one where the pointer can bend the
   frame rather than just slide it. The 2D renderer stays as the fallback for
   contexts that cannot give us a GL context at all — an old browser, a
   blocklisted driver, a machine that has already run out of GL contexts —
   because a page that shows the flight without the lens is fine, and a page
   that shows nothing is not. */
export function createRenderer(canvas, strip) {
  return createGLRenderer(canvas, strip) || create2DRenderer(canvas, strip);
}
