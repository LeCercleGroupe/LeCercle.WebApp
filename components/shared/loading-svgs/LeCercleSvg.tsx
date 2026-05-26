import Image from "next/image";

export default function LeCercleSvg() {
  return (
    <div style={{ animation: "lecerclePulse 2s ease-in-out infinite" }}>
      <style>{`
        @keyframes lecerclePulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
      `}</style>
      <Image src="/logos/LeCercle.svg" alt="Le Cercle" width={160} height={60} priority />
    </div>
  );
}
