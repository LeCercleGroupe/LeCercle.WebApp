"use client";

import dynamic from "next/dynamic";
import type { ProfilePageDict } from "./ProfilePage";

const ProfilePage = dynamic(() => import("./ProfilePage"), { ssr: false });

export default function DynamicProfilePage({ locale, dict }: { locale: string; dict: ProfilePageDict }) {
  return <ProfilePage locale={locale} dict={dict} />;
}
