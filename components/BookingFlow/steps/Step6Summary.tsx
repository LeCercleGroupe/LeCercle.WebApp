"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { BookingDict } from "../dict";
import BackButton from "../shared/BackButton";
import BookingStepper from "../shared/BookingStepper";
import PrimaryButton from "../shared/PrimaryButton";
import { BookingState, PaymentOption, ServiceId, VENUE_INFO } from "../types";
import { fetchWithRefresh } from "../utils/auth";

const TRANSPORT_RATE_PER_KM = 20 * 2;

// ─── API shapes ──────────────────────────────────────────────────────────────

interface ApiPackage {
  id: string;
  serviceId: string;
  name: string;
  tier: string;
  minGuests: number;
  maxGuests: number;
  basePrice: number;
  durationMinutes: number;
  isActive: boolean;
}

interface ApiFeatureOption {
  id: string;
  label: string;
  isDefault: boolean;
  additionalCost: number;
  sortOrder: number;
}

interface ApiFeature {
  id: string;
  label: string;
  type: 0 | 1;
  sortOrder: number;
  options: ApiFeatureOption[];
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
  onReset: () => void;
  dict: BookingDict;
  locale: string;
  stepLabel: string;
  tokenRef: RefObject<string | null>;
  tokenReady: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMDL(amount: number): string {
  return new Intl.NumberFormat("ro-MD").format(amount) + " MDL";
}

function formatDate(date: Date, months: string[], daysFull: string[]): string {
  const dayName = daysFull[(date.getDay() + 6) % 7];
  return `${dayName}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function normalizeTime(t: string): string {
  const parts = t.split(":");
  const hh = (parts[0] ?? "0").padStart(2, "0");
  const mm = (parts[1] ?? "0").padStart(2, "0");
  const ss = (parts[2] ?? "0").padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function inject(template: string, amount: string): string {
  return template.replace("{amount}", amount);
}

function computeDefaultCost(features: ApiFeature[]): { selectedOptionIds: string[]; additionalCost: number } {
  const selectedOptionIds: string[] = [];
  let additionalCost = 0;
  for (const feature of features) {
    if (feature.type !== 1) continue;
    const defaults = feature.options
      .filter((o) => o.isDefault)
      .sort((a, b) => a.additionalCost - b.additionalCost); // cheapest first = free
    for (let i = 0; i < defaults.length; i++) {
      selectedOptionIds.push(defaults[i].id);
      if (i > 0) additionalCost += defaults[i].additionalCost;
    }
  }
  return { selectedOptionIds, additionalCost };
}

function computeAdditionalCostFromIds(features: ApiFeature[], selectedOptionIds: string[]): number {
  const allSelectedIds = new Set(selectedOptionIds);
  let total = 0;
  for (const feature of features) {
    if (feature.type !== 1) continue;
    // Sort selected by cost ascending — cheapest is free, rest add their cost
    const selectedOptions = feature.options
      .filter((o) => allSelectedIds.has(o.id))
      .sort((a, b) => a.additionalCost - b.additionalCost);
    for (let i = 1; i < selectedOptions.length; i++) {
      total += selectedOptions[i].additionalCost;
    }
  }
  return total;
}

// Always derive price from live featuresMap when available so that
// toggling options in Step6 is immediately reflected in the display.
function getLiveAdditionalCost(
  pkg: { id: string; additionalCost?: number; selectedOptionIds?: string[] } | undefined,
  featuresMap: Map<string, ApiFeature[]>
): number {
  if (!pkg) return 0;
  const features = featuresMap.get(pkg.id);
  if (!features || features.length === 0) return pkg.additionalCost ?? 0;
  return computeAdditionalCostFromIds(features, pkg.selectedOptionIds ?? []);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-[#747474] font-figtree tracking-widest uppercase">
      {children}
    </p>
  );
}

function Row({ label, value, dimValue }: { label: string; value: string; dimValue?: boolean }) {
  return (
    <div className="flex justify-between gap-4 items-start">
      <p className="text-sm text-[#747474] font-figtree tracking-tight shrink-0">{label}</p>
      <p className={`text-sm font-figtree tracking-tight text-right ${dimValue ? "text-[#747474]" : "text-[#f1f1f1]"}`}>
        {value}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Step6Summary({
  state,
  onChange,
  onNext,
  onBack,
  onReset,
  dict,
  locale,
  stepLabel,
  tokenRef,
  tokenReady,
}: Props) {
  const d = dict.step6;
  const months = dict.step1.months;
  const daysFull = dict.step1.days_full;
  const isLocked = !!state.bookingRef;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // When the page is restored from bfcache after a payment redirect, React's
  // scheduler is frozen. Reload so the flow reinitialises from sessionStorage.
  useEffect(() => {
    const handlePageshow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", handlePageshow);
    return () => window.removeEventListener("pageshow", handlePageshow);
  }, []);

  const [packagesMap, setPackagesMap] = useState<Map<ServiceId, ApiPackage[]> | null>(null);
  const [featuresMap, setFeaturesMap] = useState<Map<string, ApiFeature[]>>(new Map());
  const [expandedUpgrade, setExpandedUpgrade] = useState<ServiceId | null>(null);

  // ── Fetch all packages + features for display and upgrade options ─────────

  useEffect(() => {
    const token = tokenRef.current;
    if (!token || !state.selectedServices.length) return;

    Promise.all(
      state.selectedServices.map((serviceId) =>
        fetch(`/api/booking/packages/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => (r.ok ? (r.json() as Promise<ApiPackage[]>) : ([] as ApiPackage[])))
          .then((pkgs) => [serviceId, pkgs.filter((p) => p.isActive)] as const)
          .catch((): readonly [ServiceId, ApiPackage[]] => [serviceId, []])
      )
    )
      .then((results) => {
        const pMap = new Map(results);
        setPackagesMap(pMap);

        const allPackageIds = [...pMap.values()].flat().map((p) => p.id);
        return Promise.all(
          allPackageIds.map((pkgId) =>
            fetch(`/api/booking/packages/${pkgId}/features`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => (r.ok ? (r.json() as Promise<ApiFeature[]>) : ([] as ApiFeature[])))
              .then((feats): readonly [string, ApiFeature[]] => [pkgId, feats])
              .catch((): readonly [string, ApiFeature[]] => [pkgId, []])
          )
        );
      })
      .then((featResults) => {
        setFeaturesMap(new Map(featResults));
      })
      .catch(() => {});
  }, [state.selectedServices, tokenReady, tokenRef]);

  // ── Upgrade handler ──────────────────────────────────────────────────────

  function handleUpgrade(serviceId: ServiceId, pkg: ApiPackage) {
    const features = featuresMap.get(pkg.id) ?? [];
    const { selectedOptionIds, additionalCost } = computeDefaultCost(features);
    onChange({
      selectedPackages: {
        ...state.selectedPackages,
        [serviceId]: {
          id: pkg.id,
          name: pkg.name,
          basePrice: pkg.basePrice,
          tier: pkg.tier,
          selectedOptionIds,
          additionalCost,
        },
      },
    });
    setExpandedUpgrade(null);
  }

  function toggleOption(serviceId: ServiceId, featureId: string, optionId: string) {
    const pkg = state.selectedPackages[serviceId];
    if (!pkg) return;
    const features = featuresMap.get(pkg.id) ?? [];
    const feature = features.find((f) => f.id === featureId);
    if (!feature) return;
    const featureOptionIds = new Set(feature.options.map((o) => o.id));
    const currentAllIds = pkg.selectedOptionIds ?? [];
    const thisFeatureIds = currentAllIds.filter((id) => featureOptionIds.has(id));
    const otherIds = currentAllIds.filter((id) => !featureOptionIds.has(id));
    const idx = thisFeatureIds.indexOf(optionId);
    if (idx !== -1) {
      if (thisFeatureIds.length <= 1) return; // always keep at least one selected
      thisFeatureIds.splice(idx, 1);
    } else {
      thisFeatureIds.push(optionId);
    }
    const newSelectedOptionIds = [...otherIds, ...thisFeatureIds];
    onChange({
      selectedPackages: {
        ...state.selectedPackages,
        [serviceId]: {
          ...pkg,
          selectedOptionIds: newSelectedOptionIds,
          additionalCost: computeAdditionalCostFromIds(features, newSelectedOptionIds),
        },
      },
    });
  }

  // ── Cost computation ─────────────────────────────────────────────────────

  const cityNorm = state.city.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const isChisinau = cityNorm === "chisinau" || cityNorm === "kishinev";
  const rawKm = !isChisinau && state.distanceKm ? Math.trunc(state.distanceKm) : 0;
  const transportKm = rawKm >= 15 ? rawKm : 0;
  const transportCostPerService = Math.round(transportKm * TRANSPORT_RATE_PER_KM);
  const totalTransportCost = transportCostPerService * state.selectedServices.length;

  const serviceTotal = state.selectedServices.reduce(
    (sum, v) =>
      sum +
      (state.selectedPackages[v]?.basePrice ?? 0) +
      getLiveAdditionalCost(state.selectedPackages[v], featuresMap),
    0
  );
  const totalPrice = serviceTotal + totalTransportCost;
  const advanceAmount = Math.round(totalPrice * 0.1);
  const advanceFormatted = formatMDL(advanceAmount);

  // ── Finalize handler ─────────────────────────────────────────────────────

  async function handleFinalize() {
    setSubmitting(true);
    setSubmitError(false);

    try {
      let orderId = state.bookingRef;

      if (!orderId) {
        let reservationToken = state.reservationToken;
        if (!reservationToken) {
          const eventDate = state.date
            ? `${state.date.getFullYear()}-${String(state.date.getMonth() + 1).padStart(2, "0")}-${String(state.date.getDate()).padStart(2, "0")}`
            : undefined;
          const resRes = await fetchWithRefresh("/api/reservations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventDate,
              items: state.selectedServices.map((sid) => ({ serviceId: sid, quantity: 1 })),
            }),
          });
          if (!resRes.ok) {
            const body = await resRes.text().catch(() => "");
            console.error(`[finalize] reservation failed ${resRes.status}:`, body);
            throw new Error(`reservation ${resRes.status}`);
          }
          const { token } = await resRes.json();
          reservationToken = token ?? "";
          onChange({ reservationToken });
        }

        let eventId: string;
        if (state.existingEventId) {
          eventId = state.existingEventId;
        } else {
          const eventDate = state.date
            ? `${state.date.getFullYear()}-${String(state.date.getMonth() + 1).padStart(2, "0")}-${String(state.date.getDate()).padStart(2, "0")}`
            : undefined;
          const eventRes = await fetchWithRefresh("/api/booking/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventDate,
              venueTitle: state.venueName,
              venueAddress: state.address,
              city: state.city,
              postalCode: state.postalCode || null,
              eventStartTime: normalizeTime(state.startTime),
              guestCount: state.guests,
              notes: state.notes,
              latitude: state.latitude,
              longitude: state.longitude,
              distanceKm: state.distanceKm != null ? Math.trunc(state.distanceKm) : null,
              customerId: state.customerId,
            }),
          });
          if (!eventRes.ok) {
            const body = await eventRes.text().catch(() => "");
            console.error(`[finalize] event failed ${eventRes.status}:`, body);
            throw new Error(`event ${eventRes.status}`);
          }
          const { id } = await eventRes.json();
          eventId = id;
        }

        const items = state.selectedServices
          .filter((sid) => state.selectedPackages[sid])
          .map((sid) => ({
            packageId: state.selectedPackages[sid]!.id,
            serviceId: sid,
            quantity: 1,
            selectedOptionIds: state.selectedPackages[sid]!.selectedOptionIds ?? [],
            roadPrice: transportCostPerService,
          }));

        const orderRes = await fetchWithRefresh("/api/booking/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            contactEmail: state.email,
            contactPhone: state.phone,
            contactFirstName: state.firstName,
            contactLastName: state.lastName,
            reservationToken,
            items,
            customerId: state.customerId,
          }),
        });
        if (!orderRes.ok) {
          const body = await orderRes.text().catch(() => "");
          console.error(`[finalize] order failed ${orderRes.status}:`, body);
          throw new Error(`order ${orderRes.status}`);
        }
        const { id: newOrderId } = await orderRes.json();
        orderId = newOrderId;
      }

      if (state.paymentOption === "now") {
        const payRes = await fetch("/api/booking/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentMethod: "Card",
            language: locale,
            successUrl: `${window.location.origin}/${locale}/booking/payment-success?orderId=${orderId}`,
            failUrl: `${window.location.origin}/${locale}/booking/payment-fail?orderId=${orderId}`,
          }),
        });
        if (!payRes.ok) {
          const body = await payRes.text().catch(() => "");
          console.error(`[finalize] payment failed ${payRes.status}:`, body);
          throw new Error(`payment ${payRes.status}`);
        }
        const { paymentUrl } = await payRes.json();
        onChange({ bookingRef: orderId });
        try {
          sessionStorage.removeItem("lecercle_booking_flow");
          sessionStorage.removeItem("lecercle_booking_summary");
        } catch {}
        window.location.href = paymentUrl;
        return;
      }

      onChange({ bookingRef: orderId });
      onNext();
    } catch (err) {
      console.error("[finalize] caught:", err);
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const paymentOptions: { key: PaymentOption; label: string; sub: string; recommended: boolean }[] = [
    {
      key: "now",
      label: d.pay_now_label,
      sub: inject(d.pay_now_sub, advanceFormatted),
      recommended: true,
    },
    {
      key: "later",
      label: d.pay_later_label,
      sub: inject(d.pay_later_sub, advanceFormatted),
      recommended: false,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <BookingStepper currentStep={6} label={stepLabel} />
          <BackButton
            label={isLocked ? d.start_new_order : dict.back}
            onClick={isLocked ? onReset : onBack}
            danger={isLocked}
          />
        </div>
        <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">
          {d.title}
        </h2>
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">
          {d.subtitle}
        </p>
      </div>

      {/* Locked notice — shown when order already exists */}
      {isLocked && (
        <div className="flex items-start gap-3 px-4 py-3 border border-[#c4973f]/40 bg-[#c4973f]/10">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
            <path d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 5v4.5M8 5.5v.5" stroke="#c4973f" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-[#c4973f] font-figtree tracking-tight leading-snug">
            {d.order_locked_notice}
          </p>
        </div>
      )}

      {/* Summary card */}
      <div className="bg-[#161616] border border-[#2a2a2a]">
        <div className="px-4 py-3 border-b border-[#2a2a2a]">
          <p className="text-sm font-medium text-[#d4d4d4] font-figtree tracking-tight">
            {d.card_title}
          </p>
        </div>

        {/* EVENIMENT */}
        <div className="flex flex-col gap-3 px-4 py-4 border-b border-[#252525]">
          <SectionLabel>{d.event_section}</SectionLabel>
          <div className="flex flex-col gap-2">
            <Row label={d.date_label} value={state.date ? formatDate(state.date, months, daysFull) : "—"} />
            <Row label={d.time_label} value={state.startTime || "—"} />
            <Row label={d.guests_label} value={`${state.guests} ${d.guests_unit}`} />
          </div>
        </div>

        {/* LOCAȚIE */}
        <div className="flex flex-col gap-3 px-4 py-4 border-b border-[#252525]">
          <SectionLabel>{d.location_section}</SectionLabel>
          <div className="flex flex-col gap-2">
            <Row label={d.address_label} value={state.address || "—"} />
            <Row label={d.location_label} value={state.venueName || "—"} />
          </div>
        </div>

        {/* SERVICII */}
        <div className="flex flex-col gap-3 px-4 py-4 border-b border-[#252525]">
          <SectionLabel>
            {d.services_section.replace("{count}", String(state.selectedServices.length))}
          </SectionLabel>
          <div className="flex flex-col gap-2">
            {state.selectedServices.map((v) => {
              const info = VENUE_INFO[v];
              const pkg = state.selectedPackages[v];
              const pkgFeatures = pkg
                ? (featuresMap.get(pkg.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder)
                : [];
              const allPkgs = packagesMap?.get(v) ?? [];
              const upgradeOptions = pkg
                ? allPkgs.filter((p) => p.isActive && p.basePrice > pkg.basePrice)
                : [];

              return (
                <div key={v} className="flex flex-col bg-[#111] border border-[#2a2a2a]">
                  {/* Package info */}
                  <div className="flex flex-col gap-2.5 px-3 py-3">
                    <div className="flex justify-between items-start gap-3">
                      {info.logo ? (
                        <Image
                          src={info.logo}
                          alt={info.name}
                          width={100}
                          height={40}
                          className="object-contain object-left h-10 w-auto"
                        />
                      ) : (
                        <span className="text-base font-medium text-[#f1f1f1] font-figtree tracking-tight h-10 flex items-center">
                          {info.name}
                        </span>
                      )}
                      <p className="text-base font-medium text-[#f1f1f1] font-figtree tracking-tight shrink-0">
                        {pkg ? formatMDL(pkg.basePrice + getLiveAdditionalCost(pkg, featuresMap)) : "—"}
                      </p>
                    </div>
                    {pkg && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <div className="size-4 rounded-full bg-[#c4973f] shrink-0" />
                          <p className="text-sm text-[#d4d4d4] font-figtree tracking-tight">{pkg.name}</p>
                        </div>
                        {/* Fixed features — read-only bullet list */}
                        {pkgFeatures.some((f) => f.type === 0) && (
                          <ul className="flex flex-col gap-1.5">
                            {pkgFeatures
                              .filter((f) => f.type === 0)
                              .map((feature) => (
                                <li key={feature.id} className="flex gap-2 items-start">
                                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="shrink-0 mt-0.5">
                                    <path d="M1 5l3.5 3.5L11 1" stroke="#37a067" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <span className="text-xs text-[#a8a8a8] font-figtree tracking-tight">
                                    {feature.label}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>

                  {/* Multi-selectable options — interactive */}
                  {pkg && pkgFeatures.some((f) => f.type === 1) && (
                    <div className="flex flex-col gap-4 px-3 py-4 border-t border-[#2a2a2a] bg-[#0d0d0d]">
                      {pkgFeatures
                        .filter((f) => f.type === 1)
                        .map((feature) => {
                          // Sort by additionalCost ascending — cheapest displayed first
                          const sortedOptions = [...feature.options].sort((a, b) => a.additionalCost - b.additionalCost);
                          const featureOptionIds = new Set(feature.options.map((o) => o.id));
                          const selectedIds = new Set((pkg.selectedOptionIds ?? []).filter((id) => featureOptionIds.has(id)));
                          // Cheapest currently-selected option is free
                          const freeOptionId = sortedOptions.find((o) => selectedIds.has(o.id))?.id ?? null;
                          return (
                            <div key={feature.id} className="flex flex-col gap-2">
                              <p className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight">
                                {feature.label}
                              </p>
                              <div className="flex flex-col gap-1.5">
                                {sortedOptions.map((option) => {
                                  const isChecked = selectedIds.has(option.id);
                                  const isFree = isChecked && option.id === freeOptionId;
                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => !isLocked && toggleOption(v, feature.id, option.id)}
                                      disabled={isLocked}
                                      className={`flex items-center gap-3 px-3 py-2.5 bg-[#111] border border-[#303030] transition-colors text-left w-full ${isLocked ? "cursor-not-allowed opacity-60" : "hover:border-[#474747]"}`}
                                    >
                                      <div className={`size-4 shrink-0 border flex items-center justify-center transition-colors ${
                                        isChecked ? "bg-[#37a067] border-[#37a067]" : "bg-transparent border-[#474747]"
                                      }`}>
                                        {isChecked && (
                                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </div>
                                      <span className="flex-1 text-sm text-[#c4c4c4] font-figtree tracking-tight">
                                        {option.label}
                                      </span>
                                      <span className={`text-xs font-medium font-figtree tracking-tight shrink-0 ${
                                        isChecked ? "text-[#37a067]" : "text-[#a8a8a8]"
                                      }`}>
                                        {isFree ? dict.step3.feature_included : `+${formatMDL(option.additionalCost)}`}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Upgrade section — only if higher-tier packages exist and order not yet created */}
                  {!isLocked && pkg && upgradeOptions.length > 0 && (
                    <div className="border-t border-[#2a2a2a]">
                      <button
                        type="button"
                        onClick={() => setExpandedUpgrade(expandedUpgrade === v ? null : v)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
                      >
                        <span className="text-xs font-medium text-[#c4973f] font-figtree tracking-tight">
                          {d.upgrade_package}
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className={`shrink-0 transition-transform ${expandedUpgrade === v ? "rotate-180" : ""}`}
                        >
                          <path
                            d="M3 4.5l3 3 3-3"
                            stroke="#c4973f"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {expandedUpgrade === v && (
                        <div className="flex flex-col gap-2 px-3 pb-3">
                          {upgradeOptions.map((upgPkg) => {
                            const upgFeatures = (featuresMap.get(upgPkg.id) ?? []).sort(
                              (a, b) => a.sortOrder - b.sortOrder
                            );
                            const upgDefaultCost = computeDefaultCost(upgFeatures).additionalCost;
                            return (
                              <div
                                key={upgPkg.id}
                                className="flex flex-col gap-2 bg-[#161616] border border-[#333] px-3 py-3"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight">
                                      {upgPkg.name}
                                    </p>
                                    <p className="text-xs text-[#747474] font-figtree tracking-tight uppercase">
                                      {upgPkg.tier}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 shrink-0">
                                    <p className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight">
                                      {formatMDL(upgPkg.basePrice + upgDefaultCost)}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => handleUpgrade(v, upgPkg)}
                                      className="text-xs px-3 py-1.5 bg-[#37a067] text-white font-figtree tracking-tight hover:bg-[#2d8a58] transition-colors"
                                    >
                                      {d.select_upgrade}
                                    </button>
                                  </div>
                                </div>
                                {upgFeatures.length > 0 && (
                                  <ul className="flex flex-col gap-1">
                                    {upgFeatures.map((f) => (
                                      <li key={f.id} className="flex gap-1.5 items-start">
                                        <svg
                                          width="10"
                                          height="8"
                                          viewBox="0 0 10 8"
                                          fill="none"
                                          className="shrink-0 mt-0.5"
                                        >
                                          <path
                                            d="M1 4l3 3 5-6"
                                            stroke="#37a067"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        <span className="text-xs text-[#747474] font-figtree tracking-tight">
                                          {f.label}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transport cost per service */}
                  {transportCostPerService > 0 && (
                    <div className="border-t border-[#2a2a2a] px-3 py-2.5 flex justify-between items-center bg-[#0a0a0a]">
                      <p className="text-xs text-[#747474] font-figtree tracking-tight">
                        {d.transport_label.replace("{km}", String(transportKm))}
                      </p>
                      <p className="text-xs font-medium text-[#a8a8a8] font-figtree tracking-tight">
                        +{formatMDL(transportCostPerService)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DETALII SUPLIMENTARE */}
        {state.notes.trim() && (
          <div className="flex flex-col gap-3 px-4 py-4 border-b border-[#252525]">
            <SectionLabel>{d.details_section}</SectionLabel>
            <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight leading-snug">
              {state.notes}
            </p>
          </div>
        )}

        {/* COST */}
        <div className="flex flex-col gap-3 px-4 py-4">
          <SectionLabel>{d.cost_section}</SectionLabel>
          <div className="flex flex-col gap-2">
            {state.selectedServices.flatMap((v) => {
              const info = VENUE_INFO[v];
              const pkg = state.selectedPackages[v];
              const rows = [
                <Row
                  key={v}
                  label={`${info.name}: ${pkg?.name ?? ""}`}
                  value={pkg ? formatMDL(pkg.basePrice + getLiveAdditionalCost(pkg, featuresMap)) : "—"}
                />,
              ];
              if (transportCostPerService > 0) {
                rows.push(
                  <Row
                    key={`${v}-transport`}
                    label={d.transport_label.replace("{km}", String(transportKm))}
                    value={formatMDL(transportCostPerService)}
                    dimValue
                  />
                );
              }
              return rows;
            })}
            <Row label={d.taxes_label} value="—" dimValue />
          </div>
          <div className="border-t border-[#303030] pt-3 flex justify-between items-center">
            <p className="text-sm font-semibold text-[#f1f1f1] font-figtree tracking-widest uppercase">
              {d.total_de_plata}
            </p>
            <p className="text-xl font-semibold text-[#f1f1f1] font-figtree tracking-tight">
              {formatMDL(totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Payment section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-[#a8a8a8] font-figtree tracking-widest uppercase">
            {d.payment_title}
          </p>
          <p className="text-sm text-[#747474] font-figtree tracking-tight leading-snug">
            {d.payment_subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {paymentOptions.map((opt) => {
            const selected = state.paymentOption === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChange({ paymentOption: opt.key })}
                className={`flex gap-3 items-start p-4 border text-left transition-colors ${
                  selected
                    ? "border-[#474747] bg-[#1a1a1a]"
                    : "border-[#2a2a2a] bg-[#111] hover:border-[#3a3a3a]"
                }`}
              >
                <div
                  className={`mt-0.5 size-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selected ? "border-[#f1f1f1]" : "border-[#474747]"
                  }`}
                >
                  {selected && <div className="size-2.5 rounded-full bg-[#f1f1f1]" />}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight">
                      {opt.label}
                    </p>
                    {opt.recommended && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0b2a18] border border-[#1a4d2e] text-xs text-[#4ade80] font-figtree tracking-tight">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="shrink-0">
                          <path d="M1 4l3 3 5-6" stroke="#37a067" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {d.recommended}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#747474] font-figtree tracking-tight leading-snug">
                    {opt.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-400 font-figtree tracking-tight text-center">
          {d.submit_error}
        </p>
      )}
      <PrimaryButton
        label={d.finalize}
        onClick={handleFinalize}
        disabled={submitting}
        loading={submitting}
      />
      {isLocked && (
        <button
          type="button"
          onClick={onReset}
          className="w-full py-3 text-sm text-[#747474] font-figtree tracking-tight hover:text-[#a8a8a8] transition-colors border border-[#2a2a2a] hover:border-[#3a3a3a]"
        >
          {d.start_new_order}
        </button>
      )}
    </div>
  );
}
