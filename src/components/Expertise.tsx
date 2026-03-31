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
      className="relative overflow-hidden bg-stone-50 py-20"
      onClick={handleBgClick}
    >
      <GridOverlay />
      <div className="max-w-6xl mx-auto px-6">
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 mb-3">
          <div className="md:col-span-2">
            <span className="uppercase text-xs font-normal text-slate-500 tracking-[1.2px] leading-4">
              EXPERTISE
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div className="border-t border-slate-400/40 mb-12" />

        {/* Content: large intro text + cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-y-8 md:gap-0">
          {/* Large intro text */}
          <div className="md:col-span-2 pr-8">
            <p className="text-[30px] font-normal text-slate-600 leading-[1.625]">
              I blend frontend craft, design thinking, creative animation, and
              web performance{" "}
              <span className="bg-blue-500/[0.18] px-[0.15em] py-[0.05em] rounded-sm box-decoration-clone">
                to ship experiences people love.
              </span>
            </p>
          </div>

          {/* Cards area */}
          <div
            className="md:col-start-3 md:col-span-4 relative flex justify-center"
            data-cursor-target="interests-card"
          >
            <div className="relative w-[448px] min-h-[440px]">
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
                    <div className="flex flex-col items-center justify-center gap-2 w-[200px] p-4">
                      {card.icon}
                      <span className="text-sm font-medium text-slate-800 leading-5">
                        {card.title}
                      </span>
                      <p className="text-center text-[11px] font-normal text-slate-500 leading-[15px]">
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
