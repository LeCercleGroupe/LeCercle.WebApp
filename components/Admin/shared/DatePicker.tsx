"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "@/components/Account/shared/format";
import { buildMonthDays, dayKey, monthStartFor, weekdayShortNames } from "./calendar";
import { intlLocale } from "./types";

interface Props {
  value: string; // YYYY-MM-DD, or "" when unset
  onChange: (value: string) => void;
  locale: string;
  placeholder: string;
  ariaLabel?: string;
}

// Mouse-driven date field: a button that opens a mini month-grid popover. There
// is no text input — dates are chosen by clicking a day. Empty value renders the
// placeholder; navigation is via the month arrows.
export default function DatePicker({ value, onChange, locale, placeholder, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => monthStartFor(value));
  const ref = useRef<HTMLDivElement>(null);

  // Re-anchor the grid to the selected month whenever it changes externally.
  useEffect(() => setCursor(monthStartFor(value)), [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const intl = intlLocale(locale);
  const days = useMemo(() => buildMonthDays(cursor), [cursor]);
  const weekdays = useMemo(() => weekdayShortNames(intl), [intl]);
  const monthLabel = new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(cursor);
  const todayK = dayKey(new Date());

  const shiftMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        className="flex items-center gap-2 bg-[#0c0c0c] border border-[#2a2a2a] text-[13px] font-figtree tracking-tight px-3 py-2 hover:border-[#3a3a3a] focus:outline-none focus:border-[#4a4a4a] transition-colors cursor-pointer"
      >
        <CalendarIcon />
        <span className={value ? "text-[#f0f0f0]" : "text-[#555]"}>
          {value ? formatDate(value) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 bg-[#111] border border-[#2a2a2a] shadow-2xl p-3">
          {/* Month header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight capitalize">
              {monthLabel}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
                className="size-7 flex items-center justify-center border border-[#2a2a2a] text-[#c0c0c0] hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
                className="size-7 flex items-center justify-center border border-[#2a2a2a] text-[#c0c0c0] hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer"
              >
                <Chevron dir="right" />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {weekdays.map((w) => (
              <div key={w} className="text-center text-[10px] font-figtree tracking-wide uppercase text-[#666] py-1">
                {w}
              </div>
            ))}
            {days.map((d) => {
              const k = dayKey(d);
              const inMonth = d.getMonth() === cursor.getMonth();
              const selected = k === value;
              const isToday = k === todayK;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    onChange(k);
                    setOpen(false);
                  }}
                  className={`size-8 text-[12px] font-figtree tracking-tight transition-colors cursor-pointer ${
                    selected
                      ? "bg-[#c4973f] text-[#0d0d0d] font-semibold"
                      : inMonth
                        ? "text-[#c0c0c0] hover:bg-[#1e1e1e]"
                        : "text-[#444] hover:bg-[#161616]"
                  } ${isToday && !selected ? "border border-[#3a2e14]" : ""}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#666]">
      <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
