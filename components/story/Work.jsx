'use client';

import Chars from './Chars';

/* One project, held for a beat of the level flight. Anchored bottom-left with
   the thumbnail out to the right on wide screens — the work sits in the sky
   beside its name, with no card and no chrome around it. */
export default function Work({ project, n }) {
  return (
    <section className="flex h-full items-end px-5 pb-16 sm:px-9 sm:pb-20">
      <div className="flex w-full flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-paper/45">
            {String(n).padStart(3, '0')} — {project.type} · {project.year}
          </span>

          <h3 className="story-display mt-2 text-[11vw] sm:text-[6vw]">
            <Chars text={project.title} />
          </h3>

          <p className="mt-4 hidden max-w-[52ch] text-[13px] font-light leading-relaxed text-paper/60 sm:block">
            {project.overview}
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/35">
            {project.stack}
          </p>

          <a
            href={project.live}
            target="_blank"
            rel="noreferrer"
            className="story-link mt-6 inline-flex items-center gap-2 text-[12px] text-paper/85 transition-colors hover:text-paper"
          >
            Visit site <span aria-hidden="true">↗</span>
          </a>
        </div>

        <a
          href={project.live}
          target="_blank"
          rel="noreferrer"
          className="hidden w-[30vw] max-w-[400px] shrink-0 overflow-hidden lg:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="aspect-[16/10] w-full object-cover opacity-85 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]"
          />
        </a>
      </div>
    </section>
  );
}
