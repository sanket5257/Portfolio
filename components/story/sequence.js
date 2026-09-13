/* ─────────────────────────────────────────────────────────────────────────
   The shot.

   One continuous 300-frame take, 16:9, built by scripts/build-frames.mjs from
   the PNG export. It runs unbroken from the phoenix perched on the peak,
   through the flight across the range, up past the moon, to the final spread.

   Because it is a single take there is nothing to splice — the whole journey
   is one scrub across one strip. Every frame of the export is kept: at 300 the
   strip is dense enough to draw one sharp frame per tick, with no dissolve
   between neighbours and no defocus anywhere. Softness is what makes a scrub
   look like a cheap video scrubber, and it is the one thing this sequence is
   not allowed to have.

   What keeps it from reading as "a video on a scrollbar" is what is layered
   over the scrub, not smeared into it: a camera that pushes and pulls
   independently of the footage, and a bloom that swells where the moon is
   actually in frame.
   ───────────────────────────────────────────────────────────────────────── */

export const STRIP = { dir: '/frames', count: 300 };

/* Widths that exist on disk, narrowest first. 854 roughly halves the bytes on
   phones, where the canvas is never more than ~430 CSS px wide anyway. */
export const WIDTHS = [854, 1280, 1920];

/** `/frames/1280/007.webp` */
export function frameSrc(index, width) {
  return `${STRIP.dir}/${width}/${String(index + 1).padStart(3, '0')}.webp`;
}

/* ── Acts ────────────────────────────────────────────────────────────────
   Where the footage changes character. These are read off the take itself,
   not invented: the bird leaves the rock around frame 25, is in level flight
   by 38, the moon comes back into frame around 100, and the last 25 frames
   are the head-on spread. chapters.js hangs its copy on the same numbers. */
export const ACTS = {
  perch: [0.0, 0.17],
  lift: [0.17, 0.26],
  flight: [0.26, 0.66],
  moon: [0.66, 0.84],
  spread: [0.84, 1.0],
};

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 0 below `a`, 1 above `b`, smooth in between. */
export function smoothstep(a, b, v) {
  const t = clamp01((v - a) / (b - a || 1));
  return t * t * (3 - 2 * t);
}

/** Progress `p` within an arbitrary window. */
export function range(p, from, to) {
  return clamp01((p - from) / (to - from || 1));
}

/** 1 in the middle of the window, 0 outside it. */
function bell(p, from, to) {
  const t = range(p, from, to);
  return t <= 0 || t >= 1 ? 0 : Math.sin(t * Math.PI);
}

/* ── What to draw at progress `p` ─────────────────────────────────────────
   One frame index, rounded to the nearest — not a blend of two. With 300
   frames the neighbours are close enough together that rounding is invisible,
   and drawing a single image keeps every pixel of the master intact. Blending
   a pair would put a ghost of the next frame over the current one, which on
   fast-moving wings is exactly the smear this is meant to avoid.

   `scale` is the camera's own push, layered over whatever the footage is
   already doing — and kept deliberately small. A big continuous zoom on top
   of a moving shot is what makes these sequences feel like a filter; a
   percent or two, moving slowly, reads as a camera that is alive.

   It is not monotonic: it eases back through the perch (the shot is static
   there, so the camera supplies the movement), leans in as the wings catch,
   settles across the flight, and closes the distance for the final spread. */
export function composition(p) {
  const frame = Math.round(clamp01(p) * (STRIP.count - 1));

  const lift = smoothstep(0, 1, range(p, ACTS.lift[0], ACTS.lift[1]));
  const flight = smoothstep(0, 1, range(p, ACTS.flight[0], ACTS.flight[1]));
  const spread = smoothstep(0, 1, range(p, ACTS.spread[0], ACTS.spread[1]));

  const scale =
    1.04 -
    range(p, 0, ACTS.perch[1]) * 0.03 + // the perch, drifting back
    lift * 0.05 - //                       the take-off, leaning in
    flight * 0.045 + //                    the flight, settling
    spread * 0.04; //                      the final spread, closing in

  /* The moon is physically in frame across the moon act; the bloom is that
     light spilling into the grade rather than an effect for its own sake. */
  const bloom = bell(p, ACTS.moon[0] - 0.04, ACTS.moon[1] + 0.02);

  return { frame, scale, bloom };
}
