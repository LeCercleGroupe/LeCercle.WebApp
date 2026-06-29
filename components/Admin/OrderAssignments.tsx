"use client";

import { useEffect, useState } from "react";
import type { OrderItem } from "@/components/Account/shared/types";
import type { AdminDict } from "./shared/types";
import { fetchEmployees, type Employee } from "./Employees/employeesApi";
import {
  createAssignment,
  deleteAssignment,
  fetchAssignments,
  type Assignment,
} from "./shared/assignmentsApi";
import SelectMenu from "./shared/SelectMenu";

interface Props {
  items: OrderItem[] | null;
  loading: boolean;
  error: boolean;
  dict: AdminDict;
}

// Manager / Owner-only panel for assigning staff to each order item. The roster
// is loaded once and shared across every item; each item manages its own
// assignment list. Roles are enforced upstream (RequireManager).
export default function OrderAssignments({ items, loading, error, dict }: Props) {
  const a = dict.assignments;
  const [employees, setEmployees] = useState<Employee[] | null>(null);

  useEffect(() => {
    let active = true;
    // Defer the state write out of the effect body (project lint forbids
    // setState directly in an effect).
    Promise.resolve().then(async () => {
      try {
        const list = await fetchEmployees();
        if (active) setEmployees(list);
      } catch {
        if (active) setEmployees([]);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-[13px] text-[#666] font-figtree tracking-tight py-2">{a.loading}</p>;
  }
  if (error) {
    return <p className="text-[13px] text-red-400 font-figtree tracking-tight py-2">{a.error}</p>;
  }
  if (!items || items.length === 0) {
    return <p className="text-[13px] text-[#666] font-figtree tracking-tight py-2">{dict.order_empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <ItemAssignments key={item.id} item={item} employees={employees} dict={dict} />
      ))}
    </div>
  );
}

function ItemAssignments({
  item,
  employees,
  dict,
}: {
  item: OrderItem;
  employees: Employee[] | null;
  dict: AdminDict;
}) {
  const a = dict.assignments;
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(async () => {
      try {
        const list = await fetchAssignments(item.id);
        if (active) setAssignments(list);
      } catch {
        if (active) {
          setAssignments([]);
          setFailed(true);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [item.id]);

  // Employees not yet assigned to this item — keeps the picker free of duplicates.
  const assignedIds = new Set((assignments ?? []).map((x) => x.employeeId));
  const selectable = (employees ?? []).filter((e) => !assignedIds.has(e.id));
  const options = [
    { value: "", label: a.select_employee },
    ...selectable.map((e) => ({ value: e.id, label: e.displayName })),
  ];

  async function add() {
    if (!selectedId || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const trimmed = notes.trim();
      const { id } = await createAssignment(item.id, {
        employeeId: selectedId,
        notes: trimmed || undefined,
      });
      const employee = (employees ?? []).find((e) => e.id === selectedId);
      const created: Assignment = {
        id,
        orderItemId:      item.id,
        employeeId:       selectedId,
        employeeName:     employee?.displayName ?? "",
        assignedByUserId: "",
        assignedByName:   "",
        assignedAt:       new Date().toISOString(),
        notes:            trimmed || null,
      };
      setAssignments((prev) => [...(prev ?? []), created]);
      setSelectedId("");
      setNotes("");
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  async function remove(assignmentId: string) {
    setFailed(false);
    try {
      await deleteAssignment(item.id, assignmentId);
      setAssignments((prev) => (prev ?? []).filter((x) => x.id !== assignmentId));
    } catch {
      setFailed(true);
    }
  }

  const noEmployees = employees !== null && selectable.length === 0 && assignedIds.size === 0;

  return (
    <div className="border border-[#1e1e1e] bg-[#0c0c0c]">
      {/* Item header */}
      <div className="flex items-baseline justify-between gap-4 px-4 py-3 border-b border-[#1e1e1e]">
        <p className="text-[14px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
          {item.serviceName}
        </p>
        {item.packageName && (
          <span className="shrink-0 text-[12px] text-[#888] font-figtree tracking-tight">{item.packageName}</span>
        )}
      </div>

      {/* Current assignments */}
      <div className="flex flex-col">
        {assignments === null && (
          <p className="text-[13px] text-[#666] font-figtree tracking-tight px-4 py-3">{a.loading}</p>
        )}
        {assignments !== null && assignments.length === 0 && (
          <p className="text-[13px] text-[#666] font-figtree tracking-tight px-4 py-3">{a.empty}</p>
        )}
        {(assignments ?? []).map((assignment) => (
          <div
            key={assignment.id}
            className="flex items-start gap-3 px-4 py-2.5 border-t border-[#141414] first:border-t-0"
          >
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="text-[13px] text-[#e0e0e0] font-figtree tracking-tight leading-snug">
                {assignment.employeeName || "—"}
              </span>
              {(assignment.notes || assignment.assignedByName) && (
                <span className="text-[11px] text-[#555] font-figtree tracking-tight">
                  {[assignment.notes, assignment.assignedByName && a.assigned_by.replace("{name}", assignment.assignedByName)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => remove(assignment.id)}
              className="shrink-0 text-[12px] font-medium font-figtree tracking-tight text-[#888] hover:text-red-400 transition-colors cursor-pointer"
            >
              {a.remove}
            </button>
          </div>
        ))}
      </div>

      {/* Add assignment */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-[#141414] bg-[#0a0a0a]">
        {noEmployees ? (
          <p className="text-[12px] text-[#555] font-figtree tracking-tight">{a.no_employees}</p>
        ) : (
          <>
            <SelectMenu
              value={selectedId}
              onChange={setSelectedId}
              options={options}
              placeholder={a.select_employee}
              ariaLabel={a.select_employee}
            />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={a.notes_placeholder}
              className="flex-1 min-w-40 bg-[#0c0c0c] border border-[#2a2a2a] text-[13px] text-[#f0f0f0] font-figtree tracking-tight px-3 py-2 focus:outline-none focus:border-[#4a4a4a] placeholder:text-[#555]"
            />
            <button
              type="button"
              onClick={add}
              disabled={!selectedId || busy}
              className="px-3 py-2 text-[12px] font-medium font-figtree tracking-tight text-[#f0f0f0] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? a.assigning : a.assign}
            </button>
          </>
        )}
        {failed && <span className="text-[12px] text-red-400 font-figtree tracking-tight w-full">{a.error}</span>}
      </div>
    </div>
  );
}
