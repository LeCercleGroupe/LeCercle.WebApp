"use client";

import dynamic from "next/dynamic";
import type { AdminDict, AdminUser } from "./shared/types";

const AdminPanel = dynamic(() => import("./AdminPanel"), { ssr: false });

interface Props {
  locale: string;
  user: AdminUser;
  dict: AdminDict;
}

export default function DynamicAdminPanel({ locale, user, dict }: Props) {
  return <AdminPanel locale={locale} user={user} dict={dict} />;
}
