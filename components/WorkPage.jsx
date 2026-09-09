'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MAP_POINTS, PLACES } from '@/lib/workMap';

/* Client-only: it builds its map texture from a 2D canvas, which has no
   server-side equivalent. */
const ProjectMap = dynamic(() => import('@/components/work/ProjectMap'), {
  ssr: false,
});

/* ────────────────────────────────────────────────────────────────────────
   /work — built to the hubtown.co.in/projects design language.

   What was lifted from the reference, and how:
     · palette      dark-blue rgb(2,10,24) · off-blue rgb(213,224,255)
     · type         Grotesk (display) + Commit Mono (HUD labels), both
                    self-hosted from /public/fonts
     · bevels       the reference generates SVG clipPaths per box; the same
                    chamfers are cut with clip-path polygons in globals.css
     · row hover    clip-path wipe up from the bottom edge, 0.3s ease-out,
                    title slides 0.5rem right and recolours — copied from
                    its `.list-modal-item:hover` rules exactly
     · flow         intro instructions → HUD → project listing → detail sheet

     · map          a WebGL plate you pan and zoom, with one glowing block
                    per project — same interaction model as the reference's
                    Mumbai map. There is no real geography behind a
                    portfolio, so the coastline, contours and road network
                    are generated from a fixed seed in lib/workMap.js and
                    the blocks sit at hand-placed coordinates.
   ──────────────────────────────────────────────────────────────────────── */

const NEXT_STACK = 'Next.js · GSAP · Lenis · Tailwind CSS';

const projects = [
  {
    slug: 'evoleotion-studio',
    title: 'Evoleotion Studio',
    type: 'Creative Studio',
    status: 'Live',
    group: 'Studio',
    year: '2025',
    overview:
      'Creative studio site with immersive motion and a bold visual identity — ' +
      'gradient-led art direction, scroll-driven reveals and a hero that sets ' +
      'the tone before a single word is read.',
    stack: NEXT_STACK,
    live: 'https://evoleotionstudio.com/',
    image: '/work/evoleotion-studio.jpeg',
  },
  {
    slug: 'kvell-dynamics',
    title: 'Kvell Dynamics',
    type: 'Agency Website',
    status: 'Live',
    group: 'Agency',
    year: '2025',
    overview:
      'AI and automation agency site with premium UI/UX — a restrained, ' +
      'confident layout where the motion carries the pitch rather than ' +
      'decorating it.',
    stack: NEXT_STACK,
    live: 'https://kvelld-beta.vercel.app/',
    image: '/work/kvell-dynamics.jpeg',
  },
  {
    slug: 'ramscript',
    title: 'RamScript',
    type: 'Software Agency',
    status: 'Live',
    group: 'Agency',
    year: '2024',
    overview:
      'Software development agency positioned as a virtual CTO and long-term ' +
      'tech partner — structured, credibility-first storytelling from hero to ' +
      'contact.',
    stack: NEXT_STACK,
    live: 'https://ramscript.com/',
    image: '/work/ramscript.jpeg',
  },
  {
    slug: 'shivneri-systems',
    title: 'Shivneri Systems',
    type: 'Engineering Agency',
    status: 'Live',
    group: 'Agency',
    year: '2024',
    overview:
      'Full-stack engineering agency offering on-demand product teams — built ' +
      'to make a technical service feel tangible and immediate.',
    stack: NEXT_STACK,
    live: 'https://shivneri.vercel.app/',
    image: '/work/shivneri-systems.jpeg',
  },
  {
    slug: 'codesage',
    title: 'CodeSage',
    type: 'Agency Website',
    status: 'Live',
    group: 'Agency',
    year: '2024',
    overview:
      'Web design and development agency with an AI solutions focus — clear ' +
      'service architecture wrapped in a calm, systems-led interface.',
    stack: NEXT_STACK,
    live: 'https://codesage5.vercel.app/',
    image: '/work/codesage.jpeg',
  },
  {
    slug: 'vidya-bharati',
    title: 'Vidya Bharati School',
    type: 'Education',
    status: 'Live',
    group: 'Education',
    year: '2024',
    overview:
      'School website covering admissions, academics and a campus showcase — ' +
      'a large information surface kept warm, navigable and parent-friendly.',
    stack: NEXT_STACK,
    live: 'https://education-kappa-eight.vercel.app/',
    image: '/work/vidya-bharati.jpeg',
  },
  {
    slug: 'portfolio-v2',
    title: 'Portfolio v2',
    type: 'Personal Portfolio',
    status: 'Live',
    group: 'Personal',
    year: '2024',
    overview:
      'Personal portfolio built around cinematic GSAP sequences — pacing, ' +
      'type and easing tuned so the whole page reads as one continuous shot.',
    stack: NEXT_STACK,
    live: 'https://portfolioleo-o.vercel.app/',
    image: '/work/portfolio-v2.jpeg',
  },
  {
    slug: 'zentry-clone',
    title: 'Zentry Clone',
    type: 'Concept Build',
    status: 'Concept',
    group: 'Concept',
    year: '2024',
    overview:
      'High-fidelity recreation of a cinematic homepage — a study in scroll ' +
      'choreography, video masking and getting the details exactly right.',
    stack: 'React · GSAP · Lenis · Tailwind CSS',
    live: 'https://zentry-clone-indol.vercel.app/',
    image: '/work/zentry-clone.jpeg',
  },
];

const GROUPS = ['Studio', 'Agency', 'Education', 'Personal', 'Concept'];

/* The reference pairs each instruction with a cursor pictogram inside a soft
   circle. Same three gestures, retargeted at a list instead of a map. */
const HOW_TO = [
  { n: '001', title: 'Scroll', copy: 'Move through the index', icon: 'scroll' },
  { n: '002', title: 'Hover', copy: 'Preview a project', icon: 'hover' },
  { n: '003', title: 'Click', copy: 'View project details', icon: 'click' },
];

function CursorIcon({ kind }) {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* shared arrow cursor */}
      <path d="M18 14 L30 24 L24.5 25 L27 30.5 L24 32 L21.5 26.5 L17.5 30 Z" />
      {kind === 'scroll' && <><circle cx="12" cy="15" r="4.5" /><path d="M12 8.5v13M8.5 12l3.5-3.5 3.5 3.5M8.5 18l3.5 3.5 3.5-3.5" /></>}
      {kind === 'hover' && <><circle cx="12" cy="14" r="3.5" /><path d="M12 22v6M9 25h6" /></>}
      {kind === 'click' && <circle cx="13" cy="12" r="3.5" />}
    </svg>
  );
}

const pad = (n) => String(n).padStart(2, '0');

/* The little four-corner glyph the reference puts inside every chip. */
function Glyph({ className = '' }) {
  return (
    <svg viewBox="0 0 10 10" className={className} fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
      <path d="M1 3.4V1h2.4M6.6 1H9v2.4M9 6.6V9H6.6M3.4 9H1V6.6" />
    </svg>
  );
}

/* ── shared chrome ─────────────────────────────────────────────────── */

/* Thin outlined frame with cut corners — the reference draws this over the
   whole viewport as a HUD boundary. */
function HudFrame() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 1000 700"
      aria-hidden="true"
    >
      <path
        d="M8 34 L34 8 L966 8 L992 34 L992 666 L966 692 L34 692 L8 666 Z"
        fill="none"
        stroke="rgba(213,224,255,0.16)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* Page chrome. Deliberately not a nav bar — the site already has its own
   navigation, so this is just the breadcrumb and a way back, matching what
   /work carried before. */
function Chrome() {
  return (
    <>
      <p className="hub-in hub-label pointer-events-none absolute left-6 top-7 z-30 text-[#d5e0ff]/45 sm:left-12 sm:top-8">
        sanket chougule / work
      </p>
      <Link
        href="/"
        aria-label="Close"
        style={{ animationDelay: '0.1s' }}
        className="hub-in bevel-tr group absolute right-6 top-6 z-30 flex items-center gap-2.5 bg-[#d5e0ff]/10 px-5 py-3.5 text-[#d5e0ff] backdrop-blur-sm transition-colors duration-300 hover:bg-[#d5e0ff] hover:text-[#020a18] sm:right-12 sm:top-8"
      >
        <Glyph className="h-3 w-3 transition-transform duration-500 group-hover:rotate-90" />
        <span className="hub-label">Close</span>
      </Link>
    </>
  );
}

/* Left rail — the reference lists map regions here (MUMBAI / GUJARAT / …).
   The equivalent axis for a portfolio is the kind of work. */
function GroupRail({ filter, setFilter, counts }) {
  return (
    <div className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-start gap-3 sm:left-12 sm:flex">
      {['All', ...GROUPS].map((g) => {
        const on = filter === g;
        return (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`hub-label flex items-center gap-2.5 transition-colors duration-300 ${
              on ? 'text-[#d5e0ff]' : 'text-[#d5e0ff]/30 hover:text-[#d5e0ff]/70'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 transition-opacity duration-300 ${
                on ? 'bg-[#d5e0ff] opacity-100' : 'opacity-0'
              }`}
            />
            {g}
            <span className="text-[#d5e0ff]/25">{pad(counts[g] ?? 0)}</span>
          </button>
        );
      })}
    </div>
  );
}

function Compass() {
  return (
    <div className="compass pointer-events-none absolute bottom-24 right-6 z-20 hidden h-[11.875rem] w-[11.875rem] items-center justify-center text-[#d5e0ff]/35 sm:right-12 lg:flex">
      <span className="hub-label absolute top-0">N</span>
      <span className="hub-label absolute bottom-0">S</span>
      <span className="hub-label absolute left-0">W</span>
      <span className="hub-label absolute right-0">E</span>
      {/* Rotating diamond bezel, as on the reference. */}
      <svg viewBox="0 0 100 100" className="h-[72%] w-[72%]" fill="none" aria-hidden="true">
        <path d="M50 6 L94 50 L50 94 L6 50 Z" stroke="rgba(213,224,255,0.18)" strokeWidth="1" />
        <path d="M50 16 L84 50 L50 84 L16 50 Z" stroke="rgba(213,224,255,0.10)" strokeWidth="1" />
        <path d="M50 10 L55 20 L45 20 Z" fill="rgba(213,224,255,0.7)" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-bold leading-none text-[#d5e0ff]/70">N</span>
        <span className="hub-label mt-1 text-[#d5e0ff]/40">000°</span>
      </div>
    </div>
  );
}

/* Bottom-left minimap. Appears once you push in, like the reference's —
   the white rect is the slice of the plate currently on screen. */
function MiniMap({ zoom, pan, projects, activeSlug }) {
  const visible = zoom > 1.25;
  // Pan is clamped to ±42 world units in Controls; map that to 0–100%.
  const toPct = (v) => ((v + 50) / 100) * 100;
  const box = 100 / zoom;

  return (
    <div
      className={`bevel-card pointer-events-none absolute bottom-24 left-6 z-20 hidden h-[8.5rem] w-[8.5rem] border border-[#d5e0ff]/15 bg-[#020a18]/70 backdrop-blur-sm transition-opacity duration-500 sm:left-12 md:block ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 hub-grid" />
      {projects.map((p) => {
        const [x, z] = MAP_POINTS[p.slug] || [0, 0];
        return (
          <span
            key={p.slug}
            className={`absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 ${
              activeSlug === p.slug ? 'bg-[#d5e0ff]' : 'bg-[#2b7fff]'
            }`}
            style={{ left: `${toPct(x)}%`, top: `${toPct(z)}%` }}
          />
        );
      })}
      <span
        className="absolute border border-[#d5e0ff]/60"
        style={{
          left: `${toPct(pan.x) - box / 2}%`,
          top: `${toPct(pan.y) - box / 2}%`,
          width: `${box}%`,
          height: `${box}%`,
        }}
      />
    </div>
  );
}

/* Bottom HUD strip: zoom readout + scale bar · open list · filter count. */
function BottomBar({ zoom, onOpenList, filterCount, shown, total }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-4 px-6 py-6 sm:px-12 sm:py-8">
      <div className="hub-in">
        <div className="flex items-center gap-4">
          <span className="hub-label text-[#d5e0ff]/40">Zoom {zoom.toFixed(2)}x</span>
          {/* Scale bar shrinks as you push in — 2km at 1x on the reference. */}
          <span className="hub-label text-[#d5e0ff]/60">
            {(2 / zoom).toFixed(1)}km
          </span>
        </div>
        <div className="mt-2 h-px w-28 bg-[#d5e0ff]/20 sm:w-36">
          <div
            className="h-px bg-[#d5e0ff]/60 transition-all duration-300"
            style={{ width: `${Math.min(100, 100 / zoom)}%` }}
          />
        </div>
      </div>

      <button
        onClick={onOpenList}
        className="hub-in group flex shrink-0 items-center gap-2.5 text-[#d5e0ff]/55 transition-colors hover:text-[#d5e0ff]"
      >
        <Glyph className="h-3 w-3 transition-transform duration-500 group-hover:rotate-180" />
        <span className="hub-label">Open project list</span>
      </button>

      <p className="hub-in hub-label hidden text-right text-[#d5e0ff]/35 sm:block">
        Filters [{pad(filterCount)}]
        <br />
        <span className="text-[#d5e0ff]/25">
          {pad(shown)}/{pad(total)}
        </span>
      </p>
    </div>
  );
}

/* Cursor-following readout for the hovered block. */
function BlockTip({ project, at }) {
  if (!project) return null;
  return (
    <div
      className="pointer-events-none absolute z-30 -translate-y-full"
      style={{ left: at.x + 16, top: at.y - 12 }}
    >
      <div className="bevel-tr bg-[#d5e0ff] px-4 py-3">
        <p className="text-[0.8rem] font-bold leading-none text-[#020a18]">{project.title}</p>
        <p className="hub-label mt-1.5 text-[#020a18]/50">
          {PLACES[project.slug]?.name} · {project.type} · click to explore
        </p>
      </div>
    </div>
  );
}

/* ── intro ─────────────────────────────────────────────────────────── */

function Intro({ onEnter }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6">
      <h1 className="hub-in text-center font-display text-[clamp(2.2rem,7vw,4.6rem)] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-[#d5e0ff]">
        How to use
        <br />
        the index
      </h1>

      <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {HOW_TO.map((c, i) => (
          <div
            key={c.n}
            style={{ animationDelay: `${0.12 + i * 0.09}s` }}
            className="hub-in bevel-card group/card relative flex flex-col bg-[#d5e0ff]/[0.055] p-5 backdrop-blur-sm transition-colors duration-500 hover:bg-[#d5e0ff]/[0.1] sm:h-64 sm:p-6"
          >
            <div className="flex items-center justify-end gap-2 text-[#d5e0ff]/45">
              <span className="h-1.5 w-1.5 bg-current" />
              <span className="hub-label">{c.n}</span>
            </div>
            <div className="flex flex-1 items-center justify-center py-6">
              <span className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-[#d5e0ff]/[0.07] text-[#d5e0ff]/70 transition-transform duration-500 group-hover/card:scale-110">
                <CursorIcon kind={c.icon} />
              </span>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.02em] text-[#d5e0ff]">
                {c.title}
              </h2>
              <p className="mt-1.5 text-sm font-light text-[#d5e0ff]/45">{c.copy}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onEnter}
        style={{ animationDelay: '0.42s' }}
        className="hub-in bevel-tr group mt-10 flex items-center gap-3 bg-[#d5e0ff]/10 px-6 py-4 text-[#d5e0ff] backdrop-blur-sm transition-colors duration-300 hover:bg-[#d5e0ff] hover:text-[#020a18]"
      >
        <Glyph className="h-3 w-3 transition-transform duration-500 group-hover:rotate-90" />
        <span className="hub-label">Enter the index</span>
      </button>
    </div>
  );
}

/* ── listing panel ─────────────────────────────────────────────────── */

function ListPanel({ list, filter, setFilter, onSelect, onClose, activeSlug }) {
  return (
    <div className="absolute inset-0 z-40 p-5 sm:p-8">
      <div className="panel-slide relative h-full w-full sm:w-[28.13vw] sm:min-w-[26rem]">
        {/* CLOSE sits over the panel's top-right, exactly as on the reference. */}
        <button
          onClick={onClose}
          className="bevel-tr group absolute -top-1 right-0 z-20 flex items-center gap-2.5 bg-[#020a18] px-5 py-4 text-[#d5e0ff] transition-colors duration-300 hover:bg-[#0b1a3a]"
        >
          <Glyph className="h-3 w-3 transition-transform duration-500 group-hover:rotate-90" />
          <span className="hub-label">Close</span>
        </button>

        <div className="bevel-panel flex h-full w-full flex-col bg-[#d5e0ff]">
          <div className="px-6 pt-6">
            <div className="flex items-center gap-2 text-[#020a18]/50">
              <span className="h-1.5 w-1.5 bg-current" />
              <span className="hub-label">Projects open</span>
            </div>
            <h2 className="mt-10 font-display text-[clamp(2.4rem,5.4vw,3.9rem)] font-bold uppercase leading-[0.84] tracking-[-0.03em] text-[#020a18]">
              Project
              <br />
              Listing
            </h2>
          </div>

          <div className="no-scrollbar mt-8 flex-1 overflow-y-auto overscroll-contain border-t border-[#020a18]/10">
            {list.map((p) => (
              <button
                key={p.slug}
                onClick={() => onSelect(p)}
                className={`hub-row relative flex w-full items-center justify-between border-b border-[#020a18]/10 text-left ${
                  activeSlug === p.slug ? 'is-active' : ''
                }`}
              >
                {/* The wipe fill. Sits under the text (z-0) so the copy stays
                    readable through the whole transition. */}
                <span className="hub-row__fill absolute inset-0 flex items-center justify-end bg-[#020a18] pr-5">
                  <span className="hub-label flex items-center gap-2 text-[#d5e0ff]">
                    Discover
                    <Glyph className="h-2.5 w-2.5" />
                  </span>
                </span>

                {/* Type scale taken off the reference row: 12px bold title,
                    10.5px type line, 21px/12px padding — nudged up a touch
                    here for legibility at a 16px root. */}
                <span className="relative z-10 flex flex-col gap-2 px-5 py-[1.35rem]">
                  <span className="hub-row__title text-[0.85rem] font-bold leading-none tracking-[-0.01em] text-[#020a18]">
                    {p.title}
                  </span>
                  <span className="hub-row__type text-[0.75rem] font-light leading-none text-[#020a18]/40">
                    {p.type} · {p.status}
                  </span>
                </span>

                <span className="hub-label relative z-10 pr-5 text-[#020a18]/35">
                  {PLACES[p.slug]?.name ?? p.group}
                </span>
              </button>
            ))}
            {list.length === 0 && (
              <p className="hub-label px-5 py-10 text-[#020a18]/40">No projects match</p>
            )}
          </div>

          {/* One non-wrapping scrollable row. Wrapping pushed the second line
              into the panel's bottom-left chamfer, where clip-path simply ate
              it; `pl-24` keeps every chip clear of the diagonal. */}
          <div className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto border-t border-[#020a18]/10 py-4 pl-24 pr-5">
            <span className="hub-label mr-1 shrink-0 text-[#020a18]/45">Filter</span>
            {['All', ...GROUPS].map((g) => {
              const on = filter === g;
              return (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  className={`hub-label shrink-0 border px-3 py-2 transition-colors duration-300 ${
                    on
                      ? 'border-[#020a18] bg-[#020a18] text-[#d5e0ff]'
                      : 'border-[#020a18]/25 text-[#020a18]/60 hover:border-[#020a18] hover:text-[#020a18]'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── detail sheet ──────────────────────────────────────────────────── */

function DetailSheet({ project, index, total, onClose, onStep }) {
  return (
    <div className="absolute inset-0 z-50 p-5 sm:p-8">
      <div className="hub-wipe bevel-sheet relative flex h-full w-full flex-col overflow-hidden bg-[#020a18]/95 backdrop-blur-md">
        <div className="absolute inset-0 hub-grid" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 55% at 50% 40%, rgba(30,72,168,0.28) 0%, transparent 72%)',
          }}
        />

        <div className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
          <div className="flex items-center gap-2 text-[#d5e0ff]/45">
            <span className="h-1.5 w-1.5 bg-current" />
            <span className="hub-label">
              Project {pad(index + 1)} / {pad(total)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="bevel-tr group flex items-center gap-2.5 bg-[#d5e0ff] px-5 py-3.5 text-[#020a18] transition-colors duration-300 hover:bg-white"
          >
            <Glyph className="h-3 w-3 transition-transform duration-500 group-hover:rotate-90" />
            <span className="hub-label">Close</span>
          </button>
        </div>

        {/* `my-auto` on the child rather than `justify-center` on the
            scroller: centring a flex scroll container overflows content past
            the *top*, where scrolling can't reach it. An auto margin collapses
            to 0 once the content is taller than the pane, so it centres when
            there's room and scrolls normally when there isn't. */}
        <div className="no-scrollbar relative z-10 flex flex-1 flex-col overflow-y-auto px-6 py-6 sm:px-10">
          <div className="mx-auto my-auto w-full max-w-3xl">
            {/* Kept to ~30rem so the title, meta and overview all clear the
                fold on a laptop, as they do on the reference. */}
            <div className="hub-in bevel-card mx-auto max-w-[25rem] overflow-hidden border border-[#d5e0ff]/15">
              <img
                key={project.slug}
                src={project.image}
                alt={project.title}
                className="aspect-[16/10] w-full object-cover"
                draggable="false"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {[project.type, project.status, project.year].map((t, i) => (
                <span
                  key={t}
                  style={{ animationDelay: `${0.08 + i * 0.06}s` }}
                  className="hub-in bevel-tr hub-label bg-[#d5e0ff]/[0.14] px-3.5 py-2.5 text-[#d5e0ff]/80"
                >
                  {t}
                </span>
              ))}
            </div>

            <h2
              style={{ animationDelay: '0.16s' }}
              className="hub-in mt-4 font-display text-[clamp(1.9rem,5.6vw,4rem)] font-bold uppercase leading-[0.86] tracking-[-0.035em] text-[#d5e0ff]"
            >
              {project.title}
            </h2>

            <p style={{ animationDelay: '0.22s' }} className="hub-in hub-label mt-3 text-[#d5e0ff]/45">
              {PLACES[project.slug]?.name ?? project.group} • {project.type}
            </p>

            <p
              style={{ animationDelay: '0.28s' }}
              className="hub-in mt-4 max-w-2xl text-[0.9rem] font-light leading-relaxed text-[#d5e0ff]/65"
            >
              {project.overview}
            </p>

            <p style={{ animationDelay: '0.34s' }} className="hub-in hub-label mt-4 text-[#d5e0ff]/40">
              {project.stack}
            </p>
          </div>
        </div>

        {/* Bottom action bar — prev / next plus the primary CTA, mirroring the
            reference's footer strip. */}
        <div className="relative z-10 flex items-stretch justify-between border-t border-[#d5e0ff]/12 bg-[#d5e0ff]/[0.04]">
          <div className="flex">
            {[
              { d: -1, label: 'Prev' },
              { d: 1, label: 'Next' },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => onStep(b.d)}
                className="hub-label border-r border-[#d5e0ff]/12 px-6 py-5 text-[#d5e0ff]/50 transition-colors duration-300 hover:bg-[#d5e0ff] hover:text-[#020a18]"
              >
                {b.label}
              </button>
            ))}
          </div>
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 bg-[#d5e0ff] px-6 py-5 text-[#020a18] transition-colors duration-300 hover:bg-white sm:px-10"
          >
            <Glyph className="h-3 w-3 transition-transform duration-500 group-hover:rotate-90" />
            <span className="hub-label">Visit live site</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── page ──────────────────────────────────────────────────────────── */

export default function WorkPage() {
  const [stage, setStage] = useState('intro'); // intro · map
  const [listOpen, setListOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 6 });

  const list = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.group === filter)),
    [filter]
  );

  const counts = useMemo(() => {
    const c = { All: projects.length };
    for (const g of GROUPS) c[g] = projects.filter((p) => p.group === g).length;
    return c;
  }, []);

  // Esc backs out one level at a time: detail → list → map.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (active) setActive(null);
      else if (listOpen) setListOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, listOpen]);

  const step = (d) => {
    const i = projects.findIndex((p) => p.slug === active.slug);
    setActive(projects[(i + d + projects.length) % projects.length]);
  };

  const activeIndex = active ? projects.findIndex((p) => p.slug === active.slug) : 0;
  const onMap = stage === 'map';

  return (
    <main
      className="hub relative h-[100svh] w-full overflow-hidden overscroll-none bg-[#020a18] text-[#d5e0ff]"
      onPointerMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
    >
      {/* The map itself is always mounted — the intro sits over it, so by the
          time you press Enter the WebGL context is warm and the plate is
          already drawn. It only takes pointer input once you're through. */}
      <div className={`absolute inset-0 ${onMap ? '' : 'pointer-events-none'}`}>
        <ProjectMap
          projects={list}
          activeSlug={active?.slug}
          onHover={setHovered}
          onSelect={(p) => setActive(p)}
          onZoom={setZoom}
          onPan={(x, y) => setPan({ x, y })}
        />
      </div>

      {/* Vignette + scanlines over the canvas, as on the reference. */}
      <div className="pointer-events-none absolute inset-0 hub-scan" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(115% 88% at 50% 50%, transparent 42%, rgba(2,10,24,0.92) 100%)',
        }}
      />

      <HudFrame />

      {onMap && (
        <>
          {!listOpen && <Chrome />}
          <GroupRail filter={filter} setFilter={setFilter} counts={counts} />
          <Compass />
          <MiniMap zoom={zoom} pan={pan} projects={list} activeSlug={active?.slug} />
          <BottomBar
            zoom={zoom}
            shown={list.length}
            total={projects.length}
            filterCount={filter === 'All' ? 0 : 1}
            onOpenList={() => setListOpen(true)}
          />
          {!listOpen && !active && <BlockTip project={hovered} at={cursor} />}
        </>
      )}

      {stage === 'intro' && (
        <div className="absolute inset-0 z-40 bg-[#020a18]/85 backdrop-blur-sm">
          <Intro onEnter={() => setStage('map')} />
        </div>
      )}

      {listOpen && (
        <ListPanel
          list={list}
          filter={filter}
          setFilter={setFilter}
          activeSlug={active?.slug}
          onSelect={setActive}
          onClose={() => setListOpen(false)}
        />
      )}

      {active && (
        <DetailSheet
          project={active}
          index={activeIndex}
          total={projects.length}
          onStep={step}
          onClose={() => setActive(null)}
        />
      )}
    </main>
  );
}
