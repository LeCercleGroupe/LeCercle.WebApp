"use client";

import { useEffect, useState } from "react";

interface BookingSummary {
  date?: string;
  startTime?: string;
  venueName?: string;
  address?: string;
  city?: string;
}

interface Labels {
  event_details_title: string;
  date_label: string;
  time_label: string;
  location_label: string;
  address_label: string;
}

interface Props {
  labels: Labels;
  months: string[];
  daysFull: string[];
}

function formatDateFull(
  dateStr: string,
  months: string[],
  daysFull: string[],
): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return "—";
  const date = new Date(year, month - 1, day); // local date — no UTC conversion
  const dayName = daysFull[(date.getDay() + 6) % 7];
  return `${dayName}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function PaymentSuccessEventDetails({
  labels,
  months,
  daysFull,
}: Props) {
  const [summary, setSummary] = useState<BookingSummary | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lecercle_booking_flow");
      if (raw) {
        const flow = JSON.parse(raw);
        const s = flow?.state;
        if (s) {
          setSummary({
            date: s.date
              ? `${s.date.y}-${String(s.date.m + 1).padStart(2, "0")}-${String(s.date.d).padStart(2, "0")}`
              : undefined,
            startTime: s.startTime,
            venueName: s.venueName,
            address: s.address,
            city: s.city,
          });
        }
      }
    } catch {}
    // Clear after reading so a new booking starts fresh
    try {
      sessionStorage.removeItem("lecercle_booking_flow");
      sessionStorage.removeItem("lecercle_booking_summary");
    } catch {}
  }, []);

  if (!summary) return null;

  const formattedDate = summary.date
    ? formatDateFull(summary.date, months, daysFull)
    : "—";

  return (
    <div className="flex flex-col gap-4 bg-[#1b1b1b] border border-[#303030] px-4 py-6 w-full">
      <p className="text-sm font-bold text-[#a8a8a8] font-figtree uppercase tracking-widest">
        {labels.event_details_title}
      </p>
      <div className="flex flex-col gap-2 text-sm font-figtree tracking-tight">
        <div>
          <p className="text-[#747474] leading-[1.4]">{labels.date_label}</p>
          <p className="text-[#f1f1f1] leading-[1.4]">{formattedDate}</p>
        </div>
        {summary.startTime && (
          <div>
            <p className="text-[#747474] leading-[1.4]">{labels.time_label}</p>
            <p className="text-[#f1f1f1] leading-[1.4]">{summary.startTime}</p>
          </div>
        )}
        {summary.venueName && (
          <div>
            <p className="text-[#747474] leading-[1.4]">
              {labels.location_label}
            </p>
            <p className="text-[#f1f1f1] leading-[1.4]">{summary.venueName}</p>
          </div>
        )}
        {summary.address && (
          <div>
            <p className="text-[#747474] leading-[1.4]">
              {labels.address_label}
            </p>
            <p className="text-[#f1f1f1] leading-[1.4]">
              {summary.address}
              {summary.city ? `, ${summary.city}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
