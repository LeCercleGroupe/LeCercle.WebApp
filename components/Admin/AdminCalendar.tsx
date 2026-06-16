"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_VENUES, VENUE_INFO, type ServiceId } from "@/components/BookingFlow/types";
import { fetchAllServiceEvents } from "./shared/adminApi";
import { intlLocale, type AdminDict, type TaggedEvent } from "./shared/types";
import { statusBadgeClass, statusLabel } from "./shared/status";
import { buildMonthDays, dayKey, weekdayShortNames } from "./shared/calendar";

interface Props {
  locale: string;
  dict: AdminDict;
}

export default function AdminCalendar({ locale, dict }: Props) {
  const [events, setEvents] = useState<TaggedEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    let active = true;
    fetchAllServiceEvents()
      .then((list) => active && setEvents(list))
      .catch(() => active && setEvents([]));
    return () => {
      active = false;
    };
  }, []);

  const intl = intlLocale(locale);

  // Tagged events grouped by their local day key, ordered by start time.
  const byDay = useMemo(() => {
    const map = new Map<string, TaggedEvent[]>();
    for (const tagged of events) {
      const key = tagged.event.eventDate?.slice(0, 10);
      if (!key) continue;
      const bucket = map.get(key);
      if (bucket) bucket.push(tagged);
      else map.set(key, [tagged]);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => (a.event.eventStartTime || "").localeCompare(b.event.eventStartTime || ""));
    }
    return map;
  }, [events]);

  // 6-week grid starting on the Monday on/before the 1st.
  const days = useMemo(() => buildMonthDays(cursor), [cursor]);
  const weekdayNames = useMemo(() => weekdayShortNames(intl), [intl]);

  const monthLabel = new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(cursor);
  const todayKey = dayKey(new Date());

  const goToday = () => {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
  };
  const shiftMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-5 sm:px-8 pt-6 pb-4">
        <h1 className="text-[22px] sm:text-[26px] font-semibold text-[#f0f0f0] font-figtree tracking-tight capitalize">
          {monthLabel}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="px-3 py-1.5 text-[13px] font-medium font-figtree tracking-tight text-[#c0c0c0] border border-[#2a2a2a] hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer"
          >
            {dict.today}
          </button>
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className="size-9 flex items-center justify-center border border-[#2a2a2a] text-[#c0c0c0] hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer">
            <Chevron dir="left" />
          </button>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className="size-9 flex items-center justify-center border border-[#2a2a2a] text-[#c0c0c0] hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer">
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      {/* Service legend — every service has its own colour */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 sm:px-8 pb-3">
        {ALL_VENUES.map((serviceId) => (
          <span key={serviceId} className="flex items-center gap-1.5 text-[11px] text-[#888] font-figtree tracking-tight">
            <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: VENUE_INFO[serviceId].accentColor }} />
            {VENUE_INFO[serviceId].name}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto px-5 sm:px-8 pb-6">
        <div className="grid grid-cols-7 border-l border-t border-[#1e1e1e] min-w-[640px]">
          {/* Weekday headers */}
          {weekdayNames.map((name) => (
            <div
              key={name}
              className="px-2 py-2 text-[11px] font-medium font-figtree tracking-widest uppercase text-[#666] border-r border-b border-[#1e1e1e] text-center"
            >
              {name}
            </div>
          ))}

          {/* Day cells */}
          {days.map((date) => {
            const key = dayKey(date);
            const inMonth = date.getMonth() === cursor.getMonth();
            const isToday = key === todayKey;
            const dayEvents = byDay.get(key) ?? [];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(key)}
                className={`min-h-24 sm:min-h-28 px-1.5 py-1.5 border-r border-b border-[#1e1e1e] flex flex-col gap-1 text-left transition-colors cursor-pointer hover:bg-[#141414] ${
                  inMonth ? "bg-[#0c0c0c]" : "bg-[#080808]"
                }`}
              >
                <span
                  className={`text-[12px] font-figtree tracking-tight self-start px-1.5 py-0.5 rounded-full leading-none ${
                    isToday
                      ? "bg-[#c4973f] text-[#0d0d0d] font-semibold"
                      : inMonth
                        ? "text-[#c0c0c0]"
                        : "text-[#444]"
                  }`}
                >
                  {date.getDate()}
                </span>

                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map(({ event, serviceId }, i) => {
                    const color = VENUE_INFO[serviceId as ServiceId].accentColor;
                    return (
                      <div
                        key={`${event.id}-${serviceId}-${i}`}
                        title={`${VENUE_INFO[serviceId as ServiceId].name} — ${event.venueTitle ?? ""}`}
                        className="flex items-center gap-1 text-[11px] text-[#c0c0c0] font-figtree tracking-tight truncate"
                      >
                        <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="truncate">
                          {event.eventStartTime ? `${event.eventStartTime.slice(0, 5)} ` : ""}
                          {event.venueTitle || event.eventType || "—"}
                        </span>
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-[#666] font-figtree tracking-tight">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <DaySchedule
          dayISO={selectedDay}
          events={byDay.get(selectedDay) ?? []}
          intl={intl}
          dict={dict}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

// Modal listing the full schedule for one day, ordered by start time.
function DaySchedule({
  dayISO,
  events,
  intl,
  dict,
  onClose,
}: {
  dayISO: string;
  events: TaggedEvent[];
  intl: string;
  dict: AdminDict;
  onClose: () => void;
}) {
  const [y, m, d] = dayISO.split("-").map(Number);
  const title = new Intl.DateTimeFormat(intl, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[80vh] flex flex-col bg-[#0c0c0c] border border-[#2a2a2a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-[16px] font-semibold text-[#f0f0f0] font-figtree tracking-tight capitalize">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 flex items-center justify-center text-[#888] hover:text-[#f0f0f0] transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Schedule */}
        <div className="flex-1 overflow-auto">
          {events.length === 0 ? (
            <p className="text-sm text-[#666] font-figtree tracking-tight py-12 text-center">{dict.empty}</p>
          ) : (
            <ul className="divide-y divide-[#141414]">
              {events.map(({ event, serviceId }, i) => {
                const info = VENUE_INFO[serviceId as ServiceId];
                const parts = [event.city, event.guestCount ? `${event.guestCount} ${dict.guests}` : ""].filter(Boolean);
                return (
                  <li key={`${event.id}-${serviceId}-${i}`} className="flex items-start gap-3 px-5 py-3.5">
                    {/* Time */}
                    <span className="w-12 shrink-0 text-[13px] font-semibold text-[#f0f0f0] font-figtree tracking-tight pt-0.5">
                      {event.eventStartTime ? event.eventStartTime.slice(0, 5) : "—"}
                    </span>
                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium font-figtree tracking-tight" style={{ color: info.accentColor }}>
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: info.accentColor }} />
                        {info.name}
                      </span>
                      <span className="text-[14px] text-[#f0f0f0] font-figtree tracking-tight truncate">
                        {event.venueTitle || event.eventType || "—"}
                      </span>
                      {parts.length > 0 && (
                        <span className="text-[12px] text-[#666] font-figtree tracking-tight truncate">
                          {parts.join(" · ")}
                        </span>
                      )}
                    </div>
                    {/* Status — strict value from the API */}
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-medium font-figtree tracking-widest ${statusBadgeClass(event.status)}`}>
                      {statusLabel(event.status)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d={dir === "left" ? "M10 4l-4 4 4 4" : "M6 4l4 4-4 4"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
