"use client";

import { useRef, useCallback, useEffect, type ReactNode } from "react";

interface DraggableBlockProps {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onBringToFront?: () => void;
  showHandles?: boolean;
  showPixelToggle?: boolean;
  isPixelated?: boolean;
  onTogglePixel?: () => void;
}

export default function DraggableBlock({
  children,
  className = "",
  isSelected = false,
  onSelect,
  onBringToFront,
  showHandles = true,
  showPixelToggle = false,
  isPixelated = false,
  onTogglePixel,
}: DraggableBlockProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  const updateTransform = useCallback(() => {
    if (elRef.current) {
      elRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    }
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      pos.current = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      };
      updateTransform();
    };

    const onPointerUp = () => {
      isDragging.current = false;
      el.style.cursor = "grab";
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [updateTransform]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onSelect?.();
      onBringToFront?.();
      isDragging.current = true;
      dragStart.current = {
        x: e.clientX - pos.current.x,
        y: e.clientY - pos.current.y,
      };
      if (elRef.current) {
        elRef.current.style.cursor = "grabbing";
      }
    },
    [onSelect, onBringToFront]
  );

  const handlePositions = [
    { top: -3, left: -3 },
    { top: -3, left: "50%", transform: "translateX(-50%)" },
    { top: -3, right: -3 },
    { top: "50%", left: -3, transform: "translateY(-50%)" },
    { top: "50%", right: -3, transform: "translateY(-50%)" },
    { bottom: -3, left: -3 },
    { bottom: -3, left: "50%", transform: "translateX(-50%)" },
    { bottom: -3, right: -3 },
  ];

  return (
    <div
      ref={elRef}
      className={`relative ${className}`}
      style={{
        cursor: "grab",
        outline: `1px solid ${isSelected ? "#3b82f6" : "transparent"}`,
        padding: "4px",
        borderRadius: "2px",
        userSelect: "none",
        zIndex: isSelected ? 10 : 1,
      }}
      onPointerDown={handlePointerDown}
      onClick={(e) => e.stopPropagation()}
    >
      {children}

      {/* "Text" label - top-left */}
      {isSelected && (
        <div
          className="absolute"
          style={{
            top: -18,
            left: 0,
            fontSize: 10,
            fontWeight: 500,
            color: "white",
            background: "#3b82f6",
            padding: "2px 6px",
            borderRadius: 4,
            lineHeight: "14px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Text
        </div>
      )}

      {/* Pixel toggle - bottom-right */}
      {isSelected && showPixelToggle && (
        <div
          className="absolute flex items-center gap-1"
          style={{
            bottom: -22,
            right: 0,
            fontSize: 10,
            fontWeight: 500,
            color: "white",
            background: "#3b82f6",
            padding: "2px 6px",
            borderRadius: 4,
            lineHeight: "14px",
            zIndex: 10,
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePixel?.();
          }}
        >
          {/* Normal circle icon */}
          <svg width="10" height="10" viewBox="0 0 10 10" style={{ opacity: isPixelated ? 0.4 : 0.9 }}>
            <circle cx="5" cy="5" r="4" fill="white" />
          </svg>

          {/* Toggle track */}
          <div
            className="relative"
            style={{
              width: 24,
              height: 12,
              borderRadius: 9999,
              background: isPixelated
                ? "rgba(255,255,255,0.8)"
                : "rgba(255,255,255,0.3)",
              transition: "background 0.15s",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 2,
                left: isPixelated ? 14 : 2,
                width: 8,
                height: 8,
                borderRadius: 9999,
                background: "#3b82f6",
                transition: "left 0.15s",
              }}
            />
          </div>

          {/* Pixel icon */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{ opacity: isPixelated ? 0.9 : 0.4 }}
            shapeRendering="crispEdges"
          >
            <rect x="3" y="1" width="4" height="2" fill="white" />
            <rect x="1" y="3" width="2" height="4" fill="white" />
            <rect x="7" y="3" width="2" height="4" fill="white" />
            <rect x="3" y="7" width="4" height="2" fill="white" />
          </svg>
        </div>
      )}

      {/* Resize handles - 6x6, blue fill, white border, square */}
      {showHandles && isSelected && (
        <>
          {handlePositions.map((style, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: 6,
                height: 6,
                background: "#3b82f6",
                border: "1px solid white",
                borderRadius: 0,
                pointerEvents: "none",
                ...style,
              } as React.CSSProperties}
            />
          ))}
        </>
      )}
    </div>
  );
}
