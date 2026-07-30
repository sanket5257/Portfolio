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
      className="relative h-[100svh] w-full overflow-hidden overscroll-none bg-[#050505] text-[#f2f5f8]"
    >
      {/* While stacked, the header sits on top of the carousel image rather than
          the black background, and several of those screenshots are near-white.
          A short scrim keeps the breadcrumb and chrome readable. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-black/70 to-transparent split:hidden" />

      {/* breadcrumb — top-left. Truncates rather than running under the
          top-right chrome on a 360px screen. */}
      {/* Hidden on short windows: once the copy goes side-by-side it starts at
          the very top of the pane, and there is no vertical room left for a
          breadcrumb above it. */}
      <header
        data-anim="crumb"
        className="absolute left-6 top-6 z-30 max-w-[58%] short:hidden sm:left-8 sm:max-w-none"
      >
        <p className="truncate text-sm font-light leading-normal text-[#f2f5f8] opacity-60 sm:text-lg">
          sanket chougule / work
        </p>
      </header>

      {/* global chrome — top-right */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 sm:right-8 sm:top-7 sm:gap-3">
        <button
          data-anim="chip"
          aria-label="Change language"
          style={{ animationDelay: '0.2s' }}
          className="anim-up flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 backdrop-blur-sm transition hover:border-white/60 hover:text-white sm:h-12 sm:w-12"
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
          className="anim-up flex h-10 w-10 items-center justify-center rounded-full bg-[#0b0f14]/85 text-white backdrop-blur-sm transition hover:bg-[#0b0f14] sm:h-12 sm:w-12"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </div>

      {/* ── stage ────────────────────────────────────────────────── */}
      <div ref={stage} className="h-full w-full">
        {/* The image row used to be sized `min(calc(56.25vw + 6rem), 64svh)` —
            an aspect-ratio-driven height that took 64% of a short viewport and
            left the copy pane too short for its own content. Since the pane
            clips, the project title and Type block simply vanished (worst at
            1024×768, where nothing above "Overview" survived). Capping the
            images in svh and giving the copy `minmax(0, 1fr)` keeps both
            honest. */}
        {/* Row sizing while stacked: give the images up to 48svh, but never
            more than what's left after reserving room for the copy — `max()`
            floors it so a short landscape window can't compute a negative
            track. The reserve grows at sm, where the type steps up to
            text-base and the gaps open out. */}
        <div className="grid h-full w-full grid-rows-[minmax(0,min(48svh,max(8rem,calc(100svh-25rem))))_minmax(0,1fr)] gap-4 sm:grid-rows-[minmax(0,min(48svh,max(8rem,calc(100svh-28rem))))_minmax(0,1fr)] sm:gap-6 split:grid-cols-[47%_1fr] split:grid-rows-1 split:gap-8 split:pr-8">
          {/* LEFT · text — top-aligned while stacked, bottom-aligned side-by-side */}
          <aside className="relative order-2 min-h-0 split:order-1">
            {projects.map((p, i) => (
              <div
                key={p.title}
                data-text={i}
                style={{ opacity: i === 0 ? 1 : 0 }}
                /* Scrolls rather than clips, so an unusually short window
                   degrades to a scrollable pane instead of hiding copy. The
                   pan-y touch-action lets that scroll work on a phone while the
                   image side keeps swipe-to-navigate. */
                className="no-scrollbar absolute inset-0 flex flex-col overflow-y-auto overscroll-contain px-6 pb-14 pt-1 [touch-action:pan-y] split:px-8 split:pb-8 split:pt-6 xl:pb-12 xl:pt-12"
              >
                {/* `mt-auto` rather than `justify-end` on the scroll container:
                    justify-end overflows content off the *top*, where no amount
                    of scrolling can reach it — on a short landscape window that
                    silently ate the project title. An auto margin collapses to 0
                    once the content is taller than the pane, so it bottom-aligns
                    when there's room and scrolls normally when there isn't. */}
                {/* `short:` steps the whole copy block down a size. Without it a
                    390px-tall landscape window pushes "Visit Live Site" — the
                    only CTA — below the fold. */}
                <div className="flex flex-col gap-4 sm:gap-6 split:mt-auto split:gap-6 xl:gap-12 short:gap-4">
                  <div className="overflow-hidden">
                    <h2
                      data-line
                      className="text-3xl font-light leading-normal tracking-[-0.04em] text-[#8ca8cd] sm:text-4xl xl:text-5xl 2xl:text-6xl short:text-2xl"
                    >
                      {p.title}
                    </h2>
                  </div>
                  <div className="flex w-full max-w-[26rem] flex-col gap-3 sm:max-w-[32rem] sm:gap-5 split:max-w-[26rem] xl:gap-6 short:gap-3 short:[&_a]:text-sm short:[&_p]:text-sm short:[&>div]:space-y-1">
                    <div data-line className="space-y-1 sm:space-y-2 xl:space-y-3">
                      <p className="text-sm font-normal text-[#f2f5f8] sm:text-base">Type</p>
                      <p className="text-sm font-normal leading-snug text-[#989ca1] sm:text-base">{p.type}</p>
                    </div>
                    <div data-line className="space-y-1 sm:space-y-2 xl:space-y-3">
                      <p className="text-sm font-normal text-[#f2f5f8] sm:text-base">Overview</p>
                      <p className="text-sm font-normal leading-snug text-[#989ca1] sm:text-base">{p.scene}</p>
                    </div>
                    <div data-line className="space-y-1 sm:space-y-2 xl:space-y-3">
                      <p className="text-sm font-normal text-[#f2f5f8] sm:text-base">Stack</p>
                      <p className="text-sm font-normal leading-snug text-[#989ca1] sm:text-base">{p.stack}</p>
                    </div>
                    <div data-line>
                      <a
                        href={p.live}
                        target={p.live.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="group/cta inline-flex items-center gap-2 self-start text-sm font-normal text-[#989ca1] transition-colors duration-300 hover:text-[#f2f5f8] sm:text-base"
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

          {/* RIGHT · image carousel (prev/current/next, prev+next faded).
              `touch-none` lives here rather than on <main> so a swipe over the
              images only ever drives the carousel, while the copy pane beside
              it stays scrollable. */}
          <section className="relative order-1 min-h-0 touch-none overflow-hidden split:order-2">
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

      {/* Progress dots — click to glide to a project. A vertical stack pinned
          to the right edge sat directly on top of the copy while the layout is
          stacked, so below xl they run as a centred row along the bottom. Each
          hit area is 24px even though the dot reads as 8px. */}
      <div className="absolute inset-x-0 bottom-2 z-30 flex justify-center gap-1 split:inset-x-auto split:bottom-auto split:right-8 split:top-1/2 split:-translate-y-1/2 split:flex-col split:gap-1.5">
        {projects.map((p, i) => (
          <button
            key={p.title}
            aria-label={`Go to ${p.title}`}
            onClick={() => root.current?.__go?.(i)}
            className="group flex h-6 w-6 items-center justify-center"
          >
            <span className="h-2 w-2 rounded-full bg-white/30 transition group-hover:bg-white/70" />
          </button>
        ))}
      </div>
    </main>
  );
}
