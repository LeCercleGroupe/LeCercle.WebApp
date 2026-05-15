"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import Image from "next/image";
import { BookingState, ServiceId, SelectedPackage, VENUE_INFO } from "../types";
import type { BookingDict } from "../dict";
import { fetchWithRefresh, loadAuth } from "../utils/auth";
import BookingStepper from "../shared/BookingStepper";
import BackButton from "../shared/BackButton";
import PrimaryButton from "../shared/PrimaryButton";
import CornerBrackets from "../shared/CornerBrackets";

interface ApiPackage {
  id: string;
  serviceId: string;
  name: string;
  tier: string;
  description: string;
  minGuests: number;
  maxGuests: number;
  basePrice: number;
  durationMinutes: number;
  isActive: boolean;
}

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
  dict: BookingDict;
  locale: string;
  stepLabel: string;
  tokenRef: RefObject<string | null>;
}

function formatMDL(amount: number): string {
  return new Intl.NumberFormat("ro-MD").format(amount) + " MDL";
}

interface PackageCardProps {
  pkg: ApiPackage;
  selected: boolean;
  onSelect: () => void;
  selectedBadge: string;
}

function PackageCard({ pkg, selected, onSelect, selectedBadge }: PackageCardProps) {
  const features = pkg.description.split(";").map((s) => s.trim()).filter(Boolean);

  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col gap-4 p-4 border text-left w-full transition-all duration-200 ${
        selected ? "bg-[#0e1f17] border-[#37a067]" : "bg-[#111] border-[#303030] hover:border-[#474747]"
      }`}
    >
      <CornerBrackets color={selected ? "#37a067" : "rgba(255,255,255,0.12)"} size={12} />
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-lg font-medium text-[#f1f1f1] font-figtree tracking-tight">{pkg.name}</p>
          <p className="text-xs text-[#747474] font-figtree tracking-tight uppercase">{pkg.tier}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <p className="text-base font-medium text-[#f1f1f1] font-figtree tracking-tight">{formatMDL(pkg.basePrice)}</p>
          <p className="text-xs text-[#747474] font-figtree tracking-tight">max. {pkg.maxGuests} pers.</p>
        </div>
      </div>
      <ul className="flex flex-col gap-1.5">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2 items-start">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
              <path
                d="M2.5 7l3 3 6-6"
                stroke={selected ? "#37a067" : "#747474"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-[#c4c4c4] font-figtree tracking-tight">{feature}</span>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-[#37a067]" />
          <span className="text-xs font-medium text-[#37a067] font-figtree tracking-tight">{selectedBadge}</span>
        </div>
      )}
    </button>
  );
}

function GuestInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-stretch bg-[#111] border border-[#303030]">
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
        className="flex-1 bg-transparent px-3 py-3 text-base text-[#f1f1f1] font-figtree tracking-tight focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="flex border-l border-[#303030] shrink-0">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex items-center justify-center w-11 text-[#f1f1f1] hover:bg-white/10 transition-colors text-lg font-medium border-r border-[#303030]"
        >
          −
        </button>
        <button
          onClick={() => onChange(value + 1)}
          className="flex items-center justify-center w-11 text-[#f1f1f1] hover:bg-white/10 transition-colors text-lg font-medium"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function Step3Packages({ state, onChange, onNext, onBack, dict, stepLabel, tokenRef }: Props) {
  const d = dict.step3;
  const [activeVenue, setActiveVenue] = useState<ServiceId>(state.selectedServices[0]);
  const [packagesMap, setPackagesMap] = useState<Map<ServiceId, ApiPackage[]> | null>(null);
  const [error, setError] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState(false);

  useEffect(() => {
    const token = tokenRef.current;
    if (!token || !state.selectedServices.length) return;

    Promise.all(
      state.selectedServices.map((serviceId) =>
        fetch(`/api/booking/packages/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.json() as Promise<ApiPackage[]>;
          })
          .then((pkgs) => [serviceId, pkgs.filter((p) => p.isActive)] as const)
      )
    )
      .then((results) => setPackagesMap(new Map(results)))
      .catch(() => setError(true));
  }, [state.selectedServices, tokenRef]);

  const loading = packagesMap === null && !error;
  const packages = packagesMap?.get(activeVenue) ?? [];
  const canProceed = state.selectedServices.every((v) => state.selectedPackages[v]);

  function selectPackage(serviceId: ServiceId, pkg: ApiPackage) {
    const selected: SelectedPackage = { id: pkg.id, name: pkg.name, basePrice: pkg.basePrice, tier: pkg.tier };
    onChange({
      selectedPackages: { ...state.selectedPackages, [serviceId]: selected },
      guestsPerService: {
        ...state.guestsPerService,
        [serviceId]: state.guestsPerService[serviceId] ?? state.guests,
      },
    });
  }

  function setServiceGuests(serviceId: ServiceId, count: number) {
    onChange({ guestsPerService: { ...state.guestsPerService, [serviceId]: count } });
  }

  async function handleNext() {
    setReserveError(false);

    // Reservation requires customer auth — skip here if the user hasn't
    // authenticated yet (Step 5 comes later). Step 6 will make the call then.
    if (!loadAuth()?.tokensValid) {
      onNext();
      return;
    }

    setReserving(true);
    try {
      const eventDate = state.date
        ? `${state.date.getFullYear()}-${String(state.date.getMonth() + 1).padStart(2, "0")}-${String(state.date.getDate()).padStart(2, "0")}`
        : undefined;
      const res = await fetchWithRefresh("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDate,
          items: state.selectedServices.map((serviceId) => ({ serviceId, quantity: 1 })),
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const { token } = await res.json();
      onChange({ reservationToken: token ?? "" });
      onNext();
    } catch {
      setReserveError(true);
      setReserving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <BookingStepper currentStep={3} label={stepLabel} />
          <BackButton label={dict.back} onClick={onBack} />
        </div>
        <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">{d.title}</h2>
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">{d.subtitle}</p>
      </div>

      {/* Service tab switcher — shown only when multiple services selected */}
      {state.selectedServices.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {state.selectedServices.map((v) => {
            const info = VENUE_INFO[v];
            const hasPackage = !!state.selectedPackages[v];
            const isActive = v === activeVenue;
            return (
              <button
                key={v}
                onClick={() => setActiveVenue(v)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-full shrink-0 text-sm font-medium font-figtree tracking-tight transition-all duration-200 ${
                  isActive
                    ? "bg-[#1b1b1b] border-[#474747] text-[#f1f1f1]"
                    : "bg-transparent border-[#303030] text-[#a8a8a8] hover:border-[#474747]"
                }`}
              >
                <Image src={info.logo} alt={info.name} width={16} height={16} className="object-contain" />
                {info.name}
                {hasPackage && <div className="size-1.5 rounded-full bg-[#37a067]" />}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 border-2 border-[#37a067] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              selected={state.selectedPackages[activeVenue]?.id === pkg.id}
              onSelect={() => selectPackage(activeVenue, pkg)}
              selectedBadge={d.selected_badge}
            />
          ))}
        </div>
      )}

      {/* Per-service guest count — shown after package is selected */}
      {state.selectedPackages[activeVenue] && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">
            {d.guests_for_service}
          </label>
          <GuestInput
            value={state.guestsPerService[activeVenue] ?? state.guests}
            onChange={(v) => setServiceGuests(activeVenue, v)}
          />
          <p className="text-xs text-[#747474] font-figtree tracking-tight">{d.guests_hint}</p>
        </div>
      )}

      {state.selectedServices.length > 1 && (
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">
          {d.progress
            .replace("{done}", String(state.selectedServices.filter((v) => state.selectedPackages[v]).length))
            .replace("{total}", String(state.selectedServices.length))}
        </p>
      )}

      {reserveError && (
        <p className="text-sm text-red-400 font-figtree tracking-tight text-center">{d.reserve_error}</p>
      )}
      <PrimaryButton label={dict.continue} onClick={handleNext} disabled={!canProceed || reserving} loading={reserving} />
    </div>
  );
}
