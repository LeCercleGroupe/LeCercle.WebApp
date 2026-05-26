import Image from "next/image";

export default function CalendarSvg() {
  return (
    <div style={{ animation: "svgPulse 2s ease-in-out infinite" }}>
      <style>{`
        @keyframes svgPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
      <Image src="/loading-svgs/calendar.svg" alt="Loading" width={120} height={120} unoptimized />
    </div>
  );
}
