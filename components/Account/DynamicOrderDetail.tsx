"use client";

import dynamic from "next/dynamic";
import type { EventDetailPageDict } from "./EventDetail";

const OrderDetail = dynamic(() => import("./OrderDetail"), { ssr: false });

export default function DynamicOrderDetail({
  locale,
  eventId,
  orderId,
  dict,
}: {
  locale: string;
  eventId: string;
  orderId: string;
  dict: EventDetailPageDict;
}) {
  return <OrderDetail locale={locale} eventId={eventId} orderId={orderId} dict={dict} />;
}
