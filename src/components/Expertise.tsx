"use client";

import { useState, useCallback } from "react";
import DraggableBlock from "./DraggableBlock";
import GridOverlay from "./GridOverlay";

const expertiseCards = [
  {
    id: "frontend-dev",
    title: "Frontend Development",
    description:
      "I build fast, responsive interfaces with React.js, Next.js, and Tailwind CSS — clean code that scales.",
    top: 0,
    left: 0,
    icon: (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#0f172a" strokeWidth="1.5">
        <circle cx="30" cy="30" r="18" />
        <ellipse cx="30" cy="30" rx="28" ry="8" />
        <path d="M42 18l4-4M18 42l-4 4" />
        <circle cx="30" cy="12" r="2" fill="#0f172a" />
      </svg>
    ),
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "I craft pixel-perfect interfaces in Figma, balancing usability, aesthetics, and visual polish.",
    top: 0,
    left: 248,
    icon: (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#0f172a" strokeWidth="1.5">
        <rect x="10" y="10" width="40" height="40" rx="2" />
        <circle cx="10" cy="10" r="3" fill="#0f172a" />
        <circle cx="50" cy="10" r="3" fill="#0f172a" />
        <circle cx="10" cy="50" r="3" fill="#0f172a" />
        <circle cx="50" cy="50" r="3" fill="#0f172a" />
        <line x1="30" y1="22" x2="30" y2="38" />
        <line x1="22" y1="30" x2="38" y2="30" />
      </svg>
    ),
  },
  {
    id: "animations",
    title: "Creative Animations",
    description:
      "I use GSAP and Framer Motion to create cinematic, scroll-driven animations that captivate users.",
    top: 237,
    left: 0,
    icon: (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#0f172a" strokeWidth="1.5">
        <ellipse cx="30" cy="20" rx="20" ry="8" />
        <ellipse cx="30" cy="30" rx="20" ry="8" />
        <ellipse cx="30" cy="40" rx="20" ry="8" />
      </svg>
    ),
  },
  {
    id: "web-performance",
    title: "Web Performance",
    description:
      "I optimize for speed and SEO with server-side rendering, code splitting, and modern best practices.",
    top: 221,
    left: 248,
    icon: (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#0f172a" strokeWidth="1.5">
        <rect x="8" y="14" width="30" height="30" rx="4" />
        <rect x="22" y="16" width="30" height="30" rx="4" />
        <circle cx="37" cy="31" r="6" fill="none" />
      </svg>
    ),
  },
];

export default function Expertise() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleBgClick = useCallback(() => {
    setSelectedCard(null);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#fafaf8", padding: "80px 0" }}
      onClick={handleBgClick}
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
              EXPERTISE
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div
          style={{
            borderTop: "1px solid rgba(148, 163, 184, 0.4)",
            marginBottom: 48,
          }}
        />

        {/* Content: large intro text + cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-y-8 md:gap-0">
          {/* Large intro text - cols 1-2 */}
          <div className="md:col-span-2" style={{ paddingRight: 32 }}>
            <p
              style={{
                fontSize: 30,
                fontWeight: 400,
                color: "#475569",
                lineHeight: 1.625,
              }}
            >
              I blend frontend craft, design thinking, creative animation, and
              web performance{" "}
              <span
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.18)",
                  padding: "0.05em 0.15em",
                  borderRadius: 2,
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                }}
              >
                to ship experiences people love.
              </span>
            </p>
          </div>

          {/* Cards area - cols 3-6, centered */}
          <div
            className="md:col-start-3 md:col-span-4 relative flex justify-center"
            data-cursor-target="interests-card"
          >
            <div className="relative" style={{ width: 448, minHeight: 440 }}>
              {expertiseCards.map((card) => (
                <div
                  key={card.id}
                  className="absolute select-none touch-none"
                  style={{
                    top: card.top,
                    left: card.left,
                    zIndex: selectedCard === card.id ? 10 : 1,
                  }}
                >
                  <DraggableBlock
                    isSelected={selectedCard === card.id}
                    onSelect={() => setSelectedCard(card.id)}
                    showHandles={true}
                    showPixelToggle={false}
                  >
                    <div
                      className="flex flex-col items-center justify-center gap-2"
                      style={{ width: 200, padding: 16 }}
                    >
                      {card.icon}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#1e293b",
                          lineHeight: "20px",
                        }}
                      >
                        {card.title}
                      </span>
                      <p
                        className="text-center"
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: "#64748b",
                          lineHeight: "15px",
                        }}
                      >
                        {card.description}
                      </p>
                    </div>
                  </DraggableBlock>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
