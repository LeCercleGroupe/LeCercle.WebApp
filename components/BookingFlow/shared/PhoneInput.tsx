"use client";

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export default function PhoneInput({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "6X XXX XXX",
  compact = false,
}: PhoneInputProps) {
  function handleChange(raw: string) {
    let digits = raw.replace(/\D/g, "");
    // Strip the country code whether whole or partial (3, 37, 373) so the
    // user can delete/replace digits without the +373 prefix re-appearing.
    if (digits.startsWith("373")) digits = digits.slice(3);
    else if (digits.startsWith("37")) digits = digits.slice(2);
    else if (digits.startsWith("3")) digits = digits.slice(1);
    onChange("+373" + digits.slice(0, 8));
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">
          {label}
        </label>
      )}
      <div className="flex gap-0">
        <div className={`flex items-center gap-2 px-3 bg-[#111] border border-r-0 border-[#303030] shrink-0 ${compact ? "py-3" : ""}`}>
          <span className="text-base leading-none">🇲🇩</span>
          <span className="text-sm text-[#a8a8a8] font-figtree tracking-tight">+373</span>
        </div>
        <input
          type="tel"
          value={value.replace(/^\+373/, "")}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`flex-1 bg-[#111] border border-[#303030] px-3 font-figtree tracking-tight focus:outline-none focus:border-[#474747] transition-colors disabled:opacity-50 min-w-0 placeholder:text-[#747474] ${compact ? "py-3 text-[14px] text-[#f0f0f0]" : "py-3.5 text-base text-[#f1f1f1]"}`}
        />
      </div>
    </div>
  );
}
