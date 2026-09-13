'use client';

import Chars from './Chars';
import ExplorePill from './ExplorePill';
import { hero } from './content';

/* ─────────────────────────────────────────────────────────────────────────
   The opening beat, held over the phoenix on the peak.

   One sentence, two typefaces, three anchored pieces:

     · the pill, centred in the frame
     · the sans lead-in, inset from the left, with its connector word set
       inline in the display italic
     · the payoff noun underneath at display size, centred, wider than the
       screen and bleeding off both edges

   That last part is the whole effect and the thing this beat lives or dies
   on. A display word that fits comfortably inside the viewport reads as a
   large heading; one that runs off both edges reads as a word you are
   standing too close to. Its descenders are meant to be cut by the bottom of
   the frame — that is not an overflow bug, it is the crop.

   The block is anchored to the BOTTOM rather than laid out in normal flow,
   because the crop is what has to stay put. Whatever height the word takes at
   a given viewport, it keeps the same distance from the bottom edge and grows
   upward into the frame.
   ───────────────────────────────────────────────────────────────────────── */

export default function Hero({ onEnter }) {
  const sentence = `${hero.lead.join(' ')} ${hero.word}`;

  return (
    <section className="relative h-full overflow-hidden">
      {/* Centred in the frame, the way the reference places it — not tucked
          into a corner. It is the only thing on the beat you can press. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <ExplorePill onClick={onEnter} />
      </div>

      {/* One heading, not a heading plus a subheading — the sentence is
          continuous and only the typesetting is in two parts. The pieces are
          silenced individually and the whole sentence named once, so it
          reaches a screen reader the way it reads on the page. */}
      <h1 aria-label={sentence} className="story-hero-block">
        <span className="story-hero-lead block">
          {hero.lead.map((line) => (
            <LeadLine key={line} line={line} />
          ))}
        </span>

        <span className="story-display story-hero-word block">
          <Chars text={hero.word} entrance silent />
        </span>
      </h1>
    </section>
  );
}

/* A lead line, sans throughout except for the one connector word that swaps
   to the display italic. Same size, same colour — only the face changes, so
   it reads as emphasis inside the sentence rather than as a different
   element. */
function LeadLine({ line }) {
  const words = line.split(' ');
  return (
    <span className="block">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block">
          {/* The face swap goes on a wrapper rather than through Chars'
              className, which already carries a display utility of its own —
              two display utilities on one element resolve by stylesheet order,
              which is not something to depend on.

              The wrapper must be inline-block: Chars renders a `block` span,
              and a block inside a plain inline box splits the line around it,
              which put every word of the lead on a line of its own. */}
          <span
            className={`inline-block ${word === hero.serif ? 'story-display' : ''}`}
          >
            <Chars text={word} entrance silent />
          </span>
          {i < words.length - 1 && <span className="inline-block w-[0.26em]" />}
        </span>
      ))}
    </span>
  );
}
