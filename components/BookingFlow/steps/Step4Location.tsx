"use client";

import type { AddressSuggestion } from "@/app/api/geocode/address/route";
import type { PlaceDetails } from "@/app/api/geocode/place/route";
import type { VenueSuggestion } from "@/app/api/geocode/venue/route";
import type { DistanceResult } from "@/app/api/geocode/distance/route";
import { useEffect, useRef, useState } from "react";
import type { BookingDict } from "../dict";
import AutocompleteInput from "../shared/AutocompleteInput";
import BackButton from "../shared/BackButton";
import BookingInput from "../shared/BookingInput";
import BookingStepper from "../shared/BookingStepper";
import PrimaryButton from "../shared/PrimaryButton";
import { BookingState } from "../types";

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
  dict: BookingDict;
  stepLabel: string;
}

export default function Step4Location({
  state,
  onChange,
  onNext,
  onBack,
  dict,
  stepLabel,
}: Props) {
  const d = dict.step4;
  const [venueSuggestions, setVenueSuggestions] = useState<VenueSuggestion[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [venueLoading, setVenueLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const venueDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (venueDebounce.current) clearTimeout(venueDebounce.current);
    if (state.venueName.length < 2) return;
    venueDebounce.current = setTimeout(() => {
      setVenueLoading(true);
      fetch(`/api/geocode/venue?q=${encodeURIComponent(state.venueName)}`)
        .then((r) => r.json() as Promise<VenueSuggestion[]>)
        .then(setVenueSuggestions)
        .catch(() => setVenueSuggestions([]))
        .finally(() => setVenueLoading(false));
    }, 400);
    return () => { if (venueDebounce.current) clearTimeout(venueDebounce.current); };
  }, [state.venueName]);

  useEffect(() => {
    if (addressDebounce.current) clearTimeout(addressDebounce.current);
    if (!state.city || state.address.length < 3) return;
    addressDebounce.current = setTimeout(() => {
      setAddressLoading(true);
      fetch(`/api/geocode/address?q=${encodeURIComponent(state.address)}&city=${encodeURIComponent(state.city)}`)
        .then((r) => r.json() as Promise<AddressSuggestion[]>)
        .then(setAddressSuggestions)
        .catch(() => setAddressSuggestions([]))
        .finally(() => setAddressLoading(false));
    }, 400);
    return () => { if (addressDebounce.current) clearTimeout(addressDebounce.current); };
  }, [state.address, state.city]);

  async function handleVenueSelect(suggestion: VenueSuggestion) {
    onChange({
      venueName: suggestion.label,
      city: suggestion.city,
      address: suggestion.description,
      latitude: null,
      longitude: null,
      distanceKm: null,
    });
    setVenueSuggestions([]);

    try {
      const [placeRes, distRes] = await Promise.all([
        fetch(`/api/geocode/place?id=${encodeURIComponent(suggestion.placeId)}`),
        fetch(`/api/geocode/distance?destination=${encodeURIComponent(suggestion.description)}`),
      ]);

      const update: Partial<BookingState> = {};

      if (placeRes.ok) {
        const details: PlaceDetails = await placeRes.json();
        if (details?.latitude) {
          update.latitude = details.latitude;
          update.longitude = details.longitude;
        }
      }

      if (distRes.ok) {
        const dist: DistanceResult | null = await distRes.json();
        if (dist?.distanceKm != null) update.distanceKm = dist.distanceKm;
      }

      if (Object.keys(update).length > 0) onChange(update);
    } catch {
      // Coordinates/distance unavailable — booking can still proceed
    }
  }

  async function handleAddressSelect(suggestion: AddressSuggestion) {
    onChange({ address: suggestion.label, latitude: null, longitude: null, distanceKm: null });
    setAddressSuggestions([]);

    try {
      const r = await fetch(`/api/geocode/place?id=${encodeURIComponent(suggestion.placeId)}`);
      if (!r.ok) return;
      const details: PlaceDetails = await r.json();
      if (!details?.latitude) return;

      const distRes = await fetch(
        `/api/geocode/distance?destination=${encodeURIComponent(suggestion.label + ", " + state.city + ", Moldova")}`
      );
      const dist: DistanceResult | null = distRes.ok ? await distRes.json() : null;

      onChange({
        latitude: details.latitude,
        longitude: details.longitude,
        distanceKm: dist?.distanceKm ?? null,
        postalCode: details.postcode || state.postalCode,
      });
    } catch {}
  }

  const cityNorm = state.city.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const isChisinau = cityNorm === "chisinau" || cityNorm === "kishinev" || cityNorm === "chisineu";
  const transportFree = isChisinau || (state.distanceKm != null && state.distanceKm < 15);
  const showTransportBanner = state.city.trim() !== "";

  const canProceed =
    state.city.trim() !== "" &&
    state.address.trim() !== "" &&
    state.venueName.trim() !== "" &&
    state.startTime.trim() !== "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <BookingStepper currentStep={4} label={stepLabel} />
          <BackButton label={dict.back} onClick={onBack} />
        </div>
        <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">
          {d.title}
        </h2>
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">
          {d.subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <AutocompleteInput
          label={d.venue_label}
          value={state.venueName}
          onChange={(v) => onChange({ venueName: v, city: "", address: "", latitude: null, longitude: null, distanceKm: null })}
          onSelect={handleVenueSelect}
          suggestions={state.venueName.length >= 2 ? venueSuggestions : []}
          placeholder={d.venue_placeholder}
          loading={venueLoading}
          renderSublabel={(s) => s.sublabel}
        />

        <AutocompleteInput
          label={d.address_label}
          value={state.address}
          onChange={(v) => onChange({ address: v, latitude: null, longitude: null, distanceKm: null })}
          onSelect={handleAddressSelect}
          suggestions={state.address.length >= 3 ? addressSuggestions : []}
          placeholder={d.address_placeholder}
          loading={addressLoading}
        />

        <BookingInput
          label={d.city_label}
          value={state.city}
          onChange={(v) => onChange({ city: v })}
          placeholder={d.city_placeholder}
        />

        <BookingInput
          label={d.time_label}
          value={state.startTime}
          onChange={(v) => onChange({ startTime: v })}
          placeholder={d.time_placeholder}
          type="time"
        />
        <p className="text-xs text-[#747474] font-figtree tracking-tight -mt-3">{d.time_disclaimer}</p>
        <BookingInput
          label={d.notes_label}
          value={state.notes}
          onChange={(v) => onChange({ notes: v })}
          placeholder={d.notes_placeholder}
          multiline
        />
      </div>

      {showTransportBanner && (
        transportFree ? (
          <div className="flex gap-3 bg-[#0b2a18] border border-[#1a4d2e] px-4 py-4">
            <div className="mt-0.5 shrink-0">
              <div className="flex items-center justify-center size-5 rounded-full bg-[#37a067]">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-[#d4fde2] font-figtree tracking-tight">{d.transport_free_title}</p>
              <p className="text-sm text-[#a3c9b0] font-figtree tracking-tight leading-snug">{d.transport_free_body}</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 bg-[#2a1f07] border border-[#4a3510] px-4 py-4">
            <div className="mt-0.5 shrink-0">
              <div className="flex items-center justify-center size-5 rounded-full bg-[#c49a2a]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 2v3.5M5 7.5v.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-[#fde89a] font-figtree tracking-tight">{d.transport_fee_title}</p>
              <p className="text-sm text-[#c9b47a] font-figtree tracking-tight leading-snug">{d.transport_fee_body}</p>
            </div>
          </div>
        )
      )}

      <PrimaryButton
        label={dict.continue}
        onClick={onNext}
        disabled={!canProceed}
      />
    </div>
  );
}
