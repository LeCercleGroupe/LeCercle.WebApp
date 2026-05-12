"use client";

import dynamic from "next/dynamic";
import type { EventsOverviewDict } from "./EventsOverview";

const EventsOverview = dynamic(() => import("./EventsOverview"), { ssr: false });

export default function DynamicEventsOverview({ locale, dict }: { locale: string; dict: EventsOverviewDict }) {
  return <EventsOverview locale={locale} dict={dict} />;
}
