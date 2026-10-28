// Hand-drawn SVG marks used across the HUD.

export function Logo({ className, ...p }) {
  // Monogram: an "S" folded from two rounded brackets.
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} {...p}>
      <path
        d="M30 9.5H15.5a6 6 0 0 0-6 6v1.5a6 6 0 0 0 6 6h9a6 6 0 0 1 6 6v1.5a6 6 0 0 1-6 6H10"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M30 3.5v8M10 28.5v8" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function SoundIcon({ on, className }) {
  const bars = [3, 7, 11, 7, 4, 9, 5];
  return (
    <svg viewBox="0 0 28 16" className={className} fill="currentColor">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={8 - h / 2}
          width="1.4"
          height={h}
          rx=".7"
          style={{
            transformOrigin: `${i * 4 + 0.7}px 8px`,
            animation: on ? `eqbar ${0.6 + (i % 3) * 0.17}s ${i * 0.07}s ease-in-out infinite alternate` : "none",
            transform: on ? undefined : "scaleY(.35)",
            transition: "transform .4s",
          }}
        />
      ))}
    </svg>
  );
}

export function MenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 4" className={className} fill="currentColor">
      <circle cx="2" cy="2" r="1.6" />
      <circle cx="12" cy="2" r="1.6" />
      <circle cx="22" cy="2" r="1.6" />
    </svg>
  );
}

export function ArrowDR({ className }) {
  return (
    <svg viewBox="0 0 10 10" className={className} fill="none">
      <path d="M1.5 1.5L8.5 8.5M8.5 3v5.5H3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function Spark({ className }) {
  return (
    <svg viewBox="0 0 22 44" className={className} fill="currentColor">
      <path d="M11 0c.6 13 2.4 20 11 22-8.6 2-10.4 9-11 22-.6-13-2.4-20-11-22C8.6 20 10.4 13 11 0z" />
    </svg>
  );
}

export function Planet({ className }) {
  return (
    <svg viewBox="0 0 18 18" className={className} fill="none" stroke="currentColor" strokeWidth=".9">
      <circle cx="9" cy="9" r="5.2" />
      <ellipse cx="9" cy="9" rx="8.4" ry="2.6" transform="rotate(-25 9 9)" />
    </svg>
  );
}

export function DotsGrid({ className }) {
  return (
    <svg viewBox="0 0 18 10" className={className} fill="currentColor">
      {[0, 1, 2].map((c) => [0, 1].map((r) => <circle key={`${c}${r}`} cx={2 + c * 7} cy={2 + r * 6} r="1.1" />))}
    </svg>
  );
}

export function Layers({ className }) {
  return (
    <svg viewBox="0 0 60 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M30 4L56 16 30 28 4 16z" />
      <path d="M4 22l26 12 26-12" />
      <path d="M4 28l26 12 26-12" opacity=".6" />
    </svg>
  );
}

export function Rings({ className }) {
  return (
    <svg viewBox="0 0 26 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="9" cy="8" r="6.4" />
      <circle cx="17" cy="8" r="6.4" />
    </svg>
  );
}

export function Chevrons({ className }) {
  return (
    <svg viewBox="0 0 11 11" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M2 2l3.5 3.5L2 9M6 2l3.5 3.5L6 9" />
    </svg>
  );
}

// Deterministic barcode generated from a string, so it reads as "data" not decoration.
export function Barcode({ value = "PORTFOLIO", className }) {
  const bars = [];
  let x = 0;
  for (let i = 0; i < 46; i++) {
    const c = value.charCodeAt(i % value.length) * (i + 3);
    const w = 1 + (c % 3);
    if (i % 2 === 0) bars.push(<rect key={i} x={x} y="0" width={w} height="48" />);
    x += w + 0.6;
  }
  return (
    <svg viewBox={`0 0 ${x} 48`} preserveAspectRatio="none" className={className} fill="currentColor">
      {bars}
    </svg>
  );
}

export function SocialIcon({ name, className }) {
  if (name === "github")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
      </svg>
    );
  if (name === "x")
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4 4l16 16M20 4L4 20" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M8 10v7M8 7v.01M12 17v-7M12 13c0-2 1-3 2.5-3S17 11 17 13v4" />
    </svg>
  );
}
