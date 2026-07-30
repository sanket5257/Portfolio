'use client';

import { useEffect } from 'react';
import { panels } from '@/lib/content';

export default function Panel({ id, onClose }) {
  const data = id ? panels[id] : null;

  useEffect(() => {
    if (!id) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* scrim */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] panel-fade"
      />
      {/* drawer */}
      {/* Scrolls: the contact panel is six rows plus an intro, which overruns a
          640px-tall phone. Without this the last links were simply unreachable. */}
      <aside className="panel-slide relative z-10 flex h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain border-l border-paper/10 bg-ink2/95 px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-light uppercase tracking-[0.35em] text-accent/80">
            {data.tag}
          </span>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="-mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition hover:border-paper/60 hover:text-paper"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <h2 className="mt-6 text-2xl font-thin tracking-fine text-paper sm:mt-8 sm:text-3xl">
          {data.title}
        </h2>
        <p className="mt-3 max-w-sm text-[13px] font-extralight leading-relaxed text-paper/70 sm:mt-4 sm:text-sm">
          {data.intro}
        </p>

        <ul className="mt-6 divide-y divide-paper/10 border-t border-paper/10 sm:mt-10">
          {data.items.map((it) => {
            const row = (
              <>
                <span className="shrink-0 text-sm font-light text-paper/90 transition group-hover:text-paper sm:text-base">
                  {it.name}
                </span>
                <span className="min-w-0 break-words text-right text-[11px] font-light tracking-wide text-paper/45 transition group-hover:text-paper/70 sm:text-xs">
                  {it.meta}
                </span>
              </>
            );
            return (
              <li key={it.name}>
                {it.href ? (
                  <a
                    href={it.href}
                    target={it.href.startsWith('http') ? '_blank' : undefined}
                    rel={it.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group flex items-center justify-between gap-4 py-3.5 sm:gap-6 sm:py-4"
                  >
                    {row}
                  </a>
                ) : (
                  <div className="group flex items-center justify-between gap-4 py-3.5 sm:gap-6 sm:py-4">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
