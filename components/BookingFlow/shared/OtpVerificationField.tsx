"use client";

import { useState } from "react";

interface OtpVerificationFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inputType?: "tel" | "email";
  placeholder?: string;
  isFilled: boolean;
  initialVerified?: boolean;
  hint: string;
  sendLabel: string;
  sendErrorMessage: string;
  codePlaceholder: string;
  verifyLabel: string;
  verifiedLabel: string;
  codeErrorMessage: string;
  changeLabel: string;
  onSend: () => Promise<void>;
  onVerify: (code: string) => Promise<void>;
}

type OtpState = "idle" | "sent" | "verified";

export default function OtpVerificationField({
  label,
  value,
  onChange,
  inputType = "tel",
  placeholder = "",
  isFilled,
  initialVerified = false,
  hint,
  sendLabel,
  sendErrorMessage,
  codePlaceholder,
  verifyLabel,
  verifiedLabel,
  codeErrorMessage,
  changeLabel,
  onSend,
  onVerify,
}: OtpVerificationFieldProps) {
  const [otpState, setOtpState] = useState<OtpState>(initialVerified ? "verified" : "idle");
  const [code, setCode] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState(false);

  async function handleSend() {
    setSendLoading(true);
    setSendError(null);
    try {
      await onSend();
      setOtpState("sent");
    } catch {
      setSendError(sendErrorMessage);
    } finally {
      setSendLoading(false);
    }
  }

  async function handleVerify() {
    if (code.length !== 6) { setCodeError(true); return; }
    setVerifyLoading(true);
    setCodeError(false);
    try {
      await onVerify(code);
      setOtpState("verified");
    } catch {
      setCodeError(true);
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">{label}</label>
      <div className="flex gap-2">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={otpState !== "idle"}
          className="flex-1 bg-[#111] border border-[#303030] px-3 py-3.5 text-base text-[#f1f1f1] placeholder:text-[#747474] font-figtree tracking-tight focus:outline-none focus:border-[#474747] transition-colors disabled:opacity-50"
        />
        {otpState === "idle" && (
          <button
            onClick={handleSend}
            disabled={!isFilled || sendLoading}
            className={`shrink-0 px-4 border text-sm font-medium font-figtree tracking-tight transition-all duration-200 ${
              isFilled && !sendLoading
                ? "bg-[#111] border-[#37a067] text-[#37a067] hover:bg-[#0e1f17] cursor-pointer"
                : "bg-[#111] border-[#303030] text-[#474747] cursor-not-allowed"
            }`}
          >
            {sendLoading
              ? <div className="size-4 border border-[#474747] border-t-transparent rounded-full animate-spin mx-2" />
              : sendLabel}
          </button>
        )}
        {otpState === "verified" && (
          <div className="flex items-center gap-1.5 shrink-0 px-3 border border-[#37a067] text-[#37a067]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7l3 3 6-6" stroke="#37a067" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium font-figtree tracking-tight">{verifiedLabel}</span>
          </div>
        )}
      </div>

      {sendError && (
        <p className="text-xs text-red-400 font-figtree tracking-tight">{sendError}</p>
      )}

      {otpState === "sent" && (
        <div className="flex flex-col gap-2 mt-1">
          <p className="text-xs text-[#a8a8a8] font-figtree tracking-tight">{hint}</p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setCodeError(false); }}
              placeholder={codePlaceholder}
              className={`flex-1 bg-[#111] border px-3 py-3.5 text-base text-[#f1f1f1] placeholder:text-[#747474] font-figtree tracking-tight focus:outline-none transition-colors ${
                codeError ? "border-red-500" : "border-[#303030] focus:border-[#474747]"
              }`}
            />
            <button
              onClick={handleVerify}
              disabled={verifyLoading}
              className="shrink-0 px-4 bg-[#37a067] text-white text-sm font-medium font-figtree tracking-tight hover:bg-[#2d8a58] transition-colors cursor-pointer disabled:opacity-60"
            >
              {verifyLoading
                ? <div className="size-4 border border-white/40 border-t-white rounded-full animate-spin mx-2" />
                : verifyLabel}
            </button>
          </div>
          {codeError && <p className="text-xs text-red-400 font-figtree tracking-tight">{codeError && codeErrorMessage}</p>}
          <button
            onClick={() => { setOtpState("idle"); setSendError(null); setCode(""); }}
            className="text-xs text-[#a8a8a8] underline font-figtree tracking-tight text-left w-fit hover:text-[#f1f1f1] transition-colors"
          >
            {changeLabel}
          </button>
        </div>
      )}
    </div>
  );
}
