"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BookingNavbar from "@/components/BookingFlow/shared/BookingNavbar";
import OtpDigitInput from "@/components/BookingFlow/shared/OtpDigitInput";
import PrimaryButton from "@/components/BookingFlow/shared/PrimaryButton";
import { saveAuth, loadAuth, clearAuth } from "@/components/BookingFlow/utils/auth";

type ContactType = "person" | "company";
type OtpState = "idle" | "sending" | "verifying" | "done";
type Step = "phone" | "otp" | "profile";

interface LoginDict {
  tab: string;
  tab_register: string;
  title: string;
  subtitle: string;
  email_label: string;
  // phone_label: string; // uncomment when switching back to phone login
  code_valid: string;
  send_code: string;
  confirm_title: string;
  confirm_subtitle: string;
  enter_account: string;
  continue: string;
  no_account: string;
  register_link: string;
  send_error: string;
  code_error: string;
  no_account_error: string;
  resend: string;
  change_number: string;
}

interface RegisterDict {
  title: string;
  subtitle: string;
  tab_person: string;
  tab_company: string;
  section_personal: string;
  section_company: string;
  first_name_label: string;
  first_name_placeholder: string;
  last_name_label: string;
  last_name_placeholder: string;
  email_label: string;
  email_placeholder: string;
  phone_label: string;
  company_name_label: string;
  company_name_placeholder: string;
  idno_label: string;
  idno_placeholder: string;
  code_notice: string;
  send_code: string;
  access_account: string;
  has_account: string;
  login_link: string;
  send_error: string;
  code_error: string;
  sms_hint: string;
  sms_code_placeholder: string;
  verify: string;
  verified: string;
  change_number: string;
}

export interface AccountDict {
  login: LoginDict;
  register: RegisterDict;
}

interface Props {
  locale: string;
  dict: AccountDict;
}

// ─── Shared sub-components ────────────────────────────────────────────────────


function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[12px] font-medium text-[#888] font-figtree tracking-tight mb-1.5">
      {children}
    </label>
  );
}

function ProfileTextInput({
  value, onChange, placeholder, disabled, type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-3 border border-[#2a2a2a] bg-[#111] text-[14px] text-[#f0f0f0] font-figtree tracking-tight placeholder-[#444] focus:outline-none focus:border-[#4a4a4a] disabled:text-[#555] disabled:cursor-not-allowed transition-colors"
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AccountLogin({ locale, dict }: Props) {
  const router = useRouter();
  const d = dict.login;
  const r = dict.register;
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/booking/token")
      .then((res) => res.json())
      .then(({ access_token }) => { tokenRef.current = access_token; })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const result = loadAuth();
    if (!result?.tokensValid) return;
    // localStorage says auth is valid, but the HTTP-only cookie may be expired.
    // Verify via refresh before redirecting — this also renews the access cookie.
    fetch("/api/auth/refresh", { method: "POST" })
      .then(async (r) => {
        if (r.ok) {
          router.replace(`/${locale}/account`);
          return;
        }
        const body = await r.json().catch(() => ({})) as { error?: string };
        if (body.error === "No refresh token") {
          // The upstream doesn't issue refresh tokens for this auth flow — the
          // access token simply expired. Keep localStorage so the email is
          // pre-filled; the user just needs to re-enter their OTP code.
          fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        } else {
          // Refresh token was present but rejected — full logout.
          clearAuth();
        }
      })
      .catch(() => {
        // Network error — redirect optimistically; account page will handle it.
        router.replace(`/${locale}/account`);
      });
  }, [locale, router]);

  function authHeader(): Record<string, string> {
    return tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};
  }

  // ── Unified flow state ────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("phone");
  // const [phone, setPhone] = useState("+373"); // uncomment when switching back to phone login
  const [otpCode, setOtpCode] = useState("");
  const [isExistingUser, setIsExistingUser] = useState(true);
  const [otpState, setOtpState] = useState<OtpState>("idle");
  const [sendError, setSendError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState(false);

  // ── Profile form state (new users only) ──────────────────────────────────
  const [contactType, setContactType] = useState<ContactType>("person");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [idno, setIdno] = useState("");
  const [profileError, setProfileError] = useState(false);

  const emailFilled = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // const phoneFilled = /^\+373\d{8}$/.test(phone); // uncomment when switching back to phone login
  const isCompany = contactType === "company";
  const profileFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    (!isCompany || (companyName.trim() !== "" && idno.trim().length === 13));

  const sending = otpState === "sending";
  const verifying = otpState === "verifying";

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleSend() {
    setSendError(null);
    setOtpState("sending");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        // body: JSON.stringify({ phoneNumber: phone }), // uncomment when switching back to phone login
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        throw new Error(body.detail ?? `${res.status}`);
      }
      const data = await res.json();
      setIsExistingUser(data.isExistingUser !== false);
      setOtpState("idle");
      setStep("otp");
    } catch (e) {
      setSendError(e instanceof Error ? e.message : d.send_error);
      setOtpState("idle");
    }
  }

  async function handleResend() {
    setOtpCode("");
    setCodeError(false);
    setSendError(null);
    await handleSend();
  }

  function handleChangeEmail() {
    setStep("phone");
    setOtpCode("");
    setCodeError(false);
    setOtpState("idle");
  }

  async function handleVerifyExisting() {
    if (otpCode.length !== 6) { setCodeError(true); return; }
    setCodeError(false);
    setOtpState("verifying");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode }),
        // body: JSON.stringify({ phoneNumber: phone, code: otpCode }), // uncomment when switching back to phone login
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const userId = data.user?.userId ?? data.userId ?? "";
      const customerId = data.user?.customerId ?? data.customerId ?? "";
      const existing = loadAuth()?.auth.user;
      const display = (data.user?.displayName ?? "").trim();
      const [derivedFirst = "", ...restParts] = display.split(/\s+/);
      const derivedLast = restParts.join(" ");
      saveAuth({
        userId,
        customerId,
        email: data.user?.email ?? email ?? "",
        phone: data.user?.phoneNumber ?? existing?.phoneNumber ?? "",
        firstName: data.user?.firstName ?? derivedFirst ?? existing?.firstName ?? "",
        lastName: data.user?.lastName ?? derivedLast ?? existing?.lastName ?? "",
        companyName: data.user?.companyName ?? existing?.companyName ?? "",
        idno: data.user?.idno ?? existing?.idno ?? "",
        isCompany: data.user?.isCompany ?? existing?.isCompany ?? false,
      });
      setOtpState("done");
      router.push(`/${locale}/account`);
    } catch {
      setCodeError(true);
      setOtpState("idle");
    }
  }

  function handleContinueToProfile() {
    if (otpCode.length !== 6) { setCodeError(true); return; }
    setCodeError(false);
    setStep("profile");
  }

  async function handleSubmitProfile() {
    if (!profileFormValid) return;
    setProfileError(false);
    setOtpState("verifying");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          // phoneNumber: phone, // uncomment when switching back to phone login
          code: otpCode,
          customerType: isCompany ? 1 : 0,
          firstName,
          lastName,
          ...(isCompany && companyName && { companyName }),
          ...(isCompany && idno && { idno }),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const userId = data.user?.userId ?? data.userId ?? "";
      const customerId = data.user?.customerId ?? data.customerId ?? "";
      saveAuth({
        userId,
        customerId,
        email: data.user?.email ?? email ?? "",
        phone: data.user?.phoneNumber ?? "",
        firstName: data.user?.firstName ?? firstName,
        lastName: data.user?.lastName ?? lastName,
        companyName: data.user?.companyName ?? (isCompany ? companyName : ""),
        idno: data.user?.idno ?? (isCompany ? idno : ""),
        isCompany: data.user?.isCompany ?? isCompany,
      });
      setOtpState("done");
      router.push(`/${locale}/account`);
    } catch {
      setProfileError(true);
      setOtpState("idle");
    }
  }

  // ── Profile form step (new users) ─────────────────────────────────────────
  if (step === "profile") {
    return (
      <div className="min-h-svh bg-[#080808] flex flex-col">

        {/* Top bar — matches account page aesthetic */}
        <header className="w-full bg-[#080808] border-b border-[#1a1a1a] h-[72px] flex items-center shrink-0 z-30">
          <div className="w-full mx-auto max-w-[1728px]">
            <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 2xl:px-0 flex items-center justify-between">
              <Link
                href={`/${locale}`}
                className="text-[17px] font-medium text-[#f0f0f0] font-figtree tracking-tight hover:text-white transition-colors"
              >
                Le Circle
              </Link>
              <button
                type="button"
                onClick={() => setStep("otp")}
                className="text-[13px] text-[#666] font-figtree tracking-tight hover:text-[#c0c0c0] transition-colors cursor-pointer"
              >
                ← {d.change_number}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">
          <div className="mx-auto max-w-[1728px]">
            <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8 2xl:px-0 py-14">

              {/* Contact type toggle */}
              <div className="flex gap-0 mb-10 max-w-xs">
                {(["person", "company"] as ContactType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setContactType(t)}
                    disabled={verifying}
                    className={`flex-1 py-2.5 text-sm font-medium font-figtree tracking-tight border transition-all cursor-pointer disabled:opacity-50 ${
                      contactType === t
                        ? "bg-[#1b1b1b] border-[#474747] text-[#f0f0f0]"
                        : "bg-transparent border-[#2a2a2a] text-[#888] hover:border-[#474747]"
                    }`}
                  >
                    {t === "person" ? r.tab_person : r.tab_company}
                  </button>
                ))}
              </div>

              {/* Company section */}
              {isCompany && (
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-1">
                    <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase shrink-0">
                      {r.section_company}
                    </p>
                    <div className="flex-1 h-px bg-[#1e1e1e]" />
                  </div>
                  <div className="border border-[#1e1e1e] p-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>{r.company_name_label}</FieldLabel>
                        <ProfileTextInput
                          value={companyName}
                          onChange={setCompanyName}
                          placeholder={r.company_name_placeholder}
                          disabled={verifying}
                        />
                      </div>
                      <div>
                        <FieldLabel>{r.idno_label}</FieldLabel>
                        <ProfileTextInput
                          value={idno}
                          onChange={(v) => setIdno(v.replace(/\D/g, "").slice(0, 13))}
                          placeholder={r.idno_placeholder}
                          disabled={verifying}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal section */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-1">
                  <p className="text-[11px] font-medium text-[#555] font-figtree tracking-[0.12em] uppercase shrink-0">
                    {r.section_personal}
                  </p>
                  <div className="flex-1 h-px bg-[#1e1e1e]" />
                </div>
                <div className="border border-[#1e1e1e] p-6 mt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <FieldLabel>{r.first_name_label}</FieldLabel>
                      <ProfileTextInput
                        value={firstName}
                        onChange={setFirstName}
                        placeholder={r.first_name_placeholder}
                        disabled={verifying}
                      />
                    </div>
                    <div>
                      <FieldLabel>{r.last_name_label}</FieldLabel>
                      <ProfileTextInput
                        value={lastName}
                        onChange={setLastName}
                        placeholder={r.last_name_placeholder}
                        disabled={verifying}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>{r.email_label}</FieldLabel>
                      <ProfileTextInput
                        value={email}
                        onChange={() => {}}
                        type="email"
                        disabled
                      />
                    </div>
                    {/* Phone field — uncomment when switching back to phone login
                    <div>
                      <FieldLabel>{r.phone_label}</FieldLabel>
                      <ProfileTextInput
                        value={phone}
                        onChange={() => {}}
                        disabled
                      />
                    </div>
                    */}
                  </div>
                </div>
              </div>

              {/* Error */}
              {profileError && (
                <p className="text-sm text-red-400 font-figtree tracking-tight mb-6">{r.send_error}</p>
              )}

              {/* Submit */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitProfile}
                  disabled={!profileFormValid || verifying}
                  className="px-6 py-2.5 border border-[#3a3a3a] bg-[#f0f0f0] text-sm font-medium text-[#080808] font-figtree tracking-tight hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? "…" : r.access_account}
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Email & OTP steps (narrow card) ──────────────────────────────────────
  return (
    <div className="flex flex-col min-h-svh bg-[#0d0d0d]">
      <BookingNavbar locale={locale} />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg flex flex-col gap-6">

          {/* ── EMAIL STEP ─────────────────────────────────────────────── */}
          {step === "phone" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight">{d.title}</h2>
                <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight leading-snug">{d.subtitle}</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">
                  {d.email_label}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={sending}
                  placeholder="email@example.com"
                  className="w-full bg-[#111] border border-[#303030] px-3 py-3.5 text-base text-[#f1f1f1] placeholder:text-[#747474] font-figtree tracking-tight focus:outline-none focus:border-[#474747] transition-colors disabled:opacity-50"
                />
                {/* Phone input — uncomment when switching back to phone login
                <PhoneInput value={phone} onChange={setPhone} disabled={sending} />
                */}
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#474747]">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <p className="text-xs text-[#747474] font-figtree tracking-tight">{d.code_valid}</p>
                </div>
                {sendError && (
                  <p className="text-xs text-red-400 font-figtree tracking-tight">{sendError}</p>
                )}
              </div>

              <PrimaryButton
                label={sending ? "" : d.send_code}
                onClick={handleSend}
                disabled={!emailFilled || sending}
                loading={sending}
              />
            </div>
          )}

          {/* ── OTP STEP ───────────────────────────────────────────────── */}
          {step === "otp" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight">
                  {d.confirm_title}
                </h2>
                <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight leading-snug">
                  {d.confirm_subtitle.replace("{email}", email)}
                </p>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-xs text-[#747474] underline font-figtree tracking-tight text-left w-fit hover:text-[#f1f1f1] transition-colors mt-1 cursor-pointer"
                >
                  {d.change_number}
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <OtpDigitInput
                  value={otpCode}
                  onChange={(v) => { setOtpCode(v); setCodeError(false); }}
                  hasError={codeError}
                />
                {codeError && (
                  <p className="text-xs text-red-400 font-figtree tracking-tight">{d.code_error}</p>
                )}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={sending}
                  className="text-xs text-[#747474] underline font-figtree tracking-tight text-left w-fit hover:text-[#f1f1f1] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {d.resend}
                </button>
              </div>

              <PrimaryButton
                label={verifying ? "" : (isExistingUser ? d.enter_account : d.continue)}
                onClick={isExistingUser ? handleVerifyExisting : handleContinueToProfile}
                disabled={otpCode.length !== 6 || verifying}
                loading={verifying}
              />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
