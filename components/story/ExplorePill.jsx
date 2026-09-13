'use client';

import { useCallback, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   The one thing on the hero you are meant to touch.

   A pill that does three things on hover, all at once, because any one of
   them alone reads as a button and the three together read as a live object:

     · the border light sweeps round it, reversing direction
     · the letters lift in a stagger, left to right
     · a small blurred ring scales in and tracks the pointer inside it

   The ring is the reason this is a component and not a class: it needs the
   pointer's position relative to the element, written to CSS custom
   properties on every move. That is two style writes per pointer event, no
   React state, and therefore no re-render.
   ───────────────────────────────────────────────────────────────────────── */

export default function ExplorePill({ label = 'Enter the flight', onClick }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onPointerMove={onMove}
      className="pill group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5"
    >
      {/* The pointer ring. Sits under the label, clipped by the pill's radius. */}
      <span aria-hidden="true" className="pill__circle" />
      {/* The travelling border light. */}
      <span aria-hidden="true" className="pill__ring" />

      <span className="relative z-10 flex text-[11px] uppercase tracking-[0.26em] text-paper/90">
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
        className="relative z-10 text-paper/70 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  );
}
