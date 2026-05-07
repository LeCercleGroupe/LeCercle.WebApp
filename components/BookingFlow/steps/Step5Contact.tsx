"use client";

import type { RefObject } from "react";
import { BookingState, ContactType } from "../types";
import type { BookingDict } from "../dict";
import BookingStepper from "../shared/BookingStepper";
import BackButton from "../shared/BackButton";
import BookingInput from "../shared/BookingInput";
import PrimaryButton from "../shared/PrimaryButton";
import OtpVerificationField from "../shared/OtpVerificationField";

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
  dict: BookingDict;
  stepLabel: string;
  tokenRef: RefObject<string | null>;
}

export default function Step5Contact({ state, onChange, onNext, onBack, dict, stepLabel, tokenRef }: Props) {
  const d = dict.step5;
  const isCompany = state.contactType === "company";

  const typeOptions: { key: ContactType; label: string }[] = [
    { key: "person", label: d.type_person },
    { key: "company", label: d.type_company },
  ];

  const phoneFilled = /^\+373\d{8}$/.test(state.phone);
  const emailFilled = state.email.trim().includes("@");
  const formFilled =
    state.firstName.trim() !== "" &&
    state.lastName.trim() !== "" &&
    state.email.trim() !== "" &&
    phoneFilled &&
    (!isCompany || (state.companyName.trim() !== "" && state.idno.trim() !== ""));

  const canProceed = formFilled && state.emailVerified;

  function handlePhoneChange(raw: string) {
    let digits = raw.replace(/\D/g, "");
    // Strip country code prefix whether whole or partially deleted (+373 → 373, +37 → 37, +3 → 3)
    if (digits.startsWith("373")) digits = digits.slice(3);
    else if (digits.startsWith("37")) digits = digits.slice(2);
    else if (digits.startsWith("3")) digits = digits.slice(1);
    onChange({ phone: "+373" + digits.slice(0, 8), smsVerified: false, smsSent: false });
  }

  function authHeader(): Record<string, string> {
    const token = tokenRef.current;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function handleSendPhone() {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: state.phone }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    onChange({ smsSent: true });
  }

  async function handleVerifyPhone(code: string) {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: state.phone,
        code,
        customerType: isCompany ? 1 : 0,
        firstName: isCompany ? null : state.firstName,
        lastName: isCompany ? null : state.lastName,
        companyName: isCompany ? state.companyName : null,
        idno: isCompany ? state.idno : null,
      }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    onChange({
      smsVerified: true,
      userAccessToken: data.accessToken,
      userRefreshToken: data.refreshToken,
      userId: data.user?.userId ?? "",
      customerId: data.user?.customerId ?? "",
    });
  }

  async function handleSendEmail() {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: state.email }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
  }

  async function handleVerifyEmail(code: string) {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: state.email,
        code,
        customerType: isCompany ? 1 : 0,
        firstName: state.firstName,
        lastName: state.lastName,
        companyName: isCompany ? state.companyName : null,
        idno: isCompany ? state.idno : null,
      }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const customerId =
      data.customerId ?? data.customerID ?? data.user?.customerId ?? data.user?.customerID ?? "";
    const userId =
      data.userId ?? data.userID ?? data.user?.userId ?? data.user?.userID ?? "";
    onChange({
      emailVerified: true,
      userAccessToken: data.accessToken ?? data.accessToken ?? "",
      userRefreshToken: data.refreshToken ?? "",
      userId,
      customerId,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <BookingStepper currentStep={5} label={stepLabel} />
          <BackButton label={dict.back} onClick={onBack} />
        </div>
        <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">{d.title}</h2>
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">{d.subtitle}</p>
      </div>

      <div className="flex gap-2">
        {typeOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange({ contactType: key })}
            className={`flex-1 py-2.5 text-sm font-medium font-figtree tracking-tight border transition-all duration-200 ${
              state.contactType === key
                ? "bg-[#1b1b1b] border-[#474747] text-[#f1f1f1]"
                : "bg-transparent border-[#303030] text-[#a8a8a8] hover:border-[#474747]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {isCompany && (
          <>
            <BookingInput label={d.company_name_label} value={state.companyName} onChange={(v) => onChange({ companyName: v })} placeholder={d.company_name_placeholder} />
            <BookingInput label={d.idno_label} value={state.idno} onChange={(v) => onChange({ idno: v })} placeholder={d.idno_placeholder} />
          </>
        )}

        <div className="flex gap-3">
          <BookingInput label={d.first_name_label} value={state.firstName} onChange={(v) => onChange({ firstName: v })} placeholder={d.first_name_placeholder} />
          <BookingInput label={d.last_name_label} value={state.lastName} onChange={(v) => onChange({ lastName: v })} placeholder={d.last_name_placeholder} />
        </div>

        <OtpVerificationField
          label={d.email_label}
          value={state.email}
          onChange={(v) => onChange({ email: v, emailVerified: false })}
          inputType="email"
          placeholder={d.email_placeholder}
          isFilled={emailFilled}
          initialVerified={state.emailVerified}
          hint={d.email_hint.replace("{email}", state.email)}
          sendLabel={d.send_email}
          sendErrorMessage={d.send_error}
          codePlaceholder={d.sms_code_placeholder}
          verifyLabel={d.verify}
          verifiedLabel={d.verified}
          codeErrorMessage={d.code_error}
          changeLabel={d.change_email}
          onSend={handleSendEmail}
          onVerify={handleVerifyEmail}
        />

        <BookingInput
          label={d.phone_label}
          value={state.phone}
          onChange={handlePhoneChange}
          placeholder={d.phone_placeholder}
          type="tel"
        />
        {/* Phone OTP temporarily disabled — re-enable OtpVerificationField when ready */}
      </div>

      <PrimaryButton label={dict.continue} onClick={onNext} disabled={!canProceed} />
    </div>
  );
}
