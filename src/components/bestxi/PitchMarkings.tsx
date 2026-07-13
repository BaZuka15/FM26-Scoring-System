export function PitchMarkings() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="100" height="100" fill="var(--pitch)" />
      {/* subtle mown-stripe texture */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="0" y={i * 12.5} width="100" height="12.5" fill={i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"} />
      ))}

      <g stroke="var(--pitch-line)" strokeWidth="0.4" fill="none">
        <rect x="3" y="2" width="94" height="96" rx="0.5" />
        <line x1="3" y1="50" x2="97" y2="50" />
        <circle cx="50" cy="50" r="9" />
        <circle cx="50" cy="50" r="0.6" fill="var(--pitch-line)" />

        {/* attacking third box */}
        <rect x="25" y="2" width="50" height="15" />
        <rect x="38" y="2" width="24" height="6" />
        <path d="M 40 17 Q 50 24 60 17" />
        <circle cx="50" cy="12" r="0.6" fill="var(--pitch-line)" />

        {/* defensive third box */}
        <rect x="25" y="83" width="50" height="15" />
        <rect x="38" y="92" width="24" height="6" />
        <path d="M 40 83 Q 50 76 60 83" />
        <circle cx="50" cy="88" r="0.6" fill="var(--pitch-line)" />

        {/* corner arcs */}
        <path d="M 3 4.5 Q 5.5 4.5 5.5 2" />
        <path d="M 97 4.5 Q 94.5 4.5 94.5 2" />
        <path d="M 3 95.5 Q 5.5 95.5 5.5 98" />
        <path d="M 97 95.5 Q 94.5 95.5 94.5 98" />
      </g>
    </svg>
  );
}
