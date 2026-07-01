"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AdminDict, AdminUser } from "./shared/types";

const LOCALES = ["ro", "en", "ru"] as const;

interface Props {
  locale: string;
  user: AdminUser;
  dict: AdminDict;
}

export default function AdminNavbar({ locale, user, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(next: string) {
    if (typeof window === "undefined") return;
    const segments = window.location.pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") + window.location.search);
  }

  function handleLogout() {
    setOpen(false);
    // Top-level navigation (not fetch): the endpoint clears the session cookies
    // and redirects through Microsoft's single sign-out, ending the SSO session
    // so the next login can't silently re-join the previous account.
    window.location.href = `/api/auth/entra/logout?returnTo=/${locale}`;
  }

  const initials =
    user.name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <header className="w-full bg-[#080808] border-b border-[#141414] shrink-0 z-30">
      <div className="flex items-center justify-between px-5 py-3.5 sm:px-8 sm:py-4">
        {/* Logo → home */}
        <Link href={`/${locale}`} className="shrink-0">
          <Image
            src="/logos/LeCercle.svg"
            alt="Le Cercle"
            width={120}
            height={44}
            priority
            className="w-24 sm:w-28 h-auto drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)]"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Language switcher */}
          <div className="flex gap-1">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLocale(l)}
                className={`text-[11px] font-medium font-figtree tracking-widest uppercase px-2 py-1 transition-colors cursor-pointer ${
                  l === locale
                    ? "text-[#f0f0f0] bg-[#222] border border-[#333]"
                    : "text-[#555] hover:text-[#f0f0f0]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* User dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="size-9 rounded-full flex items-center justify-center border border-white/20 hover:border-white/50 transition-all duration-200 shrink-0 cursor-pointer"
              style={{ backgroundColor: "rgba(196,151,63,0.85)" }}
            >
              <span className="text-[11px] font-semibold text-[#0d0d0d] font-figtree leading-none select-none">
                {initials}
              </span>
            </button>

            {open && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-[#111] border border-[#2a2a2a] shadow-2xl z-50">
                <div className="px-4 py-3.5 border-b border-[#1e1e1e]">
                  <p className="text-sm font-medium text-[#f0f0f0] font-figtree tracking-tight truncate">
                    {user.name}
                  </p>
                  {user.email && (
                    <p className="text-xs text-[#555] font-figtree tracking-tight truncate mt-0.5">
                      {user.email}
                    </p>
                  )}
                  {user.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium font-figtree tracking-wide text-[#c4973f] border border-[#3a2e14] bg-[#171206]"
                        >
                          {role.replace(/^LeCercle\./, "")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-[13px] text-[#666] font-figtree tracking-tight hover:text-[#f87171] hover:bg-[#120808] transition-colors cursor-pointer text-left"
                >
                  {dict.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
