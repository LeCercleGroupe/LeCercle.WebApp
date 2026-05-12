"use client";

import { clearAuth } from "@/components/BookingFlow/utils/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavDict {
  events: string;
  contracts: string;
  profile: string;
  logout: string;
}

interface Props {
  locale: string;
  initials: string;
  displayName: string;
  email?: string | null;
  navDict: NavDict;
}

const LOCALES = ["ro", "en", "ru"] as const;

export default function AccountTopBar({
  locale,
  initials,
  displayName,
  email,
  navDict,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    clearAuth();
    setOpen(false);
    router.push(`/${locale}`);
  }

  function switchLocale(next: string) {
    if (typeof window === "undefined") return;
    const segments = window.location.pathname.split("/");
    segments[1] = next;
    const newPath = segments.join("/") + window.location.search;
    router.push(newPath);
    setOpen(false);
  }

  return (
    <header className="w-full bg-[#080808] border-b border-[#1a1a1a] h-18 flex items-center shrink-0 z-30">
      <div className="w-full max-w-432 mx-auto px-0 flex items-center">
        {/* Left spacer to align with content */}
        <div className="w-68.5 shrink-0" />

        {/* Inner 1180px area */}
        <div className="flex-1 flex items-center justify-between px-0 max-w-295">
          <Link href={`/${locale}`} className="relative h-10 w-27">
            <Image
              src="/logos/LeCercle.svg"
              alt="Le Cercle"
              fill
              className="object-contain object-left"
            />
          </Link>

          {/* Avatar + dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="size-8.5 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#444] transition-colors flex items-center justify-center cursor-pointer"
            >
              <span className="text-[12px] font-semibold text-[#f0f0f0] font-figtree tracking-tight select-none">
                {initials}
              </span>
            </button>

            {open && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-55 bg-[#111] border border-[#2a2a2a] shadow-xl z-50 py-1">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[#1e1e1e]">
                  <p className="text-sm font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
                    {displayName}
                  </p>
                  {email && (
                    <p className="text-xs text-[#666] font-figtree tracking-tight truncate mt-0.5">
                      {email}
                    </p>
                  )}
                </div>

                {/* Navigation */}
                <div className="py-1">
                  {(
                    [
                      ["events", `/${locale}/account`],
                      ["contracts", `/${locale}/account/contracts`],
                      ["profile", `/${locale}/account/profile`],
                    ] as [keyof NavDict, string][]
                  ).map(([key, href]) => (
                    <Link
                      key={key}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-[#c0c0c0] font-figtree tracking-tight hover:text-[#f0f0f0] hover:bg-[#1a1a1a] transition-colors"
                    >
                      {navDict[key]}
                    </Link>
                  ))}
                </div>

                {/* Language switcher */}
                <div className="border-t border-[#1e1e1e] px-4 py-2.5 flex gap-2">
                  {LOCALES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => switchLocale(l)}
                      className={`text-xs font-medium font-figtree tracking-wide uppercase px-2 py-1 transition-colors cursor-pointer ${
                        l === locale
                          ? "text-[#f0f0f0] bg-[#222] border border-[#333]"
                          : "text-[#666] hover:text-[#f0f0f0]"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-[#1e1e1e] py-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-[#888] font-figtree tracking-tight hover:text-[#f87171] hover:bg-[#1a0a0a] transition-colors cursor-pointer text-left"
                  >
                    {navDict.logout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right spacer */}
        <div className="w-68.5 shrink-0" />
      </div>
    </header>
  );
}
