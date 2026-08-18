import { BUSINESS, WHATSAPP_GREETING } from "@/data/data";

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function formatCurrency(amount: number | null): string {
  if (amount == null) return "To be confirmed";
  return `${BUSINESS.currencySymbol}${amount}`;
}

export function generateOrderId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `MM-${n}`;
}

export function fullWhatsappNumber(): string {
  return (BUSINESS.countryCode + BUSINESS.phone).replace(/\D/g, "");
}

export function waLink(message: string = WHATSAPP_GREETING): string {
  return `https://wa.me/${fullWhatsappNumber()}?text=${encodeURIComponent(message)}`;
}

export function minOrderDate(): string {
  const min = new Date();
  min.setDate(min.getDate() + (BUSINESS.leadTimeDays || 0));
  return min.toISOString().split("T")[0];
}

export function isDateAvailable(iso: string): boolean {
  if (!iso) return false;
  if (iso < minOrderDate()) return false;
  if (BUSINESS.blackoutDates.includes(iso)) return false;
  const day = new Date(iso + "T00:00:00").getDay();
  if (BUSINESS.closedWeekdays.includes(day)) return false;
  return true;
}
