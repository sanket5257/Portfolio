"use client";

import { useState, useEffect, useCallback } from "react";
import DraggableBlock from "./DraggableBlock";
import GridOverlay from "./GridOverlay";
import { useIsMobile } from "@/hooks/useIsMobile";

interface PixelState {
  sanket: boolean;
  chougule: boolean;
}

export default function Hero() {
  const isMobile = useIsMobile();
  const [pixelated, setPixelated] = useState<PixelState>({
    sanket: true,
    chougule: false,
  });
  const [shaking, setShaking] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>("chougule");
  const [zOrder, setZOrder] = useState({
    sanket: 1,
    chougule: 3,
    bio: 4,
  });
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [weather, setWeather] = useState<string | null>(null);
  const [collabOn, setCollabOn] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(now);
      const istDate = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(now);
      setTime(istTime);
      setDate(istDate);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current_weather=true&temperature_unit=celsius"
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.current_weather) {
          setWeather(`${Math.round(data.current_weather.temperature)}°C`);
        }
      })
      .catch(() => {});
  }, []);

  const togglePixel = useCallback((key: keyof PixelState) => {
    setShaking((prev) => new Set(prev).add(key));
    setTimeout(() => {
      setPixelated((prev) => ({ ...prev, [key]: !prev[key] }));
      setTimeout(() => {
        setShaking((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 150);
    }, 150);
  }, []);

  const bringToFront = useCallback(
    (key: string) => {
      const maxZ = Math.max(...Object.values(zOrder));
      setZOrder((prev) => ({ ...prev, [key]: maxZ + 1 }));
    },
    [zOrder]
  );

  const handleBgClick = useCallback(() => {
    setSelected(null);
  }, []);

  const renderHeading = (
    key: keyof PixelState,
    text: string,
    top: string,
    left: string
  ) => {
    const isPixelated = pixelated[key];
    const isShaking = shaking.has(key);

    return (
      <div
        className="absolute select-none touch-none"
        style={{ top, left, zIndex: zOrder[key] }}
      >
        <DraggableBlock
          isSelected={selected === key}
          onSelect={() => setSelected(key)}
          onBringToFront={() => bringToFront(key)}
          className={isShaking ? "animate-shake" : ""}
          showPixelToggle={true}
          isPixelated={isPixelated}
          onTogglePixel={() => togglePixel(key)}
        >
          <h1
            className="uppercase select-none whitespace-nowrap"
            style={{
              fontFamily: isPixelated
                ? "var(--font-pixel)"
                : "var(--font-sans)",
              fontWeight: isPixelated ? 400 : 300,
              fontSize: "clamp(48px, 9vw, 128px)",
              lineHeight: "1",
              letterSpacing: isPixelated ? "normal" : "-0.025em",
              color: isPixelated ? "#f97316" : "#0f172a",
            }}
          >
            {text}
          </h1>
        </DraggableBlock>
      </div>
    );
  };

  return (
    <section
      className="fixed inset-0 z-[1] overflow-hidden"
      style={{ background: "#f5f5f4", cursor: isMobile ? "auto" : "none" }}
      onClick={handleBgClick}
    >
      <GridOverlay />

      {/* Top bar - time/weather */}
      <div
        className="absolute z-50 flex flex-col gap-0.5"
        style={{ top: 16, left: 16 }}
      >
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium" style={{ color: "#475569" }}>
            MH, IN
          </span>
          <span style={{ color: "#64748b" }}>
            {time} . {date}
          </span>
        </div>
        {weather && (
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: "#64748b" }}
          >
            <span>{weather}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
        )}
      </div>

      {/* Collaboration toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCollabOn(!collabOn);
        }}
        className="absolute z-50 flex items-center gap-1.5 rounded-full"
        style={{
          top: 16,
          right: 16,
          border: "1px solid #94a3b8",
          color: "#64748b",
          background: "transparent",
          padding: "6px 12px",
          fontSize: 12,
          fontWeight: 500,
          lineHeight: "16px",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Collaboration {collabOn ? "on" : "off"}
      </button>

      {/* SANKET */}
      {renderHeading("sanket", "SANKET", isMobile ? "25%" : "30%", isMobile ? "5%" : "28%")}

      {/* CHOUGULE - indented */}
      {renderHeading("chougule", "CHOUGULE", isMobile ? "35%" : "44%", isMobile ? "5%" : "32%")}

      {/* Bio text - draggable */}
      <div
        className="absolute select-none touch-none"
        style={{
          top: isMobile ? "48%" : "28%",
          left: isMobile ? "5%" : "62%",
          zIndex: zOrder.bio,
        }}
      >
        <DraggableBlock
          isSelected={selected === "bio"}
          onSelect={() => setSelected("bio")}
          onBringToFront={() => bringToFront("bio")}
          showPixelToggle={false}
        >
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "#475569",
              maxWidth: isMobile ? "85vw" : 320,
            }}
          >
            Creative web developer. I craft immersive, visually captivating
            digital experiences with clean code, smooth animations, and
            pixel-perfect UI.
          </p>
        </DraggableBlock>
      </div>

      {/* CTA */}
      <div
        className="absolute flex flex-col items-center gap-2"
        style={{
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 5,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            const el = document.getElementById("about");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-white rounded-full shadow-md flex items-center justify-center"
          style={{
            background: "#0f172a",
            fontSize: 14,
            fontWeight: 500,
            padding: "8px 24px",
            lineHeight: "20px",
            whiteSpace: "nowrap",
          }}
        >
          Get to know me
        </button>
        <div
          className="flex items-center gap-1.5"
          style={{ fontSize: 12, color: "#64748b" }}
        >
          <span>Or scroll down</span>
          <svg
            className="animate-bounce-arrow"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
