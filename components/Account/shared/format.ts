const RO_MONTHS_SHORT = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];

export function formatMDL(amount: number): string {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("ro-MD").format(amount) + " MDL";
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
}

export function formatDateShort(iso: string): string {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${RO_MONTHS_SHORT[(month - 1) % 12]} ${year}`;
}

export function formatDay(iso: string): string {
  if (!iso) return "—";
  const [, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!month || !day) return iso;
  return `${day} ${RO_MONTHS_SHORT[(month - 1) % 12]}`;
}

export function formatYear(iso: string): string {
  if (!iso) return "—";
  return iso.slice(0, 4);
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return "—";
  return timeStr.slice(0, 5);
}

export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function pickAmount(...values: unknown[]): number {
  for (const v of values) {
    if (typeof v === "number" && !isNaN(v)) return v;
    if (typeof v === "string" && v !== "" && !isNaN(Number(v))) return Number(v);
  }
  return 0;
}
