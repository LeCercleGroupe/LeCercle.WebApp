"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SERVICE_IDS, type ServiceId } from "@/components/BookingFlow/types";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import AdminCalendar from "./AdminCalendar";
import ServiceEvents from "./ServiceEvents";
import EmployeesPanel from "./Employees/EmployeesPanel";
import { canManageEmployees, canViewSensitive, type AdminDict, type AdminUser, type AdminView } from "./shared/types";

interface Props {
  locale: string;
  user: AdminUser;
  dict: AdminDict;
}

// The active view is mirrored in a `?view=` query param (service slug, or absent
// for the calendar). This keeps the view across a language switch — which is a
// full navigation to the new locale path that would otherwise remount the panel
// and reset its state — and makes the view refresh-safe.
const SLUG_BY_ID = Object.fromEntries(
  Object.entries(SERVICE_IDS).map(([slug, id]) => [id, slug]),
) as Record<ServiceId, string>;

const EMPLOYEES_PARAM = "employees";

function viewFromParam(param: string | null): AdminView {
  if (param === EMPLOYEES_PARAM) return { type: "employees" };
  if (param && param in SERVICE_IDS) {
    return { type: "service", serviceId: SERVICE_IDS[param as keyof typeof SERVICE_IDS] };
  }
  return { type: "calendar" };
}

export default function AdminPanel({ locale, user, dict }: Props) {
  const searchParams = useSearchParams();
  const [view, setView] = useState<AdminView>(() => viewFromParam(searchParams.get("view")));
  const sensitive = canViewSensitive(user.roles);
  // Manager / Owner gate for staff assignment (RequireManager upstream).
  const manage = canManageEmployees(user.roles);

  function changeView(next: AdminView) {
    setView(next);
    const url = new URL(window.location.href);
    if (next.type === "service") url.searchParams.set("view", SLUG_BY_ID[next.serviceId]);
    else if (next.type === "employees") url.searchParams.set("view", EMPLOYEES_PARAM);
    else url.searchParams.delete("view");
    // Update the address bar without a navigation (no RSC refetch / remount).
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#080808]">
      <AdminNavbar locale={locale} user={user} dict={dict} />

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        <AdminSidebar view={view} onChange={changeView} dict={dict} />

        <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
          {view.type === "calendar" && <AdminCalendar locale={locale} dict={dict} />}
          {view.type === "employees" && (
            <EmployeesPanel locale={locale} user={user} dict={dict} />
          )}
          {view.type === "service" && (
            <ServiceEvents
              key={view.serviceId}
              locale={locale}
              serviceId={view.serviceId}
              dict={dict}
              canViewSensitive={sensitive}
              canManage={manage}
            />
          )}
        </main>
      </div>
    </div>
  );
}
