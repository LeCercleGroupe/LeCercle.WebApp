"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/components/Account/shared/format";
import DatePicker from "../shared/DatePicker";
import type { EmployeesDict } from "../shared/types";
import {
  addMyUnavailability,
  deleteMyUnavailability,
  fetchEmployeeUnavailabilities,
  fetchMyUnavailabilities,
  type Unavailability,
} from "./employeesApi";

// Lists blocked date ranges and — in "self" mode — lets the signed-in staff
// member add and remove their own. In "view" mode it is read-only (a manager
// inspecting a roster member; the backend only exposes add/remove on /api/me).
type Source = { mode: "self" } | { mode: "view"; employeeId: string };

interface Props {
  dict: EmployeesDict;
  locale: string;
  source: Source;
}

const inputClass =
  "bg-[#0c0c0c] border border-[#2a2a2a] text-[13px] text-[#f0f0f0] font-figtree tracking-tight px-3 py-2 focus:outline-none focus:border-[#4a4a4a] placeholder:text-[#555]";

export default function UnavailabilityManager({ dict, locale, source }: Props) {
  const editable = source.mode === "self";

  const [items, setItems] = useState<Unavailability[] | null>(null);
  const [error, setError] = useState(false);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [rangeError, setRangeError] = useState(false);
  const [saving, setSaving] = useState(false);

  // `source` is a fresh object each render; key the effect on its identifying
  // fields so it only re-runs when the target actually changes.
  const mode = source.mode;
  const viewId = source.mode === "view" ? source.employeeId : "";

  useEffect(() => {
    let active = true;
    // Defer the first setState out of the effect body (see ServiceEvents) so we
    // don't trigger a synchronous cascading render.
    Promise.resolve().then(() => {
      if (!active) return;
      setItems(null);
      setError(false);
      const load = mode === "self" ? fetchMyUnavailabilities() : fetchEmployeeUnavailabilities(viewId);
      load
        .then((list) => active && setItems(sortByStart(list)))
        .catch(() => active && setError(true));
    });
    return () => {
      active = false;
    };
  }, [mode, viewId]);

  async function add() {
    if (!start || !end) return;
    if (end < start) {
      setRangeError(true);
      return;
    }
    setRangeError(false);
    setSaving(true);
    try {
      const created = await addMyUnavailability({ startDate: start, endDate: end, reason: reason.trim() || undefined });
      setItems((prev) => sortByStart([created, ...(prev ?? [])]));
      setStart("");
      setEnd("");
      setReason("");
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const prev = items ?? [];
    setItems(prev.filter((u) => u.id !== id)); // optimistic
    try {
      await deleteMyUnavailability(id);
    } catch {
      setItems(prev); // restore on failure
      setError(true);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-[13px] font-semibold text-[#f0f0f0] font-figtree tracking-tight uppercase">
        {dict.unavail_title}
      </h3>

      {editable && (
        <div className="flex flex-wrap items-center gap-2">
          <DatePicker value={start} onChange={setStart} locale={locale} placeholder={dict.unavail_start} ariaLabel={dict.unavail_start} />
          <DatePicker value={end} onChange={setEnd} locale={locale} placeholder={dict.unavail_end} ariaLabel={dict.unavail_end} />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={dict.unavail_reason_ph}
            className={`${inputClass} flex-1 min-w-40`}
          />
          <button
            type="button"
            onClick={add}
            disabled={saving || !start || !end}
            className="px-3.5 py-2 text-[13px] font-medium font-figtree tracking-tight text-[#f0f0f0] border border-[#4a4a4a] bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {saving ? dict.saving : dict.unavail_add}
          </button>
        </div>
      )}

      {rangeError && <p className="text-[12px] text-red-400 font-figtree tracking-tight">{dict.unavail_range_error}</p>}
      {error && <p className="text-[12px] text-red-400 font-figtree tracking-tight">{dict.error}</p>}

      {items === null && !error && (
        <p className="text-[13px] text-[#666] font-figtree tracking-tight py-2">{dict.loading}</p>
      )}
      {items !== null && items.length === 0 && (
        <p className="text-[13px] text-[#666] font-figtree tracking-tight py-2">{dict.unavail_empty}</p>
      )}

      {items !== null && items.length > 0 && (
        <div className="flex flex-col border border-[#1e1e1e]">
          {items.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 px-4 py-3 border-b border-[#141414] last:border-b-0 bg-[#0c0c0c]"
            >
              <span className="text-[13px] font-medium text-[#f0f0f0] font-figtree tracking-tight whitespace-nowrap">
                {formatDate(u.startDate)} — {formatDate(u.endDate)}
              </span>
              {u.reason && (
                <span className="flex-1 min-w-0 text-[13px] text-[#888] font-figtree tracking-tight truncate">
                  {u.reason}
                </span>
              )}
              {editable && (
                <button
                  type="button"
                  onClick={() => remove(u.id)}
                  aria-label={dict.unavail_remove}
                  className="ml-auto shrink-0 text-[#666] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function sortByStart(list: Unavailability[]): Unavailability[] {
  return [...list].sort((a, b) => (a.startDate || "").localeCompare(b.startDate || ""));
}
