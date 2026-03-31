"use client";

export default function GridOverlay() {
  return (
    <div className="grid-overlay hidden md:flex">
      <div className="grid-overlay-inner">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid-overlay-col" />
        ))}
      </div>
    </div>
  );
}
