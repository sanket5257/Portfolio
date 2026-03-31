"use client";

import GridOverlay from "./GridOverlay";

const experiences = [
  {
    company: "Shivneri Systems",
    url: null,
    role: "Frontend Developer",
    period: "Jun 2025\u2013Present",
  },
  {
    company: "RS Soft Tech",
    url: null,
    role: "Frontend Developer",
    period: "Mar\u2013May 2025",
  },
  {
    company: "Stormsofts Technology",
    url: null,
    role: "Frontend Developer (Intern)",
    period: "Jun\u2013Aug 2024",
  },
];

export default function Experience() {
  return (
    <section id="about" className="relative bg-stone-50 py-20">
      <GridOverlay />
      <div className="max-w-6xl mx-auto px-6">
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 mb-3">
          <div className="md:col-span-2">
            <span className="uppercase text-xs font-normal text-slate-500 tracking-[1.2px] leading-4">
              EXPERIENCE
            </span>
          </div>
          <div className="hidden md:block md:col-start-6 text-right">
            <span className="text-xs font-normal text-slate-400">
              Selected roles
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div className="border-t border-slate-400/40 mb-12" />

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6">
          <div className="md:col-span-2 md:pr-16 mb-8 md:mb-0">
            <p className="text-sm leading-relaxed text-slate-600 max-w-[280px]">
              Hi, I&apos;m Sanket — a creative web developer based in
              Maharashtra.{" "}
              <strong className="font-semibold text-slate-800">
                I specialize in frontend development and crafting immersive
                digital experiences
              </strong>{" "}
              with clean code, smooth animations, and pixel-perfect UI that
              makes brands go from &apos;meh&apos; to &apos;woah&apos;.
            </p>
          </div>

          <div className="md:col-span-4">
            {experiences.map((exp, i) => (
              <div
                key={i}
                data-cursor-target="about-row"
                className={`grid grid-cols-1 md:grid-cols-4 gap-x-6 items-center rounded-sm transition-colors duration-150 hover:bg-white/60 py-3.5 ${
                  i < experiences.length - 1 ? "border-b border-slate-400/20" : ""
                }`}
              >
                {exp.url ? (
                  <a
                    href={exp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 col-span-1 transition-opacity hover:opacity-70 text-sm font-medium text-slate-800 no-underline"
                  >
                    {exp.company}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="opacity-50 shrink-0"
                    >
                      <path d="M7 7h10v10" />
                      <path d="M7 17L17 7" />
                    </svg>
                  </a>
                ) : (
                  <span className="col-span-1 text-sm font-medium text-slate-800">
                    {exp.company}
                  </span>
                )}
                <span className="col-span-2 text-sm font-normal text-slate-600">
                  {exp.role}
                </span>
                <span className="col-span-1 text-right text-xs font-normal text-slate-400">
                  {exp.period}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
