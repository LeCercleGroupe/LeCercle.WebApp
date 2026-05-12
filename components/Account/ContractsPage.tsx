"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadAuth, clearAuth, fetchWithRefresh, StoredAuth } from "@/components/BookingFlow/utils/auth";
import AccountTopBar from "./shared/AccountTopBar";
import { formatDate } from "./shared/format";
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

  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<ContractFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const result = loadAuth();
    if (!result) {
      router.replace(`/${locale}/account/login`);
      return;
    }
    setAuth(result.auth);

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
  }, [locale, router]);

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
    { key: "all", label: d.filter_all.replace("{count}", String(counts.all)) },
    { key: "signed", label: d.filter_signed.replace("{count}", String(counts.signed)) },
    { key: "awaiting_sig", label: d.filter_awaiting_sig.replace("{count}", String(counts.awaiting_sig)) },
    { key: "awaiting_pay", label: d.filter_awaiting_pay.replace("{count}", String(counts.awaiting_pay)) },
    { key: "cancelled", label: d.filter_cancelled.replace("{count}", String(counts.cancelled)) },
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
        <div className="mx-auto max-w-[1728px]">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 2xl:px-0 py-14">

            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-[40px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none mb-3">
                {d.title}
              </h1>
              <p className="text-[15px] text-[#888] font-figtree tracking-tight">
                {d.subtitle}
              </p>
            </div>

            {/* Filters + search */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                {filterTabs.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 text-[13px] font-medium font-figtree tracking-tight border transition-colors cursor-pointer ${
                      filter === key
                        ? "border-[#4a4a4a] bg-[#1e1e1e] text-[#f0f0f0]"
                        : "border-[#2a2a2a] bg-transparent text-[#888] hover:border-[#3a3a3a] hover:text-[#c0c0c0]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={d.search}
                className="px-3 py-2 border border-[#2a2a2a] bg-[#111] text-[13px] text-[#f0f0f0] font-figtree tracking-tight placeholder-[#555] focus:outline-none focus:border-[#4a4a4a] w-44"
              />
            </div>

            {/* Content */}
            {loading && (
              <p className="text-sm text-[#666] font-figtree py-12 text-center">{d.loading}</p>
            )}
            {error && (
              <p className="text-sm text-red-400 font-figtree py-12 text-center">{d.error}</p>
            )}
            {!loading && !error && filtered.length === 0 && (
              <p className="text-sm text-[#666] font-figtree py-12 text-center">{d.empty}</p>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="border border-[#1e1e1e]">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_140px_160px_140px_100px] gap-0 px-4 py-3 border-b border-[#1e1e1e] bg-[#0e0e0e]">
                  <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase">{d.col_document}</p>
                  <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase">{d.col_event_date}</p>
                  <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase">{d.col_status}</p>
                  <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase">{d.col_issued}</p>
                  <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase text-right">&nbsp;</p>
                </div>
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-[1fr_140px_160px_140px_100px] gap-0 px-4 py-4 border-b border-[#141414] last:border-b-0 items-center hover:bg-[#0e0e0e] transition-colors"
                  >
                    {/* Document */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-7 border border-[#2a2a2a] bg-[#111] shrink-0 flex items-center justify-center">
                        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                          <path d="M7 1H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L7 1Z" stroke="#555" strokeWidth="1.1" strokeLinejoin="round"/>
                          <path d="M7 1v4h4" stroke="#555" strokeWidth="1.1" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
                          {c.documentName || c.contractNumber || "—"}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] text-[#666] font-figtree tracking-tight truncate">{c.contractNumber || c.orderNumber || "—"}</p>
                          {c.eventId && (
                            <Link
                              href={`/${locale}/account/events/${c.eventId}`}
                              className="text-[11px] text-[#666] font-figtree tracking-tight hover:text-[#c0c0c0] transition-colors shrink-0 underline underline-offset-2"
                            >
                              {d.view_event}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Event date */}
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight">
                      {c.eventDate ? formatDate(c.eventDate) : d.na}
                    </p>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium font-figtree tracking-widest border ${statusClass(c.status)}`}>
                        · {statusLabel(c.status, d)}
                      </span>
                    </div>

                    {/* Issued date */}
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight">
                      {c.generatedAt ? formatDate(c.generatedAt) : d.na}
                    </p>

                    {/* Download */}
                    <div className="flex justify-end">
                      {c.fileUrl ? (
                        <a
                          href={c.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 border border-[#2a2a2a] text-[13px] font-medium text-[#c0c0c0] font-figtree tracking-tight hover:border-[#4a4a4a] hover:text-[#f0f0f0] transition-colors"
                        >
                          {d.download}
                        </a>
                      ) : (
                        <span className="px-3 py-1.5 border border-[#1a1a1a] text-[13px] text-[#444] font-figtree tracking-tight cursor-not-allowed">
                          {d.download}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
