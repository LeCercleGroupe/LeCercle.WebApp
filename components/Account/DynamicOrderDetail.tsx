"use client";

import type { EventDetailPageDict } from "./EventDetail";
import OrderDetail from "./OrderDetail";

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
  return (
    <OrderDetail
      locale={locale}
      eventId={eventId}
      orderId={orderId}
      dict={dict}
    />
  );
}
