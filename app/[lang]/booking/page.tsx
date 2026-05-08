import { notFound } from "next/navigation";
import DynamicBookingFlow from "@/components/BookingFlow/DynamicBookingFlow";
import { getDictionary, hasLocale } from "../dictionaries";
import type { BookingDict } from "@/components/BookingFlow/dict";

export default async function BookingPage({ params }: PageProps<"/[lang]/booking">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <DynamicBookingFlow locale={lang} dict={dict.booking as BookingDict} />;
}
