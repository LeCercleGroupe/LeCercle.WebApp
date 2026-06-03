"use client";

import { useRef } from "react";

interface OtpDigitInputProps {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}

export default function OtpDigitInput({ value, onChange, hasError = false }: OtpDigitInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const arr = [...digits];
    arr[index] = digit;
    onChange(arr.join(""));
    if (index < 5) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        const arr = [...digits];
        arr[index] = "";
        onChange(arr.join(""));
      } else if (index > 0) {
        const arr = [...digits];
        arr[index - 1] = "";
        onChange(arr.join(""));
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }

  const borderBase = hasError ? "border-red-500" : "border-[#303030] focus:border-[#474747]";

  return (
    <div className="flex gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`flex-1 w-2 h-14 bg-[#111] border text-xl font-medium text-[#f1f1f1] text-center font-figtree tracking-tight focus:outline-none transition-colors ${borderBase}`}
        />
      ))}
    </div>
  );
}
