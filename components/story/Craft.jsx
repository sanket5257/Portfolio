'use client';

import Chars from './Chars';
import { craft } from './content';

/* The middle chapter: what the work actually consists of, in three columns
   under a display heading. Columns rather than prose because the beat is on
   screen for about six seconds. */
export default function Craft() {
  return (
    <section className="flex h-full flex-col justify-end px-5 pb-20 sm:px-9 sm:pb-24">
      <h2 className="story-display mb-9 text-[13vw] sm:text-[8vw]">
        <Chars text="What I build" />
      </h2>

      <div className="grid gap-7 border-t border-paper/15 pt-7 sm:grid-cols-3 sm:gap-10">
        {craft.map((c) => (
          <article key={c.n}>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-paper/40">
              {c.n}
            </span>
            <h3 className="mt-2 text-[15px] font-medium tracking-[0.01em] text-paper/95">
              {c.title}
            </h3>
            <p className="mt-2 max-w-[34ch] text-[12.5px] font-light leading-relaxed text-paper/55">
              {c.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
