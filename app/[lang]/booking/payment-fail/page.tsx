import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../../dictionaries";
import BookingNavbar from "@/components/BookingFlow/shared/BookingNavbar";
import CornerBrackets from "@/components/BookingFlow/shared/CornerBrackets";
import type { BookingDict } from "@/components/BookingFlow/dict";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaymentFailPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const sp = await searchParams;
  const orderId = typeof sp.orderId === "string" ? sp.orderId : undefined;

  const dict = await getDictionary(lang);
  const d = (dict.booking as BookingDict).payment_fail;

  return (
    <div className="min-h-screen bg-[#111] flex flex-col">
      <BookingNavbar locale={lang} />

      <div className="flex flex-col gap-6 px-2.5 py-6 max-w-lg mx-auto w-full">
        <div className="relative flex flex-col gap-4 items-center bg-[#2a0f0f] px-4 py-6 w-full">
          <CornerBrackets color="#ef4444" size={10} />

          <div className="flex items-center justify-center size-10 bg-[#ef4444] rounded-lg">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M6 6l10 10M16 6L6 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col gap-1 items-center w-full">
            {orderId && (
              <p className="text-sm font-medium text-[#f87171] font-figtree tracking-tight">
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

        <Link
          href={`/${lang}/booking`}
          className="flex items-center justify-center w-full py-4 bg-[#ef4444] text-base font-medium text-white font-figtree tracking-tight hover:bg-[#dc2626] transition-colors"
        >
          {d.retry}
        </Link>

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
