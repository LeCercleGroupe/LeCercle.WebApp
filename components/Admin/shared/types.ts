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
  detail_order: string;
  order_loading: string;
  order_error: string;
  order_empty: string;
  checklist_title: string;
  checklist_progress: string;
  checklist_selections: string;
  checklist_transport: string;
  assignments: AssignmentsDict;
  employees: EmployeesDict;
}

// Localized strings for the order-item employee assignment panel (Manager /
// Owner only). Mirrors the `admin.assignments` dictionary block.
export interface AssignmentsDict {
  title: string;
  subtitle: string;
  select_employee: string;
  notes_placeholder: string;
  assign: string;
  assigning: string;
  remove: string;
  empty: string;
  loading: string;
  error: string;
  no_employees: string;
  assigned_by: string;
}

// Localized strings for the employees management view (manager roster + staff
// self-service availability). Mirrors the `admin.employees` dictionary block.
export interface EmployeesDict {
  nav: string;
  roster_title: string;
  roster_subtitle: string;
  self_title: string;
  self_subtitle: string;
  add_employee: string;
  field_userid: string;
  field_specialization: string;
  field_available: string;
  available_yes: string;
  available_no: string;
  hired: string;
  save: string;
  saving: string;
  cancel: string;
  edit: string;
  back: string;
  empty: string;
  loading: string;
  error: string;
  unavail_title: string;
  unavail_add: string;
  unavail_start: string;
  unavail_end: string;
  unavail_reason: string;
  unavail_reason_ph: string;
  unavail_empty: string;
  unavail_remove: string;
  unavail_range_error: string;
  default_title: string;
  default_subtitle: string;
  coming_soon: string;
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
  // The order this event was loaded under. The employee events API carries the
  // id directly on the event (the `orders` array is not embedded here), so the
  // detail view loads it via GET /api/orders/{orderId} without a list lookup.
  orderId?: string;
  customerName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  customerEmail?: string;
  customerPhone?: string;
  email?: string;
  phone?: string;
  totalAmount?: number;
  // Amount booked for the single service this event was loaded under (set by the
  // employee events API when filtering by serviceId). Unlike totalAmount/orders,
  // this excludes other services on the same event.
  serviceTotal?: number;
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

// Roles allowed to manage the employee roster (RequireManager upstream). These
// are the same Manager/Owner roles that may see sensitive fields; plain
// employees get only the self-service availability view.
export function canManageEmployees(roles: string[]): boolean {
  return canViewSensitive(roles);
}

export function eventClientName(event: AdminEvent): string {
  const full = [event.contactFirstName, event.contactLastName].filter(Boolean).join(" ").trim();
  return event.customerName || full || "—";
}

export function eventClientEmail(event: AdminEvent): string {
  return event.customerEmail || event.contactEmail || event.email || "—";
}

export function eventClientPhone(event: AdminEvent): string {
  return event.customerPhone || event.contactPhone || event.phone || "—";
}

// Which panel is currently shown in the content area. Either the full-page
// calendar or the event list for one service.
export type AdminView =
  | { type: "calendar" }
  | { type: "service"; serviceId: ServiceId }
  | { type: "employees" };

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

// Amount booked for the single service an event is shown under in the per-service
// view. Prefers the API-provided serviceTotal, falling back to the whole-event
// amount when it is absent.
export function serviceAmount(event: AdminEvent): number {
  return typeof event.serviceTotal === "number" ? event.serviceTotal : eventAmount(event);
}

// Maps our short locale code to a full BCP-47 tag for Intl formatting.
export function intlLocale(locale: string): string {
  switch (locale) {
    case "ro": return "ro-RO";
    case "ru": return "ru-RU";
    default:   return "en-US";
  }
}
