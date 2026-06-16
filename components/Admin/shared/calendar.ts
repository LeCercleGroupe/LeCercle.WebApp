// Shared month-grid helpers used by both the full calendar and the date-picker
// popover. All keys are local YYYY-MM-DD (no UTC shifting from toISOString).

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

// The first day (1st) of the month a YYYY-MM-DD value falls in, or the current
// month when the value is empty/invalid. Used to position a picker's cursor.
export function monthStartFor(value: string): Date {
  if (value) {
    const [y, m] = value.split("-").map(Number);
    if (y && m) return new Date(y, m - 1, 1);
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// 42 days (6 weeks) covering the given month, starting on the Monday on/before
// the 1st — the classic calendar grid.
export function buildMonthDays(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Mon=0 … Sun=6
  const start = new Date(first);
  start.setDate(1 - offset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

// Localized short weekday names, Monday-first (2024-01-01 was a Monday).
export function weekdayShortNames(intl: string): string[] {
  const fmt = new Intl.DateTimeFormat(intl, { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
}
