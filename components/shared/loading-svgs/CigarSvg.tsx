import Image from "next/image";

export default function CigarSvg() {
  return (
    <div style={{ animation: "iconSpin 3s linear infinite" }}>
      <style>{`
        @keyframes iconSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Image src="/loading-svgs/whisky.png" alt="Loading" width={120} height={120} />
    </div>
  );
}
