"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import Image from "next/image";
import { BookingState, ServiceId, VENUE_INFO, ALL_VENUES } from "../types";
import type { BookingDict } from "../dict";
import BookingStepper from "../shared/BookingStepper";
import BackButton from "../shared/BackButton";
import PrimaryButton from "../shared/PrimaryButton";

interface ServiceAvailability {
  serviceId: string;
  isAvailable: boolean;
}

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
  dict: BookingDict;
  stepLabel: string;
  tokenRef: RefObject<string | null>;
}

function toggleService(selected: ServiceId[], key: ServiceId): ServiceId[] {
  return selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Step2Services({ state, onChange, onNext, onBack, dict, stepLabel, tokenRef }: Props) {
  const d = dict.step2;
  const [availability, setAvailability] = useState<Map<string, boolean> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!state.date) return;

    const token = tokenRef.current;
    if (!token) return;

    fetch(`/api/booking/services?date=${formatDate(state.date)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data: ServiceAvailability[]) => {
        const map = new Map(data.map((s) => [s.serviceId, s.isAvailable]));
        setAvailability(map);
      })
      .catch(() => setError(true));
  }, [state.date, tokenRef]);

  const loading = availability === null && !error;
  const canProceed = state.selectedServices.length > 0;

  function isAvailable(key: ServiceId): boolean {
    if (availability === null) return true;
    return availability.get(key) !== false;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <BookingStepper currentStep={2} label={stepLabel} />
          <BackButton label={dict.back} onClick={onBack} />
        </div>
        <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">{d.title}</h2>
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">{d.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 border-2 border-[#37a067] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ALL_VENUES.map((key) => {
            const info = VENUE_INFO[key];
            const isSelected = state.selectedServices.includes(key);
            const available = isAvailable(key);

            return (
              <button
                key={key}
                onClick={() => available && onChange({ selectedServices: toggleService(state.selectedServices, key) })}
                disabled={!available}
                className={`flex gap-4 items-center p-4 border text-left transition-all duration-200 ${
                  !available
                    ? "bg-[#0d0d0d] border-[#222] opacity-40 cursor-not-allowed"
                    : isSelected
                    ? "bg-[#0e1f17] border-[#37a067]"
                    : "bg-[#111] border-[#303030] hover:border-[#474747]"
                }`}
              >
                <div className="flex items-center justify-center size-12 shrink-0 bg-[#1b1b1b] border border-[#303030]">
                  <Image src={info.logo} alt={info.name} width={32} height={32} className="object-contain" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-base font-medium text-[#f1f1f1] font-figtree tracking-tight">{info.name}</p>
                  <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">{info.description}</p>
                </div>
                <div className={`flex items-center justify-center size-5 rounded-sm border shrink-0 transition-colors ${
                  isSelected ? "bg-[#37a067] border-[#37a067]" : "bg-transparent border-[#474747]"
                }`}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {state.selectedServices.length > 0 && (
        <p className="text-sm text-[#37a067] font-figtree tracking-tight">
          {d.selected_count.replace("{count}", String(state.selectedServices.length))}
        </p>
      )}

      <PrimaryButton label={dict.continue} onClick={onNext} disabled={!canProceed} />
    </div>
  );
}
