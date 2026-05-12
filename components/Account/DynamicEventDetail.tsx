"use client";

import dynamic from "next/dynamic";
import type { EventDetailPageDict } from "./EventDetail";

const EventDetail = dynamic(() => import("./EventDetail"), { ssr: false });

export default function DynamicEventDetail({
  locale,
  eventId,
  dict,
}: {
  locale: string;
  eventId: string;
  dict: EventDetailPageDict;
}) {
  return <EventDetail locale={locale} eventId={eventId} dict={dict} />;
}
