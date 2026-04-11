"use client";

import { useState } from "react";
import Image from "next/image";
import DraggableBlock from "./DraggableBlock";
import { useIsMobile } from "@/hooks/useIsMobile";

const photos = [
  // {
  //   src: "/images/david-speaking.jpg",
  //   alt: "Speaking at a conference",
  //   width: 220,
  //   height: 220,
  //   style: { top: "10%", left: "55%" },
  // },
  {
    src: "/images/teide.png",
    alt: "Teide volcano landscape",
    width: 140,
    height: 140,
    style: { top: "25%", left: "72%" },
  },
  {
    src: "/images/playa.png",
    alt: "Rocky beach coastline",
    width: 140,
    height: 140,
    style: { top: "50%", left: "60%" },
  },
  {
    src: "/images/nyc.png",
    alt: "Empire State Building at night",
    width: 140,
    height: 140,
    style: { top: "15%", left: "85%" },
  },
  // {
  //   src: "/images/food.png",
  //   alt: "Enjoying food by the beach",
  //   width: 140,
  //   height: 140,
  //   style: { top: "55%", left: "80%" },
  // },
];

export default function Footer() {
  const isMobile = useIsMobile();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="relative"
      style={{
        background: "#0a0a0a",
        minHeight: isMobile ? "auto" : "70vh",
      }}
    >
      {/* Marquee */}
      <div className="overflow-hidden pt-10">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span
                className="uppercase font-light text-white"
                style={{
                  fontSize: isMobile
                    ? "clamp(40px, 12vw, 72px)"
                    : "clamp(72px, 12vw, 160px)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "-0.025em",
                }}
              >
                Sanket Chougule
              </span>
              <span
                className="mx-[0.3em]"
                style={{
                  color: "rgba(255, 255, 255, 0.3)",
                  fontSize: isMobile
                    ? "clamp(40px, 12vw, 72px)"
                    : "clamp(72px, 12vw, 160px)",
                }}
              >
                &middot;
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Photos - draggable (hidden on mobile) */}
      {!isMobile && (
        <div className="relative w-full" style={{ minHeight: "40vh" }}>
          {photos.map((photo, i) => (
            <div
              key={i}
              className="absolute pointer-events-auto"
              style={photo.style}
            >
              <DraggableBlock
                isSelected={selectedPhoto === i}
                onSelect={() => setSelectedPhoto(i)}
                showHandles={selectedPhoto === i}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className="rounded-sm object-cover"
                  style={{ width: photo.width, height: photo.height }}
                  draggable={false}
                />
              </DraggableBlock>
            </div>
          ))}
        </div>
      )}

      {/* Footer nav */}
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: isMobile ? "0 20px" : "0 24px",
          paddingBottom: isMobile ? "24px" : "0",
        }}
      >
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0"
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "20px 0 24px",
          }}
        >
          <div className="flex items-center gap-3 md:gap-6 flex-wrap">
            <a
              href="https://www.linkedin.com/in/sanket-chougule5257"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-target="footer-linkedin"
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              LinkedIn
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-60"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
            <a
              href="https://dribbble.com/sanket-chougule"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              Dribbble
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-60"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
            <a
              href="https://github.com/sanket5257"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              GitHub
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-60"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/ft.leo_o"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1"
            >
              Instagram
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-60"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
            <a
              href="mailto:chougulesanket30@gmail.com"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Email
            </a>
            <a
              href="#contact"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <button
              onClick={scrollToTop}
              className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              Back to top
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
            <span className="text-xs text-white/40 whitespace-nowrap">
              &copy; 2026 Sanket Chougule
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
