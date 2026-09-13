'use client';

/* No door to knock on: the counter runs while the opening frames decode, the
   veil lifts on its own, and the visitor is already standing on the peak with
   the hero in front of them. The only thing left to do is scroll. */
export default function Loader({ progress, done }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#05040c] transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        done ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/45">
        Loading the flight
      </span>
      <span className="story-display story-char mt-3 text-[18vw] leading-none tabular-nums sm:text-[9vw]">
        {String(Math.round(progress * 100)).padStart(2, '0')}
      </span>
      <div className="mt-6 h-px w-44 bg-paper/15">
        <div
          className="h-full bg-paper/70 transition-[width] duration-200"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
