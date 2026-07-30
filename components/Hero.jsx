'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { hero } from '@/lib/content';
import { setMuted, unlockAudio, playSample, synthClick } from '@/lib/audio';
import Panel from './Panels';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

// Blue studio backdrop (growon-style gradient) + a darkened "lamp on" room.
const BG =
  'radial-gradient(120% 95% at 50% 32%, #6a8598 0%, #415a69 45%, #263440 78%, #1b2731 100%)';
const BG_DARK =
  'radial-gradient(90% 80% at 46% 46%, #241a10 0%, #140f0a 45%, #08090c 100%)';

export default function Hero() {
  const rootRef = useRef(null);
  const router = useRouter();
  // Flips on the scene's first rendered frame; fades the desk in.
  const [ready, setReady] = useState(false);
  const onSceneReady = useCallback(() => setReady(true), []);

  // interaction state
  const [focusId, setFocusId] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [musicOn, setMusicOn] = useState(false);
  const [lampOn, setLampOn] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // audio unlock on first gesture + reflect mute state
  useEffect(() => {
    setMuted(!soundOn);
  }, [soundOn]);
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  const onInteract = useCallback((obj) => {
    switch (obj.interaction) {
      case 'route':
        router.push(obj.href);
        break;
      case 'panel':
        setFocusId(obj.id);
        setActivePanel(obj.panel);
        break;
      case 'music':
        setMusicOn((m) => {
          if (!m) playSample('/audio/reel_whoosh.mp3'); // tonearm lands as music starts
          return !m;
        });
        break;
      case 'lamp':
        synthClick();
        setLampOn((l) => !l);
        break;
      default:
        break; // sfx / toy — sound already played in the scene
    }
  }, [router]);

  /* Warm the /work route while the visitor is still looking at the desk, so
     clicking the monitor navigates without a wait. Deferred past the scene's
     own startup so it doesn't compete for the main thread during load. */
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => router.prefetch('/work'), 300);
    return () => clearTimeout(id);
  }, [ready, router]);

  const closePanel = useCallback(() => {
    setActivePanel(null);
    setFocusId(null);
  }, []);

  /* The intro used to be a GSAP timeline. GSAP drives transforms from
     JavaScript on every rAF tick, so it fired at exactly the moment the main
     thread was busiest — decoding the GLBs and compiling shaders — and
     visibly stuttered. The same choreography now lives in CSS keyframes
     (see .hero-intro in globals.css): the compositor runs opacity/transform
     off the main thread, so it stays smooth no matter what three.js is doing.

     Because of that it needs no readiness gate — it starts on the very first
     paint, while the models are still downloading, which is exactly the
     window where the main thread is otherwise idle. */

  const headlineLines = hero.headline.split('\n');

  return (
    <section
      ref={rootRef}
      className="hero-intro relative h-[100svh] w-full overflow-hidden"
      style={{ background: BG }}
    >
      {/* dark "room" backdrop that fades in when the lamp is on */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 ease-out"
        style={{ background: BG_DARK, opacity: lampOn ? 1 : 0 }}
      />

      {/* 3D signature scene — mounted immediately so asset fetching starts on
          the first paint rather than after a timer. No loading veil: the
          headline animates over the backdrop straight away and the desk fades
          in underneath it whenever it finishes loading. */}
      <div
        className={`absolute inset-0 z-[1] transition-opacity duration-1000 ease-out ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SceneMount
          Scene={Scene}
          onReady={onSceneReady}
          onInteract={onInteract}
          focusId={focusId}
          musicOn={musicOn}
          lampOn={lampOn}
        />
      </div>

      {/* Legibility scrim. The headline overlays the tableau at every size, but
          only below lg is it actually *on top of* the desk rather than clear
          backdrop — so the gradient is scoped there instead of dulling the
          desktop composition. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[48%] bg-gradient-to-b from-black/45 via-black/15 to-transparent lg:hidden" />

      {/* sound toggle — top left */}
      <button
        data-anim="corner"
        aria-label={soundOn ? 'Mute sound' : 'Enable sound'}
        onClick={() => setSoundOn((s) => !s)}
        style={{ animationDelay: '0.1s' }}
        className="anim-fade absolute left-6 top-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper/80 backdrop-blur-sm transition hover:border-paper/60 hover:text-paper sm:left-8 sm:top-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          {soundOn ? (
            <path d="M17 8a5 5 0 0 1 0 8" strokeLinecap="round" />
          ) : (
            <path d="M17 9l4 6M21 9l-4 6" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {/* menu — top right */}
      <button
        data-anim="corner"
        aria-label="Menu"
        style={{ animationDelay: '0.25s' }}
        className="anim-fade absolute right-6 top-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper/80 backdrop-blur-sm transition hover:border-paper/60 hover:text-paper sm:right-8 sm:top-8"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>

      {/* headline block — upper left.
          The top offset is `max(5rem, 14%)` rather than a bare percentage: on a
          landscape phone 14% of 390px is 55px, which put the eyebrow directly
          underneath the corner buttons (24px inset + 44px tall = 68px). The
          floor keeps it clear of them at any height. */}
      <div className="pointer-events-none absolute inset-x-6 top-[max(5rem,14%)] z-10 sm:inset-x-auto sm:left-12 sm:top-[max(5rem,15%)] sm:max-w-2xl">
        {hero.eyebrow ? (
          <span
            data-anim="corner"
            style={{ animationDelay: '0.4s' }}
            className="anim-fade mb-4 block text-[11px] font-light uppercase tracking-[0.35em] text-paper/70"
          >
            {hero.eyebrow}
          </span>
        ) : null}
        <h1 className="tracking-fine text-[26px] font-thin leading-[1.18] text-paper xs:text-[28px] sm:text-4xl md:text-[44px] 2xl:text-[52px]">
          {headlineLines.map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <span
                data-anim="headline-line"
                style={{ animationDelay: `${0.2 + i * 0.12}s` }}
                className="anim-rise block"
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p
          data-anim="sub"
          style={{ animationDelay: '0.7s' }}
          className="anim-up mt-4 max-w-[20rem] text-[13px] font-extralight leading-relaxed text-paper/75 xs:text-[14px] sm:mt-5 sm:max-w-md sm:text-base"
        >
          {hero.subheading}
        </p>
      </div>

      {/* copyright — bottom center */}
      <p
        data-anim="footer"
        style={{ animationDelay: '0.9s' }}
        className="anim-fade absolute inset-x-0 bottom-5 z-10 text-center text-[13px] font-light text-paper/55"
      >
        {hero.footer}
      </p>

      {/* overlay panels (works / about / contact) */}
      <Panel id={activePanel} onClose={closePanel} />
    </section>
  );
}

/* Mounts the Canvas client-side only, and deliberately *after* the browser
   has painted the hero.

   Mounting it immediately was what made the page feel slow to appear: parsing
   the GLBs, generating the PMREM and compiling every shader are all
   synchronous main-thread work, and they started before the first contentful
   paint. The headline sits at opacity 0 waiting on its CSS animation, that
   animation can't advance while the thread is blocked, and the measured
   result was a first-contentful-paint of ~3.1 s on a warm cache — even though
   the markup and CSS were both ready inside 150 ms.

   Two rAFs guarantee a real painted frame has shipped; the short timeout then
   lets the headline get clear of its entrance before three.js takes the
   thread. The models are already downloading throughout, via the
   <link rel="preload"> tags in the root layout — network work costs the main
   thread nothing, so the wait is free. */
const SCENE_START_DELAY_MS = 450;

function SceneMount({ Scene, ...props }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let timer;
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        timer = setTimeout(() => setMounted(true), SCENE_START_DELAY_MS);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!mounted) return null;
  return <Scene {...props} />;
}
