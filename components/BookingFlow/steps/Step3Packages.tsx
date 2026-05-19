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
function buildDefaultSelections(features: ApiFeature[]): Map<string, Set<string>> {
  const featureMap = new Map<string, Set<string>>();
  for (const feature of features) {
    if (feature.type !== 1) continue;
    const defaults = feature.options.filter((o) => o.isDefault).map((o) => o.id);
    if (defaults.length > 0) {
      featureMap.set(feature.id, new Set(defaults));
    }
  }
  return featureMap;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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
}: PackageCardProps) {
  const allFeatures = [...features].sort((a, b) => a.sortOrder - b.sortOrder);
  const multiFeatures = allFeatures.filter((f) => f.type === 1);

  return (
    <div className={`flex flex-col border transition-all duration-200 ${
      selected ? "border-[#37a067]" : "border-[#303030] hover:border-[#474747]"
    }`}>

      {/* ── Recommended strip — full width, above the button ── */}
      {isRecommended && (
        <div className={`flex items-center gap-2 px-4 py-1.5 border-b ${
          selected ? "bg-[#0b2a18] border-[#37a067]/40" : "bg-[#111] border-[#303030]"
        }`}>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="shrink-0">
            <path d="M1 4l3 3 5-6" stroke="#37a067" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium text-[#37a067] font-figtree tracking-tight">
            {recommendedLabel}
          </span>
        </div>
      )}

      {/* ── Clickable card ── */}
      <button
        onClick={onSelect}
        className={`relative flex flex-col gap-4 p-4 text-left w-full transition-colors duration-200 ${
          selected ? "bg-[#0e1f17]" : "bg-[#111]"
        }`}
      >
        <CornerBrackets color={selected ? "#37a067" : "rgba(255,255,255,0.12)"} size={12} />

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

        {/* All features — shown as bullet list in every card */}
        {allFeatures.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {allFeatures.map((feature) => (
              <li key={feature.id} className="flex gap-2 items-start">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                  <path
                    d="M2.5 7l3 3 6-6"
                    stroke={selected ? "#37a067" : "#747474"}
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

        {/* Selected badge */}
        {selected && (
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-[#37a067]" />
            <span className="text-xs font-medium text-[#37a067] font-figtree tracking-tight">
              {selectedBadge}
            </span>
          </div>
        )}
      </button>

      {/* ── MultiSelectable options — always visible, interactive in all cards ── */}
      {multiFeatures.length > 0 && (
        <div className={`flex flex-col gap-4 px-4 py-4 border-t ${
          selected ? "bg-[#0e1f17] border-[#37a067]/40" : "bg-[#0d0d0d] border-[#303030]"
        }`}>
          {multiFeatures.map((feature) => {
            const selectedIds = pkgSelections.get(feature.id) ?? new Set<string>();
            // Sort by additionalCost ascending — cheapest option displayed first
            const sortedOptions = [...feature.options].sort((a, b) => a.additionalCost - b.additionalCost);
            // The cheapest currently-selected option is always free
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
                        onClick={() => {
                          if (!selected) onSelect();
                          onToggleOption(feature.id, option.id);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 bg-[#111] border border-[#303030] hover:border-[#474747] transition-colors text-left w-full"
                      >
                        <div
                          className={`size-4 shrink-0 border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-[#37a067] border-[#37a067]"
                              : "bg-transparent border-[#474747]"
                          }`}
                        >
                          {isChecked && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path
                                d="M1 4l3 3 5-6"
                                stroke="#fff"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="flex-1 text-sm text-[#c4c4c4] font-figtree tracking-tight">
                          {option.label}
                        </span>
                        <span className={`text-xs font-medium font-figtree tracking-tight shrink-0 ${isChecked ? "text-[#37a067]" : "text-[#a8a8a8]"}`}>
                          {isFree ? featureIncluded : `+${formatMDL(option.additionalCost)}`}
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
  const [reserveError, setReserveError] = useState(false);

  // ── Fetch packages + features in one go ──────────────────────────────────

  useEffect(() => {
    const token = tokenRef.current;
    if (!token || !state.selectedServices.length) return;

    let pMap: Map<ServiceId, ApiPackage[]>;

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
  }, [state.selectedServices, tokenReady]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const loading = (packagesMap === null || featuresMap === null) && !error;
  const packages = packagesMap?.get(activeVenue) ?? [];
  const canProceed = state.selectedServices.every((v) => state.selectedPackages[v]);

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
    setReserveError(false);

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
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
              />
            );
          })}
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
        <p className="text-sm text-red-400 font-figtree tracking-tight text-center">
          {d.reserve_error}
        </p>
      )}
      <PrimaryButton
        label={dict.continue}
        onClick={handleNext}
        disabled={!canProceed || reserving}
        loading={reserving}
      />
    </div>
  );
}
