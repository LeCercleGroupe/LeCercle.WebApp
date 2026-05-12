"use client";

import dynamic from "next/dynamic";
import type { ProfileEditPageDict } from "./ProfileEditPage";

const ProfileEditPage = dynamic(() => import("./ProfileEditPage"), { ssr: false });

export default function DynamicProfileEditPage({ locale, dict }: { locale: string; dict: ProfileEditPageDict }) {
  return <ProfileEditPage locale={locale} dict={dict} />;
}
