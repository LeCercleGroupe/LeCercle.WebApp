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
    if (!pkgsRes.ok) return [];

    const packages: Array<{ id: string; name: string; basePrice: number; isActive: boolean }> =
      await pkgsRes.json();
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
 * Replaces bullets (fixed features) and price in each PackagesSection item
 * by index. Falls back to the static value when the live package is missing.
 */
export function applyLivePackages(data: VenuePageData, live: LivePackageItem[]): VenuePageData {
  if (!live.length) return data;

  return {
    ...data,
    sections: data.sections.map((section) => {
      if (section.type !== "packages") return section;
      return {
        ...section,
        items: section.items.map((item, i) => {
          const pkg = live[i];
          if (!pkg) return item;
          return {
            ...item,
            price: formatMDL(pkg.basePrice),
            bullets: pkg.fixedFeatures.map((f) => f.label),
          };
        }),
      };
    }),
  };
}
