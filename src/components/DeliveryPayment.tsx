import { PAYMENT_METHODS } from "@/data/data";
import { getBusinessSettings } from "@/lib/settingsStore";
import { listDeliveryZones } from "@/lib/deliveryStore";

export default async function DeliveryPayment() {
  const [business, zones] = await Promise.all([getBusinessSettings(), listDeliveryZones({ activeOnly: true })]);
  const priced = zones.filter((z) => z.chargeType !== "quote");
  const quoteZones = zones.filter((z) => z.chargeType === "quote");

  function zoneLabel(z: (typeof zones)[number]) {
    if (z.chargeType === "fixed") return z.fixedCharge != null ? `${business.currencySymbol}${z.fixedCharge}` : "—";
    if (z.chargeType === "range") return z.minCharge != null && z.maxCharge != null ? `${business.currencySymbol}${z.minCharge}–${z.maxCharge}` : "—";
    return "";
  }

  return (
    <section id="delivery-payment" className="py-28" style={{ background: "var(--ivory)" }}>
      <div className="container-app grid md:grid-cols-2 gap-10">
        <div className="card p-9">
          <span className="eyebrow">Delivery</span>
          <h2 className="text-[1.7rem] mt-3 mb-4">Delivery &amp; Pickup</h2>
          <p className="text-text-muted mb-5">
            {business.name} offers delivery based on location. Pickup is always available at no extra charge.
          </p>
          {priced.length > 0 && (
            <>
              <h4 className="text-[0.95rem] mb-2.5">Nearby Areas</h4>
              <ul className="space-y-2 mb-5">
                {priced.map((z) => (
                  <li key={z.id} className="flex items-center justify-between text-[0.92rem] px-4 py-3 rounded-[10px]" style={{ background: "var(--blush-soft)" }}>
                    <span className="font-medium text-ink">{z.name}</span>
                    <span className="text-gold-dark font-semibold">{zoneLabel(z)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <h4 className="text-[0.95rem] mb-2.5">{quoteZones[0]?.name || "Other Locations"}</h4>
          <p className="text-[0.88rem] text-text-muted">
            Delivery charges are as per the applicable delivery portal / service charges — we&apos;ll confirm the exact amount with you before your order is finalized.
          </p>
        </div>

        <div className="card p-9">
          <span className="eyebrow">Payment</span>
          <h2 className="text-[1.7rem] mt-3 mb-4">Secure Payment</h2>
          <p className="text-text-muted mb-5">{business.name} accepts advance payment via:</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {PAYMENT_METHODS.map((m) => (
              <div key={m.id} className="text-center py-5 rounded-[10px] border border-border">
                <span className="text-[0.86rem] font-semibold text-ink">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 rounded-[10px] px-4 py-3.5" style={{ background: "rgba(180,72,60,0.08)" }}>
            <span aria-hidden>⛔</span>
            <p className="text-[0.9rem] text-ink m-0 font-medium">Cash on Delivery is not available.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
