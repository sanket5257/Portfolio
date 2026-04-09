"use client";

import GridOverlay from "./GridOverlay";

const projects = [
  {
    name: "Portfolio v2",
    description: "Personal portfolio with cinematic GSAP animations — Next.js, GSAP, Lenis, Tailwind CSS",
    url: "https://portfolioleo-o.vercel.app/",
  },
  {
    name: "Kvell Dynamics",
    description: "AI & automation agency site with premium UI/UX — Next.js, GSAP, Lenis, Tailwind CSS",
    url: "https://kvelld-beta.vercel.app/",
  },
  {
    name: "Vidya Bharati School",
    description: "School website with admissions, academics & campus showcase — Next.js, GSAP, Lenis, Tailwind CSS",
    url: "https://education-kappa-eight.vercel.app/",
  },
  {
    name: "CodeSage",
    description: "Web design & development agency site with AI solutions focus — Next.js, GSAP, Lenis, Tailwind CSS",
    url: "https://codesage5.vercel.app/",
  },
  {
    name: "RamScript",
    description: "Software dev agency site — virtual CTO & tech partner platform — Next.js, GSAP, Lenis, Tailwind CSS",
    url: "https://ramscript.com/",
  },
  {
    name: "Shivneri Systems",
    description: "Full-stack engineering agency with on-demand product teams — Next.js, GSAP, Lenis, Tailwind CSS",
    url: "https://shivneri.vercel.app/",
  },
  {
    name: "Zentry Clone",
    description: "High-fidelity recreation of a cinematic homepage — React, GSAP, Lenis, Tailwind CSS",
    url: "https://zentry-clone-indol.vercel.app/",
  },
];

export default function SideProjects() {
  return (
    <section
      className="relative"
      style={{ background: "#fafaf9", padding: "80px 0" }}
    >
      <GridOverlay />
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 24px" }}>
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6" style={{ marginBottom: 12 }}>
          <div className="md:col-span-2">
            <span
              className="uppercase"
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "#64748b",
                letterSpacing: "1.2px",
                lineHeight: "16px",
              }}
            >
              SIDE PROJECTS
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div
          style={{ borderTop: "1px solid rgba(148, 163, 184, 0.4)", marginBottom: 48 }}
        />

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6">
          <div className="md:col-span-2 md:pr-16 mb-8 md:mb-0">
            <p
              className="leading-relaxed"
              style={{ fontSize: 14, color: "#475569", maxWidth: 280 }}
            >
              Things I build on the side to{" "}
              <strong style={{ fontWeight: 600, color: "#1e293b" }}>
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
                className="grid grid-cols-1 md:grid-cols-4 gap-x-6 items-center rounded-sm transition-colors duration-150 hover:bg-white/60 group"
                style={{
                  padding: "14px 0",
                  borderBottom:
                    i < projects.length - 1
                      ? "1px solid rgba(148, 163, 184, 0.2)"
                      : "none",
                }}
              >
                <span
                  className="flex items-center gap-1 col-span-1"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#1e293b",
                    textDecoration: "none",
                  }}
                >
                  {project.name}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ opacity: 0.5, flexShrink: 0 }}
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17L17 7" />
                  </svg>
                </span>
                <span
                  className="col-span-1 md:col-span-3"
                  style={{ fontSize: 14, fontWeight: 400, color: "#475569" }}
                >
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
