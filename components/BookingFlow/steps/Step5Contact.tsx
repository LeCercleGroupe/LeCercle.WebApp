"use client";

import type { RefObject } from "react";
import type { BookingDict } from "../dict";
import BackButton from "../shared/BackButton";
import BookingInput from "../shared/BookingInput";
import BookingStepper from "../shared/BookingStepper";
import OtpVerificationField from "../shared/OtpVerificationField";
import PhoneInput from "../shared/PhoneInput";
import PrimaryButton from "../shared/PrimaryButton";
import { BookingState, ContactType } from "../types";
import { saveAuth, updateAuthProfile } from "../utils/auth";

interface Props {
  state: BookingState;
  onChange: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
  dict: BookingDict;
  stepLabel: string;
  tokenRef: RefObject<string | null>;
}

export default function Step5Contact({
  state,
  onChange,
  onNext,
  onBack,
  dict,
  stepLabel,
  tokenRef,
}: Props) {
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
    (!isCompany ||
      (state.companyName.trim() !== "" && state.idno.trim().length === 13));

  const canProceed = formFilled && state.emailVerified;

  function authHeader(): Record<string, string> {
    const token = tokenRef.current;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function handleSendPhone() {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: state.phone }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    onChange({ smsSent: true });
  }

  async function handleVerifyPhone(code: string) {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: state.phone,
        ...(state.email && { email: state.email }),
        code,
        customerType: isCompany ? 1 : 0,
        ...(!isCompany && state.firstName && { firstName: state.firstName }),
        ...(!isCompany && state.lastName && { lastName: state.lastName }),
        ...(isCompany && state.companyName && { companyName: state.companyName }),
        ...(isCompany && state.idno && { idno: state.idno }),
      }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const userId = data.user?.userId ?? data.userId ?? "";
    const customerId = data.user?.customerId ?? data.customerId ?? "";
    onChange({
      smsVerified: true,
      userAccessToken: data.accessToken,
      userRefreshToken: data.refreshToken,
      userId,
      customerId,
    });
    saveAuth({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn ?? 3600,
      userId,
      customerId,
      email: state.email,
      phone: state.phone,
      firstName: state.firstName,
      lastName: state.lastName,
      companyName: state.companyName,
      idno: state.idno,
      isCompany,
    });
  }

  async function handleSendEmail() {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ email: state.email }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    onChange({ emailSent: true });
  }

  async function handleVerifyEmail(code: string) {
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        email: state.email,
        ...(state.phone && state.phone !== "+373" && { phoneNumber: state.phone }),
        code,
        customerType: isCompany ? 1 : 0,
        ...(state.firstName && { firstName: state.firstName }),
        ...(state.lastName && { lastName: state.lastName }),
        ...(isCompany && state.companyName && { companyName: state.companyName }),
        ...(isCompany && state.idno && { idno: state.idno }),
      }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const customerId =
      data.customerId ??
      data.customerID ??
      data.user?.customerId ??
      data.user?.customerID ??
      "";
    const userId =
      data.userId ??
      data.userID ??
      data.user?.userId ??
      data.user?.userID ??
      "";
    onChange({
      emailVerified: true,
      userAccessToken: data.accessToken ?? "",
      userRefreshToken: data.refreshToken ?? "",
      userId,
      customerId,
    });
    saveAuth({
      accessToken: data.accessToken ?? "",
      refreshToken: data.refreshToken ?? "",
      expiresIn: data.expiresIn ?? 3600,
      userId,
      customerId,
      email: state.email,
      phone: state.phone,
      firstName: state.firstName,
      lastName: state.lastName,
      companyName: state.companyName,
      idno: state.idno,
      isCompany,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <BookingStepper currentStep={5} label={stepLabel} />
          <BackButton label={dict.back} onClick={onBack} />
        </div>
        <h2 className="text-2xl font-medium text-[#f1f1f1] font-figtree tracking-tight mt-3">
          {d.title}
        </h2>
        <p className="text-sm text-[#a8a8a8] font-figtree tracking-tight">
          {d.subtitle}
        </p>
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
            <BookingInput
              label={d.company_name_label}
              value={state.companyName}
              onChange={(v) => onChange({ companyName: v })}
              placeholder={d.company_name_placeholder}
            />
            <BookingInput
              label={d.idno_label}
              value={state.idno}
              onChange={(v) => {
                const digits = v.replace(/\D/g, "").slice(0, 13);
                onChange({ idno: digits });
              }}
              placeholder={d.idno_placeholder}
            />
          </>
        )}

        <div className="flex gap-3">
          <BookingInput
            label={d.first_name_label}
            value={state.firstName}
            onChange={(v) => onChange({ firstName: v })}
            placeholder={d.first_name_placeholder}
          />
          <BookingInput
            label={d.last_name_label}
            value={state.lastName}
            onChange={(v) => onChange({ lastName: v })}
            placeholder={d.last_name_placeholder}
          />
        </div>

        <OtpVerificationField
          label={d.email_label}
          value={state.email}
          onChange={(v) => onChange({ email: v, emailSent: false, emailVerified: false })}
          inputType="email"
          placeholder={d.email_placeholder}
          isFilled={emailFilled}
          initialSent={state.emailSent}
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

        <PhoneInput
          label={d.phone_label}
          value={state.phone}
          onChange={(v) =>
            onChange({ phone: v, smsVerified: false, smsSent: false })
          }
        />
        {/* Phone OTP temporarily disabled — re-enable OtpVerificationField when ready */}
      </div>

      <PrimaryButton
        label={dict.continue}
        onClick={() => {
          // Persist latest form values so the dashboard sees the user's
          // complete profile (phone is filled after email verify and would
          // otherwise be lost from the saveAuth call inside handleVerifyEmail).
          updateAuthProfile({
            firstName: state.firstName,
            lastName: state.lastName,
            email: state.email || null,
            phoneNumber:
              state.phone && state.phone !== "+373" ? state.phone : null,
            companyName: isCompany ? state.companyName : null,
            idno: isCompany ? state.idno : null,
            isCompany,
          });
          onNext();
        }}
        disabled={!canProceed}
      />
    </div>
  );
}
