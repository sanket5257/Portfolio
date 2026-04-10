"use client";

import GridOverlay from "./GridOverlay";

const talks = [
  {
    source: "YouTube Live (Product Makers)",
    title:
      "The new role of the product designer in the vibe-coding era",
    url: "https://youtube.com",
  },
  {
    source: "LinkedIn Live (Interactius)",
    title: "I monetized an experiment with Lovable",
    url: "https://linkedin.com",
  },
  {
    source: "Panel (La Product Conf)",
    title: "The art of strategic monetization",
    url: "https://youtube.com",
  },
  {
    source: "Talk (Lanzadera, ISDI, Tramontana)",
    title: "Entrepreneurship from the product perspective",
    url: null,
  },
  {
    source: "Interview",
    title: "From UX Designer to Entrepreneur",
    url: "https://interactius.com",
  },
  {
    source: "Startup advisor",
    title: "Tetuan Valley Startup School",
    url: "https://tetuanvalley.com",
  },
  {
    source: "Visiting Lecturer (Design & UX)",
    title: "Master's programs",
    url: null,
  },
];

export default function Talks() {
  return (
    <section
      className="relative"
      style={{ background: "#fafaf9", padding: "80px 0" }}
    >
      <GridOverlay />
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 24px" }}>
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 mb-1">
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
              TALKS, INTERVIEWS & ARTICLES
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div
          className="mb-12"
          style={{ borderTop: "1px solid rgba(148, 163, 184, 0.4)" }}
        />

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6">
          <div className="md:col-span-2" />

          <div className="md:col-span-4">
            {talks.map((talk, i) => (
              <div
                key={i}
                data-cursor-target="talks-row"
                className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-1 md:gap-y-0 items-center rounded-sm transition-colors duration-150 hover:bg-white/60"
                style={{
                  padding: "14px 0",
                  borderBottom:
                    i < talks.length - 1
                      ? "1px solid rgba(148, 163, 184, 0.2)"
                      : "none",
                }}
              >
                <span
                  className="col-span-1"
                  style={{ fontSize: 14, fontWeight: 400, color: "#475569" }}
                >
                  {talk.source}
                </span>
                {talk.url ? (
                  <a
                    href={talk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 col-span-1 md:col-span-3"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#1e293b",
                      textDecoration: "none",
                    }}
                  >
                    {talk.title}
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
                    className="col-span-1 md:col-span-3"
                    style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}
                  >
                    {talk.title}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
