import Link from "next/link";
import type { VideoScreen, TextPart } from "@/components/VenuePage/types";

function renderBody(parts: TextPart[], accentColor: string) {
  return parts.map((part, i) =>
    part.t === "italic-accent" ? (
      <em key={i} className="italic" style={{ color: accentColor }}>
        {part.text}
      </em>
    ) : (
      <span key={i}>{part.text}</span>
    ),
  );
}

interface SceneOutroProps {
  screen: VideoScreen;
  accentColor: string;
}

export default function SceneOutro({ screen, accentColor }: SceneOutroProps) {
  return (
    <div className="relative bg-black py-[14vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Top gradient — blends from the video above */}
      <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/55 to-transparent pointer-events-none" />
      {/* Bottom gradient — softens into the section below */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/55 to-transparent pointer-events-none" />

      <div className="relative w-[80%] max-w-2xl text-center">
        {screen.body && (
          <p className="text-white/90 text-[17px] sm:text-[21px] leading-[1.85] font-figtree font-light">
            {renderBody(screen.body, accentColor)}
          </p>
        )}

        {screen.cta && (
          <Link
            href={screen.cta.href}
            className="mt-8 inline-flex items-center justify-center px-7 py-3 text-[11px] tracking-[0.16em] uppercase text-white/70 hover:text-white font-figtree relative transition-colors duration-250 group cursor-pointer"
          >
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/38 group-hover:border-white/75 transition-[border-color] duration-250" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/38 group-hover:border-white/75 transition-[border-color] duration-250" />
            <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/38 group-hover:border-white/75 transition-[border-color] duration-250" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/38 group-hover:border-white/75 transition-[border-color] duration-250" />
            {screen.cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
