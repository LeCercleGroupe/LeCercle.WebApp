import type { ServiceId } from "@/components/BookingFlow/types";
import type { EventBooking } from "@/components/Account/shared/types";

// Shape of the localized strings the admin panel needs. Mirrors the `admin`
// block in app/[lang]/dictionaries/*.json.
export interface AdminDict {
  logout: string;
  access_denied_title: string;
  access_denied_subtitle: string;
  calendar: string;
  today: string;
  events_title: string;
  search_placeholder: string;
  date_from: string;
  date_to: string;
  clear: string;
  filter_all: string;
  filter_confirmed: string;
  filter_pending: string;
  filter_cancelled: string;
  filter_completed: string;
  all_cities: string;
  empty: string;
  loading: string;
  error: string;
  guests: string;
  summary_events: string;
  summary_total: string;
  detail_back: string;
  detail_client: string;
  detail_event: string;
  label_name: string;
  label_phone: string;
  label_email: string;
  label_date: string;
  label_location: string;
  label_guests: string;
  label_total: string;
}

// The signed-in employee, as decoded from the Entra JWT.
export interface AdminUser {
  name: string;
  email: string;
  roles: string[];
}

// An event as surfaced in the admin panel. Extends the customer EventBooking
// with the optional client-contact fields the employee events API may carry on
// the event itself. Field names are read defensively (see eventClient* helpers).
export interface AdminEvent extends EventBooking {
  serviceId?: string;
  customerName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  email?: string;
  phone?: string;
  totalAmount?: number;
}

// An event tagged with the service it was loaded under (used by the calendar,
// where the same event may appear once per service it contains).
export interface TaggedEvent {
  event: AdminEvent;
  serviceId: ServiceId;
}

// Roles allowed to see sensitive fields (money, phone, email). Employees see
// only general data.
export const SENSITIVE_ROLES = ["LeCercle.Manager", "LeCercle.Owner"];

export function canViewSensitive(roles: string[]): boolean {
  return roles.some((role) => SENSITIVE_ROLES.includes(role));
}

export function eventClientName(event: AdminEvent): string {
  const full = [event.contactFirstName, event.contactLastName].filter(Boolean).join(" ").trim();
  return event.customerName || full || "—";
}

export function eventClientEmail(event: AdminEvent): string {
  return event.contactEmail || event.email || "—";
}

export function eventClientPhone(event: AdminEvent): string {
  return event.contactPhone || event.phone || "—";
}

// Which panel is currently shown in the content area. Either the full-page
// calendar or the event list for one service.
export type AdminView =
  | { type: "calendar" }
  | { type: "service"; serviceId: ServiceId };

// The status filter tabs, identical in spirit to the account events overview.
export type StatusFilter = "all" | "confirmed" | "pending" | "cancelled" | "completed";

// Total amount booked for an event, summed across its orders. Admin cares about
// money, so this is surfaced per-row and aggregated in the list footer.
export function eventAmount(event: EventBooking): number {
  const fromOrders = (event.orders ?? []).reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
  if (fromOrders) return fromOrders;
  const direct = (event as AdminEvent).totalAmount;
  return typeof direct === "number" ? direct : 0;
}

// Maps our short locale code to a full BCP-47 tag for Intl formatting.
export function intlLocale(locale: string): string {
  switch (locale) {
    case "ro": return "ro-RO";
    case "ru": return "ru-RU";
    default:   return "en-US";
  }
}
