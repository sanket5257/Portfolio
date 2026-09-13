'use client';

import Chars from './Chars';
import { EMAIL, socials } from './content';

/* ─────────────────────────────────────────────────────────────────────────
   The end of the site.

   This beat runs to the very end of the journey and never fades back out —
   scroll as far as the page goes and this is what is there. The address is
   the largest thing on it, set in the display face and linked, because the
   only thing this page asks anyone to do is get in touch.
   ───────────────────────────────────────────────────────────────────────── */

export default function Footer() {
  return (
    <footer className="flex h-full flex-col justify-end px-5 pb-8 sm:px-9 sm:pb-10">
      <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.28em] text-paper/45">
        Tell me what you want to build
      </span>

      <a
        href={`mailto:${EMAIL}`}
        className="story-display block text-[9vw] transition-opacity duration-500 hover:opacity-70 sm:text-[6.2vw]"
      >
        <Chars text={EMAIL} />
      </a>

      <div className="mt-12 flex flex-col gap-6 border-t border-paper/15 pt-6 sm:flex-row sm:items-end sm:justify-between">
        <nav className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-paper/50">
          {socials.map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="story-link transition-colors hover:text-paper"
            >
              {label}
            </a>
          ))}
        </nav>

        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-paper/30">
          © {new Date().getFullYear()} Sanket Chougule — Maharashtra, India
        </p>
      </div>
    </footer>
  );
}
