'use client';

import Chars from './Chars';
import { statements } from './content';

/* A single line, held across a stretch of the flight where there is nothing
   to explain — a mono label above and the display serif under it. Two of
   these punctuate the page: one as the wings catch, one under the moon. */
export default function Statement({ id }) {
  const s = statements[id];
  return (
    <section className="flex h-full flex-col justify-center px-5 sm:px-9">
      <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.28em] text-paper/45">
        {s.label}
      </span>
      <h2 className="story-display max-w-[14ch] text-[12vw] sm:text-[8.5vw]">
        <Chars text={s.line} />
      </h2>
    </section>
  );
}
