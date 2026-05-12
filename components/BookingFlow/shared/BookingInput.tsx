"use client";

interface BookingInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "time";
  multiline?: boolean;
  disabled?: boolean;
}

export default function BookingInput({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  multiline = false,
  disabled = false,
}: BookingInputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={5}
          className="w-full bg-[#111] border border-[#303030] px-3 py-3.5 text-base text-[#f1f1f1] placeholder:text-[#747474] font-figtree tracking-tight resize-none focus:outline-none focus:border-[#474747] transition-colors disabled:opacity-50"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-[#111] border border-[#303030] px-3 py-3.5 text-base text-[#f1f1f1] placeholder:text-[#747474] font-figtree tracking-tight focus:outline-none focus:border-[#474747] transition-colors disabled:opacity-50"
        />
      )}
    </div>
  );
}
