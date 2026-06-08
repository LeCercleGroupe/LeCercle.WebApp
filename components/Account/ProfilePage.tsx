"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadAuth, StoredAuth } from "@/components/BookingFlow/utils/auth";
import AccountTopBar from "./shared/AccountTopBar";

interface ProfileDict {
  title: string;
  subtitle: string;
  edit_button: string;
  section_personal: string;
  section_company: string;
  section_security: string;
  optional_label: string;
  verified: string;
  not_filled: string;
  first_name: string;
  last_name: string;
  email_label: string;
  phone_label: string;
  company_label: string;
  idno_label: string;
  password_label: string;
  change_password: string;
  loading: string;
  error: string;
}

interface NavDict {
  events: string;
  contracts: string;
  profile: string;
  logout: string;
}

export interface ProfilePageDict {
  profile_page: ProfileDict;
  nav: NavDict;
}

interface Props {
  locale: string;
  dict: ProfilePageDict;
}

function ProfileField({ label, value, verified, notFilled }: { label: string; value: string; verified?: boolean; notFilled?: boolean }) {
  return (
    <div className="flex py-3 border-b border-[#141414] last:border-b-0">
      <span className="w-48 shrink-0 text-[13px] text-[#888] font-figtree tracking-tight">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[13px] font-figtree tracking-tight ${notFilled ? "text-[#555] italic" : "text-[#f0f0f0]"}`}>
          {value}
        </span>
        {verified && (
          <span className="text-[11px] font-medium text-[#4ade80] font-figtree tracking-tight">
            · verificat
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage({ locale, dict }: Props) {
  const router = useRouter();
  const d = dict.profile_page;

  const [auth] = useState<StoredAuth | null>(() => loadAuth()?.auth ?? null);

  useEffect(() => {
    if (!auth) {
      router.replace(`/${locale}/account/login`);
    }
  }, [auth, locale, router]);

  if (!auth) {
    return (
      <div className="min-h-svh bg-[#080808] flex items-center justify-center">
        <p className="text-sm text-[#666] font-figtree">{d.loading}</p>
      </div>
    );
  }

  const user = auth.user;
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const displayName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || (user.phoneNumber ?? "—");
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—";

  return (
    <div className="min-h-svh bg-[#080808] flex flex-col">
      <AccountTopBar
        locale={locale}
        initials={initials}
        displayName={displayName}
        email={user.email}
        navDict={dict.nav}
      />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-432">
          <div className="mx-auto max-w-295 px-4 sm:px-6 lg:px-8 2xl:px-0 py-14">

            {/* Page header */}
            <div className="flex items-start justify-between gap-4 mb-10">
              <div>
                <h1 className="text-[40px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none mb-2">
                  {d.title}
                </h1>
                <p className="text-[15px] text-[#888] font-figtree tracking-tight">{d.subtitle}</p>
              </div>
              <Link
                href={`/${locale}/account/profile/edit`}
                className="shrink-0 px-4 py-2.5 border border-[#3a3a3a] text-sm font-medium text-[#f0f0f0] font-figtree tracking-tight hover:bg-[#1a1a1a] transition-colors"
              >
                {d.edit_button}
              </Link>
            </div>

            {/* Avatar + identity row */}
            <div className="flex items-center gap-4 mb-10">
              <div className="size-14 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                <span className="text-[18px] font-semibold text-[#f0f0f0] font-figtree">{initials}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-[18px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-tight">{fullName}</p>
                {user.email && (
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] text-[#888] font-figtree tracking-tight">{user.email}</p>
                    <span className="text-[11px] text-[#4ade80] font-figtree tracking-tight">· {d.verified}</span>
                  </div>
                )}
                {user.phoneNumber && (
                  <p className="text-[13px] text-[#888] font-figtree tracking-tight">{user.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Personal details */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-1">
                <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase shrink-0">
                  {d.section_personal}
                </p>
                <div className="flex-1 h-px bg-[#1e1e1e]" />
              </div>
              <div className="border border-[#1e1e1e] px-5 py-1 mt-4">
                <ProfileField label={d.first_name} value={user.firstName || d.not_filled} notFilled={!user.firstName} />
                <ProfileField label={d.last_name} value={user.lastName || d.not_filled} notFilled={!user.lastName} />
                <ProfileField label={d.email_label} value={user.email || d.not_filled} verified={!!user.email} notFilled={!user.email} />
                <ProfileField label={d.phone_label} value={user.phoneNumber || d.not_filled} notFilled={!user.phoneNumber} />
              </div>
            </div>

            {/* Company details */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-1">
                <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase shrink-0">
                  {d.section_company}
                </p>
                <span className="text-[11px] text-[#555] font-figtree tracking-tight">{d.optional_label}</span>
                <div className="flex-1 h-px bg-[#1e1e1e]" />
              </div>
              <div className="border border-[#1e1e1e] px-5 py-1 mt-4">
                <ProfileField label={d.company_label} value={user.companyName || d.not_filled} notFilled={!user.companyName} />
                <ProfileField label={d.idno_label} value={user.idno || d.not_filled} notFilled={!user.idno} />
              </div>
            </div>

            {/* Security */}
            {/* <div className="mb-8">
              <div className="flex items-center gap-4 mb-1">
                <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase shrink-0">
                  {d.section_security}
                </p>
                <div className="flex-1 h-px bg-[#1e1e1e]" />
              </div>
              <div className="border border-[#1e1e1e] px-5 py-4 mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-[#f0f0f0] font-figtree tracking-tight">{d.password_label}</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2.5 border border-[#2a2a2a] text-[13px] font-medium text-[#c0c0c0] font-figtree tracking-tight hover:border-[#4a4a4a] hover:text-[#f0f0f0] transition-colors cursor-pointer"
                >
                  {d.change_password}
                </button>
              </div>
            </div> */}

          </div>
        </div>
      </main>
    </div>
  );
}
