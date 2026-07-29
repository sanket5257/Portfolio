'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

// ── selected work — text left (bottom) · image carousel right ──
const NEXT_STACK = 'Next.js · GSAP · Lenis · Tailwind CSS';

const projects = [
  {
    title: 'Evoleotion Studio',
    type: 'Creative Studio',
    scene:
      'Creative studio site with immersive motion and a bold visual identity — ' +
      'gradient-led art direction, scroll-driven reveals and a hero that sets ' +
      'the tone before a single word is read.',
    stack: NEXT_STACK,
    live: 'https://evoleotionstudio.com/',
    image: '/work/evoleotion-studio.jpeg',
  },
  {
    title: 'Kvell Dynamics',
    type: 'Agency Website',
    scene:
      'AI and automation agency site with premium UI/UX — a restrained, ' +
      'confident layout where the motion carries the pitch rather than ' +
      'decorating it.',
    stack: NEXT_STACK,
    live: 'https://kvelld-beta.vercel.app/',
    image: '/work/kvell-dynamics.jpeg',
  },
  {
    title: 'RamScript',
    type: 'Software Agency',
    scene:
      'Software development agency positioned as a virtual CTO and long-term ' +
      'tech partner — structured, credibility-first storytelling from hero to ' +
      'contact.',
    stack: NEXT_STACK,
    live: 'https://ramscript.com/',
    image: '/work/ramscript.jpeg',
  },
  {
    title: 'Shivneri Systems',
    type: 'Engineering Agency',
    scene:
      'Full-stack engineering agency offering on-demand product teams — built ' +
      'to make a technical service feel tangible and immediate.',
    stack: NEXT_STACK,
    live: 'https://shivneri.vercel.app/',
    image: '/work/shivneri-systems.jpeg',
  },
  {
    title: 'CodeSage',
    type: 'Agency Website',
    scene:
      'Web design and development agency with an AI solutions focus — clear ' +
      'service architecture wrapped in a calm, systems-led interface.',
    stack: NEXT_STACK,
    live: 'https://codesage5.vercel.app/',
    image: '/work/codesage.jpeg',
  },
  {
    title: 'Vidya Bharati School',
    type: 'Education',
    scene:
      'School website covering admissions, academics and a campus showcase — ' +
      'a large information surface kept warm, navigable and parent-friendly.',
    stack: NEXT_STACK,
    live: 'https://education-kappa-eight.vercel.app/',
    image: '/work/vidya-bharati.jpeg',
  },
  {
    title: 'Portfolio v2',
    type: 'Personal Portfolio',
    scene:
      'Personal portfolio built around cinematic GSAP sequences — pacing, ' +
      'type and easing tuned so the whole page reads as one continuous shot.',
    stack: NEXT_STACK,
    live: 'https://portfolioleo-o.vercel.app/',
    image: '/work/portfolio-v2.jpeg',
  },
  {
    title: 'Zentry Clone',
    type: 'Concept Build',
    scene:
      'High-fidelity recreation of a cinematic homepage — a study in scroll ' +
      'choreography, video masking and getting the details exactly right.',
    stack: 'React · GSAP · Lenis · Tailwind CSS',
    live: 'https://zentry-clone-indol.vercel.app/',
    image: '/work/zentry-clone.jpeg',
  },
];

const GAP_PX = 24; // 1.5rem gap between carousel slots

export default function WorkPage() {
  const root = useRef(null);
  const stage = useRef(null);
  const N = projects.length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const slots = gsap.utils.toArray('[data-slot]');
      const texts = gsap.utils.toArray('[data-text]');
      const clamp = gsap.utils.clamp(0, N - 1);
      const wrap = (v) => v - N * Math.round(v / N); // loop: neighbours always fill
      const smooth = (x) => x * x * (3 - 2 * x); // gentle fade curve

      // Position the carousel + copy for a fractional index p.
      const render = (p) => {
        slots.forEach((s, i) => {
          const off = wrap(i - p);
          const d = Math.min(1, Math.abs(off));
          gsap.set(s, {
            top: `calc(25% + ${off} * (50% + ${GAP_PX}px))`,
            opacity: 1 - smooth(d) * 0.3,
          });
        });
        texts.forEach((t, i) => {
          const off = wrap(i - p);
          const d = Math.min(1, Math.abs(off));
          gsap.set(t, { autoAlpha: 1 - smooth(d), y: off * -42 });
        });
      };

      const pos = { p: 0 };
      let index = 0;
      let anim = null;
      render(0);

      // One gesture → one smooth, eased step (the "magnetic" glide).
      const go = (target) => {
        target = clamp(target);
        if (target === index) return;
        index = target;
        if (anim) anim.kill();
        anim = gsap.to(pos, {
          p: target,
          duration: 1,
          ease: 'power3.inOut',
          overwrite: true,
          onUpdate: () => render(pos.p),
        });
      };

      const busy = () => anim && anim.isActive();

      // ── input: wheel · touch · keys ─────────────────────────────
      let acc = 0;
      const onWheel = (e) => {
        e.preventDefault();
        if (busy()) return;
        acc += e.deltaY;
        if (Math.abs(acc) < 24) return; // ignore tiny trackpad noise
        go(index + (acc > 0 ? 1 : -1));
        acc = 0;
      };

      let ty = 0;
      const onTouchStart = (e) => { ty = e.touches[0].clientY; };
      const onTouchEnd = (e) => {
        if (busy()) return;
        const dy = ty - e.changedTouches[0].clientY;
        if (Math.abs(dy) > 40) go(index + (dy > 0 ? 1 : -1));
      };

      const onKey = (e) => {
        if (busy()) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(index + 1); }
        else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(index - 1); }
      };

      const el = stage.current;
      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('keydown', onKey);

      // ── intro ───────────────────────────────────────────────────
      gsap.from('[data-anim="crumb"]', { y: -14, autoAlpha: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 });
      // NOTE: the top-right chips are intentionally *not* animated here. They
      // use the .anim-up CSS keyframes instead — a gsap.from on them applied
      // its autoAlpha:0 start state and then never advanced, which left the
      // close button invisible and the page with no way back to the home page.
      gsap.from('[data-text="0"] [data-line]', {
        yPercent: 60, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.25,
      });

      // expose for the dots
      root.current.__go = go;

      return () => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('keydown', onKey);
      };
    }, root);

    return () => ctx.revert();
  }, [N]);

  return (
    <main
      ref={root}
      className="relative h-[100svh] w-full touch-none overflow-hidden bg-[#050505] text-[#f2f5f8]"
    >
      {/* breadcrumb — top-left */}
      <header data-anim="crumb" className="absolute left-6 top-6 z-30 sm:left-8">
        <p className="text-lg font-light leading-normal text-[#f2f5f8] opacity-60">
          sanket chougule / work
        </p>
      </header>

      {/* global chrome — top-right */}
      <div className="absolute right-5 top-5 z-30 flex items-center gap-3 sm:right-8 sm:top-7">
        <button
          data-anim="chip"
          aria-label="Change language"
          style={{ animationDelay: '0.2s' }}
          className="anim-up flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white/80 backdrop-blur-sm transition hover:border-white/60 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
          </svg>
        </button>
        <Link
          href="/"
          data-anim="chip"
          aria-label="Close"
          style={{ animationDelay: '0.32s' }}
          className="anim-up flex h-12 w-12 items-center justify-center rounded-full bg-[#0b0f14]/85 text-white backdrop-blur-sm transition hover:bg-[#0b0f14]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </div>

      {/* ── stage ────────────────────────────────────────────────── */}
      <div ref={stage} className="h-full w-full">
        <div className="grid h-full w-full grid-rows-[min(calc(56.25vw+6rem),64svh)_1fr] gap-8 xl:grid-rows-1 xl:grid-cols-[47%_1fr] xl:pr-8">
          {/* LEFT · text, bottom-aligned */}
          <aside className="relative order-2 min-h-0 overflow-hidden xl:order-1">
            {projects.map((p, i) => (
              <div
                key={p.title}
                data-text={i}
                style={{ opacity: i === 0 ? 1 : 0 }}
                className="absolute inset-0 flex flex-col justify-end px-6 py-8 xl:px-8 xl:py-12"
              >
                <div className="flex flex-col gap-8 xl:gap-12">
                  <div className="overflow-hidden">
                    <h2
                      data-line
                      className="text-4xl font-light leading-normal tracking-[-0.04em] text-[#8ca8cd] xl:text-5xl 2xl:text-6xl"
                    >
                      {p.title}
                    </h2>
                  </div>
                  <div className="flex w-full max-w-[26rem] flex-col gap-6">
                    <div data-line className="space-y-3">
                      <p className="text-base font-normal text-[#f2f5f8]">Type</p>
                      <p className="text-base font-normal leading-snug text-[#989ca1]">{p.type}</p>
                    </div>
                    <div data-line className="space-y-3">
                      <p className="text-base font-normal text-[#f2f5f8]">Overview</p>
                      <p className="text-base font-normal leading-snug text-[#989ca1]">{p.scene}</p>
                    </div>
                    <div data-line className="space-y-3">
                      <p className="text-base font-normal text-[#f2f5f8]">Stack</p>
                      <p className="text-base font-normal leading-snug text-[#989ca1]">{p.stack}</p>
                    </div>
                    <div data-line>
                      <a
                        href={p.live}
                        target={p.live.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="group/cta inline-flex items-center gap-2 self-start text-base font-normal text-[#989ca1] transition-colors duration-300 hover:text-[#f2f5f8]"
                      >
                        Visit Live Site
                        <span aria-hidden="true" className="transition-transform duration-300 group-hover/cta:translate-x-1">
                          <svg viewBox="0 0 28 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-5">
                            <line x1="2" y1="12" x2="24" y2="12" />
                            <polyline points="18 6 24 12 18 18" />
                          </svg>
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </aside>

          {/* RIGHT · image carousel (prev/current/next, prev+next faded) */}
          <section className="relative order-1 min-h-0 overflow-hidden xl:order-2">
            <div className="absolute inset-0">
              {projects.map((p, i) => (
                <div
                  key={p.title}
                  data-slot={i}
                  className="absolute inset-x-0 h-1/2 overflow-hidden will-change-transform"
                  style={{ top: `calc(25% + ${i - N * Math.round(i / N)} * (50% + ${GAP_PX}px))` }}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    draggable="false"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* progress dots — click to glide to a project */}
      <div className="absolute bottom-8 right-6 z-30 flex flex-col gap-3 sm:right-8 xl:top-1/2 xl:bottom-auto xl:-translate-y-1/2">
        {projects.map((p, i) => (
          <button
            key={p.title}
            aria-label={`Go to ${p.title}`}
            onClick={() => root.current?.__go?.(i)}
            className="h-2 w-2 rounded-full bg-white/30 transition hover:bg-white/70"
          />
        ))}
      </div>
    </main>
  );
}
