"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import Image from "next/image";
import { BookingState, ServiceId, SelectedPackage, VENUE_INFO } from "../types";
import type { BookingDict } from "../dict";
import BookingStepper from "../shared/BookingStepper";
import BackButton from "../shared/BackButton";
import PrimaryButton from "../shared/PrimaryButton";
import CornerBrackets from "../shared/CornerBrackets";

// ─── API shapes ─────────────────────────────────────────────────────────────

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
  type: 0 | 1; // 0 = Fixed, 1 = MultiSelectable
  sortOrder: number;
  options: ApiFeatureOption[];
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
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

function computeAdditionalCost(
  packageId: string,
  features: ApiFeature[],
  selections: Map<string, Map<string, Set<string>>>
): number {
  const pkgSelections = selections.get(packageId);
  if (!pkgSelections) return 0;
  let total = 0;
  for (const feature of features) {
    if (feature.type !== 1) continue;
    const selectedIds = pkgSelections.get(feature.id);
    if (!selectedIds || selectedIds.size === 0) continue;
    // Sort selected by cost ascending — cheapest is free, rest add their cost
    const selectedOptions = feature.options
      .filter((o) => selectedIds.has(o.id))
      .sort((a, b) => a.additionalCost - b.additionalCost);
    for (let i = 1; i < selectedOptions.length; i++) {
      total += selectedOptions[i].additionalCost;
    }
  }
  return total;
}

/**
 * Build default selections for a package from isDefault flags.
 */
function buildDefaultSelections(_features: ApiFeature[]): Map<string, Set<string>> {
  return new Map();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function GuestInput({
  value,
  onChange,
  errorMessage,
}: {
  value: number;
  onChange: (v: number) => void;
  errorMessage: string;
}) {
  const [raw, setRaw] = useState(String(value));
  const hasError = value < 5;

  function handleChange(str: string) {
    setRaw(str);
    const parsed = parseInt(str, 10);
    if (!isNaN(parsed) && parsed > 0) onChange(parsed);
  }

  function handleStepDown() {
    const next = Math.max(1, value - 1);
    onChange(next);
    setRaw(String(next));
  }

  function handleStepUp() {
    const next = value + 1;
    onChange(next);
    setRaw(String(next));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className={`flex items-stretch bg-[#111] border ${hasError ? "border-red-500" : "border-[#303030]"}`}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="5+"
          value={raw}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 bg-transparent px-3 py-3 text-base text-[#f1f1f1] font-figtree tracking-tight focus:outline-none placeholder:text-[#474747]"
        />
        <div className="flex border-l border-[#303030] shrink-0">
          <button
            onClick={handleStepDown}
            className="flex items-center justify-center w-11 text-[#f1f1f1] hover:bg-white/10 transition-colors text-lg font-medium border-r border-[#303030]"
          >
            −
          </button>
          <button
            onClick={handleStepUp}
            className="flex items-center justify-center w-11 text-[#f1f1f1] hover:bg-white/10 transition-colors text-lg font-medium"
          >
            +
          </button>
        </div>
      </div>
      {hasError && (
        <p className="text-xs text-red-400 font-figtree tracking-tight">{errorMessage}</p>
      )}
    </div>
  );
}

interface PackageCardProps {
  pkg: ApiPackage;
  selected: boolean;
  isRecommended: boolean;
  displayPrice: number;
  features: ApiFeature[];
  pkgSelections: Map<string, Set<string>>;
  onSelect: () => void;
  onToggleOption: (featureId: string, optionId: string) => void;
  selectedBadge: string;
  recommendedLabel: string;
  featureIncluded: string;
  featureFree: string;
  firstFreeHint: string;
  accentColor: string;
}

function PackageCard({
  pkg,
  selected,
  isRecommended,
  displayPrice,
  features,
  pkgSelections,
  onSelect,
  onToggleOption,
  selectedBadge,
  recommendedLabel,
  featureIncluded,
  featureFree,
  firstFreeHint,
  accentColor,
}: PackageCardProps) {
  const allFeatures = [...features].sort((a, b) => a.sortOrder - b.sortOrder);
  const fixedFeatures = allFeatures.filter((f) => f.type === 0);
  const multiFeatures = allFeatures.filter((f) => f.type === 1);

  const accent = selected ? accentColor : "transparent";

  return (
    <div className="relative flex flex-col flex-1 pt-7">

      {/* ── Recommended label ── */}
      {isRecommended && (
        <div
          className="absolute top-0 left-0 right-0 h-7 flex items-center gap-2 px-3 border-x border-t"
          style={{ borderColor: `${accentColor}99`, backgroundColor: `${accentColor}14`, color: accentColor }}
        >
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="shrink-0">
            <path d="M1 4l3 3 5-6" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium font-figtree tracking-tight">{recommendedLabel}</span>
        </div>
      )}

      {/* ── Fixed-height card ── */}
      <div
        className="flex flex-col h-90 border transition-colors duration-200 hover:border-[#474747]"
        style={{ borderColor: selected ? accentColor : "#303030" }}
      >
        <button
          onClick={onSelect}
          className="relative flex flex-col gap-4 p-4 text-left w-full h-full transition-colors duration-200 bg-[#111]"
          style={selected ? { backgroundColor: `${accentColor}0d` } : undefined}
        >
          <CornerBrackets color={selected ? accentColor : "rgba(255,255,255,0.12)"} size={12} />

          {/* Header: name / tier / price */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <p className="text-lg font-medium text-[#f1f1f1] font-figtree tracking-tight">{pkg.name}</p>
              <p className="text-xs text-[#747474] font-figtree tracking-tight uppercase">{pkg.tier}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <p className="text-base font-medium text-[#f1f1f1] font-figtree tracking-tight">
                {formatMDL(displayPrice)}
              </p>
              <p className="text-xs text-[#747474] font-figtree tracking-tight">max. {pkg.maxGuests} pers.</p>
            </div>
          </div>

          {/* Fixed features fill remaining space */}
          {fixedFeatures.length === 0 && <div className="flex-1" />}
          {fixedFeatures.length > 0 && (
            <ul className="flex flex-col gap-1.5 flex-1 overflow-hidden">
              {fixedFeatures.map((feature) => (
                <li key={feature.id} className="flex gap-2 items-start">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                    <path
                      d="M2.5 7l3 3 6-6"
                      stroke={selected ? accentColor : "#747474"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm text-[#c4c4c4] font-figtree tracking-tight">
                    {feature.label}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Selected badge — always reserves space at bottom */}
          <div className="h-5 flex items-center gap-1.5">
            {selected && (
              <>
                <div className="size-2 rounded-full" style={{ backgroundColor: accentColor }} />
                <span className="text-xs font-medium font-figtree tracking-tight" style={{ color: accentColor }}>
                  {selectedBadge}
                </span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* ── Extra features panel ── */}
      {multiFeatures.length > 0 && (
        <div className="grid grid-rows-[1fr]">
          <div className="overflow-hidden">
            <div
              className="flex flex-col gap-4 px-4 py-4 border-x border-b"
              style={{
                borderColor: selected ? `${accentColor}66` : "#303030",
                backgroundColor: selected ? `${accentColor}0a` : "#111",
              }}
            >
              {/* Disclaimer */}
              <p className="text-xs text-[#747474] font-figtree tracking-tight">{firstFreeHint}</p>

              {multiFeatures.map((feature) => {
                const selectedIds = pkgSelections.get(feature.id) ?? new Set<string>();
                const noneSelected = selectedIds.size === 0;
                const sortedOptions = [...feature.options].sort((a, b) => a.additionalCost - b.additionalCost);
                const freeOptionId = noneSelected
                  ? null
                  : sortedOptions.find((o) => selectedIds.has(o.id))?.id ?? null;

                return (
                  <div key={feature.id} className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-[#f1f1f1] font-figtree tracking-tight">
                      {feature.label}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {sortedOptions.map((option) => {
                        const isChecked = selectedIds.has(option.id);
                        const isFree = noneSelected || (isChecked && option.id === freeOptionId);
                        const priceLabel = isFree
                          ? (noneSelected ? featureFree : featureIncluded)
                          : `+${formatMDL(option.additionalCost)}`;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => onToggleOption(feature.id, option.id)}
                            className="flex items-center gap-3 px-3 py-2.5 bg-[#111] border border-[#303030] hover:border-[#474747] transition-colors text-left w-full"
                          >
                            <div
                              className="size-4 shrink-0 border flex items-center justify-center transition-colors"
                              style={isChecked
                                ? { backgroundColor: accentColor, borderColor: accentColor }
                                : { backgroundColor: "transparent", borderColor: "#474747" }
                              }
                            >
                              {isChecked && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className="flex-1 text-sm text-[#c4c4c4] font-figtree tracking-tight">
                              {option.label}
                            </span>
                            <span
                              className="text-xs font-medium font-figtree tracking-tight shrink-0"
                              style={{ color: isFree ? accentColor : "#a8a8a8" }}
                            >
                              {priceLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Step3Packages({
  state,
  onChange,
  onNext,
  onBack,
  dict,
  stepLabel,
  tokenRef,
  tokenReady,
}: Props) {
  const d = dict.step3;

  const [activeVenue, setActiveVenue] = useState<ServiceId>(state.selectedServices[0]);
  const [packagesMap, setPackagesMap] = useState<Map<ServiceId, ApiPackage[]> | null>(null);
  const [featuresMap, setFeaturesMap] = useState<Map<string, ApiFeature[]> | null>(null);
  // selections: packageId → featureId → Set<optionId>
  const [selections, setSelections] = useState<Map<string, Map<string, Set<string>>>>(new Map());
  const [error, setError] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | boolean>(false);

  // ── Fetch packages + features in one go ──────────────────────────────────

  useEffect(() => {
    if (!state.selectedServices.length) return;

    let pMap: Map<ServiceId, ApiPackage[]>;

    Promise.all(
      state.selectedServices.map((serviceId) =>
        fetch(`/api/booking/packages/${serviceId}`)
          .then((r) => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.json() as Promise<ApiPackage[]>;
          })
          .then((pkgs) => [serviceId, pkgs.filter((p) => p.isActive)] as const)
      )
    )
      .then((results) => {
        pMap = new Map(results);
        setPackagesMap(pMap);

        // Collect all package IDs across all services
        const allPackageIds: string[] = [];
        for (const pkgs of pMap.values()) {
          for (const pkg of pkgs) {
            allPackageIds.push(pkg.id);
          }
        }

        // Fetch features for each package — failures are silent (fallback to description)
        return Promise.all(
          allPackageIds.map((pkgId) =>
            fetch(`/api/booking/packages/${pkgId}/features`)
              .then((r) => (r.ok ? (r.json() as Promise<ApiFeature[]>) : ([] as ApiFeature[])))
              .then((feats): readonly [string, ApiFeature[]] => [pkgId, feats])
              .catch((): readonly [string, ApiFeature[]] => [pkgId, []])
          )
        );
      })
      .then((featResults) => {
        const fMap = new Map(featResults);
        setFeaturesMap(fMap);

        // Initialize selections: restore from saved state OR use defaults
        setSelections((prev) => {
          const next = new Map(prev);
          for (const [pkgId, feats] of fMap.entries()) {
            // Skip only if already initialised with actual selections (non-empty map).
            // An empty map means we wrote a placeholder before features were ready — re-init.
            const existing = next.get(pkgId);
            if (existing && existing.size > 0) continue;

            // Check if this package has saved selectedOptionIds in state
            const savedPkg = Object.values(state.selectedPackages).find((p) => p?.id === pkgId);
            if (savedPkg && savedPkg.selectedOptionIds.length > 0) {
              // Restore from saved selection
              const savedIds = new Set(savedPkg.selectedOptionIds);
              const featureMap = new Map<string, Set<string>>();
              for (const feat of feats) {
                if (feat.type !== 1) continue;
                const matched = feat.options
                  .filter((o) => savedIds.has(o.id))
                  .map((o) => o.id);
                if (matched.length > 0) {
                  featureMap.set(feat.id, new Set(matched));
                }
              }
              next.set(pkgId, featureMap);
            } else {
              // First time — use defaults
              next.set(pkgId, buildDefaultSelections(feats));
            }
          }
          return next;
        });

        // Auto-select the recommended package for services that have no selection yet
        const autoPackages: Partial<Record<ServiceId, SelectedPackage>> = {};
        const autoGuests: Partial<Record<ServiceId, number>> = {};
        for (const [serviceId, pkgs] of pMap.entries()) {
          if (state.selectedPackages[serviceId]) continue;
          if (pkgs.length < 2) continue;
          const recommended = pkgs[pkgs.length - 2];
          if (!recommended) continue;
          autoPackages[serviceId] = {
            id: recommended.id,
            name: recommended.name,
            basePrice: recommended.basePrice,
            tier: recommended.tier,
            selectedOptionIds: [],
            additionalCost: 0,
          };
          autoGuests[serviceId] = state.guestsPerService[serviceId] ?? state.guests;
        }
        if (Object.keys(autoPackages).length > 0) {
          onChange({
            selectedPackages: { ...state.selectedPackages, ...autoPackages },
            guestsPerService: { ...state.guestsPerService, ...autoGuests },
          });
        }
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedServices]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const loading = (packagesMap === null || featuresMap === null) && !error;
  const packages = packagesMap?.get(activeVenue) ?? [];
  const canProceed =
    state.selectedServices.every((v) => state.selectedPackages[v]) &&
    state.selectedServices.every((v) => (state.guestsPerService[v] ?? state.guests) >= 5) &&
    featuresMap !== null &&
    state.selectedServices.every((v) => {
      const pkg = state.selectedPackages[v];
      if (!pkg) return true;
      const multiFeats = (featuresMap.get(pkg.id) ?? []).filter((f) => f.type === 1);
      if (multiFeats.length === 0) return true;
      const pkgSels = selections.get(pkg.id);
      return multiFeats.every((f) => (pkgSels?.get(f.id)?.size ?? 0) > 0);
    });

  // ── Event handlers ────────────────────────────────────────────────────────

  function selectPackage(serviceId: ServiceId, pkg: ApiPackage) {
    // Only initialise selections once features are available — never write an
    // empty Map or we'd block the default-init that runs after features load.
    setSelections((prev) => {
      if (prev.has(pkg.id)) return prev;
      const features = featuresMap?.get(pkg.id);
      if (!features) return prev;
      const next = new Map(prev);
      next.set(pkg.id, buildDefaultSelections(features));
      return next;
    });

    const selected: SelectedPackage = {
      id: pkg.id,
      name: pkg.name,
      basePrice: pkg.basePrice,
      tier: pkg.tier,
      // We compute these properly in handleNext; store zeros for now so the
      // type is satisfied — handleNext will overwrite before calling onNext.
      selectedOptionIds: [],
      additionalCost: 0,
    };
    onChange({
      selectedPackages: { ...state.selectedPackages, [serviceId]: selected },
      guestsPerService: {
        ...state.guestsPerService,
        [serviceId]: state.guestsPerService[serviceId] ?? state.guests,
      },
    });
  }

  function toggleOption(packageId: string, featureId: string, optionId: string) {
    setSelections((prev) => {
      const next = new Map(prev);
      const featureMap = new Map(next.get(packageId) ?? new Map<string, Set<string>>());
      const optionSet = new Set(featureMap.get(featureId) ?? new Set<string>());

      if (optionSet.has(optionId)) {
        if (optionSet.size <= 1) return prev; // always keep at least one selected
        optionSet.delete(optionId);
      } else {
        optionSet.add(optionId);
      }

      featureMap.set(featureId, optionSet);
      next.set(packageId, featureMap);
      return next;
    });
  }

  function setServiceGuests(serviceId: ServiceId, count: number) {
    onChange({ guestsPerService: { ...state.guestsPerService, [serviceId]: count } });
  }

  // ── handleNext: bake selections into state before proceeding ─────────────

  async function handleNext() {
    // Compute final additionalCost + selectedOptionIds for every selected package
    const updatedPackages = { ...state.selectedPackages };
    for (const serviceId of state.selectedServices) {
      const pkg = updatedPackages[serviceId];
      if (!pkg) continue;
      const features = featuresMap?.get(pkg.id) ?? [];
      const additionalCost = computeAdditionalCost(pkg.id, features, selections);

      // Collect all selected option IDs across all MultiSelectable features
      const pkgSelections = selections.get(pkg.id);
      const selectedOptionIds: string[] = [];
      if (pkgSelections) {
        for (const optionSet of pkgSelections.values()) {
          for (const id of optionSet) {
            selectedOptionIds.push(id);
          }
        }
      }

      updatedPackages[serviceId] = { ...pkg, additionalCost, selectedOptionIds };
    }
    onChange({ selectedPackages: updatedPackages });

    // Already have a reservation token — skip the API call
    if (state.reservationToken) {
      onNext();
      return;
    }

    setReserveError(false);
    setReserving(true);
    try {
      const eventDate = state.date
        ? `${state.date.getFullYear()}-${String(state.date.getMonth() + 1).padStart(2, "0")}-${String(state.date.getDate()).padStart(2, "0")}`
        : undefined;
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventDate,
          items: state.selectedServices.map((serviceId) => ({ serviceId, quantity: 1 })),
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        let detail: string | null = null;
        try { detail = (JSON.parse(body) as { detail?: string }).detail ?? null; } catch {}
        throw Object.assign(new Error(`${res.status}`), { detail });
      }
      const { token } = await res.json();
      onChange({ reservationToken: token ?? "" });
      onNext();
    } catch (err) {
      const detail = (err as { detail?: string }).detail ?? null;
      setReserveError(detail ?? true);
    } finally {
      setReserving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── Constrained header — same width as all other steps ── */}
      <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <BookingStepper currentStep={3} label={stepLabel} />
            <BackButton label={dict.back} onClick={onBack} />
          </div>
          <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">
            {d.title}
          </h2>
          <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">{d.subtitle}</p>
        </div>

        {/* Service tab switcher */}
        {state.selectedServices.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {state.selectedServices.map((v) => {
              const info = VENUE_INFO[v];
              const hasPackage = !!state.selectedPackages[v];
              const guestsInvalid = hasPackage && (state.guestsPerService[v] ?? state.guests) < 5;
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
                  {info.logo && (
                    <Image src={info.logo} alt={info.name} width={16} height={16} className="object-contain" />
                  )}
                  {info.name}
                  {guestsInvalid && <div className="size-1.5 rounded-full bg-red-500" />}
                  {hasPackage && !guestsInvalid && <div className="size-1.5 rounded-full bg-[#37a067]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Full-width cards ── */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="size-6 border-2 border-[#37a067] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 px-4 lg:px-32">
          {packages.map((pkg, index) => {
            const isRecommended =
              packages.length >= 2 && index === packages.length - 2;

            const features: ApiFeature[] = (featuresMap?.get(pkg.id) ?? []).sort(
              (a, b) => a.sortOrder - b.sortOrder
            );

            const pkgSelections =
              selections.get(pkg.id) ?? new Map<string, Set<string>>();
            const additionalCost = computeAdditionalCost(pkg.id, features, selections);
            const displayPrice = pkg.basePrice + additionalCost;

            return (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                selected={state.selectedPackages[activeVenue]?.id === pkg.id}
                isRecommended={isRecommended}
                displayPrice={displayPrice}
                features={features}
                pkgSelections={pkgSelections}
                onSelect={() => selectPackage(activeVenue, pkg)}
                onToggleOption={(featureId, optionId) =>
                  toggleOption(pkg.id, featureId, optionId)
                }
                selectedBadge={d.selected_badge}
                recommendedLabel={d.recommended}
                featureIncluded={d.feature_included}
                featureFree={d.feature_free}
                firstFreeHint={d.first_free_hint}
                accentColor={VENUE_INFO[activeVenue].accentColor}
              />
            );
          })}
        </div>
      )}

      {/* ── Constrained footer — guest input, progress, button ── */}
      <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
        {state.selectedPackages[activeVenue] && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">
              {d.guests_for_service}
            </label>
            <GuestInput
              key={activeVenue}
              value={state.guestsPerService[activeVenue] ?? state.guests}
              onChange={(v) => setServiceGuests(activeVenue, v)}
              errorMessage={d.guests_min_error}
            />
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
          <p className="text-sm text-red-400 font-figtree tracking-tight text-center">
            {typeof reserveError === "string" ? reserveError : d.reserve_error}
          </p>
        )}
        <PrimaryButton
          label={dict.continue}
          onClick={handleNext}
          disabled={!canProceed || reserving}
          loading={reserving}
        />
      </div>
    </div>
  );
}
