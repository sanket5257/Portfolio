'use client';

import Chars from './Chars';
import ExplorePill from './ExplorePill';
import { hero } from './content';

/* ─────────────────────────────────────────────────────────────────────────
   The opening beat, held over the phoenix on the peak.

   One sentence set in two faces that interlock. The sans lead-in sits in two
   short lines inset from the left; the payoff word runs underneath it at
   roughly fourteen times the size, centred, and pulled UP so its ascenders
   rise between the two small lines rather than starting below them. That
   overlap is the composition — set the big word below the small ones and the
   same two elements read as an ordinary heading with a subheading.

   The whole block is bottom-anchored rather than centred: the bird owns the
   middle of the frame through this act, and the type is built to sit under
   it, not across it.

   All the metrics live in globals.css (.story-hero-lead / .story-hero-word),
   because they are ratios that have to hold together and reading them in one
   place is the only way to keep them that way.
   ───────────────────────────────────────────────────────────────────────── */

export default function Hero({ onEnter }) {
  const sentence = `${hero.lead.join(' ')} ${hero.word}`;

  return (
    /* No horizontal padding on the section: the two children own their own
       insets, so the 7.9vw the reference measures from the VIEWPORT edge is
       not quietly stacked on top of a page gutter. The word is centred and
       therefore symmetric at any width. */
    <section className="flex h-full flex-col justify-end pb-[4vh]">
      <div className="story-hero-inset mb-[5vh]">
        <ExplorePill onClick={onEnter} />
      </div>

      {/* One heading, not a heading plus a subheading — the sentence is
          continuous and only the typesetting is in two parts. The pieces are
          silenced individually and the whole sentence named once, so it
          reaches a screen reader the way it reads on the page. */}
      <h1 aria-label={sentence}>
        <span className="story-hero-lead block">
          {hero.lead.map((line) => (
            <Chars key={line} text={line} entrance silent />
          ))}
        </span>

        <span className="story-display story-hero-word block">
          <Chars text={hero.word} entrance silent />
        </span>
      </h1>
    </section>
  );
}
