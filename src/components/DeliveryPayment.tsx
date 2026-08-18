import { DELIVERY_AREAS, PAYMENT_METHODS, BUSINESS } from "@/data/data";

export default function DeliveryPayment() {
  const nearby = DELIVERY_AREAS.filter((a) => a.charge != null);
  const other = DELIVERY_AREAS.find((a) => a.charge == null);

  return (
    <section id="delivery-payment" className="py-28" style={{ background: "var(--ivory)" }}>
      <div className="container-app grid md:grid-cols-2 gap-10">
        <div className="card p-9">
          <span className="eyebrow">Delivery</span>
          <h2 className="text-[1.7rem] mt-3 mb-4">Delivery &amp; Pickup</h2>
          <p className="text-text-muted mb-5">
            {BUSINESS.name} offers delivery based on location. Pickup is always available at no extra charge.
          </p>
          <h4 className="text-[0.95rem] mb-2.5">Nearby Areas</h4>
          <ul className="space-y-2 mb-5">
            {nearby.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-[0.92rem] px-4 py-3 rounded-[10px]" style={{ background: "var(--blush-soft)" }}>
                <span className="font-medium text-ink">{a.name}</span>
                <span className="text-gold-dark font-semibold">{BUSINESS.currencySymbol}{a.charge}</span>
              </li>
            ))}
          </ul>
          <h4 className="text-[0.95rem] mb-2.5">{other?.name}</h4>
          <p className="text-[0.88rem] text-text-muted">
            Delivery charges are as per the applicable delivery portal / service charges — we&apos;ll confirm the exact amount with you before your order is finalized.
          </p>
        </div>

        <div className="card p-9">
          <span className="eyebrow">Payment</span>
          <h2 className="text-[1.7rem] mt-3 mb-4">Secure Payment</h2>
          <p className="text-text-muted mb-5">{BUSINESS.name} accepts advance payment via:</p>
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
