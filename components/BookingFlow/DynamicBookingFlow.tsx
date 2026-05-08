"use client";

import dynamic from "next/dynamic";
import type { BookingDict } from "./dict";

// ssr: false must live in a Client Component.
// BookingFlow reads sessionStorage/localStorage in useState initializers,
// so SSR would produce HTML that mismatches the client on hydration.
const BookingFlow = dynamic(() => import("."), { ssr: false });

export default function DynamicBookingFlow({
  locale,
  dict,
}: {
  locale: string;
  dict: BookingDict;
}) {
  return <BookingFlow locale={locale} dict={dict} />;
}
