import { unstable_cache } from "next/cache";
import type { VenuePageData } from "@/components/VenuePage/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LiveFixedFeature {
  featureId: string;
  label: string;
  sortOrder: number;
}

export interface LivePackageItem {
  id: string;
  name: string;
  basePrice: number;
  fixedFeatures: LiveFixedFeature[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMDL(amount: number): string {
  return new Intl.NumberFormat("ro-MD").format(amount) + " MDL";
}

async function getBookingToken(): Promise<string | null> {
  const { BOOKING_CLIENT_ID, BOOKING_CLIENT_SECRET, BOOKING_SCOPE, BOOKING_TOKEN_URL } = process.env;
  if (!BOOKING_CLIENT_ID || !BOOKING_CLIENT_SECRET || !BOOKING_SCOPE || !BOOKING_TOKEN_URL) return null;

  try {
    const res = await fetch(BOOKING_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: BOOKING_CLIENT_ID,
        client_secret: BOOKING_CLIENT_SECRET,
        scope: BOOKING_SCOPE,
      }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { access_token } = await res.json();
    return access_token ?? null;
  } catch {
    return null;
  }
}

// ─── Core fetch — runs once per cache miss ────────────────────────────────────

async function fetchServicePackagesRaw(serviceId: string): Promise<LivePackageItem[]> {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return [];

  const token = await getBookingToken();
  if (!token) return [];

  const headers = { Authorization: `Bearer ${token}` };

  try {
    const pkgsRes = await fetch(`${BOOKING_API_BASE}/api/services/${serviceId}/packages`, {
      headers,
      cache: "no-store",
    });
    if (!pkgsRes.ok) {
      console.error(`[venuePackages] packages fetch failed: ${pkgsRes.status} for service ${serviceId}`);
      return [];
    }

    const packages: Array<{ id: string; name: string; basePrice: number; isActive: boolean }> =
      await pkgsRes.json();
    console.log(`[venuePackages] service=${serviceId} packages:`, packages.map(p => ({ name: p.name, isActive: p.isActive })));
    const active = packages.filter((p) => p.isActive);

    return Promise.all(
      active.map(async (pkg) => {
        try {
          const featRes = await fetch(`${BOOKING_API_BASE}/api/packages/${pkg.id}/features`, {
            headers,
            cache: "no-store",
          });
          if (!featRes.ok) return { id: pkg.id, name: pkg.name, basePrice: pkg.basePrice, fixedFeatures: [] };

          const features: Array<{ id: string; label: string; type: 0 | 1; sortOrder: number }> =
            await featRes.json();

          const fixedFeatures: LiveFixedFeature[] = features
            .filter((f) => f.type === 0)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((f) => ({ featureId: f.id, label: f.label, sortOrder: f.sortOrder }));

          console.log(`[venuePackages] package "${pkg.name}" features: fixed=${fixedFeatures.length} total=${features.length}`);
          return { id: pkg.id, name: pkg.name, basePrice: pkg.basePrice, fixedFeatures };
        } catch {
          return { id: pkg.id, name: pkg.name, basePrice: pkg.basePrice, fixedFeatures: [] };
        }
      })
    );
  } catch {
    return [];
  }
}

// ─── Cached version — revalidates once a day ─────────────────────────────────

export const fetchServicePackages = unstable_cache(
  fetchServicePackagesRaw,
  ["venue-packages"],
  { revalidate: 86400 }
);

// ─── Patcher — merges live data into already-merged VenuePageData ─────────────

/**
 * Rebuilds each PackagesSection using live packages as the source of truth.
 * - Count and order follow the backend (no extra static-only packages shown).
 * - Static metadata (subtitle, accentColor, cta) is matched by package name.
 * - Price and bullets always come from the live backend data.
 * Falls back to static data entirely when the backend returns nothing.
 */
export function applyLivePackages(data: VenuePageData, live: LivePackageItem[]): VenuePageData {
  if (!live.length) return data;

  return {
    ...data,
    sections: data.sections.map((section) => {
      if (section.type !== "packages") return section;

      const staticByName = new Map(
        section.items.map((item) => [item.name.toLowerCase(), item])
      );

      const items = live.map((pkg, idx) => {
        // Try name match first, fall back to positional match
        const staticItem = staticByName.get(pkg.name.toLowerCase()) ?? section.items[idx];
        const fallbackCta = section.items[0]?.cta ?? { label: "", href: "" };
        if (!staticByName.has(pkg.name.toLowerCase())) {
          console.warn(`[venuePackages] no name match for "${pkg.name}", using index ${idx} fallback`);
        }
        return {
          name:         pkg.name,
          subtitle:     staticItem?.subtitle     ?? "",
          accentColor:  staticItem?.accentColor,
          cta:          staticItem?.cta          ?? fallbackCta,
          price:        formatMDL(pkg.basePrice),
          bullets:      pkg.fixedFeatures.length > 0
                          ? pkg.fixedFeatures.map((f) => f.label)
                          : (staticItem?.bullets ?? []),
        };
      });

      return { ...section, items };
    }),
  };
}
