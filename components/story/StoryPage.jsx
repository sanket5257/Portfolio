'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { actFor, beatState, beats } from './content';
import { createRenderer, loadFilmstrip, pickWidth } from './filmstrip';
import { useJourney } from './useJourney';
import { placeChars } from './Chars';
import Header from './Header';
import Menu from './Menu';
import Loader from './Loader';
import Hero from './Hero';
import Statement from './Statement';
import Craft from './Craft';
import Work from './Work';
import Footer from './Footer';

/* ─────────────────────────────────────────────────────────────────────────
   The storytelling page — what the monitor on the desk opens.

   A single canvas scrubs one continuous rendered take, and the site is laid
   along that take as beats: hero → statement → craft → work → statement →
   footer. Nothing plays on its own; the whole flight is driven by the
   visitor's wheel and holds wherever they leave it. Scroll to the end and the
   footer is what is there.

   This component owns exactly one thing the others do not: the clock. The
   journey value lives in a ref, and every moving thing — canvas, beats,
   characters, act label, cursor — is written straight to the DOM inside one
   rAF callback. React state is used only for the two things that genuinely
   change identity: loading and the menu. Nothing here re-renders on scroll.
   ───────────────────────────────────────────────────────────────────────── */

export default function StoryPage() {
  const canvasRef = useRef(null);
  const beatRefs = useRef([]);
  const actRef = useRef(null);
  const hintRef = useRef(null);
  const rendererRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const [progress, setProgress] = useState(0); // load progress, 0→1
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Load the strip ───────────────────────────────────────────────────── */
  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;

    loadFilmstrip({
      width: pickWidth(),
      signal: ctrl.signal,
      onProgress: (v) => !cancelled && setProgress(v),
    }).then((strip) => {
      if (cancelled || !canvasRef.current) return;
      rendererRef.current = createRenderer(canvasRef.current, strip);
      rendererRef.current.resize();
      rendererRef.current.render(0, mouse.current);
      setLoaded(true);
    });

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, []);

  /* The document must not scroll — the wheel belongs to the journey. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onResize = () => rendererRef.current?.resize();
    const onMove = (e) => {
      mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  /* ── The one per-frame callback ───────────────────────────────────────── */
  const onFrame = useCallback((p) => {
    const m = mouse.current;
    m.x += (m.tx - m.x) * 0.06;
    m.y += (m.ty - m.y) * 0.06;

    // The canvas first: it is the thing a dropped frame is visible in.
    rendererRef.current?.render(p, m);

    for (let i = 0; i < beats.length; i += 1) {
      const el = beatRefs.current[i];
      if (!el) continue;
      const b = beats[i];
      const { o, y, t } = beatState(p, b.from, b.to);
      if (o === 0 && el._o === 0) continue; // already parked — skip the writes
      el._o = o;
      el.style.opacity = o;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      // Only the beat actually being read should catch a click.
      el.style.pointerEvents = o > 0.55 ? 'auto' : 'none';

      /* The nodes are looked up once and cached on the element — a
         querySelectorAll per beat per frame would be sixty a second for
         nothing. */
      if (el._rise === undefined) el._rise = el.querySelectorAll('[data-rise]');
      if (o > 0) placeChars(el._rise, t);
    }

    if (actRef.current) {
      const label = actFor(p);
      if (actRef.current._label !== label) {
        actRef.current._label = label;
        actRef.current.textContent = label;
      }
    }
    if (hintRef.current) {
      // The prompt is for the opening moments only — once the visitor has
      // moved at all, they plainly do not need telling.
      hintRef.current.style.opacity = p > 0.03 ? 0 : 1;
    }
  }, []);

  const journey = useJourney({ enabled: loaded, onFrame });

  /* Seeking is how every link on this page "navigates". */
  const seek = useCallback(
    (at) => {
      const s = journey.current;
      if (!s) return;
      s.target = at;
      s.lastInput = performance.now();
      setMenuOpen(false);
    },
    [journey]
  );

  return (
    <main
      /* `is-ready` is what starts the hero's entrance: the characters
         carry a CSS animation scoped to it, so it fires the instant the
         loader lifts rather than while it is still covering the page. */
      className={`world fixed inset-0 select-none overflow-hidden bg-[#05040c] font-body text-paper ${
        loaded ? 'is-ready' : ''
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Scrims plus a soft vignette, so pale type stays legible over the
          brightest passes of the flight. */}
      <div className="world-grade pointer-events-none absolute inset-0" />

      {/* ── Beats ─────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        {beats.map((b, i) => (
          <div
            key={b.id}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
            style={{ opacity: 0, visibility: 'hidden' }}
            className="absolute inset-0 will-change-transform"
          >
            <Beat beat={b} onSeek={seek} />
          </div>
        ))}
      </div>

      <Header
        actRef={actRef}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((v) => !v)}
        onSeek={seek}
      />

      <Menu open={menuOpen} onSeek={seek} />

      <div
        ref={hintRef}
        /* Bottom-RIGHT, not bottom-left. The hero word is centred and its
           descenders run to within a few pixels of the bottom edge, so a
           prompt on the left sits underneath the tail of the g. */
        className="pointer-events-none absolute bottom-6 right-5 z-20 transition-opacity duration-700 sm:bottom-8 sm:right-9"
      >
        <span className="world-hint font-mono text-[10px] uppercase tracking-[0.28em] text-paper/55">
          Scroll to explore
        </span>
      </div>

      <Loader progress={progress} done={loaded} />

    </main>
  );
}

function Beat({ beat, onSeek }) {
  switch (beat.kind) {
    case 'hero':
      return <Hero onEnter={() => onSeek(0.3)} />;
    case 'statement':
      return <Statement id={beat.id} />;
    case 'craft':
      return <Craft />;
    case 'footer':
      return <Footer />;
    default:
      return <Work project={beat.project} n={beat.n} />;
  }
}
