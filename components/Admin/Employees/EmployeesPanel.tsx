"use client";

import { useEffect, useState } from "react";
import { canManageEmployees, type AdminDict, type AdminUser } from "../shared/types";
import {
  createEmployee,
  fetchEmployees,
  fetchEmployeeUnavailabilities,
  isBlockedOn,
  todayISO,
  type Employee,
} from "./employeesApi";
import EmployeeDetail from "./EmployeeDetail";
import UnavailabilityManager from "./UnavailabilityManager";

interface Props {
  locale: string;
  user: AdminUser;
  dict: AdminDict;
}

// The Employees view adapts to the signed-in role: Managers/Owners get the full
// roster with add/edit; plain employees get only their own availability.
export default function EmployeesPanel({ locale, user, dict }: Props) {
  if (!canManageEmployees(user.roles)) {
    return <SelfService locale={locale} dict={dict} employeeId={user.employeeId} />;
  }
  return <Roster locale={locale} dict={dict} myEmployeeId={user.employeeId} />;
}

// ── Plain-employee self-service ──────────────────────────────────────────────

function SelfService({ locale, dict, employeeId }: { locale: string; dict: AdminDict; employeeId?: string }) {
  const t = dict.employees;
  return (
    <div className="flex flex-col h-full overflow-auto">
      <header className="px-5 sm:px-8 pt-6 pb-4 border-b border-[#141414]">
        <h1 className="text-[22px] sm:text-[26px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none">
          {t.self_title}
        </h1>
        <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1.5">{t.self_subtitle}</p>
      </header>
      <div className="px-5 sm:px-8 py-6 max-w-2xl">
        <UnavailabilityManager dict={t} locale={locale} source={{ mode: "self", employeeId }} />
      </div>
    </div>
  );
}

// ── Manager roster ───────────────────────────────────────────────────────────

const inputClass =
  "bg-[#0c0c0c] border border-[#2a2a2a] text-[13px] text-[#f0f0f0] font-figtree tracking-tight px-3 py-2 focus:outline-none focus:border-[#4a4a4a] placeholder:text-[#555]";

function Roster({ locale, dict, myEmployeeId }: { locale: string; dict: AdminDict; myEmployeeId?: string }) {
  const t = dict.employees;
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [adding, setAdding] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Ids of employees whose blocked dates cover today: shown as unavailable in the
  // roster regardless of the manually-set `isAvailable` flag.
  const [blockedToday, setBlockedToday] = useState<Set<string>>(new Set());

  function reload() {
    setEmployees(null);
    setReloadKey((k) => k + 1);
  }

  useEffect(() => {
    let active = true;
    // Defer the first setState out of the effect body (see ServiceEvents) to
    // avoid a synchronous cascading render.
    Promise.resolve().then(() => {
      if (!active) return;
      setError(false);
      setBlockedToday(new Set());
      fetchEmployees()
        .then((list) => active && setEmployees(sortByName(list)))
        .catch(() => active && setError(true));
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Once the roster is loaded, resolve each member's current availability from
  // their blocked date ranges. Failures for a single member are ignored (that
  // member simply falls back to their `isAvailable` flag).
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    let active = true;
    const today = todayISO();
    Promise.all(
      employees.map((emp) =>
        fetchEmployeeUnavailabilities(emp.id)
          .then((list) => (isBlockedOn(list, today) ? emp.id : null))
          .catch(() => null),
      ),
    ).then((ids) => {
      if (!active) return;
      setBlockedToday(new Set(ids.filter((id): id is string => id !== null)));
    });
    return () => {
      active = false;
    };
  }, [employees]);

  function applyUpdate(updated: Employee) {
    setEmployees((prev) => (prev ? sortByName(prev.map((e) => (e.id === updated.id ? updated : e))) : prev));
    setSelected(updated);
  }

  if (selected) {
    return (
      <EmployeeDetail
        employee={selected}
        dict={t}
        locale={locale}
        isSelf={!!myEmployeeId && selected.id === myEmployeeId}
        onBack={() => setSelected(null)}
        onSaved={applyUpdate}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between gap-4 px-5 sm:px-8 pt-6 pb-4 border-b border-[#141414]">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none">
            {t.roster_title}
          </h1>
          <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1.5">{t.roster_subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="shrink-0 px-3.5 py-2 text-[13px] font-medium font-figtree tracking-tight text-[#f0f0f0] border border-[#4a4a4a] bg-[#1a1a1a] hover:bg-[#222] transition-colors cursor-pointer"
        >
          {t.add_employee}
        </button>
      </header>

      {adding && (
        <AddEmployeeForm
          dict={t}
          onCancel={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            reload();
          }}
        />
      )}

      <div className="flex-1 overflow-auto px-5 sm:px-8 py-4">
        {error && <p className="text-sm text-red-400 font-figtree py-12 text-center">{t.error}</p>}
        {!error && employees === null && (
          <p className="text-sm text-[#666] font-figtree py-12 text-center">{t.loading}</p>
        )}
        {!error && employees?.length === 0 && (
          <p className="text-sm text-[#666] font-figtree py-12 text-center">{t.empty}</p>
        )}

        {!error && employees && employees.length > 0 && (
          <div className="flex flex-col border border-[#1e1e1e]">
            {employees.map((emp) => (
              <EmployeeRow
                key={emp.id}
                employee={emp}
                dict={t}
                available={emp.isAvailable && !blockedToday.has(emp.id)}
                onSelect={() => setSelected(emp)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmployeeRow({
  employee,
  dict,
  available,
  onSelect,
}: {
  employee: Employee;
  dict: AdminDict["employees"];
  available: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left flex items-center gap-4 sm:gap-6 px-4 sm:px-5 py-4 border-b border-[#141414] last:border-b-0 bg-[#0c0c0c] hover:bg-[#0f0f0f] transition-colors cursor-pointer"
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[15px] font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
          {employee.displayName || "—"}
        </p>
        <p className="text-[13px] text-[#666] font-figtree tracking-tight truncate">
          {[employee.specialization, employee.email].filter(Boolean).join(" · ")}
        </p>
      </div>
      <span
        className={`shrink-0 inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest uppercase border ${
          available
            ? "border-emerald-900 text-emerald-400"
            : "border-[#2a2a2a] text-[#888]"
        }`}
      >
        {available ? dict.available_yes : dict.available_no}
      </span>
    </button>
  );
}

function AddEmployeeForm({
  dict,
  onCancel,
  onCreated,
}: {
  dict: AdminDict["employees"];
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function submit() {
    if (!userId.trim() || !specialization.trim()) return;
    setSaving(true);
    setError(false);
    try {
      await createEmployee({ userId: userId.trim(), specialization: specialization.trim() });
      onCreated();
    } catch {
      setError(true);
      setSaving(false);
    }
  }

  return (
    <div className="px-5 sm:px-8 py-4 border-b border-[#141414] bg-[#0a0a0a] flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1.5 flex-1 min-w-56">
          <label className="text-[12px] text-[#888] font-figtree tracking-tight">{dict.field_userid}</label>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-40">
          <label className="text-[12px] text-[#888] font-figtree tracking-tight">{dict.field_specialization}</label>
          <input
            type="text"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={saving || !userId.trim() || !specialization.trim()}
          className="px-4 py-2 text-[13px] font-medium font-figtree tracking-tight text-[#f0f0f0] border border-[#4a4a4a] bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {saving ? dict.saving : dict.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[13px] font-medium font-figtree tracking-tight text-[#888] border border-[#2a2a2a] hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer"
        >
          {dict.cancel}
        </button>
      </div>
      {error && <p className="text-[12px] text-red-400 font-figtree tracking-tight">{dict.error}</p>}
    </div>
  );
}

function sortByName(list: Employee[]): Employee[] {
  return [...list].sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
}
