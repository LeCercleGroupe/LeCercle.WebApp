import { Fragment } from "react";
import VenueFooter from "./VenueFooter";
import VenueHero from "./VenueHero";
import VenueNav from "./VenueNav";
import ClosingCtaSection from "./sections/ClosingCtaSection";
import FeaturesSection from "./sections/FeaturesSection";
import GallerySection from "./sections/GallerySection";
import PackagesSection from "./sections/PackagesSection";
import SceneIntro from "./sections/SceneIntro";
import SceneOutro from "./sections/SceneOutro";
import VideoScene from "./sections/VideoScene";
import type { VenuePageData, VenueSection } from "./types";

interface VenuePageProps {
  data: VenuePageData;
  locale: string;
  contactLabel: string;
  langLabel: string;
}

const SLUG_MAP: Record<string, string> = {
  "/logos/LeBureau.svg": "lebureau",
  "/logos/MaisonDuFeu.svg": "maisondufeu",
  "/logos/LaPerle.svg": "laperle",
};

export default function VenuePage({
  data,
  locale,
  contactLabel,
  langLabel,
}: VenuePageProps) {
  const { hero, logo, name, accentColor, sections } = data;

  return (
    <div
      className="relative font-figtree bg-[#08060a]"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <VenueNav
        locale={locale}
        contactLabel={contactLabel}
        langLabel={langLabel}
      />
      <VenueHero
        hero={hero}
        logo={logo}
        name={name}
        contactLabel={contactLabel}
      />

      {sections.map((section: VenueSection, idx: number) => {
        switch (section.type) {
          case "video-scene": {
            const sceneAccent = section.accentColor ?? accentColor;
            const lastScreen = section.screens[section.screens.length - 1];
            const hasOutro = !!lastScreen?.cta;
            const bodyScreens = hasOutro
              ? section.screens.slice(0, -1)
              : section.screens;
            const next = sections[idx + 1];

            // When outro is immediately followed by features, co-render them inside
            // a single `relative` container so the sticky scope is bounded correctly:
            // SceneOutro pins to the viewport while FeaturesSection scrolls up over it.
            if (hasOutro && lastScreen && next?.type === "features") {
              return (
                <Fragment key={idx}>
                  {section.heading && (
                    <SceneIntro
                      heading={section.heading}
                      subheading={section.subheading}
                      accentColor={sceneAccent}
                    />
                  )}
                  <VideoScene
                    {...section}
                    screens={bodyScreens}
                    accentColor={sceneAccent}
                  />
                  <div className="relative">
                    {/* Sticky panel — pins for exactly one FeaturesSection height of scroll */}
                    <div className="sticky top-0 min-h-lvh flex items-center overflow-hidden bg-black">
                      <div className="w-full">
                        <SceneOutro
                          screen={lastScreen}
                          accentColor={sceneAccent}
                        />
                      </div>
                    </div>
                    {/* FeaturesSection slides up over the pinned outro */}
                    <div className="relative z-10">
                      <FeaturesSection
                        {...next}
                        accentColor={accentColor}
                        venueName={name}
                      />
                    </div>
                  </div>
                </Fragment>
              );
            }

            return (
              <Fragment key={idx}>
                {section.heading && (
                  <SceneIntro
                    heading={section.heading}
                    subheading={section.subheading}
                    accentColor={sceneAccent}
                  />
                )}
                <VideoScene
                  {...section}
                  screens={bodyScreens}
                  accentColor={sceneAccent}
                />
                {hasOutro && lastScreen && (
                  <SceneOutro screen={lastScreen} accentColor={sceneAccent} />
                )}
              </Fragment>
            );
          }

          case "packages":
            return (
              <PackagesSection
                key={idx}
                projectName={name}
                {...section}
                accentColor={accentColor}
                logo={logo}
              />
            );

          case "gallery":
            return <GallerySection key={idx} {...section} />;

          case "closing-cta":
            return (
              <ClosingCtaSection
                key={idx}
                {...section}
                accentColor={accentColor}
                logo={logo}
                name={name}
              />
            );
        }
      })}

      <VenueFooter locale={locale} activeSlug={SLUG_MAP[logo] ?? ""} />
    </div>
  );
}
