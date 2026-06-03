"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadAuth, clearAuth, fetchWithRefresh, StoredAuth } from "@/components/BookingFlow/utils/auth";
import AccountTopBar from "./shared/AccountTopBar";
import { formatDay, formatYear, pickAmount } from "./shared/format";
import { EventBooking, deriveEventState, type EventState } from "./shared/types";

type FilterTab = "all" | "confirmed" | "pending" | "cancelled" | "completed";

interface EventsPageDict {
  title: string;
  subtitle: string;
  book_event: string;
  badge_upcoming: string;
  badge_past: string;
  badge_cancelled: string;
  filter_all: string;
  filter_confirmed: string;
  filter_pending: string;
  filter_cancelled: string;
  filter_completed: string;
  filter_sort: string;
  view_details: string;
  empty: string;
  loading: string;
  error: string;
}

interface NavDict {
  events: string;
  contracts: string;
  profile: string;
  logout: string;
}

export interface EventsOverviewDict {
  events_page: EventsPageDict;
  nav: NavDict;
}

interface Props {
  locale: string;
  dict: EventsOverviewDict;
}

function stateBadgeClass(state: EventState): string {
  switch (state) {
    case "confirmed":  return "bg-[#0a2010] border border-[#1a4a2a] text-[#4ade80]";
    case "pending":    return "bg-[#1f1400] border border-[#3a2a00] text-[#fbbf24]";
    case "draft":      return "bg-[#1a0f00] border border-[#3a2000] text-[#fb923c]";
    case "past":       return "bg-[#1a1a1a] border border-[#2a2a2a] text-[#888]";
    case "cancelled":  return "bg-[#1a0505] border border-[#3a1010] text-[#f87171]";
    case "completed":  return "bg-[#0a0f1f] border border-[#1a2a4a] text-[#60a5fa]";
    default:           return "bg-[#1f1400] border border-[#3a2a00] text-[#fbbf24]";
  }
}

function stateLabel(state: EventState, d: EventsPageDict): string {
  switch (state) {
    case "confirmed":  return d.filter_confirmed.toUpperCase();
    case "pending":    return d.filter_pending.toUpperCase();
    case "cancelled":  return d.filter_cancelled.toUpperCase();
    case "completed":  return d.filter_completed.toUpperCase();
    case "draft":      return d.filter_pending.toUpperCase();
    case "past":       return d.filter_completed.toUpperCase();
    default:           return d.filter_pending.toUpperCase();
  }
}

function stateSubText(state: EventState, event: EventBooking): string {
  const total = pickAmount(event.orders?.[0]?.totalAmount);
  switch (state) {
    case "confirmed":  return "Tot este în regulă";
    case "pending":    return "Avans neplătit";
    case "draft":      return "Rezervare în progres";
    case "past":       return total > 0 ? "Plăți finalizate" : "Eveniment finalizat";
    case "cancelled":  return "Anulat";
    case "completed":  return total > 0 ? "Plăți finalizate" : "Eveniment finalizat";
    default:           return "";
  }
}

export default function EventsOverview({ locale, dict }: Props) {
  const router = useRouter();
  const d = dict.events_page;

  const [auth] = useState<StoredAuth | null>(() => loadAuth()?.auth ?? null);
  const [events, setEvents] = useState<EventBooking[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    if (!auth) {
      router.replace(`/${locale}/account/login`);
      return;
    }
    const customerId = auth.user.customerId;
    if (!customerId) return;

    fetchWithRefresh(`/api/account/events?customerId=${encodeURIComponent(customerId)}`)
      .then(async (r) => {
        if (r.status === 401) {
          clearAuth();
          router.replace(`/${locale}/account/login`);
          return null;
        }
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data == null) return;
        const list: EventBooking[] = Array.isArray(data)
          ? data
          : (data?.items ?? data?.events ?? []);
        list.sort((a, b) => (b.eventDate || "").localeCompare(a.eventDate || ""));
        setEvents(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [auth, locale, router]);

  const initials = auth
    ? `${auth.user.firstName?.[0] ?? ""}${auth.user.lastName?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";
  const displayName = auth
    ? `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim() || (auth.user.phoneNumber ?? "—")
    : "—";

  const eventsWithState = useMemo(() =>
    (events ?? []).map((ev) => ({ ev, state: deriveEventState(ev) })),
    [events]
  );

  const upcoming  = eventsWithState.filter(({ state }) => state !== "past" && state !== "cancelled");
  const past      = eventsWithState.filter(({ state }) => state === "past");
  const cancelled = eventsWithState.filter(({ state }) => state === "cancelled");

  const filtered = useMemo(() => {
    if (filter === "all")        return eventsWithState;
    if (filter === "confirmed")  return eventsWithState.filter(({ state }) => state === "confirmed");
    if (filter === "pending")    return eventsWithState.filter(({ state }) => state === "pending");
    if (filter === "cancelled")  return eventsWithState.filter(({ state }) => state === "cancelled");
    if (filter === "completed")  return eventsWithState.filter(({ state }) => state === "completed" || state === "past");
    return eventsWithState;
  }, [eventsWithState, filter]);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all",        label: d.filter_all },
    { key: "confirmed",  label: d.filter_confirmed },
    { key: "pending",    label: d.filter_pending },
    { key: "cancelled",  label: d.filter_cancelled },
    { key: "completed",  label: d.filter_completed },
  ];

  return (
    <div className="min-h-svh bg-[#080808] flex flex-col">
      <AccountTopBar
        locale={locale}
        initials={initials}
        displayName={displayName}
        email={auth?.user.email}
        navDict={dict.nav}
      />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-432">
          <div className="mx-auto max-w-295 px-4 sm:px-6 lg:px-8 2xl:px-0 py-8 sm:py-14">

            {/* Page header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-start justify-between gap-4 mb-2 sm:mb-3">
                <h1 className="text-[28px] sm:text-[40px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none">
                  {d.title}
                </h1>
                <Link
                  href={`/${locale}/booking`}
                  className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 border border-[#3a3a3a] text-[13px] sm:text-sm font-medium text-[#f0f0f0] font-figtree tracking-tight hover:bg-[#1a1a1a] transition-colors"
                >
                  {d.book_event}
                </Link>
              </div>
              <p className="text-[13px] sm:text-[15px] text-[#888] font-figtree tracking-tight">
                {d.subtitle}
              </p>
            </div>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {upcoming.length > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium font-figtree tracking-widest border border-[#3a2a00] bg-[#1f1400] text-[#fbbf24]">
                  {d.badge_upcoming.replace("{count}", String(upcoming.length))}
                </span>
              )}
              {past.length > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium font-figtree tracking-widest border border-[#2a2a2a] bg-[#1a1a1a] text-[#888]">
                  {d.badge_past.replace("{count}", String(past.length))}
                </span>
              )}
              {cancelled.length > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium font-figtree tracking-widest border border-[#3a1010] bg-[#1a0505] text-[#f87171]">
                  {d.badge_cancelled.replace("{count}", String(cancelled.length))}
                </span>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-sm font-medium font-figtree tracking-tight border transition-colors cursor-pointer ${
                    filter === key
                      ? "border-[#4a4a4a] bg-[#1e1e1e] text-[#f0f0f0]"
                      : "border-[#2a2a2a] bg-transparent text-[#888] hover:border-[#3a3a3a] hover:text-[#c0c0c0]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading && (
              <p className="text-sm text-[#666] font-figtree tracking-tight py-12 text-center">
                {d.loading}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400 font-figtree tracking-tight py-12 text-center">
                {d.error}
              </p>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-sm text-[#666] font-figtree tracking-tight py-12 text-center">
                {d.empty}
              </p>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="flex flex-col gap-0 border border-[#1e1e1e]">
                {filtered.map(({ ev, state }) => (
                  <EventRow
                    key={ev.id}
                    event={ev}
                    state={state}
                    locale={locale}
                    viewLabel={d.view_details}
                    d={d}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function EventRow({
  event,
  state,
  locale,
  viewLabel,
  d,
}: {
  event: EventBooking;
  state: EventState;
  locale: string;
  viewLabel: string;
  d: EventsPageDict;
}) {
  const day     = formatDay(event.eventDate);
  const year    = formatYear(event.eventDate);
  const subText = stateSubText(state, event);

  const parts: string[] = [];
  if (event.eventType)              parts.push(event.eventType);
  if (event.city)                   parts.push(event.city);
  if (event.guestCount)             parts.push(`${event.guestCount} invitați`);
  if (event.eventStartTime)         parts.push(event.eventStartTime.slice(0, 5));
  if (event.orders?.[0]?.orderNumber) parts.push(event.orders[0].orderNumber!);

  return (
    <Link
      href={`/${locale}/account/events/${event.id}`}
      className="flex items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-5 py-4 border-b border-[#141414] last:border-b-0 bg-[#0c0c0c] hover:bg-[#0f0f0f] active:bg-[#111] transition-colors"
    >
      {/* Date */}
      <div className="w-20 sm:w-24 shrink-0 flex flex-col pt-0.5">
        <span className="text-[20px] sm:text-[22px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none whitespace-nowrap">
          {day}
        </span>
        <span className="text-[11px] sm:text-xs text-[#555] font-figtree tracking-tight mt-0.5">{year}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[15px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
          {event.venueTitle || "—"}
        </p>
        {parts.length > 0 && (
          <p className="text-[13px] text-[#666] font-figtree tracking-tight truncate">
            {parts.join(" · ")}
          </p>
        )}
        {/* Status row — mobile only */}
        <div className="flex items-center gap-2 mt-1 sm:hidden">
          <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium font-figtree tracking-widest ${stateBadgeClass(state)}`}>
            {stateLabel(state, d)}
          </span>
          {subText && (
            <span className="text-[12px] text-[#666] font-figtree tracking-tight">{subText}</span>
          )}
        </div>
      </div>

      {/* Status — desktop only */}
      <div className="hidden sm:flex shrink-0 flex-col items-start gap-1 min-w-35">
        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest ${stateBadgeClass(state)}`}>
          {stateLabel(state, d)}
        </span>
        {subText && (
          <span className="text-[12px] text-[#666] font-figtree tracking-tight">{subText}</span>
        )}
      </div>

      {/* CTA button — desktop only */}
      <span className="hidden sm:inline-flex shrink-0 px-4 py-2 border border-[#2a2a2a] text-sm font-medium text-[#c0c0c0] font-figtree tracking-tight transition-colors">
        {viewLabel}
      </span>

      {/* Chevron — mobile only */}
      <div className="sm:hidden shrink-0 self-center text-[#444]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  );
}
