"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const LOCALES = ["ro", "en", "ru"] as const;

interface VenueNavProps {
  locale: string;
  contactLabel: string;
  langLabel: string;
}

export default function VenueNav({ locale, contactLabel, langLabel }: VenueNavProps) {
  const [langOpen, setLangOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    setLangOpen(false);
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"), { scroll: false });
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-5 sm:px-9 sm:py-6">
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
        <button className="group border-0 bg-gray-100/10 text-gray-100 text-[11px] tracking-[0.14em] cursor-pointer px-4 py-2 transition-all duration-250 relative hover:bg-gray-100/30 hover:text-white font-figtree hidden sm:block">
          <span className="absolute top-0 left-0 w-3 h-2 border-t border-l border-gray-100/70" />
          <span className="absolute top-0 right-0 w-3 h-2 border-t border-r border-gray-100/70" />
          <span className="absolute bottom-0 left-0 w-3 h-2 border-b border-l border-gray-100/70" />
          <span className="absolute bottom-0 right-0 w-3 h-2 border-b border-r border-gray-100/70" />
          {contactLabel}
        </button>
      </div>
    </nav>
  );
}
