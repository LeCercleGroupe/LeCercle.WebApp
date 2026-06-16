import { ALL_VENUES, type ServiceId } from "@/components/BookingFlow/types";
import type { AdminEvent, TaggedEvent } from "./types";

export interface FetchEventsParams {
  serviceId?: string; // returns all events containing that service
  status?: string;
  customerId?: string; // Owner/Manager only (enforced upstream)
}

// ── Client-side cache ────────────────────────────────────────────────────────
// Switching language is a full navigation to the new locale path, which remounts
// the panel and would otherwise refetch every list (the calendar alone fans out
// to all four services). Module state survives client navigations, so we cache
// successful responses with a short TTL and dedupe in-flight requests. This
// keeps backend calls down across language switches and view toggling.

interface CacheEntry {
  at: number;
  data: AdminEvent[];
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<AdminEvent[]>>();

function cacheKey(params: FetchEventsParams): string {
  return [params.serviceId ?? "", params.status ?? "", params.customerId ?? ""].join("|");
}

// Drops all cached events — call after a mutation so the next read is fresh.
export function invalidateAdminEvents(): void {
  cache.clear();
}

// Loads events from the employee events API (GET /api/events). The HttpOnly
// employee cookie is attached server-side by the route handler. Served from the
// cache when a fresh entry exists; errors are not cached (so they retry).
export async function fetchAdminEvents(params: FetchEventsParams): Promise<AdminEvent[]> {
  const key = cacheKey(params);

  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const existing = inflight.get(key);
  if (existing) return existing;

  const request = (async () => {
    const qs = new URLSearchParams();
    if (params.serviceId) qs.set("serviceId", params.serviceId);
    if (params.status) qs.set("status", params.status);
    if (params.customerId) qs.set("customerId", params.customerId);
    const suffix = qs.toString() ? `?${qs}` : "";

    const res = await fetch(`/api/events${suffix}`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));

    const data = await res.json();
    const list: AdminEvent[] = Array.isArray(data) ? data : (data?.items ?? data?.events ?? []);
    cache.set(key, { at: Date.now(), data: list });
    return list;
  })();

  inflight.set(key, request);
  try {
    return await request;
  } finally {
    inflight.delete(key);
  }
}

// Loads every service's events in parallel, each tagged with its service — used
// by the calendar so events can be coloured per service. An event spanning two
// services appears once per service.
export async function fetchAllServiceEvents(): Promise<TaggedEvent[]> {
  const perService = await Promise.all(
    ALL_VENUES.map(async (serviceId: ServiceId) => {
      try {
        const events = await fetchAdminEvents({ serviceId });
        return events.map((event) => ({ event, serviceId }));
      } catch {
        return [];
      }
    }),
  );
  return perService.flat();
}
