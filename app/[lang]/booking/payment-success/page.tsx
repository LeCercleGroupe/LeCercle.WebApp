import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../../dictionaries";
import BookingNavbar from "@/components/BookingFlow/shared/BookingNavbar";
import CornerBrackets from "@/components/BookingFlow/shared/CornerBrackets";
import PaymentSuccessEventDetails from "@/components/BookingFlow/shared/PaymentSuccessEventDetails";
import type { BookingDict } from "@/components/BookingFlow/dict";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

type StepState = "done" | "active" | "future";

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <div className="flex items-center justify-center size-5.5 bg-[#3fb877] rounded-full shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="flex items-center justify-center size-5.5 border-[1.5px] border-[#8e8e8e] rounded-full shrink-0">
        <div className="size-2 rounded-sm bg-[#d4fde2]" />
      </div>
    );
  }
  return (
    <div className="size-5.5 border-[1.5px] border-[#5c5c5c] rounded-full shrink-0" />
  );
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const sp = await searchParams;
  const orderId = typeof sp.orderId === "string" ? sp.orderId : undefined;

  const dict = await getDictionary(lang);
  const d = (dict.booking as BookingDict).payment_success;
  const step1 = (dict.booking as BookingDict).step1;

  const stepStates: StepState[] = ["done", "done", "active", "future"];

  return (
    <div className="min-h-screen bg-[#111] flex flex-col">
      <BookingNavbar locale={lang} />

      <div className="flex flex-col gap-6 px-2.5 py-6 max-w-lg mx-auto w-full">
        <div className="relative flex flex-col gap-4 items-center bg-[#0b301c] px-4 py-6 w-full">
          <CornerBrackets color="#37a067" size={10} />

          <div className="flex items-center justify-center size-10 bg-[#37a067] rounded-lg">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11l5 5 9-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="flex flex-col gap-1 items-center w-full">
            {orderId && (
              <p className="text-sm font-medium text-[#3fb877] font-figtree tracking-tight">
                #{orderId}
              </p>
            )}
            <h1 className="text-4xl font-normal text-[#f1f1f1] font-eb-garamond leading-[1.2] tracking-tight text-center w-full">
              {d.title}
            </h1>
            <p className="text-base text-[#c4c4c4] font-figtree tracking-tight text-center w-full">
              {d.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-linear-to-b from-[#252525] to-[#1b1b1b] border border-[#303030] px-4 py-6 w-full">
          <p className="text-sm font-bold text-[#a8a8a8] font-figtree uppercase tracking-widest">
            {d.steps_title}
          </p>
          <div className="flex flex-col">
            {d.steps.map((step, i) => {
              const state = stepStates[i] ?? "future";
              const labelColor =
                state === "done" ? "text-[#a8a8a8]" : state === "active" ? "text-[#f1f1f1]" : "text-[#8e8e8e]";
              const subColor =
                state === "done" ? "text-[#8e8e8e]" : state === "active" ? "text-[#a8a8a8]" : "text-[#747474]";
              const lineColor = state === "done" ? "bg-[#747474]" : "bg-[#474747]";

              return (
                <div key={i} className="flex gap-3.5 items-start">
                  <div className="flex flex-col items-center shrink-0 self-stretch">
                    <StepIcon state={state} />
                    {i < d.steps.length - 1 && (
                      <div className={`w-px flex-1 min-h-4 my-1 ${lineColor}`} />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 pb-4 flex-1 min-w-0">
                    <p className={`text-base font-medium font-figtree tracking-tight ${labelColor}`}>
                      {step.label}
                    </p>
                    {step.sub && (
                      <p className={`text-sm font-figtree tracking-tight ${subColor}`}>
                        {step.sub}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <PaymentSuccessEventDetails
          labels={{
            event_details_title: d.event_details_title,
            date_label: d.date_label,
            time_label: d.time_label,
            location_label: d.location_label,
            address_label: d.address_label,
          }}
          months={step1.months}
          daysFull={step1.days_full}
        />

        <Link
          href={`/${lang}/account`}
          className="flex items-center justify-center w-full py-4 bg-[#1b1b1b] border border-[#303030] text-base font-medium text-[#f1f1f1] font-figtree tracking-tight hover:border-[#474747] transition-colors"
        >
          {d.back_home}
        </Link>
      </div>
    </div>
  );
}
