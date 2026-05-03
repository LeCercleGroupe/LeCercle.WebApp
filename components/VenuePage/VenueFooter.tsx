import Image from "next/image";
import Link from "next/link";

const VENUES = [
  { key: "bureau", logo: "/logos/LeBureau.svg", slug: "lebureau", tagline: "Cigar lounge cu aer retro și clasic." },
  { key: "maison", logo: "/logos/MaisonDuFeu.svg", slug: "maisondufeu", tagline: "Desert francez servit ca moment live." },
  { key: "perle", logo: "/logos/LaPerle.svg", slug: "laperle", tagline: "Tuktuk cu gelato italian pentru evenimente." },
];

interface VenueFooterProps {
  locale: string;
  activeSlug: string;
}

export default function VenueFooter({ locale, activeSlug }: VenueFooterProps) {
  return (
    <footer className="bg-[#08060a] pt-16 pb-10 px-6">
      {/* Le Cercle branding */}
      <div className="flex flex-col items-center mb-12">
        <Link href={`/${locale}`} className="cursor-pointer">
          <Image
            src="/logos/LeCercle.svg"
            alt="Le Cercle"
            width={140}
            height={52}
            className="w-28 sm:w-32 h-auto opacity-90 hover:opacity-100 transition-opacity"
          />
        </Link>

        {/* Social icons */}
        <div className="flex items-center gap-5 mt-6">
          {[
            { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
            { label: "Instagram", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 20.5h11A3 3 0 0020.5 17.5V6.5A3 3 0 0017.5 3.5h-11A3 3 0 003.5 6.5v11A3 3 0 006.5 20.5z" },
            { label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
            { label: "YouTube", path: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
          ].map((icon) => (
            <button
              key={icon.label}
              aria-label={icon.label}
              className="text-white/35 hover:text-white/70 transition-colors duration-200 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon.path} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* 3 venue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10">
        {VENUES.map((venue) => {
          const isActive = venue.slug === activeSlug;
          return (
            <Link
              key={venue.key}
              href={`/${locale}/${venue.slug}`}
              className={`flex flex-col items-center text-center py-5 px-3 border transition-colors duration-250 cursor-pointer ${
                isActive
                  ? "border-white/20 bg-white/5"
                  : "border-transparent hover:border-white/10"
              }`}
            >
              <Image
                src={venue.logo}
                alt={venue.key}
                width={100}
                height={30}
                className="w-20 h-auto mb-2.5 opacity-90"
              />
              <p className="text-white/40 text-[11px] leading-normal font-figtree">
                {venue.tagline}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Legal bar */}
      <div className="border-t border-white/6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto">
        <p className="text-white/25 text-[12px] font-figtree">
          © 2026 Le Cercle. All rights reserved.
        </p>
        <div className="flex gap-5">
          {["Privacy Policy", "Terms of Service", "Cookies Settings"].map((label) => (
            <button
              key={label}
              className="text-white/25 text-[12px] font-figtree hover:text-white/50 transition-colors duration-200 cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
