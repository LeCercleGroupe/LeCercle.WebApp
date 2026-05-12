"use client";

import dynamic from "next/dynamic";
import type { ContractsPageDict } from "./ContractsPage";

const ContractsPage = dynamic(() => import("./ContractsPage"), { ssr: false });

export default function DynamicContractsPage({ locale, dict }: { locale: string; dict: ContractsPageDict }) {
  return <ContractsPage locale={locale} dict={dict} />;
}
