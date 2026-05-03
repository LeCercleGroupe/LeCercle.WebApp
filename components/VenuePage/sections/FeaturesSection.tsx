"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FeaturesSection as FeaturesSectionProps } from "@/components/VenuePage/types";
import Image from "next/image";

interface Props extends FeaturesSectionProps {
  accentColor: string;
  venueName?: string;
}

function renderHeading(heading: string, venueName: string | undefined) {
  if (!venueName) return <>{heading}</>;
  const idx = heading.indexOf(venueName);
  if (idx === -1) return <>{heading}</>;
  return (
    <>
      {heading.slice(0, idx)}
      <em className="italic">{venueName}</em>
      {heading.slice(idx + venueName.length)}
    </>
  );
}

export default function FeaturesSection({
  heading,
  subtitle,
  items,
  accentColor,
  venueName,
}: Props) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  function scroll(dir: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? el.clientWidth : -el.clientWidth, behavior: "smooth" });
  }

  function renderArrow(dir: "left" | "right") {
    const active = dir === "left" ? canLeft : canRight;
    return (
      <button
        key={dir}
        onClick={() => scroll(dir)}
        aria-label={dir === "left" ? "Previous" : "Next"}
        className="relative w-14 h-12 flex items-center justify-center text-black/35 hover:text-black/65 transition-colors duration-200 cursor-pointer group"
      >
        <span className={`absolute top-0 left-0 w-6 h-4 border-t border-l transition-[border-color] duration-300 ${active ? "border-black/20 group-hover:border-black/40" : "border-transparent"}`} />
        <span className={`absolute top-0 right-0 w-6 h-4 border-t border-r transition-[border-color] duration-300 ${active ? "border-black/20 group-hover:border-black/40" : "border-transparent"}`} />
        <span className={`absolute bottom-0 left-0 w-6 h-4 border-b border-l transition-[border-color] duration-300 ${active ? "border-black/20 group-hover:border-black/40" : "border-transparent"}`} />
        <span className={`absolute bottom-0 right-0 w-6 h-4 border-b border-r transition-[border-color] duration-300 ${active ? "border-black/20 group-hover:border-black/40" : "border-transparent"}`} />
        {dir === "left" ? (
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1L1 8l7 7M1 8h20" />
          </svg>
        ) : (
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 1l7 7-7 7M21 8H1" />
          </svg>
        )}
      </button>
    );
  }

  const arrows = (
    <div className="flex items-center gap-2">
      {renderArrow("left")}
      {renderArrow("right")}
    </div>
  );

  return (
    <section
      className="bg-white py-20 h-full sm:h-lvh"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="px-6 sm:px-12 mb-10">
          <div className="sm:flex sm:items-end sm:justify-between">
            <div>
              <h2 className="text-black text-[28px] sm:text-[42px] font-normal leading-[1.2] font-eb-garamond">
                {renderHeading(heading, venueName)}
              </h2>
              {subtitle && (
                <p className="mt-2.5 text-black/55 text-[13px] sm:text-[14px] leading-[1.7] font-figtree max-w-2xl">
                  {subtitle}
                </p>
              )}
              {/* Arrows — mobile: below subtitle, left-aligned */}
              <div className="mt-5 sm:hidden">{arrows}</div>
            </div>
            {/* Arrows — desktop: right side of subtitle row */}
            <div className="hidden sm:flex sm:shrink-0 sm:pb-0.5">{arrows}</div>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="overflow-x-auto overflow-y-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-6 sm:pl-12 pb-4"
        >
          <div className="flex gap-12 snap-x snap-mandatory">
            {items.map((item) => (
              <div
                key={item.heading}
                className="relative flex flex-col shrink-0 snap-start w-[88vw] sm:w-[44vw] lg:w-[24vw]"
              >
                {/* Exterior corner brackets */}
                <span className="absolute top-0 -left-2 w-4 h-4 border-t border-l border-black/30 pointer-events-none z-10" />
                <span className="absolute top-0 -right-2 w-4 h-4 border-t border-r border-black/30 pointer-events-none z-10" />
                <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b border-l border-black/30 pointer-events-none z-10" />
                <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-black/30 pointer-events-none z-10" />

                <h3
                  className="pt-5 text-[22px] sm:text-[26px] font-normal leading-tight font-eb-garamond mb-3 px-4"
                  style={{ color: "var(--accent)" }}
                >
                  {item.heading}
                </h3>

                <p className="text-black/65 text-[13px] leading-[1.85] font-figtree mb-6 flex-1 px-4">
                  {item.body}
                </p>

                <div className="w-full aspect-3/2 relative overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
            {/* Trailing spacer — ensures the last card can scroll fully into view */}
            <div className="shrink-0 w-6 sm:w-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
