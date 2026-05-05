import Image from "next/image";
import Link from "next/link";
import { phone } from "@/data/venues/constants/links";

const VENUES = [
  { key: "bureau", logo: "/logos/LeBureau.svg", slug: "lebureau", tagline: "Cigar lounge cu aer retro și clasic." },
  { key: "maison", logo: "/logos/MaisonDuFeu.svg", slug: "maisondufeu", tagline: "Desert francez servit ca moment live." },
  { key: "perle", logo: "/logos/LaPerle.svg", slug: "laperle", tagline: "Tuktuk cu gelato italian pentru evenimente." },
];

interface VenueFooterProps {
  locale: string;
  activeSlug: string;
  social?: {
    instagram?: string;
    facebook?: string;
  };
}

export default function VenueFooter({ locale, activeSlug, social }: VenueFooterProps) {
  const socialLinks = [
    {
      label: "Facebook",
      href: social?.facebook ?? "#",
      path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
    },
    {
      label: "Instagram",
      href: social?.instagram ?? "#",
      path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 20.5h11A3 3 0 0020.5 17.5V6.5A3 3 0 0017.5 3.5h-11A3 3 0 003.5 6.5v11A3 3 0 006.5 20.5z",
    },
    {
      label: "Phone",
      href: `tel:${phone}`,
      path: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.67 9.5a19.79 19.79 0 01-3.07-8.7A2 2 0 012.56 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 9.4a16 16 0 006.22 6.22l.88-.88a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z",
    },
  ];

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
          {socialLinks.map((icon) => (
            <Link
              key={icon.label}
              href={icon.href}
              target={icon.href.startsWith("tel:") ? undefined : "_blank"}
              rel={icon.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
              aria-label={icon.label}
              className="text-white/35 hover:text-white/70 transition-colors duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon.path} />
              </svg>
            </Link>
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
