import type { StatusFilter } from "./types";

// Strict event status handling — we display and filter on the literal `status`
// field returned by the events API (no date/order heuristics).

export function normalizeStatus(status?: string | null): string {
  return (status ?? "").trim().toLowerCase();
}

// Raw status, upper-cased for badges. Falls back to a dash when absent.
export function statusLabel(status?: string | null): string {
  const s = (status ?? "").trim();
  return s ? s.toUpperCase() : "—";
}

export function statusBadgeClass(status?: string | null): string {
  switch (normalizeStatus(status)) {
    case "confirmed": return "bg-[#0a2010] border border-[#1a4a2a] text-[#4ade80]";
    case "pending":   return "bg-[#1f1400] border border-[#3a2a00] text-[#fbbf24]";
    case "draft":     return "bg-[#1a0f00] border border-[#3a2000] text-[#fb923c]";
    case "cancelled":
    case "canceled":  return "bg-[#1a0505] border border-[#3a1010] text-[#f87171]";
    case "completed": return "bg-[#0a0f1f] border border-[#1a2a4a] text-[#60a5fa]";
    default:          return "bg-[#1a1a1a] border border-[#2a2a2a] text-[#888]";
  }
}

export function matchesStatusFilter(status: string | undefined | null, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  const s = normalizeStatus(status);
  if (filter === "cancelled") return s === "cancelled" || s === "canceled";
  return s === filter;
}
