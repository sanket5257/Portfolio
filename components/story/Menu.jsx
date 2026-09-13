'use client';

import Link from 'next/link';
import { menu, socials } from './content';

/* ─────────────────────────────────────────────────────────────────────────
   The menu sheet.

   A sheet rather than a page: the flight underneath never stops, the blur
   lets it show through, and the links seek along it instead of navigating
   away from it. Only the last row actually leaves.
   ───────────────────────────────────────────────────────────────────────── */

export default function Menu({ open, onSeek }) {
  return (
    <div
      className={`absolute inset-0 z-40 flex flex-col justify-end bg-[#05040c]/80 px-5 pb-14 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-9 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      <ul className="story-display text-[15vw] leading-[0.98] sm:text-[8vw]">
        {menu.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => onSeek(item.at)}
              tabIndex={open ? 0 : -1}
              className="story-char transition-opacity duration-300 hover:opacity-55"
            >
              {item.label}
            </button>
          </li>
        ))}
        <li>
          <Link
            href="/"
            tabIndex={open ? 0 : -1}
            className="story-char block transition-opacity duration-300 hover:opacity-55"
          >
            Desk
          </Link>
        </li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-paper/45">
        {socials.map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            tabIndex={open ? 0 : -1}
            className="story-link transition-colors hover:text-paper"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
