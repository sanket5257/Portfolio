'use client';

import Link from 'next/link';
import { nav } from './content';

/* ─────────────────────────────────────────────────────────────────────────
   The header.

   Fixed to the top of the world, never scrolls away, and deliberately thin:
   a wordmark on the left with a live label under it saying what is currently
   on screen, and the nav on the right. The nav items do not navigate — they
   seek along the flight, because the flight is the site map. Only the
   wordmark actually leaves, back to the desk.
   ───────────────────────────────────────────────────────────────────────── */

export default function Header({ actRef, menuOpen, onToggleMenu, onSeek }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-5 py-5 sm:px-9 sm:py-7">
      <Link href="/" className="pointer-events-auto block" aria-label="Back to the desk">
        <span className="text-[13px] font-medium tracking-[0.02em] text-paper/90">
          Sanket Chougule
        </span>
        {/* Written to by the render loop — never re-rendered by React. */}
        <span
          ref={actRef}
          className="mt-1 block font-mono text-[10px] uppercase tracking-[0.24em] text-paper/40"
        >
          On the peak
        </span>
      </Link>

      <nav className="pointer-events-auto flex items-center gap-6 text-[12px] tracking-[0.02em] sm:gap-9">
        {nav.map((item) => (
          <button
            key={item.label}
            onClick={() => onSeek(item.at)}
            className="story-link hidden text-paper/65 transition-colors hover:text-paper sm:block"
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={onToggleMenu}
          aria-expanded={menuOpen}
          className="story-link text-paper/85 transition-colors hover:text-paper"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </nav>
    </header>
  );
}
