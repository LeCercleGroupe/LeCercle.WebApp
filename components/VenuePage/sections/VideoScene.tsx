"use client";

import type {
  TextPart,
  VideoScene as VideoSceneProps,
} from "@/components/VenuePage/types";

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

function textAlignClass(pos?: "left" | "right" | "center") {
  if (pos === "right") return "left-1/2 -translate-x-1/2 text-center sm:left-auto sm:translate-x-0 sm:right-[8%] sm:text-right";
  if (pos === "center") return "left-1/2 -translate-x-1/2 text-center";
  return "left-1/2 -translate-x-1/2 text-center sm:translate-x-0 sm:left-[8%] sm:text-left";
}

interface Props extends VideoSceneProps {
  accentColor: string;
}

export default function VideoScene({ video, screens, accentColor }: Props) {
  const count = screens.length;

  return (
    /*
     * One extra 100dvh is prepended so the user sees the full video
     * on arrival before any text appears.
     */
    <div
      className="relative bg-[#08060a]"
      style={{ height: `${(count + 2) * 100}dvh` }}
    >
      {/* ── Sticky video ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 h-lvh overflow-hidden">
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Cinematic top + mid gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_38%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* ── Text screens — scroll over the sticky video ───────────────── */}
      <div className="mt-[-100lvh] relative z-10">
        {/* Fade mask: pins to viewport top, dissolves text before it exits */}
        <div className="sticky top-0 h-0 overflow-visible z-10 pointer-events-none">
          <div className="h-[20vh] sm:h-[30vh] bg-linear-to-b from-[#08060a] to-transparent" />
        </div>

        {/* Empty landing screen — full video visible, no text */}
        <div className="h-lvh" />

        {screens.map((screen, i) => (
          <div key={i} className="h-lvh relative pointer-events-none">
            {/* Per-screen section heading (mid-section titles) */}
            {screen.sectionHeading && (
              <div className="absolute top-[13%] left-1/2 -translate-x-1/2 w-full text-center px-6">
                <h2 className="text-white text-[20px] sm:text-[32px] font-normal leading-[1.3]">
                  {screen.sectionHeading}
                </h2>
              </div>
            )}
            

            {/* Body text block */}
            {screen.body && (
              <div
                className={`absolute top-[25%] w-full sm:max-w-87.5 pointer-events-auto ${textAlignClass(screen.textPosition)}`}
              >
                <p className="text-white/88 text-[15px] sm:text-[17px] leading-[1.85] font-normal">
                  {renderBody(screen.body, accentColor)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
