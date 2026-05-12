"use client";

import dynamic from "next/dynamic";
import type { DashboardAccountDict } from "./AccountDashboard";

const AccountDashboard = dynamic(() => import("./AccountDashboard"), { ssr: false });

export default function DynamicAccountDashboard({ locale, dict }: { locale: string; dict: DashboardAccountDict }) {
  return <AccountDashboard locale={locale} dict={dict} />;
}
