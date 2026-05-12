"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loadAuth, clearAuth, fetchWithRefresh, StoredAuth } from "@/components/BookingFlow/utils/auth";
import AccountTopBar from "./shared/AccountTopBar";
import { formatDate, formatDateShort, formatMDL, formatTime, pickAmount } from "./shared/format";
import { EventBooking, OrderDetail, Contract, deriveEventState, type EventState } from "./shared/types";
import { VENUE_INFO } from "@/components/BookingFlow/types";

function getVenueInfo(serviceId: string) {
  return (VENUE_INFO as Record<string, { name: string; logo: string } | undefined>)[serviceId];
}

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

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-4 ${className ?? ""}`}>
      {children}
    </p>
  );
}

function DetailRow({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-2.5 border-b border-[#141414] last:border-b-0">
      <span className="text-[13px] text-[#888] font-figtree tracking-tight shrink-0">{label}</span>
      <span className={`text-[13px] text-right font-figtree tracking-tight ${valueClass ?? "text-[#f0f0f0]"}`}>
        {value}
      </span>
    </div>
  );
}

function StateBadge({ state, label }: { state: EventState; label: string }) {
  const classes: Record<EventState, string> = {
    pending: "bg-[#1f1400] border-[#3a2a00] text-[#fbbf24]",
    confirmed: "bg-[#0a2010] border-[#1a4a2a] text-[#4ade80]",
    draft: "bg-[#1a0f00] border-[#3a2000] text-[#fb923c]",
    past: "bg-[#1a1a1a] border-[#2a2a2a] text-[#888]",
    cancelled: "bg-[#1a0505] border-[#3a1010] text-[#f87171]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest border ${classes[state]}`}>
      · {label}
    </span>
  );
}

function TimelineStep({
  done,
  active,
  label,
  sub,
}: {
  done: boolean;
  active?: boolean;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col items-center shrink-0 mt-0.5">
        <div className={`size-3 rounded-full border-2 flex items-center justify-center ${
          done
            ? "bg-[#f0f0f0] border-[#f0f0f0]"
            : active
              ? "bg-transparent border-[#fbbf24]"
              : "bg-transparent border-[#3a3a3a]"
        }`}>
          {done && <div className="size-1.5 rounded-full bg-[#080808]" />}
        </div>
      </div>
      <div className="flex flex-col gap-0.5 pb-4 min-w-0">
        <p className={`text-[13px] font-medium font-figtree tracking-tight ${done ? "text-[#f0f0f0]" : active ? "text-[#fbbf24]" : "text-[#555]"}`}>
          {label}
        </p>
        {sub && (
          <p className={`text-[12px] font-figtree tracking-tight ${done ? "text-[#888]" : "text-[#555]"}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function DocRow({
  name,
  number,
  status,
  statusClass,
  fileUrl,
  downloadLabel,
}: {
  name: string;
  number?: string;
  status: string;
  statusClass: string;
  fileUrl?: string | null;
  downloadLabel: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#141414] last:border-b-0">
      <div className="size-8 border border-[#2a2a2a] bg-[#111] shrink-0 flex items-center justify-center">
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
          <path d="M8 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6L8 1Z" stroke="#555" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M8 1v5h5" stroke="#555" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">{name}</p>
        {number && <p className="text-[12px] text-[#666] font-figtree tracking-tight">{number}</p>}
      </div>
      <span className={`text-[11px] font-medium font-figtree tracking-widest border px-2 py-0.5 shrink-0 ${statusClass}`}>
        · {status}
      </span>
      {fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 border border-[#2a2a2a] text-[13px] font-medium text-[#c0c0c0] font-figtree tracking-tight hover:border-[#4a4a4a] hover:text-[#f0f0f0] transition-colors"
        >
          {downloadLabel}
        </a>
      ) : (
        <div className="shrink-0 px-3 py-1.5 border border-[#1e1e1e] text-[13px] text-[#444] font-figtree tracking-tight cursor-not-allowed">
          {downloadLabel}
        </div>
      )}
    </div>
  );
}

function contractStatusClass(status: string): string {
  const s = (status ?? "").toLowerCase();
  if (s === "signed" || s === "semnat" || s === "paid" || s === "platita") return "bg-[#0a2010] border-[#1a4a2a] text-[#4ade80]";
  if (s === "issued" || s === "emis") return "bg-[#111] border-[#2a2a2a] text-[#888]";
  if (s === "awaiting_signature" || s === "pending_signature") return "bg-[#1a0f00] border-[#3a2000] text-[#fb923c]";
  if (s === "cancelled" || s === "canceled" || s === "anulat") return "bg-[#1a0505] border-[#3a1010] text-[#f87171]";
  return "bg-[#1f1400] border-[#3a2a00] text-[#fbbf24]";
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EventDetail({ locale, eventId, dict }: Props) {
  const router = useRouter();
  const d = dict.event_detail;

  const [auth] = useState<StoredAuth | null>(() => loadAuth()?.auth ?? null);
  const [event, setEvent] = useState<EventBooking | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(() => !!auth?.user.customerId);
  const [error, setError] = useState(() => !!auth && !auth.user.customerId);
  const [payingOnline, setPayingOnline] = useState(false);
  const [payOnlineError, setPayOnlineError] = useState(false);

  useEffect(() => {
    if (!auth) {
      router.replace(`/${locale}/account/login`);
      return;
    }

    const customerId = auth.user.customerId;
    if (!customerId) return;

    async function load() {
      try {
        // Fetch all events to find this one
        const evRes = await fetchWithRefresh(`/api/account/orders?customerId=${encodeURIComponent(customerId!)}`);
        if (evRes.status === 401) { clearAuth(); router.replace(`/${locale}/account/login`); return; }
        if (!evRes.ok) throw new Error("events");
        const evData = await evRes.json();
        const list: EventBooking[] = Array.isArray(evData) ? evData : (evData?.items ?? evData?.events ?? []);
        const found = list.find((e) => e.id === eventId);
        if (!found) { setError(true); setLoading(false); return; }
        setEvent(found);

        // Fetch order detail
        const primaryOrderId = found.orders?.[0]?.id;
        if (primaryOrderId) {
          const ordRes = await fetchWithRefresh(`/api/account/orders/${primaryOrderId}`);
          if (ordRes.ok) {
            const ordData: OrderDetail = await ordRes.json();
            setOrder(ordData);
          }
        }

        // Fetch contracts
        const cRes = await fetchWithRefresh("/api/account/contracts");
        if (cRes.ok) {
          const cData = await cRes.json();
          const allContracts: Contract[] = Array.isArray(cData) ? cData : (cData?.items ?? cData?.contracts ?? []);
          setContracts(allContracts.filter((c) =>
            c.orderId === primaryOrderId || c.eventId === eventId
          ));
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [auth, locale, eventId, router]);

  async function handlePayOnline() {
    const orderId = order?.id ?? event?.orders?.[0]?.id;
    if (!orderId) return;
    setPayingOnline(true);
    setPayOnlineError(false);
    try {
      const payRes = await fetch("/api/booking/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentMethod: "Card",
          language: locale,
          returnUrl: `${window.location.origin}/${locale}/booking/payment-success?orderId=${orderId}`,
        }),
      });
      if (!payRes.ok) throw new Error(`payment ${payRes.status}`);
      const { paymentUrl } = await payRes.json();
      window.location.href = paymentUrl;
    } catch {
      setPayOnlineError(true);
      setPayingOnline(false);
    }
  }

  const initials = auth
    ? `${auth.user.firstName?.[0] ?? ""}${auth.user.lastName?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";
  const displayName = auth
    ? `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim() || (auth.user.phoneNumber ?? "—")
    : "—";

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

  const state = deriveEventState(event, order);
  const primaryOrder = event.orders?.[0];
  const itemsTotal = order?.items?.reduce((s, it) => s + pickAmount(it.unitPrice) * (it.quantity ?? 1), 0) ?? 0;
  const roadTotal = order?.items?.reduce((s, it) => s + pickAmount(it.roadPrice), 0) ?? 0;
  const total = pickAmount(order?.totalAmount, primaryOrder?.totalAmount) || (itemsTotal + roadTotal);
  const advance = pickAmount(order?.advanceAmount, primaryOrder?.advanceAmount) || (total > 0 ? Math.round(total * 0.1) : 0);
  const rest = total - advance;
  const advanceDisplay = advance > 0 ? formatMDL(advance) : "—";

  // Use simpler labels for badge
  const stateBadgeLabels: Record<EventState, string> = {
    pending: "IN AȘTEPTARE",
    confirmed: "CONFIRMAT",
    draft: "ÎN PROCESARE",
    past: "TRECUT",
    cancelled: "ANULAT",
  };

  return (
    <div className="min-h-svh bg-[#080808] flex flex-col">
      <AccountTopBar locale={locale} initials={initials} displayName={displayName} email={auth?.user.email} navDict={dict.nav} />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-432">
          <div className="mx-auto max-w-295 px-4 sm:px-6 lg:px-8 2xl:px-0 py-10">

            {/* Back link */}
            <Link
              href={`/${locale}/account`}
              className="inline-flex items-center text-[13px] text-[#666] font-figtree tracking-tight hover:text-[#c0c0c0] transition-colors mb-6"
            >
              {d.back}
            </Link>

            {/* Event title row */}
            <div className="flex items-start justify-between gap-6 mb-8">
              <div className="flex flex-col gap-1">
                <h1 className="text-[32px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-tight">
                  {event.venueTitle || "—"}
                </h1>
                <p className="text-[14px] text-[#888] font-figtree tracking-tight">
                  {[event.eventType, formatDateShort(event.eventDate), event.eventStartTime?.slice(0, 5), event.venueAddress]
                    .filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StateBadge state={state} label={stateBadgeLabels[state]} />
                <a
                  href="https://wa.me/37300000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-[#2a2a2a] text-[13px] font-medium text-[#c0c0c0] font-figtree tracking-tight hover:border-[#4a4a4a] hover:text-[#f0f0f0] transition-colors"
                >
                  {d.contact_us}
                </a>
                {(state === "past" || state === "cancelled") && (
                  <Link
                    href={`/${locale}/booking`}
                    className="px-3 py-2 border border-[#2a2a2a] text-[13px] font-medium text-[#c0c0c0] font-figtree tracking-tight hover:border-[#4a4a4a] hover:text-[#f0f0f0] transition-colors"
                  >
                    {state === "past" ? d.book_again : d.book_new}
                  </Link>
                )}
                {(state === "pending" || state === "confirmed" || state === "draft") && (
                  <button
                    type="button"
                    className="px-3 py-2 border border-[#3a1010] text-[13px] font-medium text-[#f87171] font-figtree tracking-tight hover:bg-[#1a0505] transition-colors cursor-pointer"
                  >
                    {state === "draft" ? d.delete_draft : d.cancel_event}
                  </button>
                )}
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-[1fr_320px] gap-8 items-start">

              {/* ── LEFT MAIN CONTENT ───────────────────────────── */}
              <div className="flex flex-col gap-0">

                {/* ── PENDING: Action banner ─── */}
                {state === "pending" && (
                  <div className="border border-[#3a2a00] bg-[#110c00] p-6 mb-0">
                    <p className="text-[11px] font-medium text-[#fbbf24] font-figtree tracking-[0.12em] uppercase mb-2">
                      {d.pending_action_label.replace("{time}", "23:41")}
                    </p>
                    <p className="text-[20px] font-semibold text-[#f0f0f0] font-figtree tracking-tight mb-2">
                      {d.pending_action_title.replace("{amount}", advanceDisplay)}
                    </p>
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight mb-5">
                      {d.pending_action_sub
                        .replace("{date}", formatDateShort(event.createdAt ?? event.eventDate))
                        .replace("{rest}", rest > 0 ? formatMDL(rest) : "—")}
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handlePayOnline}
                          disabled={payingOnline || !(order?.id ?? event.orders?.[0]?.id)}
                          className="px-5 py-2.5 bg-[#f0f0f0] text-[#080808] text-[13px] font-semibold font-figtree tracking-tight hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {payingOnline ? "···" : d.pay_online.replace("{amount}", advanceDisplay)}
                        </button>
                        <a
                          href="https://wa.me/37300000000"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 border border-[#3a2a00] text-[#fbbf24] text-[13px] font-medium font-figtree tracking-tight hover:bg-[#1f1400] transition-colors"
                        >
                          {d.pay_cash}
                        </a>
                      </div>
                      {payOnlineError && (
                        <p className="text-[12px] text-red-400 font-figtree tracking-tight">{d.pay_error}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── CONFIRMED: Banner ─── */}
                {state === "confirmed" && (
                  <div className="border border-[#1a4a2a] bg-[#05180a] p-6 mb-0">
                    <p className="text-[11px] font-medium text-[#4ade80] font-figtree tracking-[0.12em] uppercase mb-2">
                      {d.confirmed_banner_label}
                    </p>
                    <p className="text-[20px] font-semibold text-[#f0f0f0] font-figtree tracking-tight mb-2">
                      {d.confirmed_banner_title}
                    </p>
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight mb-5">
                      {d.confirmed_banner_sub}
                    </p>
                    <a
                      href="https://wa.me/37300000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex px-5 py-2.5 border border-[#1a4a2a] text-[#4ade80] text-[13px] font-medium font-figtree tracking-tight hover:bg-[#0a2010] transition-colors"
                    >
                      {d.contact_team}
                    </a>
                  </div>
                )}

                {/* ── DRAFT: Banner ─── */}
                {state === "draft" && (
                  <div className="border border-[#3a2000] bg-[#100800] p-6 mb-0">
                    <p className="text-[11px] font-medium text-[#fb923c] font-figtree tracking-[0.12em] uppercase mb-2">
                      {d.draft_banner_label.replace("{date}", formatDate(event.createdAt ?? ""))}
                    </p>
                    <p className="text-[20px] font-semibold text-[#f0f0f0] font-figtree tracking-tight mb-2">
                      {d.draft_banner_title}
                    </p>
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight mb-5">
                      {d.draft_banner_sub.replace("{step}", "4")}
                    </p>
                    <Link
                      href={`/${locale}/booking`}
                      className="inline-flex px-5 py-2.5 border border-[#3a2000] text-[#fb923c] text-[13px] font-medium font-figtree tracking-tight hover:bg-[#1a0f00] transition-colors"
                    >
                      {d.continue_to_step.replace("{step}", "4").replace("{name}", "Locație")}
                    </Link>
                  </div>
                )}

                {/* ── PAST: Banner ─── */}
                {state === "past" && (
                  <div className="border border-[#2a2a2a] bg-[#0e0e0e] p-6 mb-0">
                    <p className="text-[11px] font-medium text-[#888] font-figtree tracking-[0.12em] uppercase mb-2">
                      {d.past_banner_label}
                    </p>
                    <p className="text-[20px] font-semibold text-[#f0f0f0] font-figtree tracking-tight mb-2">
                      {d.past_banner_title.replace("{date}", formatDateShort(event.eventDate))}
                    </p>
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight mb-5">
                      {d.past_banner_sub}
                    </p>
                    <Link
                      href={`/${locale}/booking`}
                      className="inline-flex px-5 py-2.5 border border-[#2a2a2a] text-[#c0c0c0] text-[13px] font-medium font-figtree tracking-tight hover:bg-[#1a1a1a] transition-colors"
                    >
                      {d.book_similar}
                    </Link>
                  </div>
                )}

                {/* ── CANCELLED: Banner ─── */}
                {state === "cancelled" && (
                  <div className="border border-[#3a1010] bg-[#0f0404] p-6 mb-0">
                    <p className="text-[11px] font-medium text-[#f87171] font-figtree tracking-[0.12em] uppercase mb-2">
                      {d.cancelled_banner_label.replace("{date}", formatDate(event.cancelledAt ?? ""))}
                    </p>
                    <p className="text-[20px] font-semibold text-[#f0f0f0] font-figtree tracking-tight mb-2">
                      {d.cancelled_banner_title.replace("{amount}", formatMDL(pickAmount(event.refundAmount, advance)))}
                    </p>
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight mb-5">
                      {event.cancelReason
                        ? `${d.cancelled_reason_prefix} "${event.cancelReason}". ${d.cancelled_banner_sub}`
                        : d.cancelled_banner_sub}
                    </p>
                    <Link
                      href={`/${locale}/booking`}
                      className="inline-flex px-5 py-2.5 border border-[#3a1010] text-[#f87171] text-[13px] font-medium font-figtree tracking-tight hover:bg-[#1a0505] transition-colors"
                    >
                      {d.book_new}
                    </Link>
                  </div>
                )}

                {/* ── WHAT'S NEXT / HISTORY / PROGRESS ─── */}
                {(state === "pending" || state === "confirmed") && (
                  <Section label={d.section_whats_next}>
                    <PendingConfirmedSteps state={state} event={event} order={order} advance={advance} rest={rest} total={total} d={d} />
                  </Section>
                )}

                {(state === "past" || state === "cancelled") && (
                  <Section label={d.section_history}>
                    <HistorySteps state={state} event={event} order={order} advance={advance} rest={rest} d={d} />
                  </Section>
                )}

                {state === "draft" && (
                  <Section label={d.section_progress}>
                    <DraftProgress d={d} />
                  </Section>
                )}

                {/* ── EVENT DETAILS ─── */}
                <Section label={d.section_event_details}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[#1e1e1e] p-4">
                      <p className="text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-3">
                        {d.section_data}
                      </p>
                      <div className="flex flex-col">
                        <DetailRow label={d.date_label} value={formatDateShort(event.eventDate)} />
                        <DetailRow label={d.time_label} value={formatTime(event.eventStartTime)} />
                        <DetailRow label={d.guests_label} value={`${event.guestCount ?? 0} ${d.guests_unit}`} />
                        {event.eventType && <DetailRow label={d.event_type_label} value={event.eventType} />}
                      </div>
                    </div>
                    <div className="border border-[#1e1e1e] p-4">
                      <p className="text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-3">
                        {d.section_location}
                      </p>
                      <div className="flex flex-col">
                        {event.spaceType && <DetailRow label={d.space_type_label} value={event.spaceType} />}
                        <DetailRow label={d.location_label} value={event.venueTitle || "—"} />
                        <DetailRow
                          label={d.address_label}
                          value={
                            state === "cancelled"
                              ? <span className="text-[#666] italic">{d.address_anonymised}</span>
                              : event.venueAddress || "—"
                          }
                        />
                        {event.distanceKm != null && event.distanceKm > 0 && (
                          <DetailRow label={d.distance_label} value={`${event.distanceKm} km de Chișinău · ~${Math.round(event.distanceKm * 60 / 50)} min`} />
                        )}
                        {event.logisticsNotes && (
                          <DetailRow label={d.logistics_notes_label} value={event.logisticsNotes} />
                        )}
                        {event.accessInfo && (
                          <DetailRow label={d.access_label} value={event.accessInfo} />
                        )}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* ── SERVICES ─── */}
                {order?.items && order.items.length > 0 && (
                  <Section label={d.section_services}>
                    <div className="flex flex-col gap-3">
                      {order.items.map((item) => {
                        const info = getVenueInfo(item.serviceId);
                        const lineTotal = pickAmount(item.unitPrice) * (item.quantity ?? 1);
                        return (
                          <div key={item.id} className="border border-[#1e1e1e] p-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex flex-col gap-1 min-w-0">
                                {info ? (
                                  <Image src={info.logo} alt={info.name} width={100} height={36} className="h-8 w-auto object-contain object-left" />
                                ) : (
                                  <p className="text-[14px] font-medium text-[#f0f0f0] font-figtree tracking-tight">{item.serviceName}</p>
                                )}
                                {item.packageName && (
                                  <p className="text-[12px] text-[#888] font-figtree tracking-tight">{item.packageName}</p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[16px] font-semibold text-[#f0f0f0] font-figtree tracking-tight">
                                  {formatMDL(lineTotal)}
                                </p>
                                <p className="text-[11px] text-[#666] font-figtree tracking-tight">incl. TVA</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Transport */}
                      {roadTotal > 0 && (
                        <div className="border border-[#1e1e1e] bg-[#0c0c0c] p-4 flex items-center justify-between">
                          <div>
                            <p className="text-[14px] font-medium text-[#f0f0f0] font-figtree tracking-tight">
                              {d.transport_label}
                            </p>
                            {event.distanceKm != null && (
                              <p className="text-[12px] text-[#666] font-figtree tracking-tight">
                                {event.distanceKm} km de la Chișinău · inclus în servicii
                              </p>
                            )}
                          </div>
                          <p className="text-[16px] font-semibold text-[#f0f0f0] font-figtree tracking-tight">
                            {formatMDL(roadTotal)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Section>
                )}

                {/* Draft: show services with estimated cost label */}
                {state === "draft" && order?.items && order.items.length > 0 && (
                  <Section label={d.section_data_filled}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-[#1e1e1e] p-4">
                        <p className="text-[12px] text-[#888] font-figtree mb-1">Data</p>
                        <p className="text-[14px] text-[#f0f0f0] font-figtree">{formatDateShort(event.eventDate)}</p>
                      </div>
                      <div className="border border-[#1e1e1e] p-4">
                        <p className="text-[12px] text-[#888] font-figtree mb-1">Spațiu</p>
                        <p className={`text-[14px] font-figtree ${event.spaceType ? "text-[#f0f0f0]" : "text-[#fb923c]"}`}>
                          {event.spaceType || d.not_selected}
                        </p>
                      </div>
                      <div className="border border-[#1e1e1e] p-4">
                        <p className="text-[12px] text-[#888] font-figtree mb-1">Adresă</p>
                        <p className={`text-[14px] font-figtree ${event.venueAddress ? "text-[#f0f0f0]" : "text-[#fb923c]"}`}>
                          {event.venueAddress || d.not_selected}
                        </p>
                      </div>
                    </div>
                  </Section>
                )}

                {/* ── TOTAL ─── */}
                {total > 0 && state !== "draft" && (
                  <Section label={state === "past" ? d.section_total_paid : d.section_total}>
                    <div className="border border-[#1e1e1e] p-5">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className="text-[28px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none">
                            {formatMDL(total)}
                          </p>
                          <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1">{d.taxes_label}</p>
                        </div>
                        <div className="text-right flex flex-col gap-1">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.advance_label}</span>
                            <span className={`text-[13px] font-medium font-figtree tracking-tight ${
                              state === "past" || state === "confirmed" ? "text-[#4ade80]" : "text-[#fbbf24]"
                            }`}>
                              {formatMDL(advance)}
                              {(state === "past" || state === "confirmed") && (
                                <span className="text-[11px] ml-1">· {d.paid_badge}</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.rest_label}</span>
                            <span className={`text-[13px] font-medium font-figtree tracking-tight ${
                              state === "past" ? "text-[#4ade80]" : "text-[#f0f0f0]"
                            }`}>
                              {formatMDL(rest)}
                              {state === "past" && <span className="text-[11px] ml-1">· {d.paid_badge}</span>}
                              {state === "confirmed" && (
                                <span className="text-[11px] ml-1 text-[#888]">
                                  · {formatDateShort(event.eventDate)}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Section>
                )}

                {/* Draft estimated cost */}
                {state === "draft" && total > 0 && (
                  <Section label={d.estimated_cost_label}>
                    <div className="border border-[#1e1e1e] p-5">
                      <p className="text-[28px] font-semibold text-[#f0f0f0] font-figtree tracking-tight mb-1">
                        {formatMDL(total)}
                      </p>
                      <p className="text-[12px] text-[#888] font-figtree tracking-tight">
                        {d.transport_calculated}
                      </p>
                      <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1">
                        {d.advance_estimated.replace("{amount}", formatMDL(advance))}
                      </p>
                    </div>
                  </Section>
                )}

                {/* ── DOCUMENTS ─── */}
                <Section label={d.section_documents}>
                  {contracts.length === 0 ? (
                    <div className="border border-[#1e1e1e] p-6 flex flex-col items-center gap-2">
                      <div className="size-12 border border-[#2a2a2a] bg-[#111] flex items-center justify-center mb-2">
                        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                          <path d="M12 1H3a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8L12 1Z" stroke="#444" strokeWidth="1.5" strokeLinejoin="round"/>
                          <path d="M12 1v7h7" stroke="#444" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-[14px] font-medium text-[#f0f0f0] font-figtree tracking-tight">{d.no_docs}</p>
                      <p className="text-[12px] text-[#666] font-figtree tracking-tight text-center max-w-xs">{d.no_docs_sub}</p>
                    </div>
                  ) : (
                    <div className="border border-[#1e1e1e]">
                      {contracts.map((c) => (
                        <DocRow
                          key={c.id}
                          name={c.documentName || c.contractNumber || "Document"}
                          number={`${c.contractNumber || c.orderNumber} · ${c.generatedAt ? formatDate(c.generatedAt) : ""}`}
                          status={c.status?.toUpperCase() ?? "—"}
                          statusClass={contractStatusClass(c.status)}
                          fileUrl={c.fileUrl}
                          downloadLabel={d.download}
                        />
                      ))}
                    </div>
                  )}
                </Section>

                {/* ── CONTACT ─── */}
                {order && (order.contactPhone || order.contactEmail) && (
                  <Section label={d.section_contact}>
                    <div className="border border-[#1e1e1e] p-4">
                      <div className="flex flex-col">
                        {(order.contactFirstName || order.contactLastName) && (
                          <DetailRow
                            label={d.contact_label}
                            value={`${order.contactFirstName ?? ""} ${order.contactLastName ?? ""}`.trim()}
                          />
                        )}
                        {order.contactPhone && (
                          <DetailRow
                            label={d.contact_phone}
                            value={order.contactPhone}
                            valueClass="text-[#4ade80]"
                          />
                        )}
                        {order.contactEmail && (
                          <DetailRow label={d.contact_email} value={order.contactEmail} />
                        )}
                        {order.contactNotes && (
                          <DetailRow label={d.contact_notes} value={order.contactNotes} />
                        )}
                      </div>
                    </div>
                  </Section>
                )}
              </div>

              {/* ── RIGHT SIDEBAR ──────────────────────────────── */}
              <div className="flex flex-col gap-4">

                {/* Status card */}
                <div className="border border-[#1e1e1e] bg-[#0e0e0e] p-4">
                  <p className="text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-3">
                    {d.status_section_label}
                  </p>
                  <StateBadge state={state} label={stateBadgeLabels[state]} />
                  <p className="text-[12px] text-[#888] font-figtree tracking-tight mt-2">
                    {state === "confirmed" && d.confirmed_status_desc}
                    {state === "past" && d.past_status_desc}
                    {state === "cancelled" && d.cancelled_status_desc
                      .replace("{amount}", formatMDL(pickAmount(event.refundAmount, advance)))
                      .replace("{date}", formatDate(event.cancelledAt ?? ""))}
                    {state === "draft" && d.draft_status_title}
                    {state === "pending" && "Avans neplătit · data rezervată provizoriu"}
                  </p>
                  {state === "draft" && (
                    <>
                      <div className="mt-3 mb-1">
                        <span className="text-[11px] font-medium text-[#fb923c] font-figtree tracking-widest border border-[#3a2000] bg-[#1a0f00] px-2 py-0.5">
                          {d.draft_step_badge.replace("{current}", "4").replace("{total}", "6")}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="mt-3 w-full py-2.5 bg-[#f0f0f0] text-[#080808] text-[13px] font-semibold font-figtree tracking-tight hover:bg-white transition-colors cursor-pointer"
                        onClick={() => router.push(`/${locale}/booking`)}
                      >
                        {d.continue_booking}
                      </button>
                    </>
                  )}
                </div>

                {/* Reference card */}
                {primaryOrder?.orderNumber && (
                  <div className="border border-[#1e1e1e] bg-[#0e0e0e] p-4">
                    <p className="text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-2">
                      {state === "draft" ? d.draft_ref_label : d.ref_label}
                    </p>
                    <p className="text-[15px] font-semibold text-[#f0f0f0] font-figtree tracking-tight">
                      {primaryOrder.orderNumber}
                    </p>
                    <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1.5">
                      {state === "draft" ? d.draft_ref_sub : d.ref_sub}
                    </p>
                  </div>
                )}

                {/* Financial summary */}
                {total > 0 && state !== "draft" && (
                  <div className="border border-[#1e1e1e] bg-[#0e0e0e] p-4">
                    <p className="text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-3">
                      {d.financial_label}
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.financial_total}</span>
                        <span className="text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight">
                          {formatMDL(total)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.financial_advance}</span>
                        <span className={`text-[13px] font-medium font-figtree tracking-tight ${
                          state === "past" || state === "confirmed" ? "text-[#4ade80]" : "text-[#fbbf24]"
                        }`}>
                          {formatMDL(advance)}
                          {(state === "past" || state === "confirmed") && (
                            <span className="text-[11px] ml-1">· {d.paid_badge}</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.financial_rest}</span>
                        <span className="text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight">
                          {formatMDL(rest)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Draft: estimated cost */}
                {state === "draft" && total > 0 && (
                  <div className="border border-[#1e1e1e] bg-[#0e0e0e] p-4">
                    <p className="text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-2">
                      {d.estimated_cost_label}
                    </p>
                    <p className="text-[20px] font-semibold text-[#f0f0f0] font-figtree tracking-tight">
                      {formatMDL(total)}
                    </p>
                    <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1">
                      {d.advance_estimated.replace("{amount}", formatMDL(advance))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-8">
      <div className="flex items-center gap-4 mb-4">
        <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase shrink-0">{label}</p>
        <div className="flex-1 h-px bg-[#1e1e1e]" />
      </div>
      {children}
    </div>
  );
}

// ─── Timeline: Pending / Confirmed ────────────────────────────────────────────
function PendingConfirmedSteps({
  state, event, order, advance, rest, d,
}: {
  state: EventState;
  event: EventBooking;
  order: OrderDetail | null;
  advance: number;
  rest: number;
  total: number;
  d: EventDetailDict;
}) {
  const advancePaid = state === "confirmed";
  const contractSigned = state === "confirmed" && (order?.advancePaidAt != null);
  const date1 = event.createdAt ? formatDate(event.createdAt) : "";
  const date2 = order?.advancePaidAt ? formatDate(order.advancePaidAt) : "";
  const eventDateFmt = `${formatDateShort(event.eventDate)}, ${formatTime(event.eventStartTime)}`;
  const advanceDisplay = advance > 0 ? formatMDL(advance) : "—";
  const restDisplay = rest > 0 ? formatMDL(rest) : "—";

  return (
    <div className="border border-[#1e1e1e] p-5">
      <TimelineStep
        done={true}
        label={d.step1_label}
        sub={date1}
      />
      <TimelineStep
        done={advancePaid}
        active={!advancePaid}
        label={d.step2_label.replace("{amount}", advanceDisplay)}
        sub={date2}
      />
      <TimelineStep
        done={contractSigned}
        active={advancePaid && !contractSigned}
        label={d.step3_label}
        sub={order?.advancePaidAt ? `${formatDate(order.advancePaidAt)} · prin link pe email` : undefined}
      />
      <TimelineStep
        done={false}
        active={contractSigned}
        label={d.step4_label}
        sub="2–3 zile lucrătoare · menu, dispunere mese, logistică"
      />
      <TimelineStep
        done={false}
        label={d.step5_label}
        sub={`${eventDateFmt} · ${restDisplay} la sosire`}
      />
    </div>
  );
}

// ─── Timeline: History (Past / Cancelled) ─────────────────────────────────────
function HistorySteps({
  state, event, advance, rest, d,
}: {
  state: EventState;
  event: EventBooking;
  order: OrderDetail | null;
  advance: number;
  rest: number;
  d: EventDetailDict;
}) {
  const advanceDisplay = advance > 0 ? formatMDL(advance) : "—";
  const restDisplay = rest > 0 ? formatMDL(rest) : "—";

  if (state === "cancelled") {
    const refund = pickAmount(event.refundAmount, advance);
    const refundDisplay = refund > 0 ? formatMDL(refund) : "—";
    return (
      <div className="border border-[#1e1e1e] p-5">
        <TimelineStep done={true} label={d.history_cancelled1} sub={event.createdAt ? formatDate(event.createdAt) : ""} />
        <TimelineStep done={true} label={d.history_cancelled2.replace("{amount}", advanceDisplay)} />
        <TimelineStep done={true} label={d.history_cancelled3} sub={event.cancelledAt ? `${formatDate(event.cancelledAt)} · de tine` : ""} />
        <TimelineStep done={true} label={d.history_cancelled4.replace("{amount}", refundDisplay)} />
      </div>
    );
  }

  return (
    <div className="border border-[#1e1e1e] p-5">
      <TimelineStep done={true} label={d.history_step1} sub={event.createdAt ? formatDate(event.createdAt) : ""} />
      <TimelineStep done={true} label={d.history_step2.replace("{amount}", advanceDisplay)} />
      <TimelineStep done={true} label={d.history_step3} />
      <TimelineStep done={true} label={d.history_step4} />
      <TimelineStep done={true} label={d.history_step5.replace("{amount}", restDisplay)} sub={formatDateShort(event.eventDate)} />
    </div>
  );
}

// ─── Draft progress steps ──────────────────────────────────────────────────────
function DraftProgress({ d }: { d: EventDetailDict }) {
  const steps = [
    d.draft_step1, d.draft_step2, d.draft_step3,
    d.draft_step4, d.draft_step5, d.draft_step6,
  ];
  const currentStep = 3; // 0-based: step 4 is index 3

  return (
    <div className="border border-[#1e1e1e] p-5">
      {steps.map((label, i) => (
        <TimelineStep
          key={i}
          done={i < currentStep}
          active={i === currentStep}
          label={label}
        />
      ))}
    </div>
  );
}
