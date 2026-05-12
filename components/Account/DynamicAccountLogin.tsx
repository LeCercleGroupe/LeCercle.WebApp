"use client";

import dynamic from "next/dynamic";
import type { AccountDict } from "./AccountLogin";

const AccountLogin = dynamic(() => import("./AccountLogin"), { ssr: false });

export default function DynamicAccountLogin({ locale, dict }: { locale: string; dict: AccountDict }) {
  return <AccountLogin locale={locale} dict={dict} />;
}
