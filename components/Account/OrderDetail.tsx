"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loadAuth, clearAuth, fetchWithRefresh, StoredAuth } from "@/components/BookingFlow/utils/auth";
import AccountTopBar from "./shared/AccountTopBar";
import { formatDate, formatDateShort, formatMDL, formatTime, pickAmount } from "./shared/format";
import { OrderDetail as OrderDetailType, Contract, deriveOrderState, type EventState, type OrderItemSelection } from "./shared/types";
import { VENUE_INFO } from "@/components/BookingFlow/types";
import type { EventDetailPageDict } from "./EventDetail";
import { whatsapp } from "@/data/venues/constants/links";

function getVenueInfo(serviceId: string) {
  return (VENUE_INFO as Record<string, { name: string; logo: string } | undefined>)[serviceId];
}

function groupSelections(selections?: OrderItemSelection[]) {
  if (!selections?.length) return [];
  const map = new Map<string, { featureLabel: string; options: OrderItemSelection[] }>();
  for (const sel of selections) {
    const existing = map.get(sel.featureLabel);
    if (existing) {
      existing.options.push(sel);
    } else {
      map.set(sel.featureLabel, { featureLabel: sel.featureLabel, options: [sel] });
    }
  }
  return Array.from(map.values());
}

interface Props {
  locale: string;
  eventId: string;
  orderId: string;
  dict: EventDetailPageDict;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-2.5 border-b border-[#141414] last:border-b-0">
      <span className="text-[13px] text-[#888] font-figtree tracking-tight shrink-0">{label}</span>
      <span className="text-[13px] text-right font-figtree tracking-tight text-[#f0f0f0]">{value}</span>
    </div>
  );
}


export default function OrderDetail({ locale, eventId, orderId, dict }: Props) {
  const router = useRouter();
  const d = dict.event_detail;

  const [auth] = useState<StoredAuth | null>(() => loadAuth()?.auth ?? null);
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);
  const [payOnlineError, setPayOnlineError] = useState(false);

  useEffect(() => {
    if (!auth) { router.replace(`/${locale}/account/login`); return; }

    async function load() {
      try {
        const [ordRes, cRes] = await Promise.all([
          fetchWithRefresh(`/api/account/orders/${orderId}`),
          fetchWithRefresh(`/api/account/contracts/${orderId}`),
        ]);

        if (ordRes.status === 401) {
          clearAuth();
          router.replace(`/${locale}/account/login`);
          return;
        }

        if (ordRes.ok) {
          const ordData: OrderDetailType = await ordRes.json();
          setOrder(ordData);
        } else {
          setError(true);
          setLoading(false);
          return;
        }

        if (cRes.ok) {
          const cData = await cRes.json();
          const list: Contract[] = Array.isArray(cData) ? cData : (cData ? [cData] : []);
          setContracts(list);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [auth, locale, orderId, router]);

  async function handlePayOnline() {
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
          successUrl: `${window.location.origin}/${locale}/booking/payment-success?orderId=${orderId}`,
          failUrl: `${window.location.origin}/${locale}/booking/payment-fail?orderId=${orderId}`,
        }),
      });
      if (!payRes.ok) throw new Error(`${payRes.status}`);
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

  if (error || !order) {
    return (
      <div className="min-h-svh bg-[#080808] flex flex-col">
        <AccountTopBar locale={locale} initials={initials} displayName={displayName} email={auth?.user.email} navDict={dict.nav} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-red-400 font-figtree">{d.error}</p>
        </main>
      </div>
    );
  }

  const orderState = deriveOrderState(order);
  const total   = pickAmount(order.totalAmount);
  const advance = pickAmount(order.advanceAmount) || (total > 0 ? Math.round(total * 0.1) : 0);
  const rest    = total - advance;
  const stateBadgeLabels: Record<EventState, string> = {
    pending:   d.badge_pending,
    confirmed: d.badge_confirmed,
    draft:     d.badge_draft,
    past:      d.badge_past,
    cancelled: d.badge_cancelled,
  };

  const stateClasses: Record<EventState, string> = {
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
          <div className="mx-auto max-w-295 px-4 sm:px-6 lg:px-8 2xl:px-0 py-6 sm:py-10">

            {/* Back link */}
            <Link
              href={`/${locale}/account/events/${eventId}`}
              className="inline-flex items-center text-[13px] text-[#666] font-figtree tracking-tight hover:text-[#c0c0c0] transition-colors mb-6"
            >
              {d.back}
            </Link>

            {/* Order header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-8">
              <div className="flex flex-col gap-1.5 min-w-0">
                <h1 className="text-[26px] sm:text-[32px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-tight">
                  {order.orderNumber || "—"}
                </h1>
                {order.createdAt && (
                  <p className="text-[13px] sm:text-[14px] text-[#888] font-figtree tracking-tight">
                    {formatDate(order.createdAt)}
                  </p>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest border ${stateClasses[orderState]}`}>
                  {stateBadgeLabels[orderState]}
                </span>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 border border-[#2a2a2a] text-[13px] font-medium text-[#c0c0c0] font-figtree tracking-tight hover:border-[#4a4a4a] hover:text-[#f0f0f0] transition-colors"
                >
                  {d.contact_us}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">

              {/* ── LEFT COLUMN ─────────────────────────── */}
              <div className="flex flex-col gap-0">

                {/* Pending payment action */}
                {orderState === "pending" && (
                  <div className="border border-[#3a2a00] bg-[#110c00] p-6 mb-0">
                    <p className="text-[11px] font-medium text-[#fbbf24] font-figtree tracking-[0.12em] uppercase mb-2">
                      {d.pending_action_label.replace("{time}", "")}
                    </p>
                    <p className="text-[20px] font-semibold text-[#f0f0f0] font-figtree tracking-tight mb-2">
                      {d.pending_action_title.replace("{amount}", formatMDL(advance))}
                    </p>
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight mb-5">
                      {d.pending_action_sub
                        .replace("{date}", order.createdAt ? formatDateShort(order.createdAt) : "—")
                        .replace("{rest}", formatMDL(rest))}
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={handlePayOnline}
                          disabled={payingOnline}
                          className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-[#f0f0f0] text-[#080808] text-[13px] font-semibold font-figtree tracking-tight hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {payingOnline ? "···" : d.pay_online.replace("{amount}", formatMDL(advance))}
                        </button>
                        <a
                          href={whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto text-center px-5 py-3 sm:py-2.5 border border-[#3a2a00] text-[#fbbf24] text-[13px] font-medium font-figtree tracking-tight hover:bg-[#1f1400] transition-colors"
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

                {/* Confirmed banner */}
                {orderState === "confirmed" && (
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
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex px-5 py-2.5 border border-[#1a4a2a] text-[#4ade80] text-[13px] font-medium font-figtree tracking-tight hover:bg-[#0a2010] transition-colors"
                    >
                      {d.contact_team}
                    </a>
                  </div>
                )}

                {/* Services */}
                {order.items && order.items.length > 0 && (
                  <Section label={d.section_services}>
                    <div className="flex flex-col gap-3">
                      {order.items.map((item) => {
                        const info = getVenueInfo(item.serviceId);
                        const lineTotal = pickAmount(item.unitPrice) * (item.quantity ?? 1);
                        const groupedSelections = groupSelections(item.selections);
                        return (
                          <div key={item.id} className="border border-[#1e1e1e] p-4">
                            <div className="flex items-start justify-between gap-4">
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
                            <div className="mt-3 pt-3 border-t border-[#1e1e1e] flex flex-col gap-2.5">
                              {groupedSelections.map((group) => (
                                <div key={group.featureLabel}>
                                  <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.08em] uppercase mb-1">
                                    {group.featureLabel}
                                  </p>
                                  {group.options.map((sel) => (
                                    <div key={sel.selectedOptionId} className="flex items-start justify-between gap-3">
                                      <p className="text-[12px] text-[#888] font-figtree tracking-tight leading-snug">{sel.selectedOptionLabel}</p>
                                      {sel.additionalCost > 0 && (
                                        <p className="text-[12px] text-[#c0c0c0] font-figtree tracking-tight shrink-0">+{formatMDL(sel.additionalCost)}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                              <div className={`flex items-center justify-between gap-3 pt-1 ${groupedSelections.length > 0 ? "border-t border-[#1e1e1e]" : ""}`}>
                                <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.08em] uppercase">{d.transport_label}</p>
                                {pickAmount(item.roadPrice) > 0 ? (
                                  <p className="text-[12px] text-[#c0c0c0] font-figtree tracking-tight shrink-0">+{formatMDL(pickAmount(item.roadPrice))}</p>
                                ) : (
                                  <p className="text-[12px] text-[#4ade80] font-figtree tracking-tight shrink-0">{d.transport_included}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Total */}
                {total > 0 && (
                  <Section label={orderState === "past" ? d.section_total_paid : d.section_total}>
                    <div className="border border-[#1e1e1e] p-4 sm:p-5">
                      <p className="text-[26px] sm:text-[28px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none mb-1">
                        {formatMDL(total)}
                      </p>
                      <p className="text-[12px] text-[#666] font-figtree tracking-tight mb-4">{d.taxes_label}</p>
                      <div className="flex flex-col gap-2 border-t border-[#1e1e1e] pt-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.advance_label}</span>
                          <span className={`text-[13px] font-medium font-figtree tracking-tight whitespace-nowrap ${
                            orderState === "past" || orderState === "confirmed" ? "text-[#4ade80]" : "text-[#fbbf24]"
                          }`}>
                            {formatMDL(advance)}
                            {(orderState === "past" || orderState === "confirmed") && (
                              <span className="text-[11px] ml-1">{d.paid_badge}</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.rest_label}</span>
                          <span className={`text-[13px] font-medium font-figtree tracking-tight whitespace-nowrap ${
                            orderState === "past" ? "text-[#4ade80]" : "text-[#f0f0f0]"
                          }`}>
                            {formatMDL(rest)}
                            {orderState === "past" && <span className="text-[11px] ml-1">{d.paid_badge}</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Section>
                )}

                {/* Documents / Contracts */}
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
                    <div className="border border-[#1e1e1e] p-4">
                      {contracts.map((c) => (
                        <div key={c.id} className="py-3 border-b border-[#141414] last:border-b-0">
                          <div className="flex items-center gap-3">
                            <div className="size-8 border border-[#2a2a2a] bg-[#111] shrink-0 flex items-center justify-center">
                              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                                <path d="M8 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6L8 1Z" stroke="#555" strokeWidth="1.2" strokeLinejoin="round"/>
                                <path d="M8 1v5h5" stroke="#555" strokeWidth="1.2" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <p className="flex-1 min-w-0 text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
                              {c.documentName || c.contractNumber || "Document"}
                            </p>
                            {c.fileUrl ? (
                              <a
                                href={c.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f0f0] text-[#080808] text-[12px] font-medium font-figtree tracking-tight hover:bg-white transition-colors"
                              >
                                {d.download}
                              </a>
                            ) : (
                              <div className="shrink-0 px-3 py-1.5 border border-[#1e1e1e] text-[12px] text-[#444] font-figtree tracking-tight cursor-not-allowed">
                                {d.download}
                              </div>
                            )}
                          </div>
                          {c.generatedAt && (
                            <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1 ml-11">
                              {formatDate(c.generatedAt)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Contact */}
                {(order.contactPhone || order.contactEmail) && (
                  <Section label={d.section_contact}>
                    <div className="border border-[#1e1e1e] p-4">
                      {(order.contactFirstName || order.contactLastName) && (
                        <DetailRow
                          label={d.contact_label}
                          value={`${order.contactFirstName ?? ""} ${order.contactLastName ?? ""}`.trim()}
                        />
                      )}
                      {order.contactPhone && (
                        <DetailRow label={d.contact_phone} value={order.contactPhone} />
                      )}
                      {order.contactEmail && (
                        <DetailRow label={d.contact_email} value={order.contactEmail} />
                      )}
                      {order.contactNotes && (
                        <DetailRow label={d.contact_notes} value={order.contactNotes} />
                      )}
                    </div>
                  </Section>
                )}

              </div>

              {/* ── RIGHT SIDEBAR ──────────────────────── */}
              <div className="flex flex-col gap-4">

                {/* Reference */}
                {order.orderNumber && (
                  <div className="border border-[#1e1e1e] bg-[#0e0e0e] p-4">
                    <p className="text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-2">
                      {d.ref_label}
                    </p>
                    <p className="text-[15px] font-semibold text-[#f0f0f0] font-figtree tracking-tight">
                      {order.orderNumber}
                    </p>
                    <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1.5">
                      {d.ref_sub}
                    </p>
                  </div>
                )}

                {/* Financial summary */}
                {total > 0 && (
                  <div className="border border-[#1e1e1e] bg-[#0e0e0e] p-4">
                    <p className="text-[11px] font-medium text-[#666] font-figtree tracking-[0.12em] uppercase mb-3">
                      {d.financial_label}
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.financial_total}</span>
                        <span className="text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight">{formatMDL(total)}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.financial_advance}</span>
                        <span className={`text-[13px] font-medium font-figtree tracking-tight ${
                          orderState === "past" || orderState === "confirmed" ? "text-[#4ade80]" : "text-[#fbbf24]"
                        }`}>
                          {formatMDL(advance)}
                          {(orderState === "past" || orderState === "confirmed") && (
                            <span className="text-[11px] ml-1">{d.paid_badge}</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[13px] text-[#888] font-figtree tracking-tight">{d.financial_rest}</span>
                        <span className="text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight">{formatMDL(rest)}</span>
                      </div>
                    </div>
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
