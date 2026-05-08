"use client";

import { useState } from "react";
import { BookingState } from "../types";
import type { BookingDict } from "../dict";
import BookingStepper from "../shared/BookingStepper";
import PrimaryButton from "../shared/PrimaryButton";

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  dict: BookingDict;
  stepLabel: string;
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Step1DateGuests({ state, onChange, onNext, dict, stepLabel }: Props) {
  const d1 = dict.step1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initial = state.date ?? today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [viewMode, setViewMode] = useState<"days" | "months">("days");

  const cells = buildCalendarDays(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function selectDate(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    if (d < today) return;
    onChange({ date: d });
  }

  function isMonthPast(month: number) {
    if (viewYear < today.getFullYear()) return true;
    if (viewYear === today.getFullYear()) return month < today.getMonth();
    return false;
  }

  function selectMonth(month: number) {
    if (isMonthPast(month)) return;
    setViewMonth(month);
    setViewMode("days");
  }

  function isSelected(day: number) {
    return (
      !!state.date &&
      state.date.getFullYear() === viewYear &&
      state.date.getMonth() === viewMonth &&
      state.date.getDate() === day
    );
  }

  function isToday(day: number) {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  }

  function isPast(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }

  function setGuests(val: number) {
    onChange({ guests: Math.max(1, Math.min(99999, val)) });
  }

  const canProceed = state.date !== null && state.guests >= 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <BookingStepper currentStep={1} label={stepLabel} />
        <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">
          {d1.title}
        </h2>
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">{d1.subtitle}</p>
      </div>

      {/* Calendar */}
      <div className="flex flex-col gap-3 bg-[#111] border border-[#303030] p-4">
        {viewMode === "months" ? (
          <>
            {/* Year navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewYear(y => y - 1)}
                className="flex items-center justify-center size-8 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="#f1f1f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight">
                {viewYear}
              </p>
              <button
                onClick={() => setViewYear(y => y + 1)}
                className="flex items-center justify-center size-8 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="#f1f1f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Month grid 3×4 */}
            <div className="grid grid-cols-3 gap-1.5">
              {d1.months.map((name, i) => {
                const past = isMonthPast(i);
                const active = i === viewMonth && viewYear === (state.date?.getFullYear() ?? today.getFullYear());
                return (
                  <button
                    key={name}
                    onClick={() => selectMonth(i)}
                    disabled={past}
                    className={`py-2.5 text-sm font-figtree tracking-tight transition-colors
                      ${active
                        ? "bg-white text-[#111] font-medium"
                        : past
                        ? "text-[#474747] cursor-not-allowed"
                        : "text-[#c4c4c4] hover:bg-white/10 cursor-pointer"
                      }`}
                  >
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Month/year navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="flex items-center justify-center size-8 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="#f1f1f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("months")}
                className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight hover:text-[#a8a8a8] transition-colors"
              >
                {d1.months[viewMonth]} {viewYear}
              </button>
              <button
                onClick={nextMonth}
                className="flex items-center justify-center size-8 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="#f1f1f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1">
              {d1.days.map((d) => (
                <div key={d} className="flex items-center justify-center py-1">
                  <span className="text-xs font-medium text-[#747474] font-figtree tracking-tight">{d}</span>
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const past = isPast(day);
                const selected = isSelected(day);
                const todayCell = isToday(day);
                return (
                  <button
                    key={day}
                    onClick={() => selectDate(day)}
                    disabled={past}
                    className={`flex items-center justify-center h-9 text-sm font-figtree tracking-tight transition-colors
                      ${selected
                        ? "bg-white text-[#111] font-medium"
                        : past
                        ? "text-[#474747] cursor-not-allowed"
                        : todayCell
                        ? "text-[#f1f1f1] border border-[#474747] hover:bg-white/10"
                        : "text-[#c4c4c4] hover:bg-white/10 cursor-pointer"
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Guest counter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">
          {d1.guests_label}
        </label>
        <div className="flex items-stretch bg-[#111] border border-[#303030]">
          <input
            type="number"
            min={1}
            max={99999}
            value={state.guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            className="flex-1 bg-transparent px-3 py-3.5 text-base text-[#f1f1f1] font-figtree tracking-tight focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <div className="flex border-l border-[#303030] shrink-0">
            <button
              onClick={() => setGuests(state.guests - 1)}
              className="flex items-center justify-center w-11 text-[#f1f1f1] hover:bg-white/10 transition-colors text-lg font-medium border-r border-[#303030]"
            >
              −
            </button>
            <button
              onClick={() => setGuests(state.guests + 1)}
              disabled={state.guests >= 99999}
              className="flex items-center justify-center w-11 text-[#f1f1f1] hover:bg-white/10 transition-colors text-lg font-medium disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <PrimaryButton label={dict.continue} onClick={onNext} disabled={!canProceed} />
    </div>
  );
}
