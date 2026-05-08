import Link from "next/link";
import type { BookingDict } from "../dict";
import BackButton from "../shared/BackButton";
import CornerBrackets from "../shared/CornerBrackets";
import { BookingState } from "../types";

interface Props {
  state: BookingState;
  dict: BookingDict;
  locale: string;
  onBack: () => void;
}

function formatMDL(amount: number): string {
  return new Intl.NumberFormat("ro-MD").format(amount) + " MDL";
}

function formatDateFull(date: Date, months: string[], daysFull: string[]): string {
  const dayName = daysFull[(date.getDay() + 6) % 7];
  return `${dayName}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function inject(template: string, amount: string): string {
  return template.replace("{amount}", amount);
}

type StepState = "done" | "active" | "future";

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <div className="flex items-center justify-center size-5.5 bg-[#daa17f] rounded-full shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="flex items-center justify-center size-5.5 border-[1.5px] border-[#8e8e8e] rounded-full shrink-0">
        <div className="size-2 rounded-sm bg-[#f9f2ef]" />
      </div>
    );
  }
  return (
    <div className="size-5.5 border-[1.5px] border-[#5c5c5c] rounded-full shrink-0" />
  );
}

export default function Step7Confirmation({ state, dict, locale, onBack }: Props) {
  const d = dict.step7;
  const months = dict.step1.months;
  const daysFull = dict.step1.days_full;

  const totalPrice = state.selectedServices.reduce((sum, v) => {
    return sum + (state.selectedPackages[v]?.basePrice ?? 0);
  }, 0);
  const advanceMDL = formatMDL(Math.round(totalPrice * 0.1));

  const stepStates: StepState[] = ["done", "active", "future", "future", "future"];

  const formattedDate = state.date
    ? formatDateFull(state.date, months, daysFull)
    : "—";

  const eventSub =
    state.date
      ? `${formattedDate}${state.venueName ? `. ${state.venueName}` : ""}${state.city ? `, ${state.city}` : ""}`
      : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-start">
        <BackButton label={dict.back} onClick={onBack} />
      </div>

      <div className="relative flex flex-col gap-4 items-center bg-[#2a1d14] px-4 py-6 w-full">
        <CornerBrackets color="#daa17f" size={10} />

        <div className="flex items-center justify-center size-10 bg-[#5c3a20] rounded-lg">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#daa17f" strokeWidth="1.5" />
            <path d="M11 7v4l2.5 2.5" stroke="#daa17f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="flex flex-col gap-1 items-center w-full">
          {state.bookingRef && (
            <p className="text-sm font-medium text-[#daa17f] font-figtree tracking-tight">
              #{state.bookingRef}
            </p>
          )}
          <h2 className="text-4xl font-normal text-[#f1f1f1] font-eb-garamond leading-[1.2] tracking-tight text-center w-full">
            {d.title}
          </h2>
          <p className="text-base text-[#c4c4c4] font-figtree tracking-tight text-center w-full">
            {inject(d.subtitle, advanceMDL)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-linear-to-b from-[#252525] to-[#1b1b1b] border border-[#303030] px-4 py-6 w-full">
        <p className="text-sm font-bold text-[#a8a8a8] font-figtree uppercase tracking-widest">
          {d.steps_title}
        </p>
        <div className="flex flex-col">
          {d.steps.map((step, i) => {
            const stepState = stepStates[i] ?? "future";
            const label = i === 1 ? inject(step.label, advanceMDL) : step.label;
            const sub = i === 4 ? eventSub : step.sub;
            const labelColor =
              stepState === "done" ? "text-[#a8a8a8]" : stepState === "active" ? "text-[#f1f1f1]" : "text-[#8e8e8e]";
            const subColor =
              stepState === "done" ? "text-[#8e8e8e]" : stepState === "active" ? "text-[#a8a8a8]" : "text-[#747474]";
            const lineColor = stepState === "done" ? "bg-[#747474]" : "bg-[#474747]";

            return (
              <div key={i} className="flex gap-3.5 items-start">
                <div className="flex flex-col items-center shrink-0 self-stretch">
                  <StepIcon state={stepState} />
                  {i < d.steps.length - 1 && (
                    <div className={`w-px flex-1 min-h-4 my-1 ${lineColor}`} />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-4 flex-1 min-w-0">
                  <p className={`text-base font-medium font-figtree tracking-tight ${labelColor}`}>
                    {label}
                  </p>
                  {sub && (
                    <p className={`text-sm font-figtree tracking-tight ${subColor}`}>
                      {sub}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-[#1b1b1b] border border-[#303030] px-4 py-6 w-full">
        <p className="text-sm font-bold text-[#a8a8a8] font-figtree uppercase tracking-widest">
          {d.event_details_title}
        </p>
        <div className="flex flex-col gap-2 text-sm font-figtree tracking-tight">
          <div>
            <p className="text-[#747474] leading-[1.4]">{d.date_label}</p>
            <p className="text-[#f1f1f1] leading-[1.4]">{formattedDate}</p>
          </div>
          {state.startTime && (
            <div>
              <p className="text-[#747474] leading-[1.4]">{d.time_label}</p>
              <p className="text-[#f1f1f1] leading-[1.4]">{state.startTime}</p>
            </div>
          )}
          {state.venueName && (
            <div>
              <p className="text-[#747474] leading-[1.4]">{d.location_label}</p>
              <p className="text-[#f1f1f1] leading-[1.4]">{state.venueName}</p>
            </div>
          )}
          {state.address && (
            <div>
              <p className="text-[#747474] leading-[1.4]">{d.address_label}</p>
              <p className="text-[#f1f1f1] leading-[1.4]">
                {state.address}{state.city ? `, ${state.city}` : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <Link
        href={`/${locale}`}
        className="flex items-center justify-center w-full py-4 bg-[#1b1b1b] border border-[#303030] text-base font-medium text-[#f1f1f1] font-figtree tracking-tight hover:border-[#474747] transition-colors"
      >
        {d.back_home}
      </Link>
    </div>
  );
}
