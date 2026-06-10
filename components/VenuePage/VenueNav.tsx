"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadAuth } from "@/components/BookingFlow/utils/auth";

const LOCALES = ["ro", "en", "ru"] as const;

interface VenueNavProps {
  locale: string;
  contactLabel: string;
  langLabel: string;
}

export default function VenueNav({
  locale,
  contactLabel,
  langLabel,
}: VenueNavProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const result = loadAuth();
    if (result) {
      const { auth } = result;
      const initials = `${auth.user.firstName?.[0] ?? ""}${auth.user.lastName?.[0] ?? ""}`.toUpperCase();
      setUserInitials(initials || "U");
    } else {
      setUserInitials(null);
    }
  }, [pathname]);

  function switchLocale(next: string) {
    setLangOpen(false);
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"), { scroll: false });
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5 sm:px-9 sm:py-6 mix-blend-difference">
      <Link
        href={`/${locale}`}
        className="opacity-70 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
      >
        <Image
          src="/logos/LeCercle.svg"
          alt="Le Cercle"
          width={80}
          height={29}
          className="h-8 w-auto"
        />
      </Link>

      <div className="flex items-center gap-4">
        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="bg-transparent border-0 text-gray-100 text-[13px] tracking-widest cursor-pointer flex items-center gap-1.5 uppercase font-figtree"
          >
            {langLabel}
            <span
              className={`text-[9px] opacity-65 transition-transform duration-200 inline-block ${langOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {langOpen && (
            <div className="absolute top-full right-0 mt-2 flex flex-col gap-0.5 backdrop-blur-md bg-black/55 py-1.5">
              {LOCALES.filter((l) => l !== locale).map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className="bg-transparent border-0 text-white/72 text-[13px] tracking-widest cursor-pointer px-4.5 py-1.5 text-left uppercase transition-colors duration-200 hover:text-white font-figtree"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contact CTA only for desktop */}
        <Link
          href={`/${locale}/booking`}
          className="group border-0 bg-gray-100/10 text-gray-100 text-[11px] tracking-[0.14em] cursor-pointer px-4 py-2 transition-all duration-250 relative hover:bg-gray-100/30 hover:text-white font-figtree hidden sm:block"
        >
          <span className="absolute top-0 left-0 w-3 h-2 border-t border-l border-gray-100/70" />
          <span className="absolute top-0 right-0 w-3 h-2 border-t border-r border-gray-100/70" />
          <span className="absolute bottom-0 left-0 w-3 h-2 border-b border-l border-gray-100/70" />
          <span className="absolute bottom-0 right-0 w-3 h-2 border-b border-r border-gray-100/70" />
          {contactLabel}
        </Link>

        {/* User account circle */}
        <Link
          href={userInitials ? `/${locale}/account` : `/${locale}/account/login`}
          className="size-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 border border-white/20 hover:border-white/50"
          style={{ backgroundColor: userInitials ? "rgba(196,151,63,0.85)" : "rgba(255,255,255,0.1)" }}
        >
          {userInitials ? (
            <span className="text-[10px] font-semibold text-[#0d0d0d] font-figtree leading-none">{userInitials}</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          )}
        </Link>
      </div>
    </nav>
  );
}
