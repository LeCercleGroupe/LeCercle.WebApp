import type { PackagesSection as PackagesSectionProps } from "@/components/VenuePage/types";
import Image from "next/image";
import Link from "next/link";

interface Props extends PackagesSectionProps {
  accentColor: string;
  logo: string;
  projectName: string;
}

export default function PackagesSection({
  heading,
  subtitle,
  items,
  accentColor,
  logo,
  projectName,
}: Props) {
  return (
    <section className="bg-[#1B1B1B] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-eb-garamond text-4xl sm:text-5xl font-medium text-white">
            {heading}
          </h2>
          {subtitle && (
            <p className="mt-4 text-[#83848E] text-sm max-w-3xl mx-auto font-figtree">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((pkg) => (
            <PackageCard
              key={pkg.name}
              pkg={pkg}
              fallbackColor={accentColor}
              logo={logo}
              projectName={projectName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CardProps {
  pkg: PackagesSectionProps["items"][number];
  fallbackColor: string;
  logo: string;
  projectName: string;
}

function PackageCard({
  pkg,
  fallbackColor,
  logo,
  projectName,
}: CardProps) {
  const color = pkg.accentColor ?? fallbackColor;
  const initial = pkg.name.charAt(0);

  return (
    <div
      className="relative pt-7 flex flex-col"
      style={{ "--card-color": color } as React.CSSProperties}
    >
      {/* Wax stamp — overlaps the card's top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 size-14">
        <Image src="/images/stamp.svg" alt="" fill className="object-contain" />
        <span className="absolute inset-0 flex items-center justify-center font-dancing-script text-2xl text-[#1a0800] select-none leading-none">
          {initial}
        </span>
      </div>

      {/* Card */}
      <div className="relative flex flex-col flex-1 pt-10 pb-8 px-5 bg-[url('/images/invite.png')] bg-cover bg-center border-3 border-(--card-color) overflow-hidden">
        {/* Warm parchment overlay */}
        <div className="absolute inset-0 bg-[#f5ede0]/55 pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-1 items-center text-center">
          {/* Package name — Cinzel Bold */}
          <h3 className="text-3xl text-(--card-color) font-eb-garamond font-medium leading-tight mb-2">
            {pkg.name}
          </h3>

          {/* Venue name — Cinzel Decorative */}
          <p className="font-cinzel-deco text-xs font-bold tracking-widest text-(--card-color) mb-5">
            {projectName}
          </p>

          {/* Capacity row with flanking rules */}
          <div className="flex items-center gap-2 w-full mb-6">
            <div className="flex-1 h-px bg-(--card-color) opacity-30" />
            <span className="font-cinzel text-[10px] tracking-widest uppercase text-(--card-color) whitespace-nowrap">
              {pkg.subtitle}
            </span>
            <div className="flex-1 h-px bg-(--card-color) opacity-30" />
          </div>

          {/* Features — centered, no bullet dots, Cinzel */}
          <ul className="flex flex-col gap-1.5 mb-8 flex-1 w-full">
            {pkg.bullets.map((bullet) => (
              <li
                key={bullet}
                className="font-cinzel text-[11px] leading-relaxed text-(--card-color)"
              >
                {bullet}
              </li>
            ))}
          </ul>

          {/* Price */}
          <p className="font-cinzel text-2xl font-bold text-(--card-color) mb-4">
            {pkg.price}
          </p>

          {/* Venue logo */}
          <div className="relative w-28 h-10 mb-6 opacity-80">
            <Image src={logo} alt="" fill className="object-contain invert" />
          </div>

          {/* CTA — corner-bracket style */}
          <Link
            href={pkg.cta.href}
            className="relative w-full py-3 font-figtree text-[10px] tracking-widest uppercase text-(--card-color) hover:opacity-70 transition-opacity duration-200 cursor-pointer"
          >
            <span className="absolute top-0 left-0 size-3 border-t-2 border-l-2 border-(--card-color)" />
            <span className="absolute top-0 right-0 size-3 border-t-2 border-r-2 border-(--card-color)" />
            <span className="absolute bottom-0 left-0 size-3 border-b-2 border-l-2 border-(--card-color)" />
            <span className="absolute bottom-0 right-0 size-3 border-b-2 border-r-2 border-(--card-color)" />
            {pkg.cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
