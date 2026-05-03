"use client";

import VideoShowcase from "@/components/MainHero/VideoShowcase";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FitMode = "Fill" | "Fit" | "Crop" | "Tile";
type Quality = "Low" | "Medium" | "High";
type TransitionPreset =
  | "01 Classic Liquid"
  | "02 Hard Stripes"
  | "03 Swirl Lens"
  | "04 Scanline Jitter"
  | "05 Mosaic Blocks"
  | "06 Turbulent Smoke"
  | "07 Tight Wave"
  | "08 Glitch Spikes";
type EasePreset = "Expo Out" | "Power3 Out" | "Sine InOut" | "Linear";

type VenueKey = "bureau" | "maison" | "perle";

interface VenueDict {
  tagline: string;
  cta: string;
}

export interface HeroDict {
  nav: { contact: string; lang: string };
  hero: { description: string };
  venues: Record<VenueKey, VenueDict>;
}

interface LeCircleHeroProps {
  dict: HeroDict;
  locale: string;
}

const LOCALES = ["ro", "en", "ru"] as const;

const VENUES: { key: VenueKey; logo: string; slug: string }[] = [
  { key: "bureau", logo: "/logos/LeBureau.svg", slug: "lebureau" },
  { key: "maison", logo: "/logos/MaisonDuFeu.svg", slug: "maisondufeu" },
  { key: "perle", logo: "/logos/LaPerle.svg", slug: "laperle" },
];

export default function LeCircleHero({ dict, locale }: LeCircleHeroProps) {
  const [activeVenue, setActiveVenue] = useState<number>(0);
  const [langOpen, setLangOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 639);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const video1 = isMobile ? "/videos/lebureau-vertical.mp4" : "/videos/lebureau-horizontal.mp4";
  const video2 = isMobile ? "/videos/maisondufeu-vertical.mp4" : "/videos/maisondufeu-horizontal.mp4";
  const video3 = isMobile ? "/videos/laperle-vertical.mp4" : "/videos/laperle-horizontal.mp4";

  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    setLangOpen(false);
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"), { scroll: false });
  }

  return (
    <div className="relative w-full h-lvh min-h-150 bg-[#08060a] overflow-hidden text-white font-figtree flex flex-col sm:block">
      {/* ── Full-screen video background ─────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <VideoShowcase
          video1={video1}
          video2={video2}
          video3={video3}
          defaultActive={activeVenue + 1}
          fitMode={"Crop" as FitMode}
          quality={"High" as Quality}
          transition={"01 Classic Liquid" as TransitionPreset}
          duration={1.15}
          ease={"Expo Out" as EasePreset}
          transitionIntensity={0.52}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* ── Cinematic gradient overlay ────────────────────────────────────── */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.08)_38%,rgba(0,0,0,0.42)_66%,rgba(0,0,0,0.88)_100%)]" />

      {/* ── Edge vignette ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_90%_90%_at_50%_50%,transparent_55%,rgba(0,0,0,0.38)_100%)]" />

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="relative shrink-0 sm:absolute sm:top-0 sm:inset-x-0 z-10 flex items-center justify-between px-5 py-3.5 sm:px-9 sm:py-5.5">
        {/* Logo — mobile only */}
        <Image
          src="/logos/LeCercle.svg"
          alt="Le Cercle"
          width={120}
          height={44}
          priority
          className="sm:hidden w-24 h-auto drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
        />

        {/* Language switcher — desktop: left side; mobile: right side */}
        <div className="relative sm:order-first">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="bg-transparent border-0 text-gray-100 text-[13px] tracking-widest cursor-pointer flex items-center gap-1.25 uppercase"
          >
            {dict.nav.lang}
            <span
              className={`text-[9px] opacity-[0.65] transition-transform duration-200 inline-block ${langOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {langOpen && (
            <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 flex flex-col gap-0.5 backdrop-blur-md bg-black/55 py-1.5">
              {LOCALES.filter((l) => l !== locale).map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className="bg-transparent border-0 text-white/72 text-[13px] tracking-widest cursor-pointer px-4.5 py-1.5 text-left uppercase transition-colors duration-200 hover:text-white"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contact CTA — desktop only */}
        <button className="hidden sm:block group border-0 bg-gray-100/20 text-gray-100 text-[12px] tracking-[0.12em] cursor-pointer px-5.5 py-2.25 transition-all duration-250 relative hover:bg-gray-100/40 hover:text-white">
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-gray-100/20 group-hover:border-gray-100/40 transition-[border-color] duration-250" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-gray-100/20 group-hover:border-gray-100/40 transition-[border-color] duration-250" />
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-gray-100/20 group-hover:border-gray-100/40 transition-[border-color] duration-250" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-gray-100/20 group-hover:border-gray-100/40 transition-[border-color] duration-250" />
          {dict.nav.contact}
        </button>
      </nav>

      {/* ── Centre hero text ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col justify-center items-center text-center z-5 sm:pointer-events-none sm:flex-none sm:block sm:absolute sm:top-[17%] sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-[-56%] sm:w-full sm:px-5">
        <Image
          src="/logos/LeCercle.svg"
          alt="Le Cercle"
          width={300}
          height={109}
          priority
          className="hidden sm:block w-60 h-auto mx-auto drop-shadow-[0_2px_40px_rgba(0,0,0,0.4)]"
        />
        <p className="pointer-events-none mt-3.5 sm:mt-5.5 text-[15px] font-normal sm:text-[16px] text-[#E2E2E2] leading-[1.75] max-w-[90vw] sm:leading-[1.8] sm:max-w-140 mx-auto not-italic tracking-[0.02em]">
          {dict.hero.description}
        </p>
        {/* Contact CTA — mobile only, under description */}
        <button className="sm:hidden group border-0 bg-gray-100/20 text-gray-100 text-[12px] tracking-[0.12em] cursor-pointer px-4 py-2 mt-6 transition-all duration-250 relative hover:bg-gray-100/40 hover:text-white">
          <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-gray-100/20 group-hover:border-gray-100/40 transition-[border-color] duration-250" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-gray-100/20 group-hover:border-gray-100/40 transition-[border-color] duration-250" />
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-gray-100/20 group-hover:border-gray-100/40 transition-[border-color] duration-250" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-gray-100/20 group-hover:border-gray-100/40 transition-[border-color] duration-250" />
          {dict.nav.contact}
        </button>
      </div>

      {/* ── Bottom venue strip ───────────────────────────────────────────── */}
      <div className="relative shrink-0 sm:absolute sm:bottom-0 sm:inset-x-0 z-6 grid grid-cols-1 sm:grid-cols-3">
        {VENUES.map((venue, idx) => {
          const isActive = activeVenue === idx;
          const venueDict = dict.venues[venue.key];

          return (
            <div
              key={venue.key}
              onClick={() => setActiveVenue(idx)}
              className="pt-6 px-7 pb-5 sm:pt-6.5 sm:px-7.5 sm:pb-12.5 cursor-pointer relative text-center"
            >
              {/* 4-corner brackets */}
              <div
                className={`absolute top-3.5 left-4 w-3.5 h-3.5 border-t border-l transition-[border-color] duration-350 pointer-events-none ${isActive ? "border-white/72" : "border-transparent"}`}
              />
              <div
                className={`absolute top-3.5 right-4 w-3.5 h-3.5 border-t border-r transition-[border-color] duration-350 pointer-events-none ${isActive ? "border-white/72" : "border-transparent"}`}
              />
              <div
                className={`absolute bottom-3.5 left-4 w-3.5 h-3.5 border-b border-l transition-[border-color] duration-350 pointer-events-none ${isActive ? "border-white/72" : "border-transparent"}`}
              />
              <div
                className={`absolute bottom-3.5 right-4 w-3.5 h-3.5 border-b border-r transition-[border-color] duration-350 pointer-events-none ${isActive ? "border-white/72" : "border-transparent"}`}
              />

              {/* Active mobile fill — inset to match corner brackets */}
              <div
                className={`absolute top-3.5 left-4 right-4 bottom-3.5 bg-black/40 pointer-events-none z-0 transition-opacity duration-350 sm:hidden ${isActive ? "opacity-100" : "opacity-0"}`}
              />

              {/* Content — z-[1] keeps it above the black fill overlay (z-0) */}
              <div className="relative z-1">
                {/* Venue name SVG */}
                <Image
                  src={venue.logo}
                  alt={venue.key}
                  width={240}
                  height={72}
                  className="w-[clamp(140px,32vw,150px)] sm:w-[clamp(100px,12vw,170px)] h-auto block mx-auto mb-1.25 sm:mb-2.5 drop-shadow-[0_1px_20px_rgba(0,0,0,0.55)]"
                />

                {/* Tagline */}
                <p
                  className={`text-[12px] sm:text-[14px] text-white not-italic leading-[1.55] tracking-[0.01em] sm:mb-5 ${isActive ? "mb-2" : "mb-0"}`}
                >
                  {venueDict.tagline}
                </p>

                {/* CTA — hidden on mobile when inactive, invisible on desktop when inactive */}
                <Link
                  href={`/${locale}/${venue.slug}`}
                  className={`backdrop-blur-[10px] bg-white/10 border-0 font-medium text-white text-[10px] sm:text-[12px] tracking-widest py-1.75 px-4 sm:py-2 sm:px-4.5 uppercase relative hover:text-white sm:inline-block mt-2 sm:mt-0 [transition:opacity_0.35s_ease,color_0.25s] ${isActive ? "inline-block opacity-100 pointer-events-auto cursor-pointer" : "hidden opacity-0 pointer-events-none cursor-default"}`}
                >
                  <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/[0.55]" />
                  <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/[0.55]" />
                  <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/[0.55]" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/[0.55]" />
                  {venueDict.cta}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
