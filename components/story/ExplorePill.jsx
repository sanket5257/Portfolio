'use client';

import { useCallback, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   The one thing on the hero you are meant to touch.

   It moves with the cursor. Not magnetically — there is no radius you have to
   enter before anything happens — it leans toward the pointer from anywhere
   on the page, all the time, and comes to rest in its own position only when
   the pointer is level with it. A control that tracks you across the whole
   frame reads as something alive in the scene; the same control sitting still
   until you are nearly on top of it reads as a link with a hover state.

   The travel is a small fraction of the pointer's distance and it is capped,
   so the button drifts rather than wanders — at the far corner of a wide
   screen the offset is the same as it is a few hundred pixels away.

   On top of that it answers the hover three more ways at once, because any
   one of them alone still reads as a button:

     · the border light sweeps round it, reversing direction
     · the letters lift in a stagger, left to right
     · a small blurred ring scales in and tracks the pointer inside it

   ── Why this is a component and not a class ──────────────────────────────
   All of it needs the pointer's position relative to the element, and the
   tracking needs it from anywhere on the page. So the listener is on the
   window, the easing runs in a rAF loop, and the results are written straight
   to the element as a transform and two custom properties. No React state, so
   none of it costs a render.
   ───────────────────────────────────────────────────────────────────────── */

/* Fraction of the pointer's distance the button travels. */
const FOLLOW = 0.14;
/* Ceiling on that travel, in px. Without it the button ends up halfway across
   a wide screen and stops reading as belonging to its own layout slot. */
const MAX = 64;
/* Follow rate per frame. Lower is looser. */
const CHASE = 0.14;

export default function ExplorePill({ label = 'Enter the flight', onClick }) {
  const ref = useRef(null);
  const inner = useRef(null);
  const state = useRef({ tx: 0, ty: 0, x: 0, y: 0 });

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const s = state.current;
    const r = el.getBoundingClientRect();

    /* The rect is the button where it is RIGHT NOW, which includes the offset
       already applied. Measuring from that would make the button chase its own
       tail and drift away. Subtracting the current offset gives the rest
       position, which is the only stable thing to aim from. */
    const restX = r.left + r.width / 2 - s.x;
    const restY = r.top + r.height / 2 - s.y;

    const dx = e.clientX - restX;
    const dy = e.clientY - restY;

    /* Cap the vector as a whole, not each axis: clamping x and y separately
       would let a diagonal travel further than a straight one and the button
       would trace a square instead of a circle. */
    let ox = dx * FOLLOW;
    let oy = dy * FOLLOW;
    const len = Math.hypot(ox, oy);
    if (len > MAX) {
      ox = (ox / len) * MAX;
      oy = (oy / len) * MAX;
    }
    s.tx = ox;
    s.ty = oy;

    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const s = state.current;
      s.x += (s.tx - s.x) * CHASE;
      s.y += (s.ty - s.y) * CHASE;

      const el = ref.current;
      if (el) el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0)`;
      /* The label lags the button, which makes the pill feel like a skin
         stretched over a shape rather than a rigid block being slid about. */
      const inn = inner.current;
      if (inn) {
        inn.style.transform = `translate3d(${(s.x * 0.22).toFixed(2)}px, ${(s.y * 0.22).toFixed(2)}px, 0)`;
      }
    };
    raf = requestAnimationFrame(tick);

    /* On the window, not the element: the button reacts to the pointer
       everywhere, so the button cannot be the thing that hears about it. */
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [onMove]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="pill group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 will-change-transform"
    >
      {/* The pointer ring. Sits under the label, clipped by the pill's radius. */}
      <span aria-hidden="true" className="pill__circle" />
      {/* The travelling border light. */}
      <span aria-hidden="true" className="pill__ring" />

      <span ref={inner} className="relative z-10 flex items-center gap-3 will-change-transform">
        <span className="flex text-[11px] uppercase tracking-[0.26em] text-paper/90">
          {Array.from(label).map((ch, i) => (
            <span
              key={i}
              className="pill__letter"
              /* The stagger is a transition-delay per letter rather than an
                 animation, so leaving the pill unwinds it in reverse for free. */
              style={{ transitionDelay: `${i * 18}ms` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </span>

        <span
          aria-hidden="true"
          className="text-paper/70 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </button>
  );
}
