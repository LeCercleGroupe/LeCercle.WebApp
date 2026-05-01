"use client";

import type { VenueHeroData } from "@/components/VenuePage/types";
import Image from "next/image";

interface VenueHeroProps {
  hero: VenueHeroData;
  logo: string;
  name: string;
  contactLabel: string;
}

export default function VenueHero({
  hero,
  logo,
  name,
  contactLabel,
}: VenueHeroProps) {
  return (
    <section className="relative h-dvh overflow-hidden bg-[#08060a]">
      <video
        src={hero.video}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Cinematic gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.05)_40%,rgba(0,0,0,0.72)_100%)]" />

      {/* Venue logo + tagline — centered */}
      <div className="absolute inset-0 flex flex-col justify-end items-center sm:justify-center text-center px-6 pb-24 sm:pb-0 pointer-events-none">
        <Image
          src={logo}
          alt={name}
          width={300}
          height={90}
          priority
          className="w-48 sm:w-72 h-auto drop-shadow-[0_2px_40px_rgba(0,0,0,0.5)]"
        />
        <p className="mt-5 text-white/65 text-[12px] sm:text-[13px] tracking-[0.16em] uppercase font-figtree max-w-3xl pb-4">
          {hero.tagline}
        </p>
        {/* Contact CTA only for mobile */}
        <button className="group border-0 bg-transparent text-gray-100 text-[11px] tracking-[0.14em] cursor-pointer px-4 py-2 transition-all duration-250 relative hover:bg-white/6 hover:text-white font-figtree block sm:hidden">
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-100/35 group-hover:border-white/70 transition-[border-color] duration-250" />
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-100/35 group-hover:border-white/70 transition-[border-color] duration-250" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-100/35 group-hover:border-white/70 transition-[border-color] duration-250" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-100/35 group-hover:border-white/70 transition-[border-color] duration-250" />
          {contactLabel}
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-px h-10 bg-linear-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
