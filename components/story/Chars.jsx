'use client';

/* ─────────────────────────────────────────────────────────────────────────
   Display type, split for the reveal.

   Every headline on the page rises into place one character at a time. The
   split happens here; the actual per-frame movement is written by StoryPage
   inside its rAF loop, which finds these nodes by their `data-rise` attribute
   and sets a transform on each. Nothing animates itself — the scroll position
   is the only clock on this page.

   Every character is its own inline-block, and an inline-block is a break
   opportunity, so left alone the browser will happily wrap a headline in the
   middle of a word. The characters are therefore grouped back into words and
   the WORD carries `whitespace-nowrap`: lines break between words, as they
   should, and the per-character masks survive inside them.
   ───────────────────────────────────────────────────────────────────────── */

export default function Chars({ text, className = '', entrance = false, silent = false }) {
  const words = text.split(' ');
  /* `entrance` is for the opening beat only. It has no scroll to rise out of
     — the visitor has not moved yet — so its characters play a CSS animation
     when the loader lifts instead. A running CSS animation outranks an inline
     style, so it wins while it plays; it is filled `backwards` rather than
     `forwards`, so the moment it ends the render loop's inline transform
     takes the character back and the exit still works. */
  let k = 0;
  return (
    <span className={`block ${className}`}>
      {/* The split is decorative. Word gaps are rendered as empty spacer
          elements rather than as space characters, so to a screen reader — and
          to anyone copying the headline — the split version reads
          "Sitesthat". The real string is carried once, for them, and the
          visible characters are hidden from the accessibility tree.

          `silent` suppresses it for the case where several of these sit
          inside one heading: there the caller puts the whole sentence on the
          heading's aria-label, and three separate copies in here would only
          run together without their spaces. */}
      {!silent && <span className="sr-only">{text}</span>}
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={`${word}-${w}`} className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, i) => {
              const delay = entrance ? `${140 + (k += 1) * 34}ms` : undefined;
              return (
                <span key={i} className="story-mask">
                  <span
                    data-rise=""
                    className={`story-char inline-block will-change-transform ${
                      entrance ? 'story-rise-in' : ''
                    }`}
                    style={{ transform: 'translate3d(0, 110%, 0)', animationDelay: delay }}
                  >
                    {ch}
                  </span>
                </span>
              );
            })}
            {w < words.length - 1 && <span className="inline-block w-[0.24em]" />}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Places every `[data-rise]` node inside `el` for an arrival ramp of `t`.
 *
 * Called once per beat per frame from the render loop, so it does no
 * allocation and no DOM queries of its own — the caller passes the cached
 * NodeList in.
 */
export function placeChars(nodes, t) {
  const n = nodes.length;
  if (!n) return;
  // Long strings need a tighter stagger or the tail never finishes arriving.
  const spread = n > 24 ? 0.14 : 0.5;
  const span = 1 + spread * (n - 1);
  for (let k = 0; k < n; k += 1) {
    let wt = t * span - k * spread;
    wt = wt < 0 ? 0 : wt > 1 ? 1 : wt;
    const e = wt * wt * (3 - 2 * wt);
    nodes[k].style.transform = `translate3d(0, ${((1 - e) * 110).toFixed(1)}%, 0)`;
  }
}
