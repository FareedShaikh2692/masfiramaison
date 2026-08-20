import { Resend } from "resend";
import type { OrderRecord } from "@/lib/types";
import type { BusinessSettings } from "@/lib/settingsStore";
import { formatCurrency, formatDate } from "@/lib/format";

export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set.");
  return new Resend(apiKey);
}

function invoiceUrl(orderId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://masfiramaison.vercel.app";
  return `${base}/invoice/${orderId}`;
}

function buildInvoiceEmailHtml(order: OrderRecord, business: BusinessSettings): string {
  const rows: string[] = [];
  const row = (label: string, value?: string | null) => {
    if (!value) return;
    rows.push(
      `<tr><td style="padding:8px 0;color:#8a7a6a;font-size:14px;">${label}</td><td style="padding:8px 0;color:#40332a;font-size:14px;text-align:right;font-weight:600;">${value}</td></tr>`
    );
  };

  row("Product", order.productName);
  row("Flavor", order.flavor);
  row("Weight", order.weight);
  row("Pack Size", order.packSize);
  row("Fulfillment", order.fulfillment === "delivery" ? "Delivery" : "Pickup");
  row("Date", formatDate(order.preferredDate));
  row("Time Slot", order.preferredTime);
  if (order.total != null) row("Total", formatCurrency(order.total));

  return `
  <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;background:#fffdf9;border:1px solid #e8dcc8;border-radius:16px;overflow:hidden;">
    <div style="background:#40332a;padding:28px 32px;text-align:center;">
      <h1 style="color:#fbf6ee;font-size:22px;margin:0;">${business.name}</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#40332a;font-size:16px;margin:0 0 6px;">Hi ${order.fullName},</p>
      <p style="color:#6b5c4e;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Thank you for your order! Here's a summary of your invoice for order <strong>${order.orderId}</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;border-top:1px dashed #e8dcc8;border-bottom:1px dashed #e8dcc8;padding:8px 0;">
        ${rows.join("")}
      </table>
      <div style="text-align:center;margin-top:28px;">
        <a href="${invoiceUrl(order.orderId)}" style="display:inline-block;background:linear-gradient(135deg,#c6a15b,#a9803d);color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:600;">
          View Full Invoice
        </a>
      </div>
      <p style="color:#8a7a6a;font-size:12px;text-align:center;margin-top:28px;">
        Order confirmed only after advance payment · No refund on custom cakes.
      </p>
    </div>
  </div>`;
}

export async function sendInvoiceEmail(order: OrderRecord, business: BusinessSettings): Promise<void> {
  if (!order.email) return;
  if (!emailEnabled()) return;

  const client = getClient();
  await client.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Masfira Maison <onboarding@resend.dev>",
    to: order.email,
    subject: `Your Masfira Maison Invoice — Order ${order.orderId}`,
    html: buildInvoiceEmailHtml(order, business)
  });
}
