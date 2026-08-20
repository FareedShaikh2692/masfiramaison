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

export function fullWhatsappNumber(contact?: { phone: string; countryCode: string }): string {
  const c = contact || BUSINESS;
  return (c.countryCode + c.phone).replace(/\D/g, "");
}

/** Pass `contact` (live business settings from useBusiness()) wherever available — falls back to the static config otherwise. */
export function waLink(message: string = WHATSAPP_GREETING, contact?: { phone: string; countryCode: string }): string {
  return `https://wa.me/${fullWhatsappNumber(contact)}?text=${encodeURIComponent(message)}`;
}

/** Pass `leadTimeDays` (live business settings from useBusiness()) wherever available — falls back to the static config otherwise. */
export function minOrderDate(leadTimeDays?: number): string {
  const min = new Date();
  min.setDate(min.getDate() + (leadTimeDays ?? BUSINESS.leadTimeDays ?? 0));
  return min.toISOString().split("T")[0];
}

/** Pass `config` (live business settings from useBusiness()) wherever available — falls back to the static config otherwise. */
export function isDateAvailable(iso: string, config?: { leadTimeDays: number; blackoutDates: string[]; closedWeekdays: number[] }): boolean {
  if (!iso) return false;
  const leadTimeDays = config?.leadTimeDays ?? BUSINESS.leadTimeDays;
  const blackoutDates = config?.blackoutDates ?? BUSINESS.blackoutDates;
  const closedWeekdays = config?.closedWeekdays ?? BUSINESS.closedWeekdays;
  if (iso < minOrderDate(leadTimeDays)) return false;
  if (blackoutDates.includes(iso)) return false;
  const day = new Date(iso + "T00:00:00").getDay();
  if (closedWeekdays.includes(day)) return false;
  return true;
}
