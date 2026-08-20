import type { OrderRecord } from "@/lib/types";

/** Shared date-range filter for the dashboard/analytics endpoints — `range` plus optional `from`/`to` (YYYY-MM-DD) for a custom range. */
export function filterByRange(orders: OrderRecord[], range: string, from?: string | null, to?: string | null): OrderRecord[] {
  if (range === "custom" && from && to) {
    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T23:59:59.999");
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });
  }

  if (range === "all") return orders;

  const now = new Date();

  if (range === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return orders.filter((o) => new Date(o.createdAt) >= start);
  }

  if (range === "yesterday") {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= start && d < end;
    });
  }

  if (range === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return orders.filter((o) => new Date(o.createdAt) >= start);
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : null;
  if (days != null) {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    return orders.filter((o) => new Date(o.createdAt) >= cutoff);
  }

  return orders;
}
