"use client";

import { useRef, useEffect, useState } from "react";

interface Props<T extends { label: string }> {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (v: T) => void;
  suggestions: T[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  renderSublabel?: (item: T) => string | undefined;
}

export default function AutocompleteInput<T extends { label: string }>({
  label,
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder = "",
  loading = false,
  disabled = false,
  renderSublabel,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const showDropdown = open && (suggestions.length > 0 || loading);

  return (
    <div ref={containerRef} className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-[#a8a8a8] font-figtree tracking-tight">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#111] border border-[#303030] px-3 py-3.5 pr-8 text-base text-[#f1f1f1] placeholder:text-[#747474] font-figtree tracking-tight focus:outline-none focus:border-[#474747] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="size-4 border border-[#474747] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {showDropdown && (
          <ul className="absolute z-20 top-full left-0 right-0 mt-0.5 bg-[#1a1a1a] border border-[#303030] max-h-52 overflow-y-auto">
            {loading && suggestions.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-[#747474] font-figtree">...</li>
            ) : (
              suggestions.map((s, index) => {
                const sub = renderSublabel?.(s);
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect(s);
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-white/6 transition-colors"
                    >
                      <span className="block text-sm text-[#d4d4d4] font-figtree tracking-tight">{s.label}</span>
                      {sub && <span className="block text-xs text-[#747474] font-figtree tracking-tight mt-0.5">{sub}</span>}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
