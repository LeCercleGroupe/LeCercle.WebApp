"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  ariaLabel?: string;
}

// Mouse-driven dropdown matching the dark admin theme (native <select> options
// can't be styled to fit). Click to open, click an option to select and close.
export default function SelectMenu({ value, onChange, options, placeholder, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        className="flex items-center gap-2 bg-[#0c0c0c] border border-[#2a2a2a] text-[13px] font-figtree tracking-tight px-3 py-2 hover:border-[#3a3a3a] focus:outline-none focus:border-[#4a4a4a] transition-colors cursor-pointer"
      >
        <span className={selectedLabel ? "text-[#f0f0f0]" : "text-[#555]"}>
          {selectedLabel ?? placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#666]">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-full max-h-64 overflow-auto bg-[#111] border border-[#2a2a2a] shadow-2xl py-1">
          {options.map((opt) => (
            <button
              key={opt.value || "__all"}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left whitespace-nowrap px-3 py-2 text-[13px] font-figtree tracking-tight transition-colors cursor-pointer ${
                opt.value === value
                  ? "bg-[#1e1e1e] text-[#f0f0f0]"
                  : "text-[#c0c0c0] hover:bg-[#1a1a1a] hover:text-[#f0f0f0]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
