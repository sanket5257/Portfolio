"use client";

import GridOverlay from "./GridOverlay";

const projects = [
  {
    name: "Portfolio v2",
    description: "Personal portfolio with cinematic GSAP animations — Next.js, GSAP, Tailwind CSS",
    url: "https://portfolioleo-o.vercel.app/",
  },
  {
    name: "Zentry Clone",
    description: "High-fidelity recreation of a cinematic homepage — React, Framer Motion, Tailwind CSS",
    url: "https://portfolioleo-o.vercel.app/projects/zentry",
  },
];

export default function SideProjects() {
  return (
    <section className="relative bg-stone-50 py-20">
      <GridOverlay />
      <div className="max-w-6xl mx-auto px-6">
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 mb-3">
          <div className="md:col-span-2">
            <span className="uppercase text-xs font-normal text-slate-500 tracking-[1.2px] leading-4">
              SIDE PROJECTS
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div className="border-t border-slate-400/40 mb-12" />

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6">
          <div className="md:col-span-2 md:pr-16 mb-8 md:mb-0">
            <p className="text-sm leading-relaxed text-slate-600 max-w-[280px]">
              Things I build on the side to{" "}
              <strong className="font-semibold text-slate-800">
                explore ideas, learn new tools,
              </strong>{" "}
              and scratch creative itches.
            </p>
          </div>

          <div className="md:col-span-4">
            {projects.map((project, i) => (
              <a
                key={i}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-target="projects-row"
                className={`grid grid-cols-1 md:grid-cols-4 gap-x-6 items-center rounded-sm transition-colors duration-150 hover:bg-white/60 group py-3.5 no-underline ${
                  i < projects.length - 1 ? "border-b border-slate-400/20" : ""
                }`}
              >
                <span className="flex items-center gap-1 col-span-1 text-sm font-medium text-slate-800">
                  {project.name}
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
                </span>
                <span className="col-span-1 md:col-span-3 text-sm font-normal text-slate-600">
                  {project.description}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
