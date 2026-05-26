export default function PersonSvg() {
  return (
    <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
      <style>{`
        @keyframes personPulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.85; }
        }
      `}</style>

      <g stroke="#888" strokeWidth="1.5" fill="none"
        style={{ animation: "personPulse 2s ease-in-out infinite" }}>
        <circle cx="40" cy="28" r="18" />
        <path d="M6 96 C6 72 18 60 40 60 C62 60 74 72 74 96" strokeLinecap="round" />
      </g>
    </svg>
  );
}
