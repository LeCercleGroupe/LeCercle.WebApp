"use client";

import { useMemo, useState } from "react";
import { formatMDL, pickAmount } from "@/components/Account/shared/format";
import type {
  OrderItem,
  OrderItemSelection,
} from "@/components/Account/shared/types";
import type { AdminDict } from "./shared/types";

// localStorage key holding the set of features an employee has ticked off while
// preparing orders. Tracking is browser-local on purpose: it is a personal
// checklist, not order state, so it is never sent back to the API.
const STORAGE_KEY = "lc-admin-order-checklist";

function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

// Stable keys for each trackable line. item.id is a GUID, so it is unique on its
// own; selections add the option so the same feature with two options is distinct.
function fixedKey(itemId: string, featureId: string): string {
  return `f:${itemId}:${featureId}`;
}
function selectionKey(itemId: string, sel: OrderItemSelection): string {
  return `s:${itemId}:${sel.packageFeatureId}:${sel.selectedOptionId}`;
}

function groupSelections(selections?: OrderItemSelection[]) {
  if (!selections?.length) return [];
  const map = new Map<string, { featureLabel: string; options: OrderItemSelection[] }>();
  for (const sel of selections) {
    const existing = map.get(sel.featureLabel);
    if (existing) existing.options.push(sel);
    else map.set(sel.featureLabel, { featureLabel: sel.featureLabel, options: [sel] });
  }
  return Array.from(map.values());
}

interface Props {
  items: OrderItem[] | null;
  loading: boolean;
  error: boolean;
  dict: AdminDict;
}

export default function OrderChecklist({ items, loading, error, dict }: Props) {
  // The employee's personal "added to order" ticks, persisted to localStorage.
  const [checked, setChecked] = useState<Set<string>>(loadChecked);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Storage may be unavailable (private mode); tracking stays in-memory.
      }
      return next;
    });
  }

  // Overall progress across every trackable feature and selection.
  const { done, total } = useMemo(() => {
    let d = 0;
    let t = 0;
    for (const item of items ?? []) {
      for (const f of item.fixedFeatures ?? []) {
        t += 1;
        if (checked.has(fixedKey(item.id, f.featureId))) d += 1;
      }
      for (const sel of item.selections ?? []) {
        t += 1;
        if (checked.has(selectionKey(item.id, sel))) d += 1;
      }
    }
    return { done: d, total: t };
  }, [items, checked]);

  if (loading) {
    return <p className="text-[13px] text-[#666] font-figtree tracking-tight py-2">{dict.order_loading}</p>;
  }
  if (error) {
    return <p className="text-[13px] text-red-400 font-figtree tracking-tight py-2">{dict.order_error}</p>;
  }
  if (!items || items.length === 0) {
    return <p className="text-[13px] text-[#666] font-figtree tracking-tight py-2">{dict.order_empty}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {total > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-[#141414] overflow-hidden">
            <div
              className="h-full bg-[#37a067] transition-all"
              style={{ width: `${Math.round((done / total) * 100)}%` }}
            />
          </div>
          <span className="text-[12px] text-[#888] font-figtree tracking-tight tabular-nums shrink-0">
            {dict.checklist_progress.replace("{done}", String(done)).replace("{total}", String(total))}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const fixed = [...(item.fixedFeatures ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
          const groups = groupSelections(item.selections);
          const roadPrice = pickAmount(item.roadPrice);
          return (
            <div key={item.id} className="border border-[#1e1e1e] bg-[#0c0c0c]">
              <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-[#1e1e1e]">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-[14px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
                    {item.serviceName}
                  </p>
                  {item.packageName && (
                    <p className="text-[12px] text-[#888] font-figtree tracking-tight">{item.packageName}</p>
                  )}
                </div>
                {item.quantity > 1 && (
                  <span className="shrink-0 text-[12px] text-[#888] font-figtree tracking-tight">×{item.quantity}</span>
                )}
              </div>

              <div className="flex flex-col">
                {fixed.map((f) => (
                  <ChecklistRow
                    key={f.featureId}
                    label={f.label}
                    checked={checked.has(fixedKey(item.id, f.featureId))}
                    onToggle={() => toggle(fixedKey(item.id, f.featureId))}
                  />
                ))}

                {groups.map((group) =>
                  group.options.map((sel) => (
                    <ChecklistRow
                      key={selectionKey(item.id, sel)}
                      label={sel.selectedOptionLabel}
                      hint={`${dict.checklist_selections} · ${group.featureLabel}`}
                      cost={pickAmount(sel.additionalCost)}
                      checked={checked.has(selectionKey(item.id, sel))}
                      onToggle={() => toggle(selectionKey(item.id, sel))}
                    />
                  )),
                )}

                {roadPrice > 0 && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-[#141414]">
                    <span className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.08em] uppercase">
                      {dict.checklist_transport}
                    </span>
                    <span className="text-[12px] text-[#c0c0c0] font-figtree tracking-tight">+{formatMDL(roadPrice)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChecklistRow({
  label,
  hint,
  cost,
  checked,
  onToggle,
}: {
  label: string;
  hint?: string;
  cost?: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-start gap-3 px-4 py-2.5 border-t border-[#141414] first:border-t-0 cursor-pointer hover:bg-[#0f0f0f] transition-colors">
      <span
        className={`mt-0.5 size-4 shrink-0 flex items-center justify-center border transition-colors ${
          checked ? "bg-[#37a067] border-[#37a067]" : "border-[#3a3a3a] bg-transparent"
        }`}
      >
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5l3 3L10 1" stroke="#0a0a0a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span
          className={`text-[13px] font-figtree tracking-tight leading-snug ${
            checked ? "text-[#666] line-through" : "text-[#e0e0e0]"
          }`}
        >
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-[#555] font-figtree uppercase tracking-[0.06em]">{hint}</span>
        )}
      </span>
      {cost !== undefined && cost > 0 && (
        <span className="shrink-0 text-[12px] text-[#888] font-figtree tracking-tight">+{formatMDL(cost)}</span>
      )}
    </label>
  );
}
