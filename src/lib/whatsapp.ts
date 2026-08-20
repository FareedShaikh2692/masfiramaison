import type { OrderRecord } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

/**
 * WhatsApp Business Platform (Meta Cloud API) — sends a free-text message
 * from the business's WhatsApp number to the admin's own phone.
 *
 * Meta only allows free-text business-initiated messages to a recipient who
 * has an open 24-hour "customer service window" (i.e. messaged the business
 * number within the last 24h). Outside that window, Meta requires a
 * pre-approved message TEMPLATE instead — that has to be created and
 * approved in the Meta dashboard, which can't be done from code. Until a
 * template exists, keep the window open by occasionally messaging the
 * business number from the admin's phone.
 */

export function whatsappEnabled(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ADMIN_NUMBER);
}

async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken || !phoneNumberId) throw new Error("WhatsApp Business API is not configured.");

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `WhatsApp API request failed (${res.status}).`);
  }
}

function buildOrderNotification(order: OrderRecord): string {
  const lines = [
    `🎂 *New Order — ${order.orderId}*`,
    "",
    `Customer: ${order.fullName}`,
    `Phone: ${order.phone}`,
    `Product: ${order.productName}`,
    order.flavor ? `Flavor: ${order.flavor}` : null,
    order.weight ? `Weight: ${order.weight}` : null,
    `Fulfillment: ${order.fulfillment === "delivery" ? "Delivery" : "Pickup"}`,
    `Date: ${formatDate(order.preferredDate)}`,
    order.total != null ? `Total: ${formatCurrency(order.total)}` : null
  ];
  return lines.filter(Boolean).join("\n");
}

export async function notifyAdminOfNewOrder(order: OrderRecord): Promise<void> {
  const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;
  if (!whatsappEnabled() || !adminNumber) return;
  await sendWhatsAppText(adminNumber, buildOrderNotification(order));
}
