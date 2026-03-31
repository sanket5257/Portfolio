"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const WAYPOINTS = [
  { x: 0.7, y: 0.3 },
  { x: 0.5, y: 0.5 },
  { x: 0.3, y: 0.35 },
  { x: 0.45, y: 0.65 },
  { x: 0.65, y: 0.55 },
  { x: 0.55, y: 0.25 },
];

const SCROLL_TARGETS = [
  "about-row",
  "interests-card",
  "projects-row",
  "contact-input",
  "talks-row",
  "footer-linkedin",
];

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function CursorArrow({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
    >
      <path
        d="M0.5 0.5L15 10L8 11L5 19.5L0.5 0.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={0.5}
      />
    </svg>
  );
}

export default function CursorSystem() {
  const [userPos, setUserPos] = useState({ x: -100, y: -100 });
  const [userVisible, setUserVisible] = useState(false);
  const [davidPos, setDavidPos] = useState({ x: 0, y: 0 });
  const [isScrollMode, setIsScrollMode] = useState(false);

  const waypointProgress = useRef(0);
  const currentWaypoint = useRef(0);
  const davidTargetPos = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number>(0);
  const lastTime = useRef(0);

  // User cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setUserPos({ x: e.clientX, y: e.clientY });
      setUserVisible(true);
    };
    const handleMouseLeave = () => setUserVisible(false);
    const handleMouseEnter = () => setUserVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrollMode(window.scrollY > window.innerHeight * 0.3);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // David cursor animation
  const animateDavid = useCallback(
    (timestamp: number) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const delta = timestamp - lastTime.current;
      lastTime.current = timestamp;

      if (isScrollMode) {
        // Follow nearest scroll target
        const viewCenter = window.innerHeight / 2;
        let nearest: HTMLElement | null = null;
        let nearestDist = Infinity;

        for (const id of SCROLL_TARGETS) {
          const el = document.querySelector(
            `[data-cursor-target="${id}"]`
          ) as HTMLElement;
          if (el) {
            const rect = el.getBoundingClientRect();
            const dist = Math.abs(rect.top + rect.height / 2 - viewCenter);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearest = el;
            }
          }
        }

        if (nearest) {
          const rect = nearest.getBoundingClientRect();
          davidTargetPos.current = {
            x: rect.left + rect.width * 0.3,
            y: rect.top + rect.height / 2,
          };
        }

        setDavidPos((prev) => ({
          x: prev.x + (davidTargetPos.current.x - prev.x) * 0.04,
          y: prev.y + (davidTargetPos.current.y - prev.y) * 0.04,
        }));
      } else {
        // Autonomous waypoint movement
        waypointProgress.current += delta * 0.0004;

        if (waypointProgress.current >= 1) {
          waypointProgress.current = 0;
          currentWaypoint.current =
            (currentWaypoint.current + 1) % WAYPOINTS.length;
        }

        const from = WAYPOINTS[currentWaypoint.current];
        const to =
          WAYPOINTS[(currentWaypoint.current + 1) % WAYPOINTS.length];
        const t = smoothstep(waypointProgress.current);

        setDavidPos({
          x: (from.x + (to.x - from.x) * t) * window.innerWidth,
          y: (from.y + (to.y - from.y) * t) * window.innerHeight,
        });
      }

      animFrame.current = requestAnimationFrame(animateDavid);
    },
    [isScrollMode]
  );

  useEffect(() => {
    animFrame.current = requestAnimationFrame(animateDavid);
    return () => cancelAnimationFrame(animFrame.current);
  }, [animateDavid]);

  return (
    <>
      {/* David cursor */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: davidPos.x,
          top: davidPos.y,
          zIndex: 9998,
          transition: "none",
        }}
      >
        <CursorArrow fill="#8b5cf6" stroke="#7c3aed" />
        <div
          className="absolute text-white font-medium rounded-full whitespace-nowrap shadow-sm"
          style={{
            background: "#8b5cf6",
            left: 16,
            top: 16,
            fontSize: 12,
            padding: "2px 8px",
            lineHeight: "16px",
          }}
        >
          Sanket
        </div>
      </div>

      {/* User cursor */}
      {userVisible && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: userPos.x,
            top: userPos.y,
            zIndex: 9999,
          }}
        >
          <CursorArrow fill="#0f172a" stroke="#1e293b" />
          <div
            className="absolute text-white font-medium rounded-full whitespace-nowrap shadow-sm"
            style={{
              background: "#0f172a",
              left: 16,
              top: 16,
              fontSize: 12,
              padding: "2px 8px",
              lineHeight: "16px",
            }}
          >
            You
          </div>
        </div>
      )}
    </>
  );
}
