"use client";

import Image from "next/image";
import { ALL_VENUES, VENUE_INFO } from "@/components/BookingFlow/types";
import type { AdminDict, AdminView } from "./shared/types";

interface Props {
  view: AdminView;
  onChange: (view: AdminView) => void;
  dict: AdminDict;
}

export default function AdminSidebar({ view, onChange, dict }: Props) {
  const isActive = (candidate: AdminView) => {
    if (candidate.type === "calendar") return view.type === "calendar";
    if (candidate.type === "employees") return view.type === "employees";
    return view.type === "service" && view.serviceId === candidate.serviceId;
  };

  const itemClass = (active: boolean) =>
    `flex items-center gap-3 shrink-0 md:w-full px-3.5 py-2.5 text-left text-[13px] font-medium font-figtree tracking-tight border transition-colors cursor-pointer ${
      active
        ? "border-[#4a4a4a] bg-[#1a1a1a] text-[#f0f0f0]"
        : "border-transparent text-[#888] hover:text-[#f0f0f0] hover:bg-[#121212]"
    }`;

  return (
    <nav className="flex md:flex-col gap-1 md:w-56 shrink-0 p-3 md:p-4 overflow-x-auto md:overflow-visible border-b md:border-b-0 md:border-r border-[#141414] bg-[#0a0a0a]">
      {/* Calendar */}
      <button
        type="button"
        onClick={() => onChange({ type: "calendar" })}
        className={itemClass(isActive({ type: "calendar" }))}
      >
        <CalendarIcon />
        <span className="whitespace-nowrap">{dict.calendar}</span>
      </button>

      {/* Employees */}
      <button
        type="button"
        onClick={() => onChange({ type: "employees" })}
        className={itemClass(isActive({ type: "employees" }))}
      >
        <TeamIcon />
        <span className="whitespace-nowrap">{dict.employees.nav}</span>
      </button>

      <div className="hidden md:block h-px bg-[#141414] my-2" />

      {/* Services */}
      {ALL_VENUES.map((serviceId) => {
        const info = VENUE_INFO[serviceId];
        const active = isActive({ type: "service", serviceId });
        return (
          <button
            key={serviceId}
            type="button"
            onClick={() => onChange({ type: "service", serviceId })}
            className={itemClass(active)}
          >
            {info.logo ? (
              <Image
                src={info.logo}
                alt={info.name}
                width={20}
                height={20}
                className="size-5 object-contain shrink-0"
              />
            ) : (
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: info.accentColor }}
              />
            )}
            <span className="whitespace-nowrap">{info.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M17.5 19a5.5 5.5 0 0 0-3-4.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
