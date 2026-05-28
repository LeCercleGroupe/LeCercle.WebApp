export interface OrderSummary {
  id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  advanceAmount?: number;
}

export interface EventBooking {
  id: string;
  customerId: string;
  eventDate: string;
  venueTitle: string;
  venueAddress: string;
  city: string;
  postalCode?: string;
  eventStartTime: string;
  guestCount: number;
  notes?: string;
  eventType?: string;
  spaceType?: string;
  distanceKm?: number;
  logisticsNotes?: string;
  accessInfo?: string;
  status: string;
  createdAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  refundAmount?: number;
  orders: OrderSummary[];
}

export interface OrderItemFixedFeature {
  featureId: string;
  label: string;
  sortOrder: number;
}

export interface OrderItemSelection {
  packageFeatureId: string;
  featureLabel: string;
  selectedOptionId: string;
  selectedOptionLabel: string;
  additionalCost: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  packageId: string;
  serviceId: string;
  packageName: string;
  serviceName: string;
  unitPrice: number;
  roadPrice: number;
  quantity: number;
  createdAt?: string;
  fixedFeatures?: OrderItemFixedFeature[];
  selections?: OrderItemSelection[];
}

export interface OrderDetail {
  id: string;
  eventId: string;
  customerId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  advanceAmount?: number;
  advancePaidAt?: string;
  contactEmail: string;
  contactPhone: string;
  phoneVerified?: boolean;
  contactFirstName?: string;
  contactLastName?: string;
  contactNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  items: OrderItem[];
}

export interface Contract {
  id: string;
  orderId: string;
  eventId?: string;
  orderNumber: string;
  contractNumber: string;
  documentName?: string;
  status: string;
  generatedAt: string;
  signedAt: string | null;
  fileUrl: string | null;
  eventDate?: string;
  eventTitle?: string;
}

export type EventState = "pending" | "confirmed" | "draft" | "past" | "cancelled";

export function deriveEventState(event: EventBooking, order?: OrderDetail | null): EventState {
  const status = (order?.status ?? event.orders?.[0]?.status ?? event.status ?? "").toLowerCase();
  if (status === "cancelled" || status === "canceled") return "cancelled";
  if (status === "completed") return "past";
  if (status === "draft" || status === "processing" || status === "inprogress" || status === "in_progress") return "draft";
  if (status === "confirmed") {
    const eventDate = event.eventDate ? new Date(event.eventDate) : null;
    if (eventDate && eventDate < new Date()) return "past";
    return "confirmed";
  }
  return "pending";
}

export function deriveOrderState(order: OrderDetail): EventState {
  const status = (order.status ?? "").toLowerCase();
  if (status === "cancelled" || status === "canceled") return "cancelled";
  if (status === "completed") return "past";
  if (status === "draft" || status === "processing" || status === "inprogress" || status === "in_progress") return "draft";
  if (status === "confirmed") return "confirmed";
  return "pending";
}
