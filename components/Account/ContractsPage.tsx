"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadAuth, clearAuth, fetchWithRefresh, StoredAuth } from "@/components/BookingFlow/utils/auth";
import AccountTopBar from "./shared/AccountTopBar";
import { formatDay, formatYear } from "./shared/format";
import { Contract } from "./shared/types";

type ContractFilter = "all" | "signed" | "awaiting_sig" | "awaiting_pay" | "cancelled";

interface ContractsDict {
  title: string;
  subtitle: string;
  search: string;
  filter_all: string;
  filter_signed: string;
  filter_awaiting_sig: string;
  filter_awaiting_pay: string;
  filter_cancelled: string;
  col_document: string;
  col_event_date: string;
  col_status: string;
  col_issued: string;
  download: string;
  view_event: string;
  empty: string;
  loading: string;
  error: string;
  na: string;
  status_confirmed: string;
  status_signed: string;
  status_issued: string;
  status_paid: string;
  status_awaiting_sig: string;
  status_awaiting_pay: string;
  status_cancelled: string;
}

interface NavDict {
  events: string;
  contracts: string;
  profile: string;
  logout: string;
}

export interface ContractsPageDict {
  contracts_page: ContractsDict;
  nav: NavDict;
}

interface Props {
  locale: string;
  dict: ContractsPageDict;
}

function contractCategory(status: string): ContractFilter {
  const s = (status ?? "").toLowerCase();
  if (s === "signed" || s === "semnat") return "signed";
  if (s === "awaiting_signature" || s === "pending_signature" || s === "asteapta_semnatura") return "awaiting_sig";
  if (s === "awaiting_payment" || s === "pending_payment" || s === "asteapta_plata") return "awaiting_pay";
  if (s === "cancelled" || s === "canceled" || s === "anulat") return "cancelled";
  return "all";
}

function statusLabel(status: string, d: ContractsDict): string {
  const s = (status ?? "").toLowerCase();
  if (s === "confirmed") return d.status_confirmed;
  if (s === "signed" || s === "semnat") return d.status_signed;
  if (s === "issued" || s === "emis") return d.status_issued;
  if (s === "paid" || s === "platita" || s === "plătită") return d.status_paid;
  if (s === "awaiting_signature" || s === "pending_signature") return d.status_awaiting_sig;
  if (s === "awaiting_payment" || s === "pending_payment") return d.status_awaiting_pay;
  if (s === "cancelled" || s === "canceled" || s === "anulat") return d.status_cancelled;
  return status?.toUpperCase() ?? "—";
}

function statusClass(status: string): string {
  const s = (status ?? "").toLowerCase();
  if (s === "confirmed")
    return "bg-[#0a1a2a] border-[#1a3a5a] text-[#60a5fa]";
  if (s === "signed" || s === "semnat" || s === "paid" || s === "platita" || s === "plătită")
    return "bg-[#0a2010] border-[#1a4a2a] text-[#4ade80]";
  if (s === "issued" || s === "emis")
    return "bg-[#111] border-[#2a2a2a] text-[#888]";
  if (s === "awaiting_signature" || s === "pending_signature")
    return "bg-[#1a0f00] border-[#3a2000] text-[#fb923c]";
  if (s === "awaiting_payment" || s === "pending_payment")
    return "bg-[#1f1400] border-[#3a2a00] text-[#fbbf24]";
  if (s === "cancelled" || s === "canceled" || s === "anulat")
    return "bg-[#1a0505] border-[#3a1010] text-[#f87171]";
  return "bg-[#111] border-[#2a2a2a] text-[#888]";
}

export default function ContractsPage({ locale, dict }: Props) {
  const router = useRouter();
  const d = dict.contracts_page;

  const [auth] = useState<StoredAuth | null>(() => loadAuth()?.auth ?? null);
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<ContractFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!auth) {
      router.replace(`/${locale}/account/login`);
      return;
    }

    fetchWithRefresh("/api/account/contracts")
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
        const list: Contract[] = Array.isArray(data) ? data : (data?.items ?? data?.contracts ?? []);
        setContracts(list);
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

  const counts = useMemo(() => {
    const list = contracts ?? [];
    return {
      all: list.length,
      signed: list.filter((c) => contractCategory(c.status) === "signed").length,
      awaiting_sig: list.filter((c) => contractCategory(c.status) === "awaiting_sig").length,
      awaiting_pay: list.filter((c) => contractCategory(c.status) === "awaiting_pay").length,
      cancelled: list.filter((c) => contractCategory(c.status) === "cancelled").length,
    };
  }, [contracts]);

  const filtered = useMemo(() => {
    let list = contracts ?? [];
    if (filter !== "all") list = list.filter((c) => contractCategory(c.status) === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) =>
        (c.contractNumber ?? "").toLowerCase().includes(q) ||
        (c.documentName ?? "").toLowerCase().includes(q) ||
        (c.orderNumber ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [contracts, filter, search]);

  const filterTabs: { key: ContractFilter; label: string }[] = [
    { key: "all",          label: d.filter_all.replace("{count}", String(counts.all)) },
    { key: "signed",       label: d.filter_signed.replace("{count}", String(counts.signed)) },
    { key: "awaiting_sig", label: d.filter_awaiting_sig.replace("{count}", String(counts.awaiting_sig)) },
    { key: "awaiting_pay", label: d.filter_awaiting_pay.replace("{count}", String(counts.awaiting_pay)) },
    { key: "cancelled",    label: d.filter_cancelled.replace("{count}", String(counts.cancelled)) },
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
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={d.search}
                  className="shrink-0 px-3 py-2 border border-[#2a2a2a] bg-[#111] text-[13px] text-[#f0f0f0] font-figtree tracking-tight placeholder-[#555] focus:outline-none focus:border-[#4a4a4a] w-36 sm:w-44"
                />
              </div>
              <p className="text-[13px] sm:text-[15px] text-[#888] font-figtree tracking-tight">
                {d.subtitle}
              </p>
            </div>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {counts.signed > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium font-figtree tracking-widest border border-[#1a4a2a] bg-[#0a2010] text-[#4ade80]">
                  {d.filter_signed.replace("{count}", String(counts.signed))}
                </span>
              )}
              {counts.awaiting_sig > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium font-figtree tracking-widest border border-[#3a2000] bg-[#1a0f00] text-[#fb923c]">
                  {d.filter_awaiting_sig.replace("{count}", String(counts.awaiting_sig))}
                </span>
              )}
              {counts.awaiting_pay > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium font-figtree tracking-widest border border-[#3a2a00] bg-[#1f1400] text-[#fbbf24]">
                  {d.filter_awaiting_pay.replace("{count}", String(counts.awaiting_pay))}
                </span>
              )}
              {counts.cancelled > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium font-figtree tracking-widest border border-[#3a1010] bg-[#1a0505] text-[#f87171]">
                  {d.filter_cancelled.replace("{count}", String(counts.cancelled))}
                </span>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
              {filterTabs.map(({ key, label }) => (
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
              <p className="text-sm text-[#666] font-figtree tracking-tight py-12 text-center">{d.loading}</p>
            )}
            {error && (
              <p className="text-sm text-red-400 font-figtree tracking-tight py-12 text-center">{d.error}</p>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-sm text-[#666] font-figtree tracking-tight py-12 text-center">{d.empty}</p>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="flex flex-col gap-0 border border-[#1e1e1e]">
                {filtered.map((c) => (
                  <ContractRow key={c.id} contract={c} locale={locale} d={d} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ContractRow({
  contract: c,
  locale,
  d,
}: {
  contract: Contract;
  locale: string;
  d: ContractsDict;
}) {
  const dateStr = c.eventDate || c.generatedAt || "";
  const day  = formatDay(dateStr);
  const year = formatYear(dateStr);

  const title    = c.documentName || c.contractNumber || "—";
  const subtitle = [c.contractNumber, c.orderNumber].filter(Boolean).join(" · ");

  const inner = (
    <>
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
          {title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {subtitle && (
            <p className="text-[13px] text-[#666] font-figtree tracking-tight truncate">{subtitle}</p>
          )}
          {c.eventId && (
            <Link
              href={`/${locale}/account/events/${c.eventId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-[#555] font-figtree tracking-tight hover:text-[#c0c0c0] transition-colors shrink-0 underline underline-offset-2"
            >
              {d.view_event}
            </Link>
          )}
        </div>
        {/* Status — mobile only */}
        <div className="flex items-center gap-2 mt-1 sm:hidden">
          <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium font-figtree tracking-widest border ${statusClass(c.status)}`}>
            {statusLabel(c.status, d)}
          </span>
        </div>
      </div>

      {/* Status — desktop only */}
      <div className="hidden sm:flex shrink-0 flex-col items-start gap-1 min-w-40">
        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest border ${statusClass(c.status)}`}>
          {statusLabel(c.status, d)}
        </span>
      </div>

      {/* Download — desktop only */}
      <span className={`hidden sm:inline-flex shrink-0 px-4 py-2 border text-sm font-medium font-figtree tracking-tight transition-colors ${
        c.fileUrl
          ? "border-[#2a2a2a] text-[#c0c0c0] hover:border-[#4a4a4a] hover:text-[#f0f0f0]"
          : "border-[#1a1a1a] text-[#444] cursor-not-allowed"
      }`}>
        {d.download}
      </span>

      {/* Chevron — mobile only */}
      <div className="sm:hidden shrink-0 self-center text-[#444]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </>
  );

  const rowClass = "flex items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-5 py-4 border-b border-[#141414] last:border-b-0 bg-[#0c0c0c] hover:bg-[#0f0f0f] active:bg-[#111] transition-colors";

  if (c.fileUrl) {
    return (
      <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {inner}
      </a>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}
