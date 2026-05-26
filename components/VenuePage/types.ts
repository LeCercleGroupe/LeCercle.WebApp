/** Inline text with optional italic-accent spans mixed in the same paragraph */
export type TextPart =
  | { t: "normal"; text: string }
  | { t: "italic-accent"; text: string };

// ─── Video scene ──────────────────────────────────────────────────────────────

/** One full-viewport screen within a VideoScene */
export interface VideoScreen {
  /** Large display text at the top of the screen */
  sectionHeading?: string;
  /** Body text block overlaid on the video */
  body?: TextPart[];
  textPosition?: "left" | "right" | "center";
  /** Optional CTA button */
  cta?: { label: string; href: string };
}

/**
 * Full-viewport video that stays sticky while its screens scroll over it.
 * Each screen occupies 100dvh. Use multiple screens with the same video
 * to get the "same shot, different text" effect from the design.
 */
export interface VideoScene {
  type: "video-scene";
  video: string;
  /** Optional portrait video used on mobile screens (≤639 px wide) */
  videoMobile?: string;
  /** Overrides the page-level accentColor for this scene only */
  accentColor?: string;
  /** Persistent heading shown at the top of the sticky video throughout all screens */
  heading?: string;
  subheading?: string;
  screens: VideoScreen[];
}

// ─── Other section types ──────────────────────────────────────────────────────

export interface FeaturesItem {
  image: string;
  imageAlt: string;
  heading: string;
  body: string;
}

/** Warm-cream 4-column feature grid */
export interface FeaturesSection {
  type: "features";
  heading: string;
  subtitle?: string;
  items: FeaturesItem[];
}

export interface PackageItem {
  name: string;
  subtitle: string; // e.g. "până la 60 de persoane"
  bullets: string[];
  price: string; // e.g. "750 €"
  cta: { label: string; href: string };
  accentColor?: string;
}

/** Dark-background 4-column packages — shared across all venues */
export interface PackagesSection {
  type: "packages";
  heading: string;
  subtitle?: string;
  items: PackageItem[];
}

/** Image mosaic gallery */
export interface GallerySection {
  type: "gallery";
  heading: string;
  images: { src: string; alt: string }[];
}

/** Closing section — light or dark bg, venue logo, centered CTA */
export interface ClosingCtaSection {
  type: "closing-cta";
  background: "light" | "dark";
  showLogo?: boolean;
  body: TextPart[];
  cta: { label: string; href: string };
}

export type VenueSection =
  | VideoScene
  | FeaturesSection
  | PackagesSection
  | GallerySection
  | ClosingCtaSection;

// ─── Split types for shared (locale-invariant) + locale text ─────────────────

export interface SharedVideoScene {
  type: "video-scene";
  video: string;
  videoMobile?: string;
  accentColor?: string;
  screens: Array<{ textPosition?: "left" | "right" | "center"; cta?: { href: string } }>;
}

export interface SharedFeaturesSection {
  type: "features";
  items: { image: string; imageAlt: string }[];
}

export interface SharedPackagesSection {
  type: "packages";
  items: { name: string; price: string; accentColor?: string; cta: { href: string } }[];
}

export interface SharedGallerySection {
  type: "gallery";
  images: { src: string; alt: string }[];
}

export interface SharedClosingCtaSection {
  type: "closing-cta";
  background: "light" | "dark";
  showLogo?: boolean;
  cta: { href: string };
}

export type SharedSection =
  | SharedVideoScene
  | SharedFeaturesSection
  | SharedPackagesSection
  | SharedGallerySection
  | SharedClosingCtaSection;

export interface VenueShared {
  name: string;
  logo?: string;
  accentColor: string;
  hero: { video: string; videoMobile?: string };
  social?: { instagram?: string; facebook?: string };
  sections: SharedSection[];
}

export interface SectionText {
  heading?: string;
  subheading?: string;
  subtitle?: string;
  body?: TextPart[];
  cta?: { label: string };
  screens?: Array<{ body?: TextPart[]; cta?: { label: string } }>;
  items?: Array<{
    heading?: string;
    body?: string;
    subtitle?: string;
    bullets?: string[];
    cta?: { label: string };
  }>;
}

export interface VenueLocaleText {
  hero: { tagline: string };
  sections: SectionText[];
}

// ─── Page-level data ─────────────────────────────────────────────────────────

export interface VenueHeroData {
  /** Full-screen hero video */
  video: string;
  /** Optional portrait video used on mobile screens (≤639 px wide) */
  videoMobile?: string;
  /** Short tagline shown beneath the venue logo */
  tagline: string;
}

export interface VenuePageData {
  name: string;
  logo?: string;
  accentColor: string;
  hero: VenueHeroData;
  sections: VenueSection[];
  social?: {
    instagram?: string;
    facebook?: string;
  };
}
