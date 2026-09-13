'use client';

import Chars from './Chars';
import { statements } from './content';

/* ─────────────────────────────────────────────────────────────────────────
   A statement beat, scattered across the frame.

   Four kinds of thing, at four scales, deliberately not stacked:

     · short sans fragments pinned at hand-placed anchors in the upper half
     · one two-word phrase in the display italic through the middle
     · two narrow paragraph columns along the bottom edge, left and right

   The fragments and the phrase are one sentence read across the frame, so
   they are announced as one — the pieces are hidden from the accessibility
   tree individually and the whole line is named once on the section.

   The columns are the only long copy on the page. They get a plain fade
   rather than the per-character reveal every heading uses: two dozen words
   split into characters is three hundred DOM nodes and a stagger nobody can
   follow, and the reveal is there to make short lines land, not to make
   paragraphs legible.
   ───────────────────────────────────────────────────────────────────────── */

export default function Statement({ id }) {
  const s = statements[id];
  const sentence = `${s.fragments.map((f) => f.text).join(' ')} ${s.big}`;

  return (
    <section className="relative h-full" aria-label={sentence}>
      {s.fragments.map((f) => (
        <span
          key={f.text}
          aria-hidden="true"
          style={{ left: `${f.at[0]}%`, top: `${f.at[1]}%` }}
          className="story-fragment absolute"
        >
          <Chars text={f.text} silent />
        </span>
      ))}

      {/* The one big moment of the beat. Centred on both axes, which is the
          only thing here that is. */}
      <span
        aria-hidden="true"
        className="story-display story-statement absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Chars text={s.big} silent />
      </span>

      {/* The bottom pair. Narrow columns pinned to opposite sides, the way
          a footnote sits under a plate rather than under a paragraph. */}
      <div className="story-columns absolute inset-x-0 bottom-0 flex justify-between">
        {s.columns.map((text) => (
          <p key={text} className="story-column">
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}
