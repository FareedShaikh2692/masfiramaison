"use client";

import { useMemo, useState } from "react";
import {
  PRODUCTS,
  CATEGORIES,
  DESIGN_OPTIONS,
  BASIC_FLAVORS,
  WEIGHTS,
  DELIVERY_AREAS
} from "@/data/data";
import type { FulfillmentType } from "@/lib/types";
import { formatDate, minOrderDate, isDateAvailable } from "@/lib/format";
import OrderSummary from "@/components/order/OrderSummary";
import TermsCheckbox from "@/components/order/TermsCheckbox";
import type { OrderPrefill } from "@/components/order/OrderContext";

export interface OrderSnapshot {
  orderId: string;
  fullName: string;
  phone: string;
  productName: string;
  flavor?: string;
  comboFlavor?: string;
  comboCupcakeFlavor?: string;
  weight?: string;
  quantity?: number;
  design?: string;
  cakeMessage?: string;
  specialInstructions?: string;
  fulfillment: FulfillmentType;
  address?: string;
  preferredDate: string;
  preferredTime?: string;
  itemPrice: number | null;
  deliveryCharge: number | null;
  total: number | null;
}

export default function ProductOrderForm({
  prefill,
  onOrderCreated
}: {
  prefill: OrderPrefill;
  onOrderCreated: (snapshot: OrderSnapshot) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState(prefill.productId || PRODUCTS[0].id);
  const [flavor, setFlavor] = useState(prefill.flavor || "");
  const [comboFlavor, setComboFlavor] = useState("");
  const [comboCupcakeFlavor, setComboCupcakeFlavor] = useState("");
  const [weight, setWeight] = useState("");
  const [customWeight, setCustomWeight] = useState("");
  const [design, setDesign] = useState(prefill.design || "");
  const [quantity, setQuantity] = useState(1);
  const [cakeMessage, setCakeMessage] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("pickup");
  const [deliveryAreaId, setDeliveryAreaId] = useState(DELIVERY_AREAS[0].id);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const product = useMemo(() => PRODUCTS.find((p) => p.id === productId)!, [productId]);
  const weightOptions = product.weightOptions || WEIGHTS;
  const minDate = minOrderDate();

  const deliveryArea = DELIVERY_AREAS.find((a) => a.id === deliveryAreaId);
  const deliveryCharge = fulfillment === "delivery" ? deliveryArea?.charge ?? null : 0;
  const weightAdd = product.fields.includes("weight") ? weightOptions.find((w) => w.value === weight)?.priceAdd ?? null : 0;
  const itemPrice = product.price != null && weightAdd != null ? product.price + weightAdd : product.price;
  const total = itemPrice != null && deliveryCharge != null ? itemPrice + deliveryCharge : null;

  function weightLabel() {
    if (!product.fields.includes("weight")) return undefined;
    if (weight === "custom") return customWeight ? `${customWeight} (custom)` : "Custom";
    return weightOptions.find((w) => w.value === weight)?.label;
  }

  function validate(): boolean {
    const next: Record<string, boolean> = {};
    if (!fullName.trim()) next.fullName = true;
    if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) next.phone = true;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = true;
    if (product.fields.includes("flavor") && !flavor) next.flavor = true;
    if (product.fields.includes("comboFlavor") && !comboFlavor) next.comboFlavor = true;
    if (product.fields.includes("comboCupcakeFlavor") && !comboCupcakeFlavor) next.comboCupcakeFlavor = true;
    if (product.fields.includes("weight") && !weight) next.weight = true;
    if (product.fields.includes("design") && !design) next.design = true;
    if (product.fields.includes("quantity") && (!quantity || quantity < 1)) next.quantity = true;
    if (fulfillment === "delivery") {
      if (!address.trim()) next.address = true;
      if (!city.trim()) next.city = true;
    }
    if (!preferredDate || !isDateAvailable(preferredDate)) next.preferredDate = true;
    if (!preferredTime) next.preferredTime = true;
    if (!termsAccepted) next.termsAccepted = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      kind: "product",
      fullName,
      phone,
      email,
      productId: product.id,
      productName: product.name,
      flavor: product.fields.includes("flavor") ? flavor : undefined,
      comboFlavor: product.fields.includes("comboFlavor") ? comboFlavor : undefined,
      comboCupcakeFlavor: product.fields.includes("comboCupcakeFlavor") ? comboCupcakeFlavor : undefined,
      weight: weightLabel(),
      quantity: product.fields.includes("quantity") ? quantity : undefined,
      design: product.fields.includes("design") ? design : undefined,
      cakeMessage: product.fields.includes("message") ? cakeMessage : undefined,
      specialInstructions: product.fields.includes("specialInstructions") ? specialInstructions : undefined,
      fulfillment,
      deliveryAreaId: fulfillment === "delivery" ? deliveryAreaId : undefined,
      address: fulfillment === "delivery" ? [address, city, postalCode].filter(Boolean).join(", ") : undefined,
      preferredDate,
      preferredTime,
      itemPrice,
      deliveryCharge,
      total,
      termsAccepted
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      onOrderCreated({
        orderId: data.orderId,
        fullName,
        phone,
        productName: product.name,
        flavor: payload.flavor,
        comboFlavor: payload.comboFlavor,
        comboCupcakeFlavor: payload.comboCupcakeFlavor,
        weight: payload.weight,
        quantity: payload.quantity,
        design: payload.design,
        cakeMessage: payload.cakeMessage,
        specialInstructions: payload.specialInstructions,
        fulfillment,
        address: payload.address,
        preferredDate,
        preferredTime,
        itemPrice,
        deliveryCharge,
        total
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const summaryRows = [
    { label: "Product", value: product.name },
    ...(product.fields.includes("flavor") ? [{ label: "Flavor", value: flavor }] : []),
    ...(product.fields.includes("comboFlavor") ? [{ label: "Bento Flavor", value: comboFlavor }] : []),
    ...(product.fields.includes("comboCupcakeFlavor") ? [{ label: "Cupcake Flavor", value: comboCupcakeFlavor }] : []),
    ...(product.fields.includes("weight") ? [{ label: "Weight", value: weightLabel() || "" }] : []),
    ...(product.fields.includes("design") ? [{ label: "Design", value: design }] : []),
    ...(product.fields.includes("quantity") ? [{ label: "Quantity", value: String(quantity) }] : []),
    { label: "Delivery / Pickup", value: fulfillment === "delivery" ? "Delivery" : "Pickup" },
    ...(fulfillment === "delivery" ? [{ label: "Delivery Area", value: deliveryArea?.name || "" }] : []),
    { label: "Date", value: formatDate(preferredDate) }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <FormSection title="Customer Details">
        <Field label="Full Name" error={errors.fullName}>
          <input className="field-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone / WhatsApp Number" error={errors.phone}>
            <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" inputMode="tel" />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" type="email" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Choose Your Product">
        <Field label="Product">
          <select className="field-input" value={productId} onChange={(e) => setProductId(e.target.value)}>
            {CATEGORIES.map((cat) => {
              const items = PRODUCTS.filter((p) => p.category === cat.id);
              if (!items.length) return null;
              return (
                <optgroup key={cat.id} label={cat.name}>
                  {items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </Field>
      </FormSection>

      <FormSection title="Customize">
        {product.fields.includes("flavor") && product.flavors && (
          <Field label="Flavor" error={errors.flavor}>
            <select className="field-input" value={flavor} onChange={(e) => setFlavor(e.target.value)}>
              <option value="" disabled>Choose a flavor</option>
              {product.flavors.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        )}

        {product.fields.includes("comboFlavor") && (
          <Field label="Bento Cake Flavor" error={errors.comboFlavor}>
            <select className="field-input" value={comboFlavor} onChange={(e) => setComboFlavor(e.target.value)}>
              <option value="" disabled>Choose a flavor</option>
              {BASIC_FLAVORS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        )}
        {product.fields.includes("comboCupcakeFlavor") && (
          <Field label="Cupcake Flavor" error={errors.comboCupcakeFlavor}>
            <select className="field-input" value={comboCupcakeFlavor} onChange={(e) => setComboCupcakeFlavor(e.target.value)}>
              <option value="" disabled>Choose a flavor</option>
              {BASIC_FLAVORS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        )}

        {product.fields.includes("weight") && (
          <Field label="Cake Weight" error={errors.weight}>
            <select className="field-input" value={weight} onChange={(e) => setWeight(e.target.value)}>
              <option value="" disabled>Choose a weight</option>
              {weightOptions.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
            {weight === "custom" && (
              <input className="field-input mt-2.5" value={customWeight} onChange={(e) => setCustomWeight(e.target.value)} placeholder="e.g. 4 kg" />
            )}
          </Field>
        )}

        {product.fields.includes("design") && (
          <Field label="Cake Design" error={errors.design}>
            <select className="field-input" value={design} onChange={(e) => setDesign(e.target.value)}>
              <option value="" disabled>Choose a design</option>
              {DESIGN_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
        )}

        {product.fields.includes("quantity") && (
          <Field label="Quantity" error={errors.quantity}>
            <input className="field-input" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </Field>
        )}

        {product.fields.includes("message") && (
          <Field label="Message on Cake">
            <input className="field-input" value={cakeMessage} onChange={(e) => setCakeMessage(e.target.value)} placeholder="Happy Birthday Sarah!" maxLength={60} />
          </Field>
        )}

        {product.fields.includes("specialInstructions") && (
          <Field label="Special Instructions">
            <textarea className="field-input min-h-[90px]" value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="Please use pastel pink flowers and gold lettering." />
          </Field>
        )}
      </FormSection>

      <FormSection title="Delivery / Pickup">
        <Field label="How would you like to receive your order?">
          <div className="flex gap-3.5 flex-wrap">
            {(["pickup", "delivery"] as FulfillmentType[]).map((opt) => (
              <label
                key={opt}
                className={`flex-1 min-w-[130px] flex items-center gap-2.5 px-4 py-3.5 rounded-[10px] border cursor-pointer transition-colors ${
                  fulfillment === opt ? "border-gold bg-blush-soft" : "border-border bg-ivory"
                }`}
              >
                <input type="radio" name="fulfillment" value={opt} checked={fulfillment === opt} onChange={() => setFulfillment(opt)} className="w-[18px] h-[18px] accent-[var(--gold-dark)]" />
                <span className="font-medium text-[0.92rem] text-ink capitalize">{opt}</span>
              </label>
            ))}
          </div>
        </Field>

        {fulfillment === "delivery" ? (
          <>
            <Field label="Delivery Area">
              <select className="field-input" value={deliveryAreaId} onChange={(e) => setDeliveryAreaId(e.target.value)}>
                {DELIVERY_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.charge != null ? `— ₹${a.charge}` : "— charges confirmed on request"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Address" error={errors.address}>
              <input className="field-input" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City" error={errors.city}>
                <input className="field-input" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="Postal Code">
                <input className="field-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} inputMode="numeric" />
              </Field>
            </div>
          </>
        ) : (
          <div className="rounded-[10px] px-4 py-3.5 text-[0.84rem] text-ink flex gap-2.5" style={{ background: "var(--blush-soft)" }}>
            <span>📍</span>
            <span>Pickup details (address &amp; timing) will be shared once your order is confirmed.</span>
          </div>
        )}
      </FormSection>

      <FormSection title="Date & Time">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Preferred Date" error={errors.preferredDate}>
            <input className="field-input" type="date" min={minDate} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
          </Field>
          <Field label="Preferred Time" error={errors.preferredTime}>
            <input className="field-input" type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />
          </Field>
        </div>
        <p className="field-hint">Please place your order in advance so we can prepare your cake fresh for your special occasion.</p>
      </FormSection>

      <OrderSummary rows={summaryRows} deliveryCharge={deliveryCharge} itemPrice={itemPrice} total={total} />

      <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} error={errors.termsAccepted} />

      {submitError && <p className="text-danger text-[0.85rem]">{submitError}</p>}

      <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
        {submitting ? "Submitting…" : "Review & Continue to Payment"}
      </button>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 text-[0.78rem] uppercase tracking-wide font-bold mb-4" style={{ color: "var(--gold-dark)" }}>
        {title}
        <span className="flex-1 h-px bg-border" />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className={error ? "field-has-error" : undefined}>{children}</div>
      {error && <span className="text-danger text-[0.78rem] mt-1.5 block">This field is required.</span>}
    </div>
  );
}
