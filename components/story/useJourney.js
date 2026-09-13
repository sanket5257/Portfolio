'use client';

import { useEffect, useRef } from 'react';
import { clamp01 } from './sequence';

/* ─────────────────────────────────────────────────────────────────────────
   The scroll engine.

   Every frame of the flight is the visitor's to place, so the progress value
   cannot be the document's scrollTop — there is no document scroll here at
   all. Wheel, touch, drag and keys all feed one virtual position, and
   everything downstream (canvas, beats, act label) reads that one value.

   Nothing advances it on its own. The world holds exactly where it is left,
   which is the difference between a film that plays at you and a place you
   are walking through.

   Two values, not one:
     target   where the input says we are, jumps
     current  what gets drawn, chases `target` exponentially

   The chase is what makes a wheel notch land as a glide instead of a step —
   the same job Lenis does for a real scrollbar.
   ───────────────────────────────────────────────────────────────────────── */

/* One 100px wheel notch moves about 3.3% of the journey — ten unhurried
   notches from the peak to the sign-off. Tuned against the frame count
   rather than by feel: at this scale a normal scroll gesture advances the
   strip at roughly the rate it was rendered at, so the bird flies instead of
   strobing or crawling. */
const WHEEL_SCALE = 1 / 3000;
const TOUCH_SCALE = 1 / 1100;
const KEY_STEP = 0.04;
const CHASE = 6.5; // higher = tighter follow, lower = more glide

export function useJourney({ enabled, onFrame }) {
  const state = useRef({
    target: 0,
    current: 0,
    lastInput: 0,
    velocity: 0,
  });

  /* onFrame is re-created on every render of the caller; keeping it in a ref
     means the RAF loop below never has to be torn down and restarted. */
  const cb = useRef(onFrame);
  cb.current = onFrame;

  useEffect(() => {
    if (!enabled) return undefined;

    const s = state.current;
    const el = document;
    let raf = 0;
    let last = performance.now();

    const nudge = (delta) => {
      s.target = clamp01(s.target + delta);
      s.lastInput = performance.now();
    };

    const onWheel = (e) => {
      /* The page itself never scrolls; swallowing the event is what keeps the
         browser from rubber-banding or handing the gesture to a parent. */
      e.preventDefault();
      nudge(e.deltaY * WHEEL_SCALE);
    };

    let touchY = 0;
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY;
      s.lastInput = performance.now();
    };
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY;
      nudge((touchY - y) * TOUCH_SCALE);
      touchY = y;
      e.preventDefault();
    };

    const onKey = (e) => {
      const map = {
        ArrowDown: KEY_STEP,
        ArrowRight: KEY_STEP,
        PageDown: KEY_STEP * 3,
        ArrowUp: -KEY_STEP,
        ArrowLeft: -KEY_STEP,
        PageUp: -KEY_STEP * 3,
        Home: -1,
        End: 1,
        ' ': KEY_STEP * 3,
      };
      const d = map[e.key];
      if (d === undefined) return;
      e.preventDefault();
      nudge(d);
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const prev = s.current;
      // Frame-rate independent easing: same curve at 60 and at 144 Hz.
      s.current += (s.target - s.current) * (1 - Math.exp(-CHASE * dt));
      if (Math.abs(s.target - s.current) < 0.00002) s.current = s.target;
      s.velocity = (s.current - prev) / (dt || 1);

      cb.current?.(s.current, s.velocity);
    };

    /* Jumping to an exact point on the timeline is otherwise a matter of
       spinning the wheel and hoping — this makes the seam and every beat
       addressable while tuning them. Development only. */
    if (process.env.NODE_ENV === 'development') {
      window.__world = {
        seek(p) {
          s.target = clamp01(p);
          s.current = s.target;
          s.lastInput = performance.now();
        },
        get: () => ({ ...s }),
      };
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled]);

  return state;
}
