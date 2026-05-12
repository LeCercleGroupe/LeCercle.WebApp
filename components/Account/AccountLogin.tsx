"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BookingNavbar from "@/components/BookingFlow/shared/BookingNavbar";
import BookingInput from "@/components/BookingFlow/shared/BookingInput";
import PhoneInput from "@/components/BookingFlow/shared/PhoneInput";
import PrimaryButton from "@/components/BookingFlow/shared/PrimaryButton";
import { saveAuth, loadAuth } from "@/components/BookingFlow/utils/auth";

type Tab = "login" | "register";
type ContactType = "person" | "company";
type OtpState = "idle" | "sending" | "sent" | "verifying" | "done";

interface LoginDict {
  tab: string;
  tab_register: string;
  title: string;
  subtitle: string;
  phone_label: string;
  code_valid: string;
  send_code: string;
  confirm_title: string;
  confirm_subtitle: string;
  enter_account: string;
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

function OtpCodeInput({
  value,
  onChange,
  hasError,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder={placeholder}
      className={`w-full bg-[#111] border px-3 py-3.5 text-base text-[#f1f1f1] placeholder:text-[#747474] font-figtree tracking-[0.3em] text-center focus:outline-none transition-colors ${
        hasError ? "border-red-500" : "border-[#303030] focus:border-[#474747]"
      }`}
    />
  );
}

export default function AccountLogin({ locale, dict }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const tokenRef = useRef<string | null>(null);

  // Fetch service token for OTP API calls
  useEffect(() => {
    fetch("/api/booking/token")
      .then((r) => r.json())
      .then(({ access_token }) => { tokenRef.current = access_token; })
      .catch(() => {});
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const result = loadAuth();
    if (result?.tokensValid) router.replace(`/${locale}/account`);
  }, [locale, router]);

  function authHeader(): Record<string, string> {
    return tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {};
  }

  // ── LOGIN STATE ──────────────────────────────────────────────────────────
  const [loginPhone, setLoginPhone] = useState("+373");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpState, setLoginOtpState] = useState<OtpState>("idle");
  const [loginSendError, setLoginSendError] = useState(false);
  const [loginCodeError, setLoginCodeError] = useState(false);
  const [loginNoAccount, setLoginNoAccount] = useState(false);

  const loginPhoneFilled = /^\+373\d{8}$/.test(loginPhone);

  async function handleLoginSend() {
    setLoginSendError(false);
    setLoginOtpState("sending");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginPhone }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setLoginOtpState("sent");
    } catch {
      setLoginSendError(true);
      setLoginOtpState("idle");
    }
  }

  async function handleLoginVerify() {
    if (loginOtp.length !== 6) { setLoginCodeError(true); return; }
    setLoginCodeError(false);
    setLoginNoAccount(false);
    setLoginOtpState("verifying");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginPhone, code: loginOtp }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      // Login mode: if the backend says this is a brand-new user, no account
      // existed for this phone. Don't save auth — prompt them to sign up.
      if (data.user?.isNewUser === true) {
        setLoginNoAccount(true);
        setLoginOtpState("sent");
        return;
      }
      const userId = data.user?.userId ?? data.userId ?? "";
      const customerId = data.user?.customerId ?? data.customerId ?? "";
      // OTP verify response omits explicit firstName/lastName fields but
      // includes a `displayName` like "Jane Smith". Split on whitespace to
      // populate the local profile (`/api/auth/me` is workforce-only, so we
      // can't fetch the real profile and have to derive it from the JWT
      // response payload).
      const existingUser = loadAuth()?.auth.user;
      const display = (data.user?.displayName ?? "").trim();
      const [derivedFirst = "", ...rest] = display.split(/\s+/);
      const derivedLast = rest.join(" ");
      saveAuth({
        accessToken: data.accessToken ?? "",
        refreshToken: data.refreshToken ?? "",
        expiresIn: data.expiresIn ?? 3600,
        userId,
        customerId,
        email: data.user?.email ?? existingUser?.email ?? "",
        phone: data.user?.phoneNumber ?? loginPhone,
        firstName: data.user?.firstName ?? derivedFirst ?? existingUser?.firstName ?? "",
        lastName: data.user?.lastName ?? derivedLast ?? existingUser?.lastName ?? "",
        companyName: data.user?.companyName ?? existingUser?.companyName ?? "",
        idno: data.user?.idno ?? existingUser?.idno ?? "",
        isCompany: data.user?.isCompany ?? existingUser?.isCompany ?? false,
      });
      setLoginOtpState("done");
      router.push(`/${locale}/account`);
    } catch {
      setLoginCodeError(true);
      setLoginOtpState("sent");
    }
  }

  // ── REGISTER STATE ───────────────────────────────────────────────────────
  const [contactType, setContactType] = useState<ContactType>("person");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("+373");
  const [regCompany, setRegCompany] = useState("");
  const [regIdno, setRegIdno] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [regOtpState, setRegOtpState] = useState<OtpState>("idle");
  const [regSendError, setRegSendError] = useState(false);
  const [regCodeError, setRegCodeError] = useState(false);

  const isCompany = contactType === "company";
  const regPhoneFilled = /^\+373\d{8}$/.test(regPhone);
  const regFormFilled =
    regFirstName.trim() !== "" &&
    regLastName.trim() !== "" &&
    regPhoneFilled &&
    (!isCompany || (regCompany.trim() !== "" && regIdno.trim().length === 13));

  const d = dict.login;
  const r = dict.register;

  async function handleRegSend() {
    setRegSendError(false);
    setRegOtpState("sending");
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: regPhone }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setRegOtpState("sent");
    } catch {
      setRegSendError(true);
      setRegOtpState("idle");
    }
  }

  async function handleRegVerify() {
    if (regOtp.length !== 6) { setRegCodeError(true); return; }
    setRegCodeError(false);
    setRegOtpState("verifying");
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { ...authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: regPhone,
          code: regOtp,
          customerType: isCompany ? 1 : 0,
          firstName: isCompany ? null : regFirstName,
          lastName: isCompany ? null : regLastName,
          companyName: isCompany ? regCompany : null,
          idno: isCompany ? regIdno : null,
          email: regEmail || null,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const userId = data.user?.userId ?? data.userId ?? "";
      const customerId = data.user?.customerId ?? data.customerId ?? "";
      saveAuth({
        accessToken: data.accessToken ?? "",
        refreshToken: data.refreshToken ?? "",
        expiresIn: data.expiresIn ?? 3600,
        userId,
        customerId,
        email: regEmail,
        phone: regPhone,
        firstName: regFirstName,
        lastName: regLastName,
        companyName: regCompany,
        idno: regIdno,
        isCompany,
      });
      setRegOtpState("done");
      router.push(`/${locale}/account`);
    } catch {
      setRegCodeError(true);
      setRegOtpState("sent");
    }
  }

  const loginSending = loginOtpState === "sending";
  const loginVerifying = loginOtpState === "verifying";
  const regSending = regOtpState === "sending";
  const regVerifying = regOtpState === "verifying";

  return (
    <div className="flex flex-col min-h-svh bg-[#0d0d0d]">
      <BookingNavbar locale={locale} />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-lg flex flex-col gap-6">

          {/* Tabs */}
          <div className="flex gap-0">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium font-figtree tracking-tight border transition-all duration-200 ${
                  tab === t
                    ? "bg-[#1b1b1b] border-[#474747] text-[#f1f1f1]"
                    : "bg-transparent border-[#303030] text-[#a8a8a8] hover:border-[#474747]"
                }`}
              >
                {t === "login" ? d.tab : d.tab_register}
              </button>
            ))}
          </div>

          {/* ── LOGIN PANEL ─────────────────────────────────────────────── */}
          {tab === "login" && (
            <div className="flex flex-col gap-6">
              {loginOtpState === "idle" || loginOtpState === "sending" ? (
                <>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight">{d.title}</h2>
                    <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight leading-snug">{d.subtitle}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">{d.phone_label}</label>
                    <PhoneInput value={loginPhone} onChange={setLoginPhone} disabled={loginSending} />
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#474747]">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      <p className="text-xs text-[#747474] font-figtree tracking-tight">{d.code_valid}</p>
                    </div>
                    {loginSendError && (
                      <p className="text-xs text-red-400 font-figtree tracking-tight">{d.send_error}</p>
                    )}
                  </div>

                  <p className="text-xs text-[#747474] font-figtree tracking-tight text-center">
                    {d.no_account}{" "}
                    <button
                      type="button"
                      onClick={() => setTab("register")}
                      className="text-[#a8a8a8] underline hover:text-[#f1f1f1] transition-colors"
                    >
                      {d.register_link}
                    </button>
                  </p>

                  <PrimaryButton
                    label={loginSending ? "" : d.send_code}
                    onClick={handleLoginSend}
                    disabled={!loginPhoneFilled || loginSending}
                    loading={loginSending}
                  />
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight">{d.confirm_title}</h2>
                    <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight leading-snug">
                      {d.confirm_subtitle.replace("{phone}", loginPhone)}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setLoginOtpState("idle"); setLoginOtp(""); setLoginCodeError(false); setLoginNoAccount(false); }}
                      className="text-xs text-[#747474] underline font-figtree tracking-tight text-left w-fit hover:text-[#f1f1f1] transition-colors mt-1"
                    >
                      {d.change_number}
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <OtpCodeInput
                      value={loginOtp}
                      onChange={(v) => { setLoginOtp(v); setLoginCodeError(false); }}
                      hasError={loginCodeError}
                      placeholder="000000"
                    />
                    {loginCodeError && !loginNoAccount && (
                      <p className="text-xs text-red-400 font-figtree tracking-tight">{d.code_error}</p>
                    )}
                    {loginNoAccount && (
                      <div className="flex flex-col gap-2 px-3 py-2.5 border border-[#4a3510] bg-[#2a1f07]">
                        <p className="text-xs text-[#fbbf24] font-figtree tracking-tight leading-snug">
                          {d.no_account_error}
                        </p>
                        <button
                          type="button"
                          onClick={() => { setTab("register"); setLoginNoAccount(false); }}
                          className="text-xs text-[#fbbf24] underline font-figtree tracking-tight text-left w-fit hover:text-[#fde68a] transition-colors"
                        >
                          {d.register_link}
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setLoginOtp(""); setLoginCodeError(false); setLoginNoAccount(false); handleLoginSend(); }}
                      className="text-xs text-[#747474] underline font-figtree tracking-tight text-left w-fit hover:text-[#f1f1f1] transition-colors"
                    >
                      {d.resend}
                    </button>
                  </div>

                  <PrimaryButton
                    label={d.enter_account}
                    onClick={handleLoginVerify}
                    disabled={loginOtp.length !== 6 || loginVerifying || loginNoAccount}
                    loading={loginVerifying}
                  />
                </>
              )}
            </div>
          )}

          {/* ── REGISTER PANEL ──────────────────────────────────────────── */}
          {tab === "register" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight">{r.title}</h2>
                <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight leading-snug">{r.subtitle}</p>
              </div>

              {/* Person/Company toggle */}
              <div className="flex gap-0">
                {(["person", "company"] as ContactType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setContactType(t)}
                    disabled={regOtpState !== "idle"}
                    className={`flex-1 py-2.5 text-sm font-medium font-figtree tracking-tight border transition-all duration-200 ${
                      contactType === t
                        ? "bg-[#1b1b1b] border-[#474747] text-[#f1f1f1]"
                        : "bg-transparent border-[#303030] text-[#a8a8a8] hover:border-[#474747]"
                    } disabled:opacity-50`}
                  >
                    {t === "person" ? r.tab_person : r.tab_company}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                {isCompany && (
                  <>
                    <BookingInput
                      label={r.company_name_label}
                      value={regCompany}
                      onChange={(v) => setRegCompany(v)}
                      placeholder={r.company_name_placeholder}
                      disabled={regOtpState !== "idle"}
                    />
                    <BookingInput
                      label={r.idno_label}
                      value={regIdno}
                      onChange={(v) => setRegIdno(v.replace(/\D/g, "").slice(0, 13))}
                      placeholder={r.idno_placeholder}
                      disabled={regOtpState !== "idle"}
                    />
                  </>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <BookingInput
                    label={r.first_name_label}
                    value={regFirstName}
                    onChange={setRegFirstName}
                    placeholder={r.first_name_placeholder}
                    disabled={regOtpState !== "idle"}
                  />
                  <BookingInput
                    label={r.last_name_label}
                    value={regLastName}
                    onChange={setRegLastName}
                    placeholder={r.last_name_placeholder}
                    disabled={regOtpState !== "idle"}
                  />
                </div>

                <BookingInput
                  label={r.email_label}
                  value={regEmail}
                  onChange={setRegEmail}
                  placeholder={r.email_placeholder}
                  type="email"
                  disabled={regOtpState !== "idle"}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">{r.phone_label}</label>
                  <PhoneInput value={regPhone} onChange={(v) => { setRegPhone(v); setRegOtpState("idle"); }} disabled={regOtpState !== "idle"} />
                  {regOtpState === "idle" && (
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#474747]">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      <p className="text-xs text-[#747474] font-figtree tracking-tight">{r.code_notice}</p>
                    </div>
                  )}
                  {regSendError && (
                    <p className="text-xs text-red-400 font-figtree tracking-tight">{r.send_error}</p>
                  )}
                </div>

                {/* OTP section after send */}
                {(regOtpState === "sent" || regOtpState === "verifying") && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#a8a8a8] font-figtree tracking-tight">
                      {r.sms_hint.replace("{phone}", regPhone)}
                    </p>
                    <OtpCodeInput
                      value={regOtp}
                      onChange={(v) => { setRegOtp(v); setRegCodeError(false); }}
                      hasError={regCodeError}
                      placeholder={r.sms_code_placeholder}
                    />
                    {regCodeError && (
                      <p className="text-xs text-red-400 font-figtree tracking-tight">{r.code_error}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => { setRegOtp(""); setRegCodeError(false); setRegOtpState("idle"); }}
                      className="text-xs text-[#747474] underline font-figtree tracking-tight text-left w-fit hover:text-[#f1f1f1] transition-colors"
                    >
                      {r.change_number}
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-[#747474] font-figtree tracking-tight text-center">
                {r.has_account}{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="text-[#a8a8a8] underline hover:text-[#f1f1f1] transition-colors"
                >
                  {r.login_link}
                </button>
              </p>

              {regOtpState === "idle" || regOtpState === "sending" ? (
                <PrimaryButton
                  label={r.send_code}
                  onClick={handleRegSend}
                  disabled={!regFormFilled || regSending}
                  loading={regSending}
                />
              ) : (
                <PrimaryButton
                  label={r.access_account}
                  onClick={handleRegVerify}
                  disabled={regOtp.length !== 6 || regVerifying}
                  loading={regVerifying}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
