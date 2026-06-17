"use client";

import { useEffect, useState } from "react";
import type { OrderDetail } from "@/components/Account/shared/types";

export interface OrderDetailsState {
  orders: OrderDetail[] | null;
  loading: boolean;
  error: boolean;
}

// Loads the full order(s) for a set of ids via GET /api/orders/{orderId}.
// The per-order endpoint carries guest count, items, fixed features and
// selections — everything the event detail view needs. Shared so the detail
// fields and the preparation checklist draw from a single fetch.
export function useOrderDetails(orderIds: string[], serviceId?: string): OrderDetailsState {
  const [orders, setOrders] = useState<OrderDetail[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Stable primitive dependency: ids are GUIDs, order is deterministic.
  const idsKey = orderIds.join(",");

  useEffect(() => {
    let active = true;
    const qs = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : "";
    // Defer the synchronous state writes out of the effect body (project lint
    // forbids setState directly in an effect).
    Promise.resolve().then(async () => {
      if (!active) return;
      setLoading(true);
      setError(false);
      try {
        const ids = idsKey ? idsKey.split(",") : [];
        const details = await Promise.all(
          ids.map((id) =>
            fetch(`/api/orders/${id}${qs}`, { cache: "no-store" }).then((res) => {
              if (!res.ok) throw new Error(String(res.status));
              return res.json() as Promise<OrderDetail>;
            }),
          ),
        );
        if (!active) return;
        setOrders(details);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [idsKey, serviceId]);

  return { orders, loading, error };
}
