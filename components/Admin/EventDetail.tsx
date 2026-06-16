"use client";

import { formatDateShort, formatMDL, formatTime } from "@/components/Account/shared/format";
import {
  eventAmount,
  eventClientEmail,
  eventClientName,
  eventClientPhone,
  type AdminDict,
  type AdminEvent,
} from "./shared/types";
import { statusBadgeClass, statusLabel } from "./shared/status";

interface Props {
  event: AdminEvent;
  dict: AdminDict;
  canViewSensitive: boolean;
  onBack: () => void;
}

export default function EventDetail({ event, dict, canViewSensitive, onBack }: Props) {
  const fullLocation = [event.venueTitle, event.venueAddress, event.city, event.postalCode]
    .filter(Boolean)
    .join(", ");
  const dateLine = [formatDateShort(event.eventDate), event.eventStartTime ? formatTime(event.eventStartTime) : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 sm:px-8 pt-6 pb-4 border-b border-[#141414]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium font-figtree tracking-tight text-[#888] hover:text-[#f0f0f0] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.detail_back}
        </button>
        <span className={`ml-auto inline-flex items-center px-2.5 py-1 text-[11px] font-medium font-figtree tracking-widest ${statusBadgeClass(event.status)}`}>
          {statusLabel(event.status)}
        </span>
      </div>

      <div className="flex-1 overflow-auto px-5 sm:px-8 py-6 flex flex-col gap-6 max-w-2xl">
        {/* Client info */}
        <section>
          <h2 className="text-[12px] font-medium font-figtree tracking-widest uppercase text-[#666] mb-3">
            {dict.detail_client}
          </h2>
          <dl className="divide-y divide-[#141414] border border-[#1e1e1e]">
            <Field label={dict.label_name} value={eventClientName(event)} />
            {canViewSensitive && <Field label={dict.label_phone} value={eventClientPhone(event)} />}
            {canViewSensitive && <Field label={dict.label_email} value={eventClientEmail(event)} />}
          </dl>
        </section>

        {/* Event details */}
        <section>
          <h2 className="text-[12px] font-medium font-figtree tracking-widest uppercase text-[#666] mb-3">
            {dict.detail_event}
          </h2>
          <dl className="divide-y divide-[#141414] border border-[#1e1e1e]">
            <Field label={dict.label_date} value={dateLine || "—"} />
            <Field label={dict.label_location} value={fullLocation || "—"} />
            <Field label={dict.label_guests} value={event.guestCount ? `${event.guestCount} ${dict.guests}` : "—"} />
            {canViewSensitive && <Field label={dict.label_total} value={formatMDL(eventAmount(event))} />}
          </dl>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4 bg-[#0c0c0c]">
      <dt className="w-32 shrink-0 text-[13px] text-[#666] font-figtree tracking-tight">{label}</dt>
      <dd className="text-[14px] text-[#f0f0f0] font-figtree tracking-tight break-words">{value}</dd>
    </div>
  );
}
