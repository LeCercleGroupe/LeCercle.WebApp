"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const LOCALES = ["ro", "en", "ru"] as const;

interface BookingNavbarProps {
  locale: string;
}

export default function BookingNavbar({ locale }: BookingNavbarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    setOpen(false);
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"), { scroll: false });
  }

  return (
    <div className="flex items-center justify-between p-2.5 w-full shrink-0 z-10">
      <Link href={`/${locale}`} className="relative h-10 w-27">
        <Image
          src="/logos/LeCercle.svg"
          alt="Le Cercle"
          fill
          className="object-contain object-left"
        />
      </Link>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex gap-1 items-center text-[#c4c4c4] text-base px-2 py-2 capitalize hover:text-[#f1f1f1] transition-colors"
        >
          {locale}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={`opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-1 flex flex-col backdrop-blur-md bg-[#111]/90 border border-[#303030] py-1 min-w-16">
            {LOCALES.filter((l) => l !== locale).map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className="px-4 py-2 text-sm text-[#a8a8a8] font-figtree tracking-tight capitalize text-left hover:text-[#f1f1f1] hover:bg-white/5 transition-colors cursor-pointer"
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
