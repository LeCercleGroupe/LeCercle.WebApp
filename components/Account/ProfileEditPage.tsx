"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadAuth, updateAuthProfile, StoredAuth } from "@/components/BookingFlow/utils/auth";
import AccountTopBar from "./shared/AccountTopBar";

interface ProfileEditDict {
  title: string;
  subtitle: string;
  save: string;
  cancel: string;
  section_personal: string;
  section_company: string;
  optional_label: string;
  first_name_label: string;
  last_name_label: string;
  email_label: string;
  phone_label: string;
  phone_note: string;
  company_label: string;
  company_placeholder: string;
  idno_label: string;
  idno_placeholder: string;
  notes_label: string;
  notes_placeholder: string;
  save_error: string;
  save_success: string;
}

interface NavDict {
  events: string;
  contracts: string;
  profile: string;
  logout: string;
}

export interface ProfileEditPageDict {
  profile_edit_page: ProfileEditDict;
  nav: NavDict;
}

interface Props {
  locale: string;
  dict: ProfileEditPageDict;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[12px] font-medium text-[#888] font-figtree tracking-tight mb-1.5">
      {children}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-3 border border-[#2a2a2a] bg-[#111] text-[14px] text-[#f0f0f0] font-figtree tracking-tight placeholder-[#444] focus:outline-none focus:border-[#4a4a4a] disabled:text-[#555] disabled:cursor-not-allowed transition-colors"
    />
  );
}

export default function ProfileEditPage({ locale, dict }: Props) {
  const router = useRouter();
  const d = dict.profile_edit_page;

  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [idno, setIdno] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const result = loadAuth();
    if (!result) {
      router.replace(`/${locale}/account/login`);
      return;
    }
    setAuth(result.auth);
    const u = result.auth.user;
    setFirstName(u.firstName ?? "");
    setLastName(u.lastName ?? "");
    setEmail(u.email ?? "");
    setCompanyName(u.companyName ?? "");
    setIdno(u.idno ?? "");
  }, [locale, router]);

  if (!auth) {
    return (
      <div className="min-h-svh bg-[#080808] flex items-center justify-center">
        <p className="text-sm text-[#666] font-figtree">Loading...</p>
      </div>
    );
  }

  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const displayName = `${firstName} ${lastName}`.trim() || (auth.user.phoneNumber ?? "—");

  async function handleSave() {
    setSaving(true);
    setSaveError(false);
    try {
      // Update localStorage profile immediately
      updateAuthProfile({ firstName, lastName, email: email || null, companyName: companyName || null, idno: idno || null });
      router.push(`/${locale}/account/profile`);
    } catch {
      setSaveError(true);
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push(`/${locale}/account/profile`);
  }

  return (
    <div className="min-h-svh bg-[#080808] flex flex-col">
      <AccountTopBar
        locale={locale}
        initials={initials}
        displayName={displayName}
        email={auth.user.email}
        navDict={dict.nav}
      />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-[1728px]">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 2xl:px-0 py-14">

            {/* Page header */}
            <div className="flex items-start justify-between gap-4 mb-10">
              <div>
                <h1 className="text-[40px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-none mb-2">
                  {d.title}
                </h1>
                <p className="text-[15px] text-[#888] font-figtree tracking-tight">{d.subtitle}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2.5 border border-[#2a2a2a] text-sm font-medium text-[#888] font-figtree tracking-tight hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {d.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2.5 border border-[#3a3a3a] bg-[#f0f0f0] text-sm font-medium text-[#080808] font-figtree tracking-tight hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {d.save}
                </button>
              </div>
            </div>

            {/* Avatar + identity row */}
            <div className="flex items-center gap-4 mb-10">
              <div className="size-14 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                <span className="text-[18px] font-semibold text-[#f0f0f0] font-figtree">{initials}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-[18px] font-semibold text-[#f0f0f0] font-figtree tracking-tight leading-tight">
                  {displayName}
                </p>
                {auth.user.email && (
                  <p className="text-[13px] text-[#888] font-figtree tracking-tight">{auth.user.email}</p>
                )}
                {auth.user.phoneNumber && (
                  <p className="text-[13px] text-[#4ade80] font-figtree tracking-tight">{auth.user.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Personal details form */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-1">
                <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase shrink-0">
                  {d.section_personal}
                </p>
                <div className="flex-1 h-px bg-[#1e1e1e]" />
              </div>
              <div className="border border-[#1e1e1e] p-6 mt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <FieldLabel>{d.first_name_label}</FieldLabel>
                    <TextInput value={firstName} onChange={setFirstName} />
                  </div>
                  <div>
                    <FieldLabel>{d.last_name_label}</FieldLabel>
                    <TextInput value={lastName} onChange={setLastName} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>{d.email_label}</FieldLabel>
                    <TextInput value={email} onChange={setEmail} placeholder="email@example.com" />
                  </div>
                  <div>
                    <FieldLabel>{d.phone_label}</FieldLabel>
                    <TextInput value={auth.user.phoneNumber ?? ""} onChange={() => {}} disabled />
                    {d.phone_note && (
                      <p className="text-[11px] text-[#555] font-figtree tracking-tight mt-1.5">{d.phone_note}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company details form */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-1">
                <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase shrink-0">
                  {d.section_company}
                </p>
                <span className="text-[11px] text-[#555] font-figtree tracking-tight">{d.optional_label}</span>
                <div className="flex-1 h-px bg-[#1e1e1e]" />
              </div>
              <div className="border border-[#1e1e1e] p-6 mt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <FieldLabel>{d.company_label}</FieldLabel>
                    <TextInput value={companyName} onChange={setCompanyName} placeholder={d.company_placeholder} />
                  </div>
                  <div>
                    <FieldLabel>{d.idno_label}</FieldLabel>
                    <TextInput value={idno} onChange={setIdno} placeholder={d.idno_placeholder} />
                  </div>
                </div>
                <div>
                  <FieldLabel>{d.notes_label}</FieldLabel>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={d.notes_placeholder}
                    rows={4}
                    className="w-full px-3.5 py-3 border border-[#2a2a2a] bg-[#111] text-[14px] text-[#f0f0f0] font-figtree tracking-tight placeholder-[#444] focus:outline-none focus:border-[#4a4a4a] resize-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {saveError && (
              <p className="text-sm text-red-400 font-figtree tracking-tight mb-4">{d.save_error}</p>
            )}

            {/* Bottom action bar */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2.5 border border-[#2a2a2a] text-sm font-medium text-[#888] font-figtree tracking-tight hover:text-[#f0f0f0] hover:border-[#3a3a3a] transition-colors cursor-pointer disabled:opacity-50"
              >
                {d.cancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 border border-[#3a3a3a] bg-[#f0f0f0] text-sm font-medium text-[#080808] font-figtree tracking-tight hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {d.save}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
