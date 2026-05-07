import lebureau from "@/data/venues/lebureau";
import maisondufeu from "@/data/venues/maisondufeu";
import laperle from "@/data/venues/laperle";
import type { PackageItem } from "@/components/VenuePage/types";
import { SERVICE_IDS } from "../types";

type Slug = "lebureau" | "maisondufeu" | "laperle";

const VENUE_DATA: Record<Slug, typeof lebureau> = { lebureau, maisondufeu, laperle };

const ID_TO_SLUG: Partial<Record<string, Slug>> = {
  [SERVICE_IDS.lebureau]: "lebureau",
  [SERVICE_IDS.maisondufeu]: "maisondufeu",
  [SERVICE_IDS.laperle]: "laperle",
};

export function getVenuePackages(serviceId: string, locale: string): PackageItem[] {
  const slug = ID_TO_SLUG[serviceId];
  if (!slug) return [];
  const venueLocales = VENUE_DATA[slug];
  const data = venueLocales[locale as keyof typeof venueLocales] ?? venueLocales["ro"];
  const section = data.sections.find((s) => s.type === "packages");
  return section?.type === "packages" ? section.items : [];
}

export function parsePrice(price: string): number {
  // Handles "€750", "750 €", "1 350 €" (narrow-space thousands separator)
  return parseInt(price.replace(/[€\s  ]/g, ""), 10) || 0;
}
