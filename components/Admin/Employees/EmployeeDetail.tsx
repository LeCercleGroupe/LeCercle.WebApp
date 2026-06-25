"use client";

import Image from "next/image";
import { useState } from "react";
import { ALL_VENUES, VENUE_INFO } from "@/components/BookingFlow/types";
import { formatDate } from "@/components/Account/shared/format";
import SelectMenu from "../shared/SelectMenu";
import type { EmployeesDict } from "../shared/types";
import { updateEmployee, type Employee } from "./employeesApi";
import UnavailabilityManager from "./UnavailabilityManager";

interface Props {
  employee: Employee;
  dict: EmployeesDict;
  locale: string;
  onBack: () => void;
  onSaved: (employee: Employee) => void;
}

const inputClass =
  "bg-[#0c0c0c] border border-[#2a2a2a] text-[13px] text-[#f0f0f0] font-figtree tracking-tight px-3 py-2 focus:outline-none focus:border-[#4a4a4a] placeholder:text-[#555]";

export default function EmployeeDetail({ employee, dict, locale, onBack, onSaved }: Props) {
  const [specialization, setSpecialization] = useState(employee.specialization ?? "");
  const [isAvailable, setIsAvailable] = useState(employee.isAvailable);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const dirty = specialization !== (employee.specialization ?? "") || isAvailable !== employee.isAvailable;

  async function save() {
    setSaving(true);
    setError(false);
    const updated: Employee = { ...employee, specialization: specialization.trim(), isAvailable };
    try {
      await updateEmployee(updated);
      onSaved(updated);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  const availabilityOptions = [
    { value: "yes", label: dict.available_yes },
    { value: "no", label: dict.available_no },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-[#141414]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#888] hover:text-[#f0f0f0] font-figtree tracking-tight transition-colors cursor-pointer mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.back}
        </button>
        <h1 className="text-[22px] sm:text-[26px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none">
          {employee.displayName || "—"}
        </h1>
        <p className="text-[12px] text-[#666] font-figtree tracking-tight mt-1.5">
          {employee.email} · {dict.hired} {formatDate(employee.hiredAt)}
        </p>
      </div>

      <div className="px-5 sm:px-8 py-6 flex flex-col gap-8 max-w-2xl">
        {/* Edit fields */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-[#888] font-figtree tracking-tight">{dict.field_specialization}</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className={`${inputClass} max-w-xs`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-[#888] font-figtree tracking-tight">{dict.field_available}</label>
            <SelectMenu
              value={isAvailable ? "yes" : "no"}
              onChange={(v) => setIsAvailable(v === "yes")}
              options={availabilityOptions}
              placeholder={dict.field_available}
              ariaLabel={dict.field_available}
            />
          </div>

          {error && <p className="text-[12px] text-red-400 font-figtree tracking-tight">{dict.error}</p>}

          <div>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="px-4 py-2 text-[13px] font-medium font-figtree tracking-tight text-[#f0f0f0] border border-[#4a4a4a] bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {saving ? dict.saving : dict.save}
            </button>
          </div>
        </section>

        {/* Read-only unavailabilities */}
        <UnavailabilityManager dict={dict} locale={locale} source={{ mode: "view", employeeId: employee.id }} />

        {/* Default service assignment — backend not available yet */}
        <DefaultAssignmentStub dict={dict} />
      </div>
    </div>
  );
}

// Placeholder for assigning an employee as a default for a service. The backend
// does not expose this yet, so the control is rendered disabled with a notice.
function DefaultAssignmentStub({ dict }: { dict: EmployeesDict }) {
  return (
    <section className="flex flex-col gap-3 opacity-60">
      <div className="flex items-center gap-2">
        <h3 className="text-[13px] font-semibold text-[#f0f0f0] font-figtree tracking-tight uppercase">
          {dict.default_title}
        </h3>
        <span className="px-2 py-0.5 text-[10px] font-medium font-figtree tracking-widest uppercase text-[#888] border border-[#2a2a2a]">
          {dict.coming_soon}
        </span>
      </div>
      <p className="text-[12px] text-[#666] font-figtree tracking-tight">{dict.default_subtitle}</p>
      <div className="flex flex-wrap gap-2">
        {ALL_VENUES.map((serviceId) => {
          const info = VENUE_INFO[serviceId];
          return (
            <label
              key={serviceId}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-figtree tracking-tight text-[#888] border border-[#2a2a2a] bg-[#0c0c0c] cursor-not-allowed"
            >
              <input type="checkbox" disabled className="accent-[#4a4a4a] cursor-not-allowed" />
              {info.logo && (
                <Image src={info.logo} alt={info.name} width={16} height={16} className="size-4 object-contain" />
              )}
              {info.name}
            </label>
          );
        })}
      </div>
    </section>
  );
}
