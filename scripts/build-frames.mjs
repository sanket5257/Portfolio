/* ─────────────────────────────────────────────────────────────────────────
   Turns the exported PNG sequence into the webp filmstrip /work plays.

   The export is 300 frames of 1920×1080 PNG — 340 MB, which is not a thing
   you ship. Every frame is kept — at 300 the strip is dense enough that the renderer
   can draw one sharp frame per tick with no blending between them, which is
   the difference between "cinematic" and "soft". Each is written at three
   widths so a phone never downloads desktop pixels.

     node scripts/build-frames.mjs <folder-of-pngs>

   Output: public/frames/<width>/<001..150>.webp
   ───────────────────────────────────────────────────────────────────────── */
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = process.argv[2];
if (!SRC) {
  console.error('usage: node scripts/build-frames.mjs <folder-of-pngs>');
  process.exit(1);
}

const OUT = path.resolve('public/frames');
const WIDTHS = [854, 1280, 1920];
const STEP = 1;

const all = (await readdir(SRC)).filter((f) => /\.png$/i.test(f)).sort();
const picks = all.filter((_, i) => i % STEP === 0);

for (const w of WIDTHS) await mkdir(`${OUT}/${w}`, { recursive: true });

const jobs = [];
picks.forEach((file, idx) => {
  const id = String(idx + 1).padStart(3, '0');
  for (const w of WIDTHS) {
    jobs.push(() =>
      sharp(path.join(SRC, file))
        .resize(w)
        /* Quality is high on purpose. These frames ARE the page — every
           byte saved here comes straight out of the one thing the visitor
           is looking at, and webp below ~75 puts visible mush into the
           phoenix's feathers and the star field. The 1920 tier gets a point
           less only because it is already carrying the most pixels. */
        .webp({ quality: w >= 1920 ? 78 : 80, effort: 6 })
        .toFile(`${OUT}/${w}/${id}.webp`)
    );
  }
});

let done = 0;
let cursor = 0;
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (cursor < jobs.length) {
      await jobs[cursor++]();
      done += 1;
      if (done % 90 === 0) console.log(`${done}/${jobs.length}`);
    }
  })
);
console.log(`done — ${picks.length} frames × ${WIDTHS.length} widths`);
