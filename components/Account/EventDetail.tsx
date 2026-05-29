"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadAuth, clearAuth, fetchWithRefresh, StoredAuth } from "@/components/BookingFlow/utils/auth";
import AccountTopBar from "./shared/AccountTopBar";
import { formatDay, formatYear, formatDateShort, formatTime, formatMDL, pickAmount } from "./shared/format";
import { EventBooking, OrderDetail, deriveEventState, deriveOrderState, type EventState } from "./shared/types";
import { whatsapp } from "@/data/venues/constants/links";

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
    case "confirmed":  return "bg-[#0a2010] border border-[#1a4a2a] text-[#4ade80]";
    case "pending":    return "bg-[#1f1400] border border-[#3a2a00] text-[#fbbf24]";
    case "draft":      return "bg-[#1a0f00] border border-[#3a2000] text-[#fb923c]";
    case "past":       return "bg-[#1a1a1a] border border-[#2a2a2a] text-[#888]";
    case "cancelled":  return "bg-[#1a0505] border border-[#3a1010] text-[#f87171]";
    default:           return "bg-[#1f1400] border border-[#3a2a00] text-[#fbbf24]";
  }
}

function stateLabel(state: EventState, d: EventDetailDict): string {
  switch (state) {
    case "confirmed": return d.badge_confirmed;
    case "pending":   return d.badge_pending;
    case "draft":     return d.badge_draft;
    case "past":      return d.badge_past;
    case "cancelled": return d.badge_cancelled;
    default:          return d.badge_pending;
  }
}

function orderSubText(state: EventState, order: OrderDetail): string {
  const total = pickAmount(order.totalAmount);
  switch (state) {
    case "confirmed": return "Tot este în regulă";
    case "pending":   return "Avans neplătit";
    case "draft":     return "Rezervare în progres";
    case "past":      return total > 0 ? "Plăți finalizate" : "Finalizat";
    case "cancelled": return "Anulat";
    default:          return "";
  }
}

export default function EventDetail({ locale, eventId, dict }: Props) {
  const router = useRouter();
  const d = dict.event_detail;

  const [auth] = useState<StoredAuth | null>(() => loadAuth()?.auth ?? null);
  const [event, setEvent] = useState<EventBooking | null>(null);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!auth) { router.replace(`/${locale}/account/login`); return; }
    const customerId = auth.user.customerId;
    if (!customerId) { setError(true); setLoading(false); return; }

    async function load() {
      try {
        const [evRes, ordRes] = await Promise.all([
          fetchWithRefresh(`/api/account/events?customerId=${encodeURIComponent(customerId!)}`),
          fetchWithRefresh(`/api/account/orders?eventId=${encodeURIComponent(eventId)}`),
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
          if (!found) { setError(true); setLoading(false); return; }
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

  const initials = auth
    ? `${auth.user.firstName?.[0] ?? ""}${auth.user.lastName?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";
  const displayName = auth
    ? `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim() || (auth.user.phoneNumber ?? "—")
    : "—";

  const ordersWithState = useMemo(() =>
    orders.map((order) => ({ order, state: deriveOrderState(order) })),
    [orders]
  );

  if (loading) {
    return (
      <div className="min-h-svh bg-[#080808] flex flex-col">
        <AccountTopBar locale={locale} initials={initials} displayName={displayName} email={auth?.user.email} navDict={dict.nav} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#666] font-figtree">{d.loading}</p>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-svh bg-[#080808] flex flex-col">
        <AccountTopBar locale={locale} initials={initials} displayName={displayName} email={auth?.user.email} navDict={dict.nav} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-red-400 font-figtree">{d.error}</p>
        </main>
      </div>
    );
  }

  const eventState = deriveEventState(event);

  function handleBookOrder() {
    if (!event || eventState === "cancelled") return;
    const authResult = loadAuth();
    const tokens = authResult?.auth;
    const tokensValid = authResult?.tokensValid ?? false;

    const [y, m, day] = event.eventDate.split("-").map(Number);
    const date = y && m && day ? new Date(y, m - 1, day) : null;

    const prefilledState = {
      date: date ? { y: date.getFullYear(), m: date.getMonth(), d: date.getDate() } : null,
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
      distanceKm: event.distanceKm ?? null,
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
      smsVerified: tokensValid && !!(tokens?.user.phoneNumber),
      emailSent: false,
      emailVerified: tokensValid && !!(tokens?.user.email),
      userId: tokensValid ? (tokens?.user.userId ?? "") : "",
      customerId: tokensValid ? (tokens?.user.customerId ?? "") : "",
      bookingRef: "",
      reservationToken: "",
      existingEventId: event.id,
    };

    try {
      sessionStorage.removeItem("lecercle_booking_flow");
      sessionStorage.setItem("lecercle_booking_flow", JSON.stringify({
        step: 2,
        isAddOrder: true,
        returnUrl: `/${locale}/account/events/${eventId}`,
        state: prefilledState,
      }));
    } catch {}

    router.push(`/${locale}/booking`);
  }

  const stateBadgeClasses: Record<EventState, string> = {
    pending:   "bg-[#1f1400] border-[#3a2a00] text-[#fbbf24]",
    confirmed: "bg-[#0a2010] border-[#1a4a2a] text-[#4ade80]",
    draft:     "bg-[#1a0f00] border-[#3a2000] text-[#fb923c]",
    past:      "bg-[#1a1a1a] border-[#2a2a2a] text-[#888]",
    cancelled: "bg-[#1a0505] border-[#3a1010] text-[#f87171]",
  };

  return (
    <div className="min-h-svh bg-[#080808] flex flex-col">
      <AccountTopBar locale={locale} initials={initials} displayName={displayName} email={auth?.user.email} navDict={dict.nav} />

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
              <div className="flex items-start justify-between gap-4 mb-2 sm:mb-3">
                <h1 className="text-[28px] sm:text-[40px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none">
                  {event.venueTitle || "—"}
                </h1>
                {eventState !== "cancelled" ? (
                  <button
                    type="button"
                    onClick={handleBookOrder}
                    className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 border border-[#3a3a3a] text-[13px] sm:text-sm font-medium text-[#f0f0f0] font-figtree tracking-tight hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    {d.add_order}
                  </button>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest border shrink-0 ${stateBadgeClasses[eventState]}`}>
                    {stateLabel(eventState, d)}
                  </span>
                )}
              </div>
              <p className="text-[13px] sm:text-[15px] text-[#888] font-figtree tracking-tight">
                {[
                  formatDateShort(event.eventDate),
                  event.eventStartTime ? formatTime(event.eventStartTime) : null,
                  event.city,
                  event.guestCount ? `${event.guestCount} ${d.guests_unit}` : null,
                ].filter(Boolean).join(" · ")}
              </p>
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
  const day     = formatDay(order.createdAt ?? "");
  const year    = formatYear(order.createdAt ?? "");
  const subText = orderSubText(state, order);
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
        <span className="text-[11px] sm:text-xs text-[#555] font-figtree tracking-tight mt-0.5">{year}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[15px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
          {services.length > 0 ? services.join(" · ") : (order.orderNumber || "—")}
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
          <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium font-figtree tracking-widest border ${stateBadgeClass(state)}`}>
            {stateLabel(state, d)}
          </span>
          {subText && (
            <span className="text-[12px] text-[#666] font-figtree tracking-tight">{subText}</span>
          )}
        </div>
      </div>

      {/* Status — desktop only */}
      <div className="hidden sm:flex shrink-0 flex-col items-start gap-1 min-w-35">
        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest border ${stateBadgeClass(state)}`}>
          {stateLabel(state, d)}
        </span>
        {subText && (
          <span className="text-[12px] text-[#666] font-figtree tracking-tight">{subText}</span>
        )}
      </div>

      {/* CTA — desktop only */}
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
