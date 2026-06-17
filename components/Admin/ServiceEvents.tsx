"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { VENUE_INFO, type ServiceId } from "@/components/BookingFlow/types";
import { formatDay, formatMDL, formatYear } from "@/components/Account/shared/format";
import { fetchAdminEvents } from "./shared/adminApi";
import { serviceAmount, type AdminDict, type AdminEvent, type StatusFilter } from "./shared/types";
import { matchesStatusFilter, statusBadgeClass, statusLabel } from "./shared/status";
import { todayKey } from "./shared/calendar";
import DatePicker from "./shared/DatePicker";
import SelectMenu from "./shared/SelectMenu";
import EventDetail from "./EventDetail";

interface Props {
  locale: string;
  serviceId: ServiceId;
  dict: AdminDict;
  canViewSensitive: boolean;
}

export default function ServiceEvents({ locale, serviceId, dict, canViewSensitive }: Props) {
  const info = VENUE_INFO[serviceId];
  const defaultFrom = todayKey();

  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<AdminEvent | null>(null);

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setError(false);
      fetchAdminEvents({ serviceId })
        .then((list) => {
          if (!active) return;
          // Soonest events first, furthest last.
          list.sort((a, b) => (a.eventDate || "").localeCompare(b.eventDate || ""));
          setEvents(list);
        })
        .catch(() => active && setError(true))
        .finally(() => active && setLoading(false));
    });
    return () => {
      active = false;
    };
  }, [serviceId]);

  // Unique, sorted list of cities present in the loaded events, for the filter.
  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const ev of events ?? []) {
      if (ev.city) set.add(ev.city);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (events ?? []).filter((ev) => {
      if (!matchesStatusFilter(ev.status, filter)) return false;
      if (city && ev.city !== city) return false;
      const day = ev.eventDate?.slice(0, 10) ?? "";
      if (dateFrom && day && day < dateFrom) return false;
      if (dateTo && day && day > dateTo) return false;
      if (term) {
        const haystack = [
          ev.venueTitle,
          ev.eventType,
          ev.city,
          ev.orders?.[0]?.orderNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [events, filter, search, dateFrom, dateTo, city]);

  const totalSum = useMemo(
    () => filtered.reduce((sum, ev) => sum + serviceAmount(ev), 0),
    [filtered],
  );

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all",       label: dict.filter_all },
    { key: "confirmed", label: dict.filter_confirmed },
    { key: "pending",   label: dict.filter_pending },
    { key: "cancelled", label: dict.filter_cancelled },
    { key: "completed", label: dict.filter_completed },
  ];

  const hasFilters =
    filter !== "all" || Boolean(search) || Boolean(dateTo) || dateFrom !== defaultFrom || Boolean(city);

  function clearFilters() {
    setFilter("all");
    setSearch("");
    setDateFrom(defaultFrom);
    setDateTo("");
    setCity("");
  }

  const cityOptions = [
    { value: "", label: dict.all_cities },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  const inputClass =
    "bg-[#0c0c0c] border border-[#2a2a2a] text-[13px] text-[#f0f0f0] font-figtree tracking-tight px-3 py-2 focus:outline-none focus:border-[#4a4a4a] placeholder:text-[#555]";

  if (selected) {
    return (
      <EventDetail
        event={selected}
        serviceId={serviceId}
        dict={dict}
        canViewSensitive={canViewSensitive}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 sm:px-8 pt-6 pb-4">
        {info.logo && (
          <Image src={info.logo} alt={info.name} width={28} height={28} className="size-7 object-contain" />
        )}
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none">
            {info.name}
          </h1>
          <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1">{dict.events_title}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 sm:px-8 flex flex-col gap-3 pb-4 border-b border-[#141414]">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-[13px] font-medium font-figtree tracking-tight border transition-colors cursor-pointer ${
                filter === key
                  ? "border-[#4a4a4a] bg-[#1e1e1e] text-[#f0f0f0]"
                  : "border-[#2a2a2a] bg-transparent text-[#888] hover:border-[#3a3a3a] hover:text-[#c0c0c0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Date range + search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-[12px] text-[#666] font-figtree tracking-tight">
            <span>{dict.date_from}</span>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              locale={locale}
              placeholder={dict.date_from}
              ariaLabel={dict.date_from}
            />
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#666] font-figtree tracking-tight">
            <span>{dict.date_to}</span>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              locale={locale}
              placeholder={dict.date_to}
              ariaLabel={dict.date_to}
            />
          </div>
          {cities.length > 0 && (
            <SelectMenu
              value={city}
              onChange={setCity}
              options={cityOptions}
              placeholder={dict.all_cities}
              ariaLabel={dict.all_cities}
            />
          )}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.search_placeholder}
            className={`${inputClass} flex-1 min-w-48`}
          />
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-[12px] font-medium font-figtree tracking-tight text-[#888] border border-[#2a2a2a] hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer"
            >
              {dict.clear}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-5 sm:px-8 py-4">
        {loading && <p className="text-sm text-[#666] font-figtree py-12 text-center">{dict.loading}</p>}
        {error && <p className="text-sm text-red-400 font-figtree py-12 text-center">{dict.error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-[#666] font-figtree py-12 text-center">{dict.empty}</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col border border-[#1e1e1e]">
            {filtered.map((ev) => (
              <EventRow
                key={ev.id}
                event={ev}
                dict={dict}
                canViewSensitive={canViewSensitive}
                onSelect={() => setSelected(ev)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="shrink-0 flex items-center justify-between gap-4 px-5 sm:px-8 py-4 border-t border-[#141414] bg-[#0a0a0a]">
        <span className="text-[13px] text-[#888] font-figtree tracking-tight">
          {dict.summary_events.replace("{count}", String(filtered.length))}
        </span>
        {canViewSensitive && (
          <span className="text-[15px] font-semibold text-[#f0f0f0] font-figtree tracking-tight">
            {dict.summary_total}: {formatMDL(totalSum)}
          </span>
        )}
      </div>
    </div>
  );
}

function EventRow({
  event,
  dict,
  canViewSensitive,
  onSelect,
}: {
  event: AdminEvent;
  dict: AdminDict;
  canViewSensitive: boolean;
  onSelect: () => void;
}) {
  const parts: string[] = [];
  if (event.eventType) parts.push(event.eventType);
  if (event.city) parts.push(event.city);
  if (event.guestCount) parts.push(`${event.guestCount} ${dict.guests}`);
  if (event.eventStartTime) parts.push(event.eventStartTime.slice(0, 5));
  if (event.orders?.[0]?.orderNumber) parts.push(event.orders[0].orderNumber!);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left flex items-center gap-4 sm:gap-6 px-4 sm:px-5 py-4 border-b border-[#141414] last:border-b-0 bg-[#0c0c0c] hover:bg-[#0f0f0f] transition-colors cursor-pointer">
      {/* Date */}
      <div className="w-20 sm:w-24 shrink-0 flex flex-col">
        <span className="text-[19px] sm:text-[21px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none whitespace-nowrap">
          {formatDay(event.eventDate)}
        </span>
        <span className="text-[11px] text-[#555] font-figtree tracking-tight mt-0.5">{formatYear(event.eventDate)}</span>
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[15px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
          {event.venueTitle || "—"}
        </p>
        {parts.length > 0 && (
          <p className="text-[13px] text-[#666] font-figtree tracking-tight truncate">{parts.join(" · ")}</p>
        )}
      </div>

      {/* Status — strict value from the API */}
      <span
        className={`hidden sm:inline-flex shrink-0 items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest ${statusBadgeClass(event.status)}`}
      >
        {statusLabel(event.status)}
      </span>

      {/* Amount — sensitive, hidden from employees */}
      {canViewSensitive && (
        <span className="shrink-0 text-[14px] font-semibold text-[#f0f0f0] font-figtree tracking-tight text-right w-28 sm:w-32">
          {formatMDL(serviceAmount(event))}
        </span>
      )}
    </button>
  );
}
