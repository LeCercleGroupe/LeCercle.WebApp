import type {
  ClosingCtaSection as ClosingCtaSectionProps,
  TextPart,
} from "@/components/VenuePage/types";
import Image from "next/image";
import Link from "next/link";

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

interface Props extends ClosingCtaSectionProps {
  accentColor: string;
  logo: string;
  name: string;
}

export default function ClosingCtaSection({
  background,
  showLogo,
  body,
  cta,
  accentColor,
  logo,
  name,
}: Props) {
  const isDark = background === "dark";

  return (
    <section
      className={`py-28 px-6 text-center ${isDark ? "bg-[#08060a]" : "bg-white"}`}
    >
      <div className="max-w-2xl mx-auto">
        {showLogo && (
          <Image
            src={logo}
            alt={name}
            width={200}
            height={60}
            className={`w-72 sm:w-80 h-auto mx-auto mb-10 ${isDark ? "opacity-90" : "invert opacity-75"}`}
          />
        )}

        <p
          className={`text-[17px] sm:text-[19px] leading-[1.75] font-figtree font-light mb-10 ${
            isDark ? "text-white/80" : "text-[#1a1208]/80"
          }`}
        >
          {renderBody(body, accentColor)}
        </p>

        <Link
          href={cta.href}
          className="group relative inline-flex items-center px-8 py-3.5 text-[11px] tracking-[0.18em] uppercase font-figtree transition-colors duration-250 cursor-pointer"
          style={{
            color: isDark ? "rgba(255,255,255,0.75)" : accentColor,
          }}
        >
          <span
            className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l transition-[border-color] duration-250"
            style={{ borderColor: `${accentColor}70` }}
          />
          <span
            className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r transition-[border-color] duration-250"
            style={{ borderColor: `${accentColor}70` }}
          />
          <span
            className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l transition-[border-color] duration-250"
            style={{ borderColor: `${accentColor}70` }}
          />
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r transition-[border-color] duration-250"
            style={{ borderColor: `${accentColor}70` }}
          />
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
