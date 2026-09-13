import { projects } from '@/lib/projects';

/* ─────────────────────────────────────────────────────────────────────────
   Every word on the storytelling page, and where on the flight it appears.

   The page has no scrollbar and no sections in the document sense — it has
   BEATS. Each beat owns a window of the 0→1 journey and fades itself in and
   out inside that window, so "scrolling to the next section" and "flying
   further along the take" are the same gesture.

   The windows are hand-placed against the footage rather than spaced evenly:
   the hero over the perched bird, the first statement as the wings catch, the
   craft columns once it has cleared the rock, one project per beat of the
   level flight, a statement held under the moon, and the footer over the
   final head-on spread. Nothing sits on the take-off itself (0.17–0.26) —
   the footage is the content there, and copy over it would only be in the
   way.
   ───────────────────────────────────────────────────────────────────────── */

const WORK_START = 0.4;
const WORK_END = 0.78;
const SLOT = (WORK_END - WORK_START) / projects.length;

export const beats = [
  { id: 'hero', kind: 'hero', from: 0.0, to: 0.135 },
  { id: 'credo', kind: 'statement', from: 0.155, to: 0.245 },
  { id: 'craft', kind: 'craft', from: 0.275, to: 0.375 },
  ...projects.map((project, i) => ({
    id: project.slug,
    kind: 'work',
    project,
    n: i + 1,
    /* Neighbouring windows are butted, not overlapped: one card is always on
       its way out as the next arrives, which keeps the flight reading as
       continuous travel rather than as a slideshow. */
    from: WORK_START + i * SLOT,
    to: WORK_START + (i + 1) * SLOT,
  })),
  { id: 'moon', kind: 'statement', from: 0.795, to: 0.875 },
  /* The last beat runs to the very end of the journey and never leaves. The
     site ends at the footer — scroll as far as it goes and the footer is
     what is there, not a blank frame past the last card. */
  { id: 'end', kind: 'footer', from: 0.895, to: 1.0001 },
];

/* Short on purpose: at 11vw there is room for about eleven characters a line
   and no more. */
export const hero = {
  /* The hero is two typefaces in one sentence, and the split is the whole
     idea: a quiet sans lead-in in two short lines, then the payoff noun on
     its own at fourteen times the size, crashing up into them.

     The metrics are the point of the shape. Two words per sans line keeps
     both lines close to the same measure; a payoff word of ten to twelve
     characters is what fills the screen edge to edge at 19.5vw. Change the
     word count here and the composition stops working — a three-word line
     runs past the display word above it, and a six-letter payoff leaves the
     line looking stranded in the middle of the frame. */
  lead: ['Immersive web', 'design and'],
  word: 'engineering',
};

/* The two full-width statements. The leading fragment is set in the mono
   label face and the line itself in the display serif, which is the whole
   typographic idea of the page in one beat. */
export const statements = {
  credo: { label: 'Every build starts still', line: 'before it knows it can fly' },
  moon: { label: 'The work is the flight', line: 'craft keeps it in the air' },
};

/* Three columns rather than a paragraph: this beat is on screen for about six
   seconds, and nobody reads a paragraph in six. */
export const craft = [
  {
    n: '01',
    title: 'Interface',
    body: 'Layouts that hold up at every width, typeset properly, with nothing decorative that has not earned its place.',
  },
  {
    n: '02',
    title: 'Motion',
    body: 'Scroll-driven scenes, canvas and WebGL — movement that carries the story rather than sitting on top of it.',
  },
  {
    n: '03',
    title: 'Engineering',
    body: 'Next.js and React underneath: fast, accessible, and still maintainable long after the launch post.',
  },
];

export const EMAIL = 'chougulesanket30@gmail.com';

/* Header nav. An entry with `at` seeks along the flight instead of
   navigating — the journey IS the site map here. */
export const nav = [
  { label: 'Craft', at: 0.3 },
  { label: 'Work', at: 0.42 },
  { label: 'Contact', at: 0.96 },
];

/* The menu sheet repeats the nav and adds the two things that genuinely
   leave the page. */
export const menu = [
  { label: 'Top', at: 0.0 },
  { label: 'Craft', at: 0.3 },
  { label: 'Work', at: 0.42 },
  { label: 'Contact', at: 0.96 },
];

export const socials = [
  ['GitHub', 'https://github.com/sanket5257'],
  ['LinkedIn', 'https://linkedin.com/in/sanket-chougule5257'],
  ['Dribbble', 'https://dribbble.com/sanket-chougule'],
  ['Instagram', 'https://instagram.com/ft.leo_o'],
];

/* The label under the wordmark. Named for what is on screen, not for where
   the playhead is — the visitor is watching a bird, not a timeline. */
export function actFor(p) {
  if (p < 0.17) return 'On the peak';
  if (p < 0.26) return 'Lift-off';
  if (p < 0.4) return 'The craft';
  if (p < 0.78) return 'In flight';
  if (p < 0.89) return 'Under the moon';
  return 'Sign-off';
}

/* Opacity/offset for a beat at progress `p`. The 26% ramps are long enough
   that nothing ever pops, short enough that each beat gets a still moment in
   the middle of its window. `t` is the arrival ramp on its own, which is what
   drives the per-character reveals. */
export function beatState(p, from, to) {
  const span = to - from;
  const t = (p - from) / span;
  if (t <= -0.02 || t >= 1.02) return { o: 0, y: 0, t: 0 };
  const ramp = 0.26;
  /* The opening beat is already arrived at p = 0. Every other beat rises in
     as the visitor scrolls into it, but the first one has nothing to rise out
     of — running the ramp on it would mean the page lands blank and only
     appears once someone scrolls, which looks like a site that failed to
     load. Its entrance is a CSS one instead, played when the loader lifts
     (see Chars' `entrance` prop). */
  const inT = from === 0 ? 1 : Math.min(1, Math.max(0, t / ramp));
  const outT = Math.min(1, Math.max(0, (1 - t) / ramp));
  const ease = (v) => v * v * (3 - 2 * v);
  const o = ease(inT) * ease(outT);
  // Travels a little further than it arrives, so exits feel like fly-past.
  return { o, y: (1 - ease(inT)) * 34 - (1 - ease(outT)) * 26, t: inT };
}
