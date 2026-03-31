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
    <section
      id="about"
      className="relative"
      style={{ background: "#fafaf8", padding: "80px 0" }}
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
              EXPERIENCE
            </span>
          </div>
          <div className="hidden md:block md:col-start-6 text-right">
            <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}>
              Selected roles
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div
          style={{ borderTop: "1px solid rgba(148, 163, 184, 0.4)", marginBottom: 48 }}
        />

        {/* Content: intro (cols 1-2) + rows (cols 3-6) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6">
          <div className="md:col-span-2 md:pr-16 mb-8 md:mb-0">
            <p
              className="leading-relaxed"
              style={{ fontSize: 14, color: "#475569", maxWidth: 280 }}
            >
              Hi, I&apos;m Sanket — a creative web developer based in
              Maharashtra.{" "}
              <strong style={{ fontWeight: 600, color: "#1e293b" }}>
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
                className="grid grid-cols-1 md:grid-cols-4 gap-x-6 items-center rounded-sm transition-colors duration-150 hover:bg-white/60"
                style={{
                  padding: "14px 0",
                  borderBottom:
                    i < experiences.length - 1
                      ? "1px solid rgba(148, 163, 184, 0.2)"
                      : "none",
                }}
              >
                {exp.url ? (
                  <a
                    href={exp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 col-span-1 transition-opacity hover:opacity-70"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#1e293b",
                      textDecoration: "none",
                    }}
                  >
                    {exp.company}
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
                  </a>
                ) : (
                  <span
                    className="col-span-1"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#1e293b",
                    }}
                  >
                    {exp.company}
                  </span>
                )}
                <span
                  className="col-span-2"
                  style={{ fontSize: 14, fontWeight: 400, color: "#475569" }}
                >
                  {exp.role}
                </span>
                <span
                  className="col-span-1 text-right"
                  style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}
                >
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
