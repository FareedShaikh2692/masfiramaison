import { formatCurrency, formatDate } from "@/lib/format";

export interface SummaryRow {
  label: string;
  value: string;
}

export default function OrderSummary({
  rows,
  deliveryCharge,
  itemPrice,
  total,
  discount,
  discountLabel
}: {
  rows: SummaryRow[];
  deliveryCharge: number | null;
  itemPrice: number | null;
  total: number | null;
  discount?: number;
  discountLabel?: string;
}) {
  return (
    <div className="card p-6">
      <h4 className="text-[1.05rem] mb-4">Your Order Summary</h4>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-2.5 py-2.5 border-b border-dashed border-border text-[0.88rem] last:border-b-0">
          <span className="text-text-muted">{r.label}</span>
          <span className="text-ink font-semibold text-right">{r.value || "—"}</span>
        </div>
      ))}
      <div className="flex justify-between gap-2.5 py-2.5 text-[0.88rem]">
        <span className="text-text-muted">Item Price</span>
        <span className="text-ink font-semibold">{formatCurrency(itemPrice)}</span>
      </div>
      <div className="flex justify-between gap-2.5 py-2.5 text-[0.88rem]">
        <span className="text-text-muted">Delivery Charge</span>
        <span className="text-ink font-semibold">{deliveryCharge == null ? "—" : deliveryCharge === 0 ? "Free (Pickup)" : formatCurrency(deliveryCharge)}</span>
      </div>
      {discount != null && discount > 0 && (
        <div className="flex justify-between gap-2.5 py-2.5 text-[0.88rem]">
          <span className="text-text-muted">{discountLabel || "Discount"}</span>
          <span className="font-semibold text-[#1a8a4a]">&minus;{formatCurrency(discount)}</span>
        </div>
      )}
      <div className="flex justify-between items-baseline mt-3.5 pt-3.5 border-t-2 border-border">
        <span className="text-[0.9rem] font-semibold text-ink">Estimated Total</span>
        <span className="font-serif text-[1.4rem] font-bold text-gold-dark">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export { formatDate };
