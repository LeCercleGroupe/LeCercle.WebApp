"use client";

import type { VenueSuggestion } from "@/app/api/geocode/venue/route";
import {
  clearAuth,
  fetchWithRefresh,
  loadAuth,
  StoredAuth,
} from "@/components/BookingFlow/utils/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AccountTopBar from "./shared/AccountTopBar";
import {
  formatDateShort,
  formatDay,
  formatMDL,
  formatTime,
  formatYear,
} from "./shared/format";
import {
  deriveEventState,
  deriveOrderState,
  EventBooking,
  OrderDetail,
  type EventState,
} from "./shared/types";
import { useHydrated } from "./shared/useHydrated";

interface EventDetailDict {
  back: string;
  contact_us: string;
  cancel_event: string;
  book_again: string;
  book_new: string;
  delete_draft: string;
  continue_booking: string;
  contact_team: string;
  book_similar: string;
  pending_action_label: string;
  pending_action_title: string;
  pending_action_sub: string;
  pay_online: string;
  pay_cash: string;
  pay_error: string;
  confirmed_banner_label: string;
  confirmed_banner_title: string;
  confirmed_banner_sub: string;
  confirmed_status_desc: string;
  draft_banner_label: string;
  draft_banner_title: string;
  draft_banner_sub: string;
  continue_to_step: string;
  draft_status_title: string;
  draft_step_badge: string;
  draft_ref_label: string;
  draft_ref_sub: string;
  estimated_cost_label: string;
  advance_estimated: string;
  section_progress: string;
  section_data_filled: string;
  transport_calculated: string;
  past_banner_label: string;
  past_banner_title: string;
  past_banner_sub: string;
  past_status_desc: string;
  cancelled_banner_label: string;
  cancelled_banner_title: string;
  cancelled_banner_sub: string;
  cancelled_reason_prefix: string;
  cancelled_status_desc: string;
  address_anonymised: string;
  section_whats_next: string;
  section_history: string;
  section_event_details: string;
  section_services: string;
  section_total: string;
  section_total_paid: string;
  section_documents: string;
  section_contact: string;
  section_data: string;
  section_location: string;
  date_label: string;
  time_label: string;
  guests_label: string;
  guests_unit: string;
  event_type_label: string;
  space_type_label: string;
  location_label: string;
  address_label: string;
  distance_label: string;
  logistics_notes_label: string;
  access_label: string;
  not_selected: string;
  total_event_label: string;
  advance_label: string;
  rest_label: string;
  paid_badge: string;
  confirmed_badge: string;
  taxes_label: string;
  transport_label: string;
  transport_included: string;
  no_docs: string;
  no_docs_sub: string;
  download: string;
  contact_label: string;
  contact_phone: string;
  contact_email: string;
  contact_notes: string;
  ref_label: string;
  ref_sub: string;
  financial_label: string;
  financial_services: string;
  financial_discount: string;
  financial_transportation: string;
  financial_total: string;
  financial_advance: string;
  financial_rest: string;
  status_section_label: string;
  badge_pending: string;
  badge_confirmed: string;
  badge_draft: string;
  badge_past: string;
  badge_cancelled: string;
  pending_status_desc: string;
  step1_label: string;
  step2_label: string;
  step3_label: string;
  step4_label: string;
  step5_label: string;
  history_step1: string;
  history_step2: string;
  history_step3: string;
  history_step4: string;
  history_step5: string;
  history_cancelled1: string;
  history_cancelled2: string;
  history_cancelled3: string;
  history_cancelled4: string;
  draft_step1: string;
  draft_step2: string;
  draft_step3: string;
  draft_step4: string;
  draft_step5: string;
  draft_step6: string;
  loading: string;
  error: string;
  view_order: string;
  add_order: string;
  upgrade_package: string;
  select_upgrade: string;
  edit_event: string;
  edit_event_date_unavailable: string;
  edit_event_save: string;
  edit_event_cancel: string;
  edit_event_error: string;
  cancel_event_confirm: string;
  cancel_event_yes: string;
  cancel_event_no: string;
  cancel_event_error: string;
  cancel_order: string;
  cancel_order_confirm: string;
  cancel_order_yes: string;
  cancel_order_no: string;
  cancel_order_error: string;
}

interface NavDict {
  events: string;
  contracts: string;
  profile: string;
  logout: string;
}

export interface EventDetailPageDict {
  event_detail: EventDetailDict;
  nav: NavDict;
}

interface Props {
  locale: string;
  eventId: string;
  dict: EventDetailPageDict;
}

function stateBadgeClass(state: EventState): string {
  switch (state) {
    case "confirmed":
      return "bg-[#0a2010] border border-[#1a4a2a] text-[#4ade80]";
    case "pending":
      return "bg-[#1f1400] border border-[#3a2a00] text-[#fbbf24]";
    case "draft":
      return "bg-[#1a0f00] border border-[#3a2000] text-[#fb923c]";
    case "past":
      return "bg-[#1a1a1a] border border-[#2a2a2a] text-[#888]";
    case "cancelled":
      return "bg-[#1a0505] border border-[#3a1010] text-[#f87171]";
    default:
      return "bg-[#1f1400] border border-[#3a2a00] text-[#fbbf24]";
  }
}

function stateLabel(state: EventState, d: EventDetailDict): string {
  switch (state) {
    case "confirmed":
      return d.badge_confirmed;
    case "pending":
      return d.badge_pending;
    case "draft":
      return d.badge_draft;
    case "past":
      return d.badge_past;
    case "cancelled":
      return d.badge_cancelled;
    default:
      return d.badge_pending;
  }
}

export default function EventDetail({ locale, eventId, dict }: Props) {
  const router = useRouter();
  const d = dict.event_detail;

  const [auth] = useState<StoredAuth | null>(() => loadAuth()?.auth ?? null);
  // Auth comes from client-only storage; defer auth-derived UI until hydrated
  // so the first client render matches the auth-less server render (no hydration mismatch).
  const mounted = useHydrated();
  const [event, setEvent] = useState<EventBooking | null>(null);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ── Cancel state ─────────────────────────────────────────────────────────
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(false);

  async function handleCancel() {
    if (!event) return;
    setCancelLoading(true);
    setCancelError(false);
    try {
      const res = await fetchWithRefresh(`/api/events/${event.id}/cancel`, { method: "PATCH" });
      if (!res.ok) throw new Error(`${res.status}`);
      setEvent((prev) => prev ? { ...prev, status: "Cancelled" } : prev);
      setCancelConfirming(false);
    } catch {
      setCancelError(true);
    } finally {
      setCancelLoading(false);
    }
  }

  // ── Edit modal state ──────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(false);
  const [editForm, setEditForm] = useState<{
    eventDate: string;
    venueTitle: string;
    venueAddress: string;
    city: string;
    eventStartTime: string;
    guestCount: string;
    notes: string;
    distanceKm: number | null;
  }>({
    eventDate: "",
    venueTitle: "",
    venueAddress: "",
    city: "",
    eventStartTime: "",
    guestCount: "",
    notes: "",
    distanceKm: null,
  });

  const [venueSuggestions, setVenueSuggestions] = useState<VenueSuggestion[]>(
    [],
  );
  const venueDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editOpen || editForm.venueTitle.length < 2) {
      return;
    }
    if (venueDebounce.current) clearTimeout(venueDebounce.current);
    venueDebounce.current = setTimeout(() => {
      fetch(`/api/geocode/venue?q=${encodeURIComponent(editForm.venueTitle)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then(setVenueSuggestions)
        .catch(() => setVenueSuggestions([]));
    }, 400);
    return () => {
      if (venueDebounce.current) clearTimeout(venueDebounce.current);
      setVenueSuggestions([]);
    };
  }, [editForm.venueTitle, editOpen]);

  async function handleVenueSuggestionSelect(s: VenueSuggestion) {
    setEditForm((p) => ({
      ...p,
      venueTitle: s.label,
      city: s.city,
      venueAddress: s.description,
      distanceKm: null,
    }));
    setVenueSuggestions([]);
    try {
      const r = await fetch(
        `/api/geocode/distance?destination=${encodeURIComponent(s.description)}`,
      );
      if (r.ok) {
        const dist: { distanceKm: number | null } | null = await r.json();
        if (dist?.distanceKm != null) {
          setEditForm((p) => ({ ...p, distanceKm: dist.distanceKm }));
        }
      }
    } catch {}
  }

  const [dateAvailable, setDateAvailable] = useState<boolean | null>(null);
  const [checkingDate, setCheckingDate] = useState(false);
  const dateCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function checkDateAvailability(date: string) {
    if (!date) {
      setDateAvailable(null);
      return;
    }
    if (dateCheckTimeout.current) clearTimeout(dateCheckTimeout.current);

    // Collect service IDs from orders fetched via /api/account/orders?eventId=
    const serviceIds = [
      ...new Set(
        orders
          .flatMap((o) => (o.items ?? []).map((i) => i.serviceId))
          .filter(Boolean),
      ),
    ];

    // If orders haven't loaded yet or have no items, skip the check silently
    if (!serviceIds.length) {
      setDateAvailable(null);
      return;
    }

    setCheckingDate(true);
    setDateAvailable(null);
    dateCheckTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/booking/services?date=${date}`);
        if (!res.ok) {
          setCheckingDate(false);
          return;
        }
        const data: { serviceId: string; isAvailable: boolean }[] =
          await res.json();
        const availMap = new Map(data.map((s) => [s.serviceId, s.isAvailable]));
        const allAvailable = serviceIds.every(
          (sid) => availMap.get(sid) !== false,
        );
        setDateAvailable(allAvailable);
      } catch {
        setDateAvailable(null);
      } finally {
        setCheckingDate(false);
      }
    }, 600);
  }

  function openEdit() {
    if (!event) return;
    setEditForm({
      eventDate: event.eventDate ?? "",
      venueTitle: event.venueTitle ?? "",
      venueAddress: event.venueAddress ?? "",
      city: event.city ?? "",
      eventStartTime: (event.eventStartTime ?? "").slice(0, 5),
      guestCount: String(event.guestCount ?? ""),
      notes: event.notes ?? "",
      distanceKm: event.distanceKm ?? null,
    });
    setEditError(false);
    setDateAvailable(null);
    setCheckingDate(false);
    setVenueSuggestions([]);
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    if (!event) return;
    setEditSaving(true);
    setEditError(false);
    try {
      const res = await fetchWithRefresh(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          eventDate: editForm.eventDate,
          venueTitle: editForm.venueTitle,
          venueAddress: editForm.venueAddress,
          city: editForm.city,
          eventStartTime: editForm.eventStartTime
            ? `${editForm.eventStartTime}:00`
            : undefined,
          guestCount: parseInt(editForm.guestCount, 10) || event.guestCount,
          notes: editForm.notes,
          distanceKm: editForm.distanceKm,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setEvent((prev) =>
        prev
          ? {
              ...prev,
              eventDate: editForm.eventDate,
              venueTitle: editForm.venueTitle,
              venueAddress: editForm.venueAddress,
              city: editForm.city,
              distanceKm: editForm.distanceKm ?? undefined,
              eventStartTime: editForm.eventStartTime
                ? `${editForm.eventStartTime}:00`
                : prev.eventStartTime,
              guestCount: parseInt(editForm.guestCount, 10) || prev.guestCount,
              notes: editForm.notes,
            }
          : prev,
      );
      setEditOpen(false);
    } catch {
      setEditError(true);
    } finally {
      setEditSaving(false);
    }
  }

  useEffect(() => {
    if (!auth) {
      router.replace(`/${locale}/account/login`);
      return;
    }
    const customerId = auth.user.customerId;
    if (!customerId) {
      return;
    }

    async function load() {
      try {
        const [evRes, ordRes] = await Promise.all([
          fetchWithRefresh(
            `/api/account/events?customerId=${encodeURIComponent(customerId!)}`,
          ),
          fetchWithRefresh(
            `/api/account/orders?eventId=${encodeURIComponent(eventId)}`,
          ),
        ]);

        if (evRes.status === 401) {
          clearAuth();
          router.replace(`/${locale}/account/login`);
          return;
        }

        if (evRes.ok) {
          const evData = await evRes.json();
          const list: EventBooking[] = Array.isArray(evData)
            ? evData
            : (evData?.items ?? evData?.events ?? []);
          const found = list.find((e) => e.id === eventId);
          if (!found) {
            setError(true);
            setLoading(false);
            return;
          }
          setEvent(found);
        } else {
          setError(true);
          setLoading(false);
          return;
        }

        if (ordRes.ok) {
          const ordData = await ordRes.json();
          const list: OrderDetail[] = Array.isArray(ordData)
            ? ordData
            : (ordData?.items ?? ordData?.orders ?? []);
          setOrders(list);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [auth, locale, eventId, router]);

  const initials =
    mounted && auth
      ? `${auth.user.firstName?.[0] ?? ""}${auth.user.lastName?.[0] ?? ""}`.toUpperCase() ||
        "?"
      : "?";
  const displayName =
    mounted && auth
      ? `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim() ||
        (auth.user.phoneNumber ?? "—")
      : "—";

  const ordersWithState = useMemo(
    () => orders.map((order) => ({ order, state: deriveOrderState(order) })),
    [orders],
  );

  if (loading) {
    return (
      <div className="min-h-svh bg-[#080808] flex flex-col">
        <AccountTopBar
          locale={locale}
          initials={initials}
          displayName={displayName}
          email={auth?.user.email}
          navDict={dict.nav}
        />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#666] font-figtree">{d.loading}</p>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-svh bg-[#080808] flex flex-col">
        <AccountTopBar
          locale={locale}
          initials={initials}
          displayName={displayName}
          email={auth?.user.email}
          navDict={dict.nav}
        />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-red-400 font-figtree">{d.error}</p>
        </main>
      </div>
    );
  }

  const eventState = deriveEventState(event);

  async function handleBookOrder() {
    if (!event || eventState === "cancelled") return;
    const authResult = loadAuth();
    const tokens = authResult?.auth;
    const tokensValid = authResult?.tokensValid ?? false;

    const [y, m, day] = event.eventDate.split("-").map(Number);
    const date = y && m && day ? new Date(y, m - 1, day) : null;

    // If the events list API didn't include distanceKm, calculate it on demand.
    let distanceKm: number | null = event.distanceKm ?? null;
    if (distanceKm == null && event.venueAddress) {
      const cityNorm = (event.city || "").trim().toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "");
      const isChisinau = cityNorm === "chisinau" || cityNorm === "kishinev" || cityNorm === "chisineu";
      if (!isChisinau) {
        try {
          const r = await fetch(`/api/geocode/distance?destination=${encodeURIComponent(event.venueAddress)}`);
          if (r.ok) {
            const dist = await r.json() as { distanceKm?: number | null } | null;
            if (dist?.distanceKm != null) distanceKm = dist.distanceKm;
          }
        } catch {}
      }
    }

    const prefilledState = {
      date: date
        ? { y: date.getFullYear(), m: date.getMonth(), d: date.getDate() }
        : null,
      guests: event.guestCount || 1,
      selectedServices: [],
      selectedPackages: {},
      guestsPerService: {},
      city: event.city || "",
      address: event.venueAddress || "",
      postalCode: event.postalCode || "",
      venueName: event.venueTitle || "",
      latitude: null,
      longitude: null,
      distanceKm,
      startTime: event.eventStartTime || "",
      notes: event.notes ?? "",
      contactType: tokens?.user.isCompany ? "company" : "person",
      companyName: tokens?.user.companyName ?? "",
      idno: tokens?.user.idno ?? "",
      firstName: tokens?.user.firstName ?? "",
      lastName: tokens?.user.lastName ?? "",
      email: tokens?.user.email ?? "",
      phone: tokens?.user.phoneNumber ?? "+373",
      paymentOption: "now",
      smsSent: false,
      smsVerified: tokensValid && !!tokens?.user.phoneNumber,
      emailSent: false,
      emailVerified: tokensValid && !!tokens?.user.email,
      userId: tokensValid ? (tokens?.user.userId ?? "") : "",
      customerId: tokensValid ? (tokens?.user.customerId ?? "") : "",
      bookingRef: "",
      reservationToken: "",
      existingEventId: event.id,
    };

    try {
      sessionStorage.removeItem("lecercle_booking_flow");
      sessionStorage.setItem(
        "lecercle_booking_flow",
        JSON.stringify({
          step: 2,
          isAddOrder: true,
          returnUrl: `/${locale}/account/events/${eventId}`,
          state: prefilledState,
        }),
      );
    } catch {}

    router.push(`/${locale}/booking`);
  }

  const stateBadgeClasses: Record<EventState, string> = {
    pending: "bg-[#1f1400] border-[#3a2a00] text-[#fbbf24]",
    confirmed: "bg-[#0a2010] border-[#1a4a2a] text-[#4ade80]",
    draft: "bg-[#1a0f00] border-[#3a2000] text-[#fb923c]",
    past: "bg-[#1a1a1a] border-[#2a2a2a] text-[#888]",
    cancelled: "bg-[#1a0505] border-[#3a1010] text-[#f87171]",
    completed: "bg-[#0a0f1f] border-[#1a2a4a] text-[#60a5fa]",
  };

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
            {/* Back link */}
            <Link
              href={`/${locale}/account`}
              className="inline-flex items-center text-[13px] text-[#666] font-figtree tracking-tight hover:text-[#c0c0c0] transition-colors mb-6"
            >
              {d.back}
            </Link>

            {/* Event header */}
            <div className="mb-6 sm:mb-8">
              {/* Title row — on desktop shows buttons on the right; on mobile buttons are below */}
              <div className="flex items-start justify-between gap-4 mb-2 sm:mb-3">
                <h1 className="text-[28px] sm:text-[40px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none">
                  {event.venueTitle || "—"}
                </h1>
                {/* Desktop-only buttons / badge */}
                {eventState === "cancelled" ? (
                  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest border shrink-0 ${stateBadgeClasses[eventState]}`}>
                    {stateLabel(eventState, d)}
                  </span>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <button type="button" onClick={openEdit} className="px-4 py-2.5 border border-[#3a3a3a] text-sm font-medium text-[#f0f0f0] font-figtree tracking-tight hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                      {d.edit_event}
                    </button>
                    <button type="button" onClick={handleBookOrder} className="px-4 py-2.5 border border-[#3a3a3a] text-sm font-medium text-[#f0f0f0] font-figtree tracking-tight hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                      {d.add_order}
                    </button>
                    {!cancelConfirming ? (
                      <button type="button" onClick={() => setCancelConfirming(true)} className="px-4 py-2.5 border border-[#3a1010] text-sm font-medium text-[#f87171] font-figtree tracking-tight hover:bg-[#1a0505] transition-colors cursor-pointer">
                        {d.cancel_event}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={handleCancel} disabled={cancelLoading} className="px-4 py-2.5 border border-[#3a1010] bg-[#1a0505] text-sm font-medium text-[#f87171] font-figtree tracking-tight hover:bg-[#220808] transition-colors cursor-pointer disabled:opacity-50">
                          {cancelLoading ? "…" : d.cancel_event_yes}
                        </button>
                        <button type="button" onClick={() => { setCancelConfirming(false); setCancelError(false); }} disabled={cancelLoading} className="px-4 py-2.5 border border-[#3a3a3a] text-sm font-medium text-[#888] font-figtree tracking-tight hover:text-[#f0f0f0] hover:border-[#555] transition-colors cursor-pointer disabled:opacity-50">
                          {d.cancel_event_no}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Subtitle: date · time · city · guests */}
              <p className="text-[13px] sm:text-[15px] text-[#888] font-figtree tracking-tight">
                {[
                  formatDateShort(event.eventDate),
                  event.eventStartTime ? formatTime(event.eventStartTime) : null,
                  event.city,
                  event.guestCount ? `${event.guestCount} ${d.guests_unit}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              {/* Mobile-only action buttons — below subtitle */}
              {eventState !== "cancelled" && (
                <div className="flex sm:hidden flex-col gap-2 mt-4">
                  {!cancelConfirming ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={openEdit} className="flex-1 px-3 py-2.5 border border-[#3a3a3a] text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                        {d.edit_event}
                      </button>
                      <button type="button" onClick={handleBookOrder} className="flex-1 px-3 py-2.5 border border-[#3a3a3a] text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                        {d.add_order}
                      </button>
                      <button type="button" onClick={() => setCancelConfirming(true)} className="flex-1 px-3 py-2.5 border border-[#3a1010] text-[13px] font-medium text-[#f87171] font-figtree tracking-tight hover:bg-[#1a0505] transition-colors cursor-pointer">
                        {d.cancel_event}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] text-red-400 font-figtree tracking-tight">{d.cancel_event_confirm}</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={handleCancel} disabled={cancelLoading} className="flex-1 px-3 py-2.5 border border-[#3a1010] bg-[#1a0505] text-[13px] font-medium text-[#f87171] font-figtree tracking-tight hover:bg-[#220808] transition-colors cursor-pointer disabled:opacity-50">
                          {cancelLoading ? "…" : d.cancel_event_yes}
                        </button>
                        <button type="button" onClick={() => { setCancelConfirming(false); setCancelError(false); }} disabled={cancelLoading} className="flex-1 px-3 py-2.5 border border-[#3a3a3a] text-[13px] font-medium text-[#888] font-figtree tracking-tight hover:text-[#f0f0f0] transition-colors cursor-pointer disabled:opacity-50">
                          {d.cancel_event_no}
                        </button>
                      </div>
                    </div>
                  )}
                  {cancelError && (
                    <p className="text-[12px] text-red-400 font-figtree tracking-tight">{d.cancel_event_error}</p>
                  )}
                </div>
              )}

              {/* Desktop cancel confirmation message + error */}
              {cancelConfirming && eventState !== "cancelled" && (
                <p className="hidden sm:block text-[13px] text-red-400 font-figtree tracking-tight mt-2">{d.cancel_event_confirm}</p>
              )}
              {cancelError && eventState !== "cancelled" && (
                <p className="hidden sm:block text-[12px] text-red-400 font-figtree tracking-tight mt-1">{d.cancel_event_error}</p>
              )}
            </div>

            {/* Orders list */}
            {orders.length === 0 ? (
              <p className="text-sm text-[#666] font-figtree tracking-tight py-12 text-center border border-[#1e1e1e]">
                Nu există comenzi pentru acest eveniment.
              </p>
            ) : (
              <div className="flex flex-col gap-0 border border-[#1e1e1e]">
                {ordersWithState.map(({ order, state }) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    state={state}
                    locale={locale}
                    eventId={eventId}
                    viewLabel={d.view_order ?? "Detalii"}
                    d={d}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Edit Event Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg bg-[#0f0f0f] border border-[#222] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
              <p className="text-sm font-medium text-[#f0f0f0] font-figtree tracking-tight">
                {d.edit_event}
              </p>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="text-[#555] hover:text-[#c0c0c0] transition-colors text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto max-h-[70vh]">
              {/* Date — read-only */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#888] font-figtree tracking-tight">
                  Date
                </label>
                <input
                  type="date"
                  value={editForm.eventDate}
                  disabled
                  className="w-full px-3 py-2.5 bg-[#111] border border-[#2a2a2a] text-[14px] text-[#555] font-figtree tracking-tight opacity-50 cursor-not-allowed"
                />
              </div>

              {/* Venue name with autocomplete */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[12px] font-medium text-[#888] font-figtree tracking-tight">
                  Venue name
                </label>
                <input
                  type="text"
                  value={editForm.venueTitle}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, venueTitle: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-[#111] border border-[#2a2a2a] text-[14px] text-[#f0f0f0] font-figtree tracking-tight focus:outline-none focus:border-[#4a4a4a] transition-colors"
                />
                {venueSuggestions.length > 0 && (
                  <ul className="absolute z-30 top-full left-0 right-0 mt-0.5 bg-[#1a1a1a] border border-[#2a2a2a] max-h-48 overflow-y-auto">
                    {venueSuggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onMouseDown={() => handleVenueSuggestionSelect(s)}
                          className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors"
                        >
                          <span className="block text-[13px] text-[#f0f0f0] font-figtree tracking-tight">
                            {s.label}
                          </span>
                          {s.sublabel && (
                            <span className="block text-[11px] text-[#666] font-figtree tracking-tight">
                              {s.sublabel}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#888] font-figtree tracking-tight">
                  City
                </label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, city: e.target.value, distanceKm: null }))
                  }
                  className="w-full px-3 py-2.5 bg-[#111] border border-[#2a2a2a] text-[14px] text-[#f0f0f0] font-figtree tracking-tight focus:outline-none focus:border-[#4a4a4a] transition-colors"
                />
              </div>

              {/* Address with autocomplete */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[12px] font-medium text-[#888] font-figtree tracking-tight">
                  Address
                </label>
                <input
                  type="text"
                  value={editForm.venueAddress}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, venueAddress: e.target.value, distanceKm: null }))
                  }
                  className="w-full px-3 py-2.5 bg-[#111] border border-[#2a2a2a] text-[14px] text-[#f0f0f0] font-figtree tracking-tight focus:outline-none focus:border-[#4a4a4a] transition-colors"
                />
              </div>

              {/* Remaining plain fields */}
              {[
                { key: "eventStartTime", label: "Start time", type: "time" },
                { key: "guestCount", label: "Guests", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#888] font-figtree tracking-tight">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={editForm[key as keyof typeof editForm] as string}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-[#111] border border-[#2a2a2a] text-[14px] text-[#f0f0f0] font-figtree tracking-tight focus:outline-none focus:border-[#4a4a4a] transition-colors"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#888] font-figtree tracking-tight">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 bg-[#111] border border-[#2a2a2a] text-[14px] text-[#f0f0f0] font-figtree tracking-tight focus:outline-none focus:border-[#4a4a4a] transition-colors resize-none"
                />
              </div>
              {editError && (
                <p className="text-xs text-red-400 font-figtree tracking-tight">
                  {d.edit_event_error}
                </p>
              )}
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-[#1e1e1e]">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 border border-[#2a2a2a] text-sm font-medium text-[#888] font-figtree tracking-tight hover:bg-[#1a1a1a] hover:text-[#c0c0c0] transition-colors cursor-pointer"
              >
                {d.edit_event_cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editSaving || dateAvailable === false || checkingDate}
                className="flex-1 py-2.5 bg-[#f0f0f0] text-[#080808] text-sm font-medium font-figtree tracking-tight hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {editSaving ? "..." : d.edit_event_save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  state,
  locale,
  eventId,
  viewLabel,
  d,
}: {
  order: OrderDetail;
  state: EventState;
  locale: string;
  eventId: string;
  viewLabel: string;
  d: EventDetailDict;
}) {
  const day = formatDay(order.createdAt ?? "");
  const year = formatYear(order.createdAt ?? "");
  const services = [...new Set((order.items ?? []).map((i) => i.serviceName))];

  return (
    <Link
      href={`/${locale}/account/events/${eventId}/orders/${order.id}`}
      className="flex items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-5 py-4 border-b border-[#141414] last:border-b-0 bg-[#0c0c0c] hover:bg-[#0f0f0f] active:bg-[#111] transition-colors"
    >
      {/* Date */}
      <div className="w-20 sm:w-24 shrink-0 flex flex-col pt-0.5">
        <span className="text-[20px] sm:text-[22px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none whitespace-nowrap">
          {day}
        </span>
        <span className="text-[11px] sm:text-xs text-[#555] font-figtree tracking-tight mt-0.5">
          {year}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[15px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
          {services.length > 0
            ? services.join(" · ")
            : order.orderNumber || "—"}
        </p>
        {order.orderNumber && (
          <p className="text-[13px] text-[#666] font-figtree tracking-tight truncate">
            {order.orderNumber}
            {order.totalAmount ? ` · ${formatMDL(order.totalAmount)}` : ""}
          </p>
        )}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {services.map((s) => (
              <span
                key={s}
                className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium font-figtree tracking-tight border border-[#2a2a2a] bg-[#141414] text-[#777]"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {/* Status row — mobile only */}
        <div className="flex items-center gap-2 mt-1 sm:hidden">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium font-figtree tracking-widest border ${stateBadgeClass(state)}`}
          >
            {stateLabel(state, d)}
          </span>
        </div>
      </div>

      {/* Status — desktop only */}
      <div className="hidden sm:flex shrink-0 flex-col items-start gap-1 min-w-35">
        <span
          className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest border ${stateBadgeClass(state)}`}
        >
          {stateLabel(state, d)}
        </span>
      </div>

      {/* CTA — desktop only */}
      <span className="hidden sm:inline-flex shrink-0 px-4 py-2 border border-[#2a2a2a] text-sm font-medium text-[#c0c0c0] font-figtree tracking-tight transition-colors">
        {viewLabel}
      </span>

      {/* Chevron — mobile only */}
      <div className="sm:hidden shrink-0 self-center text-[#444]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}
