"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import CigarSvg from "./loading-svgs/CigarSvg";
import MarshmallowSvg from "./loading-svgs/MarshmallowSvg";
import IceCreamSvg from "./loading-svgs/IceCreamSvg";
import ChocolateFountainSvg from "./loading-svgs/ChocolateFountainSvg";
import CalendarSvg from "./loading-svgs/CalendarSvg";
import PersonSvg from "./loading-svgs/PersonSvg";
import LeCercleSvg from "./loading-svgs/LeCercleSvg";

const ROUTE_SVG: Record<string, React.ReactNode> = {
  "/":            <LeCercleSvg />,
  "/lebureau":    <CigarSvg />,
  "/maisondufeu": <MarshmallowSvg />,
  "/laperle":     <IceCreamSvg />,
  "/lafonte":     <ChocolateFountainSvg />,
  "/booking":     <CalendarSvg />,
  "/account":     <PersonSvg />,
};

function matchSvg(href: string): React.ReactNode | null {
  // Strip lang prefix: /ro/lebureau → /lebureau
  const stripped = href.replace(/^\/[a-z]{2}(\/|$)/, "/");
  for (const [key, svg] of Object.entries(ROUTE_SVG)) {
    if (stripped === key || stripped.startsWith(key + "/")) return svg;
  }
  return null;
}

export default function NavigationLoadingOverlay() {
  const pathname = usePathname();
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear overlay when navigation completes
  useEffect(() => {
    setContent(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("http") || href.startsWith("//") || href.startsWith("#")) return;
      const svg = matchSvg(href);
      if (!svg) return;
      setContent(svg);
      // Safety fallback — clear after 10s if navigation never completes
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setContent(null), 60_000);
    }
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex items-center justify-center">
      {content}
    </div>
  );
}
