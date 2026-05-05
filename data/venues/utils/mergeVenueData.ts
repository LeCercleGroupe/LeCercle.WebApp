import type {
  VenueShared,
  VenueLocaleText,
  VenuePageData,
  VideoScene,
  FeaturesSection,
  PackagesSection,
  GallerySection,
  ClosingCtaSection,
  SectionText,
} from "@/components/VenuePage/types";

export function mergeVenueData(shared: VenueShared, text: VenueLocaleText): VenuePageData {
  return {
    name: shared.name,
    logo: shared.logo,
    accentColor: shared.accentColor,
    hero: { ...shared.hero, tagline: text.hero.tagline },
    social: shared.social,
    sections: shared.sections.map((section, i) => {
      const t: SectionText = text.sections[i] ?? {};
      switch (section.type) {
        case "video-scene":
          return {
            type: "video-scene",
            video: section.video,
            videoMobile: section.videoMobile,
            accentColor: section.accentColor,
            heading: t.heading,
            subheading: t.subheading,
            screens: section.screens.map((screen, j) => {
              const ts = t.screens?.[j] ?? {};
              const cta =
                screen.cta && ts.cta
                  ? { href: screen.cta.href, label: ts.cta.label }
                  : undefined;
              return { textPosition: screen.textPosition, body: ts.body, cta };
            }),
          } satisfies VideoScene;
        case "features":
          return {
            type: "features",
            heading: t.heading ?? "",
            subtitle: t.subtitle,
            items: section.items.map((item, j) => ({
              image: item.image,
              imageAlt: item.imageAlt,
              heading: t.items?.[j]?.heading ?? "",
              body: t.items?.[j]?.body ?? "",
            })),
          } satisfies FeaturesSection;
        case "packages":
          return {
            type: "packages",
            heading: t.heading ?? "",
            subtitle: t.subtitle,
            items: section.items.map((item, j) => ({
              name: item.name,
              price: item.price,
              accentColor: item.accentColor,
              subtitle: t.items?.[j]?.subtitle ?? "",
              bullets: t.items?.[j]?.bullets ?? [],
              cta: { href: item.cta.href, label: t.items?.[j]?.cta?.label ?? "" },
            })),
          } satisfies PackagesSection;
        case "gallery":
          return {
            type: "gallery",
            heading: t.heading ?? "",
            images: section.images,
          } satisfies GallerySection;
        case "closing-cta":
          return {
            type: "closing-cta",
            background: section.background,
            showLogo: section.showLogo,
            body: t.body ?? [],
            cta: { href: section.cta.href, label: t.cta?.label ?? "" },
          } satisfies ClosingCtaSection;
      }
    }),
  };
}
