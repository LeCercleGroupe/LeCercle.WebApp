"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  loadAuth,
  clearAuth,
  fetchWithRefresh,
  StoredAuth,
} from "@/components/BookingFlow/utils/auth";
import BookingNavbar from "@/components/BookingFlow/shared/BookingNavbar";
import { VENUE_INFO } from "@/components/BookingFlow/types";

function getVenueInfo(serviceId: string) {
  return (VENUE_INFO as Record<string, { name: string; logo: string } | undefined>)[serviceId];
}

type Tab = "orders" | "contracts" | "profile";

interface OrderSummary {
  id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
}

interface EventBooking {
  id: string;
  customerId: string;
  eventDate: string;
  venueTitle: string;
  venueAddress: string;
  city: string;
  eventStartTime: string;
  guestCount: number;
  notes?: string;
  status: string;
  orders: OrderSummary[];
}

interface OrderItem {
  id: string;
  packageId: string;
  serviceId: string;
  packageName: string;
  serviceName: string;
  unitPrice: number;
  roadPrice: number;
  quantity: number;
}

interface OrderDetail {
  id: string;
  eventId: string;
  customerId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  contactEmail: string;
  contactPhone: string;
  items: OrderItem[];
}

interface Contract {
  id: string;
  orderId: string;
  orderNumber: string;
  contractNumber: string;
  status: string;
  generatedAt: string;
  signedAt: string | null;
  fileUrl: string | null;
}

interface DashboardDict {
  tab_orders: string;
  tab_contracts: string;
  tab_profile: string;
  logout: string;
  orders_empty: string;
  contracts_empty: string;
  order_date: string;
  order_status: string;
  order_total: string;
  status_pending: string;
  status_confirmed: string;
  status_completed: string;
  status_cancelled: string;
  pay_advance: string;
  view_details: string;
  back_orders: string;
  back_contracts: string;
  loading: string;
  load_error: string;
  first_name_label: string;
  last_name_label: string;
  email_label: string;
  phone_label: string;
  event_section: string;
  services_section: string;
  cost_section: string;
  guests_label: string;
  guests_unit: string;
  time_label: string;
  address_label: string;
  location_label: string;
  contract_number: string;
  contract_generated: string;
  contract_signed: string;
  contract_download: string;
  contract_not_ready: string;
  advance_label: string;
  total_label: string;
}

export interface DashboardAccountDict {
  dashboard: DashboardDict;
}

interface Props {
  locale: string;
  dict: DashboardAccountDict;
}

function formatMDL(amount: number) {
  return new Intl.NumberFormat("ro-MD").format(amount) + " MDL";
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function isOrderPaid(status: string | undefined) {
  return status === "Confirmed" || status === "Completed";
}

function isOrderCancelled(status: string | undefined) {
  return status === "Cancelled";
}

function statusLabel(status: string | undefined, dict: DashboardDict) {
  switch (status) {
    case "Confirmed": return dict.status_confirmed;
    case "Completed": return dict.status_completed;
    case "Cancelled": return dict.status_cancelled;
    default: return dict.status_pending;
  }
}

function StatusBadge({ status, dict }: { status: string | undefined; dict: DashboardDict }) {
  const paid = isOrderPaid(status);
  const cancelled = isOrderCancelled(status);

  const color = paid
    ? "bg-[#0b2a18] border border-[#1a4d2e] text-[#4ade80]"
    : cancelled
      ? "bg-[#2a0b0b] border border-[#4d1a1a] text-[#f87171]"
      : "bg-[#2a1f07] border border-[#4a3510] text-[#fbbf24]";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-figtree tracking-tight font-medium ${color}`}>
      {statusLabel(status, dict)}
    </span>
  );
}

// Robustly extract a numeric amount — backend may use various field names
function pickAmount(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === "number" && !isNaN(v)) return v;
    if (typeof v === "string" && !isNaN(Number(v))) return Number(v);
  }
  return 0;
}

export default function AccountDashboard({ locale, dict }: Props) {
  const router = useRouter();
  const d = dict.dashboard;

  const [auth] = useState<StoredAuth | null>(() => loadAuth()?.auth ?? null);
  const [tab, setTab] = useState<Tab>("orders");

  // Orders
  const [events, setEvents] = useState<EventBooking[] | null>(() => (auth && !auth.user.customerId) ? [] : null);
  const [eventsLoading, setEventsLoading] = useState(() => !!auth?.user.customerId);
  const [eventsError, setEventsError] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventBooking | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  // Contracts
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState(false);

  // Mount — refresh profile from backend, then fetch events
  useEffect(() => {
    if (!auth) {
      router.replace(`/${locale}/account/login`);
      return;
    }

    const customerId = auth.user.customerId;
    if (!customerId) return;

    fetchWithRefresh(`/api/account/orders?customerId=${encodeURIComponent(customerId)}`)
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
        const list: EventBooking[] = Array.isArray(data) ? data : data?.items ?? data?.events ?? [];
        // Sort newest first by eventDate
        list.sort((a, b) => (b.eventDate || "").localeCompare(a.eventDate || ""));
        setEvents(list);
      })
      .catch(() => setEventsError(true))
      .finally(() => setEventsLoading(false));
  }, [auth, locale, router]);

  // Fetch contracts on demand (called from tab click handler)
  function loadContracts() {
    if (contracts !== null) return;
    setContractsLoading(true);
    setContractsError(false);
    fetchWithRefresh("/api/account/contracts")
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list: Contract[] = Array.isArray(data) ? data : data?.items ?? data?.contracts ?? [];
        setContracts(list);
      })
      .catch(() => setContractsError(true))
      .finally(() => setContractsLoading(false));
  }

  async function openEvent(event: EventBooking) {
    setSelectedEvent(event);
    setSelectedOrderDetail(null);
    setDetailError(false);

    const primaryOrder = event.orders?.[0];
    if (!primaryOrder) return;

    setDetailLoading(true);
    try {
      const r = await fetchWithRefresh(`/api/account/orders/${primaryOrder.id}`);
      if (!r.ok) throw new Error(`${r.status}`);
      const data: OrderDetail = await r.json();
      setSelectedOrderDetail(data);
    } catch {
      setDetailError(true);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    router.push(`/${locale}`);
  }

  const initials = auth
    ? `${auth.user.firstName?.[0] ?? ""}${auth.user.lastName?.[0] ?? ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="flex flex-col min-h-svh bg-[#0d0d0d]">
      <BookingNavbar locale={locale} />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg flex flex-col gap-6">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#c4973f] flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-[#0d0d0d] font-figtree">{initials}</span>
              </div>
              {auth && (
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight">
                    {auth.user.firstName || auth.user.lastName
                      ? `${auth.user.firstName ?? ""} ${auth.user.lastName ?? ""}`.trim()
                      : (auth.user.phoneNumber || auth.user.email || "—")}
                  </p>
                  {auth.user.email && (
                    <p className="text-xs text-[#747474] font-figtree tracking-tight">{auth.user.email}</p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-[#747474] font-figtree tracking-tight hover:text-[#f1f1f1] transition-colors cursor-pointer"
            >
              {d.logout}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            {(["orders", "contracts", "profile"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setSelectedEvent(null); if (t === "contracts") loadContracts(); }}
                className={`flex-1 py-2.5 text-sm font-medium font-figtree tracking-tight border transition-all duration-200 cursor-pointer ${
                  tab === t
                    ? "bg-[#1b1b1b] border-[#474747] text-[#f1f1f1]"
                    : "bg-transparent border-[#303030] text-[#a8a8a8] hover:border-[#474747]"
                }`}
              >
                {t === "orders" ? d.tab_orders : t === "contracts" ? d.tab_contracts : d.tab_profile}
              </button>
            ))}
          </div>

          {/* ── ORDERS TAB ────────────────────────────────────────────── */}
          {tab === "orders" && (
            <>
              {selectedEvent ? (
                <EventDetail
                  event={selectedEvent}
                  detail={selectedOrderDetail}
                  loading={detailLoading}
                  error={detailError}
                  d={d}
                  locale={locale}
                  onBack={() => { setSelectedEvent(null); setSelectedOrderDetail(null); }}
                />
              ) : (
                <EventsList
                  events={events}
                  loading={eventsLoading}
                  error={eventsError}
                  d={d}
                  onSelect={openEvent}
                />
              )}
            </>
          )}

          {/* ── CONTRACTS TAB ─────────────────────────────────────────── */}
          {tab === "contracts" && (
            <ContractsList
              contracts={contracts}
              loading={contractsLoading}
              error={contractsError}
              d={d}
            />
          )}

          {/* ── PROFILE TAB ───────────────────────────────────────────── */}
          {tab === "profile" && auth && (
            <div className="flex flex-col gap-3">
              <ProfileField label={d.first_name_label} value={auth.user.firstName || "—"} />
              <ProfileField label={d.last_name_label} value={auth.user.lastName || "—"} />
              <ProfileField label={d.email_label} value={auth.user.email || "—"} />
              <ProfileField label={d.phone_label} value={auth.user.phoneNumber || "—"} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-[#747474] font-figtree tracking-widest uppercase">{label}</p>
      <p className="text-sm text-[#f1f1f1] font-figtree tracking-tight px-3 py-3 bg-[#111] border border-[#303030]">
        {value}
      </p>
    </div>
  );
}

function EventsList({
  events,
  loading,
  error,
  d,
  onSelect,
}: {
  events: EventBooking[] | null;
  loading: boolean;
  error: boolean;
  d: DashboardDict;
  onSelect: (e: EventBooking) => void;
}) {
  if (loading) {
    return <p className="text-sm text-[#747474] font-figtree tracking-tight text-center py-8">{d.loading}</p>;
  }
  if (error) {
    return <p className="text-sm text-red-400 font-figtree tracking-tight text-center py-8">{d.load_error}</p>;
  }
  if (!events?.length) {
    return <p className="text-sm text-[#747474] font-figtree tracking-tight text-center py-8">{d.orders_empty}</p>;
  }

  return (
    <div className="flex flex-col gap-0 border border-[#2a2a2a]">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-2 border-b border-[#2a2a2a] bg-[#111]">
        <p className="text-xs font-medium text-[#747474] font-figtree tracking-widest uppercase">{d.order_date}</p>
        <p className="text-xs font-medium text-[#747474] font-figtree tracking-widest uppercase">{d.order_status}</p>
        <p className="text-xs font-medium text-[#747474] font-figtree tracking-widest uppercase text-right">{d.order_total}</p>
      </div>
      {events.map((event) => {
        const primary = event.orders?.[0];
        const status = primary?.status ?? event.status;
        const total = pickAmount(primary?.totalAmount);

        return (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event)}
            className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 border-b border-[#1e1e1e] last:border-b-0 bg-[#0d0d0d] hover:bg-[#131313] transition-colors text-left items-center cursor-pointer"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm text-[#f1f1f1] font-figtree tracking-tight">{formatDate(event.eventDate)}</p>
              <p className="text-xs text-[#747474] font-figtree tracking-tight truncate">{event.venueTitle || "—"}</p>
            </div>
            <StatusBadge status={status} dict={d} />
            <p className="text-sm text-[#f1f1f1] font-figtree tracking-tight text-right">
              {formatMDL(total)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-[#747474] font-figtree tracking-widest uppercase">{children}</p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 items-start">
      <p className="text-sm text-[#747474] font-figtree tracking-tight shrink-0">{label}</p>
      <p className="text-sm text-[#f1f1f1] font-figtree tracking-tight text-right">{value}</p>
    </div>
  );
}

function EventDetail({
  event,
  detail,
  loading,
  error,
  d,
  locale,
  onBack,
}: {
  event: EventBooking;
  detail: OrderDetail | null;
  loading: boolean;
  error: boolean;
  d: DashboardDict;
  locale: string;
  onBack: () => void;
}) {
  const primary = event.orders?.[0];
  const status = detail?.status ?? primary?.status ?? event.status;
  // Calculate from items when totalAmount is missing/zero (more reliable)
  const itemsTotal = detail?.items?.reduce(
    (sum, it) => sum + pickAmount(it.unitPrice) * (it.quantity ?? 1),
    0,
  ) ?? 0;
  const roadTotal = detail?.items?.reduce(
    (sum, it) => sum + pickAmount(it.roadPrice),
    0,
  ) ?? 0;
  const total = pickAmount(detail?.totalAmount, primary?.totalAmount) || (itemsTotal + roadTotal);
  const isPending = !isOrderPaid(status) && !isOrderCancelled(status);
  const advance = Math.round(total * 0.1);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-[#747474] font-figtree tracking-tight text-left hover:text-[#f1f1f1] transition-colors w-fit cursor-pointer"
      >
        {d.back_orders}
      </button>

      <div className="bg-[#161616] border border-[#2a2a2a]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-[#d4d4d4] font-figtree tracking-tight">
              {formatDate(event.eventDate)}
            </p>
            {(detail?.orderNumber || primary?.orderNumber) && (
              <p className="text-xs text-[#747474] font-figtree tracking-tight">
                {detail?.orderNumber ?? primary?.orderNumber}
              </p>
            )}
          </div>
          <StatusBadge status={status} dict={d} />
        </div>

        {/* Event section */}
        <div className="flex flex-col gap-3 px-4 py-4 border-b border-[#252525]">
          <SectionLabel>{d.event_section}</SectionLabel>
          <div className="flex flex-col gap-2">
            <Row label={d.time_label} value={event.eventStartTime?.slice(0, 5) || "—"} />
            <Row label={d.guests_label} value={`${event.guestCount ?? 0} ${d.guests_unit}`} />
          </div>
        </div>

        {/* Location section */}
        <div className="flex flex-col gap-3 px-4 py-4 border-b border-[#252525]">
          <SectionLabel>{d.location_label}</SectionLabel>
          <div className="flex flex-col gap-2">
            <Row label={d.address_label} value={event.venueAddress ? `${event.venueAddress}${event.city ? `, ${event.city}` : ""}` : "—"} />
            <Row label={d.location_label} value={event.venueTitle || "—"} />
          </div>
        </div>

        {/* Services (items) */}
        {loading && (
          <div className="px-4 py-4">
            <p className="text-sm text-[#747474] font-figtree tracking-tight">{d.loading}</p>
          </div>
        )}
        {error && (
          <div className="px-4 py-4">
            <p className="text-sm text-red-400 font-figtree tracking-tight">{d.load_error}</p>
          </div>
        )}
        {detail?.items?.length ? (
          <div className="flex flex-col gap-3 px-4 py-4 border-b border-[#252525]">
            <SectionLabel>{d.services_section.replace("{count}", String(detail.items.length))}</SectionLabel>
            <div className="flex flex-col gap-2">
              {detail.items.map((item) => {
                const info = getVenueInfo(item.serviceId);
                return (
                  <div key={item.id} className="flex flex-col gap-2 bg-[#111] border border-[#2a2a2a] px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      {info ? (
                        <Image src={info.logo} alt={info.name} width={100} height={40} className="h-10 w-auto object-contain object-left" />
                      ) : (
                        <p className="text-sm text-[#f1f1f1] font-figtree tracking-tight">{item.serviceName}</p>
                      )}
                      <p className="text-base font-medium text-[#f1f1f1] font-figtree tracking-tight shrink-0">
                        {formatMDL(pickAmount(item.unitPrice) * (item.quantity ?? 1))}
                      </p>
                    </div>
                    {item.packageName && (
                      <div className="flex items-center gap-1.5">
                        <div className="size-3 rounded-full bg-[#c4973f] shrink-0" />
                        <p className="text-xs text-[#a8a8a8] font-figtree tracking-tight">{item.packageName}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Cost summary */}
        <div className="flex flex-col gap-3 px-4 py-4">
          <SectionLabel>{d.cost_section}</SectionLabel>
          <div className="flex flex-col gap-2">
            {advance > 0 && isPending && (
              <Row label={d.advance_label} value={formatMDL(advance)} />
            )}
          </div>
          <div className="border-t border-[#303030] pt-3 flex justify-between items-center">
            <p className="text-sm font-semibold text-[#f1f1f1] font-figtree tracking-widest uppercase">
              {d.total_label}
            </p>
            <p className="text-xl font-semibold text-[#f1f1f1] font-figtree tracking-tight">
              {formatMDL(total)}
            </p>
          </div>
        </div>
      </div>

      {/* Pay advance CTA — pending orders only */}
      {isPending && primary && advance > 0 && (
        <Link
          href={`/${locale}/booking`}
          className="relative w-full py-4 text-base font-medium font-figtree tracking-tight bg-white/50 text-white hover:bg-white/60 transition-all duration-200 text-center block"
        >
          {d.pay_advance}
        </Link>
      )}
    </div>
  );
}

function ContractsList({
  contracts,
  loading,
  error,
  d,
}: {
  contracts: Contract[] | null;
  loading: boolean;
  error: boolean;
  d: DashboardDict;
}) {
  if (loading) {
    return <p className="text-sm text-[#747474] font-figtree tracking-tight text-center py-8">{d.loading}</p>;
  }
  if (error) {
    return <p className="text-sm text-red-400 font-figtree tracking-tight text-center py-8">{d.load_error}</p>;
  }
  if (!contracts?.length) {
    return <p className="text-sm text-[#747474] font-figtree tracking-tight text-center py-8">{d.contracts_empty}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {contracts.map((c) => (
        <div key={c.id} className="flex flex-col gap-3 bg-[#161616] border border-[#2a2a2a] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight">
                {c.contractNumber || "—"}
              </p>
              {c.orderNumber && (
                <p className="text-xs text-[#747474] font-figtree tracking-tight">{c.orderNumber}</p>
              )}
            </div>
            <StatusBadge status={c.status} dict={d} />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between gap-3">
              <p className="text-xs text-[#747474] font-figtree tracking-tight">{d.contract_generated}</p>
              <p className="text-xs text-[#a8a8a8] font-figtree tracking-tight">{formatDateTime(c.generatedAt)}</p>
            </div>
            {c.signedAt && (
              <div className="flex justify-between gap-3">
                <p className="text-xs text-[#747474] font-figtree tracking-tight">{d.contract_signed}</p>
                <p className="text-xs text-[#a8a8a8] font-figtree tracking-tight">{formatDateTime(c.signedAt)}</p>
              </div>
            )}
          </div>

          {c.fileUrl ? (
            <a
              href={c.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium font-figtree tracking-tight bg-white/10 hover:bg-white/20 text-white px-3 py-2.5 text-center transition-colors border border-[#303030]"
            >
              {d.contract_download}
            </a>
          ) : (
            <p className="text-xs text-[#747474] font-figtree tracking-tight italic">{d.contract_not_ready}</p>
          )}
        </div>
      ))}
    </div>
  );
}
