"use client";

import Image from "next/image";
import { useState } from "react";
import type { BookingDict } from "../dict";
import BackButton from "../shared/BackButton";
import BookingStepper from "../shared/BookingStepper";
import PrimaryButton from "../shared/PrimaryButton";
import { BookingState, PaymentOption, VENUE_INFO } from "../types";

const TRANSPORT_RATE_PER_KM = 20 * 2; // round trip

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
  dict: BookingDict;
  locale: string;
  stepLabel: string;
}

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

export default function Step6Summary({
  state,
  onChange,
  onNext,
  onBack,
  dict,
  locale,
  stepLabel,
}: Props) {
  const d = dict.step6;
  const months = dict.step1.months;
  const daysFull = dict.step1.days_full;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const cityNorm = state.city.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const isChisinau = cityNorm === "chisinau" || cityNorm === "kishinev";
  const transportKm = !isChisinau && state.distanceKm ? state.distanceKm : 0;
  const transportCost = Math.round(transportKm * TRANSPORT_RATE_PER_KM);

  const serviceTotal = state.selectedServices.reduce(
    (sum, v) => sum + (state.selectedPackages[v]?.basePrice ?? 0),
    0
  );
  const totalPrice = serviceTotal + transportCost;
  const advanceAmount = Math.round(totalPrice * 0.1);
  const advanceFormatted = formatMDL(advanceAmount);

  async function handleFinalize() {
    setSubmitting(true);
    setSubmitError(false);

    const auth = `Bearer ${state.userAccessToken}`;

    try {
      // If returning from step 7 (order already exists), skip event/order creation
      let orderId = state.bookingRef;

      if (!orderId) {
        const eventRes = await fetch("/api/booking/event", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: auth },
          body: JSON.stringify({
            eventDate: state.date
              ? `${state.date.getFullYear()}-${String(state.date.getMonth() + 1).padStart(2, "0")}-${String(state.date.getDate()).padStart(2, "0")}`
              : undefined,
            venueTitle: state.venueName,
            venueAddress: state.address,
            city: state.city,
            eventStartTime: normalizeTime(state.startTime),
            guestCount: state.guests,
            notes: state.notes,
            latitude: state.latitude ?? 0,
            longitude: state.longitude ?? 0,
            distanceKm: state.distanceKm ?? 0,
            customerId: state.customerId,
          }),
        });
        if (!eventRes.ok) throw new Error(`event ${eventRes.status}`);
        const { id: eventId } = await eventRes.json();

        const items = state.selectedServices
          .filter((sid) => state.selectedPackages[sid])
          .map((sid) => ({
            packageId: state.selectedPackages[sid]!.id,
            serviceId: sid,
            quantity: 1,
          }));

        const orderRes = await fetch("/api/booking/order", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: auth },
          body: JSON.stringify({
            eventId,
            contactEmail: state.email,
            contactPhone: state.phone,
            items,
            customerId: state.customerId,
          }),
        });
        if (!orderRes.ok) throw new Error(`order ${orderRes.status}`);
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
            returnUrl: `${window.location.origin}/${locale}/booking/payment-success?orderId=${orderId}`,
          }),
        });
        if (!payRes.ok) throw new Error(`payment ${payRes.status}`);
        const { paymentUrl } = await payRes.json();
        try {
          // Save event details for the payment-success page to display
          sessionStorage.setItem(
            "lecercle_booking_summary",
            JSON.stringify({
              date: state.date
                ? `${state.date.getFullYear()}-${String(state.date.getMonth() + 1).padStart(2, "0")}-${String(state.date.getDate()).padStart(2, "0")}`
                : undefined,
              startTime: state.startTime,
              venueName: state.venueName,
              address: state.address,
              city: state.city,
            })
          );
          // Stamp orderId into the flow state synchronously so that if the
          // bank payment fails/cancels and the user comes back, handleFinalize
          // skips re-creating the event/order and just retries payment.
          const flowRaw = sessionStorage.getItem("lecercle_booking_flow");
          if (flowRaw) {
            const flow = JSON.parse(flowRaw);
            if (flow.state) flow.state.bookingRef = orderId;
            sessionStorage.setItem("lecercle_booking_flow", JSON.stringify(flow));
          }
        } catch {}
        window.location.href = paymentUrl;
        return;
      }

      onChange({ bookingRef: orderId });
      onNext();
    } catch {
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
          <BackButton label={dict.back} onClick={onBack} />
        </div>
        <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">
          {d.title}
        </h2>
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">
          {d.subtitle}
        </p>
      </div>

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
              return (
                <div key={v} className="flex flex-col gap-2.5 bg-[#111] border border-[#2a2a2a] px-3 py-3">
                  <div className="flex justify-between items-start gap-3">
                    <Image
                      src={info.logo}
                      alt={info.name}
                      width={100}
                      height={40}
                      className="object-contain object-left h-10 w-auto"
                    />
                    <p className="text-base font-medium text-[#f1f1f1] font-figtree tracking-tight shrink-0">
                      {pkg ? formatMDL(pkg.basePrice) : "—"}
                    </p>
                  </div>
                  {pkg && (
                    <div className="flex items-center gap-1.5">
                      <div className="size-4 rounded-full bg-[#c4973f] shrink-0" />
                      <p className="text-sm text-[#d4d4d4] font-figtree tracking-tight">{pkg.name}</p>
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
            {state.selectedServices.map((v) => {
              const info = VENUE_INFO[v];
              const pkg = state.selectedPackages[v];
              return (
                <Row
                  key={v}
                  label={`${info.name}: ${pkg?.name ?? ""}`}
                  value={pkg ? formatMDL(pkg.basePrice) : "—"}
                />
              );
            })}
            {transportCost > 0 && (
              <Row
                label={d.transport_label.replace("{km}", String(Math.round(transportKm)))}
                value={formatMDL(transportCost)}
              />
            )}
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
    </div>
  );
}
