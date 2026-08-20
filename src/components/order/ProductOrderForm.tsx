"use client";

import { useEffect, useMemo, useState } from "react";
import { DESIGN_OPTIONS, WEIGHTS } from "@/data/data";
import { OCCASIONS, ADD_ONS } from "@/lib/types";
import type { FulfillmentType, Product } from "@/lib/types";
import { formatDate, minOrderDate, isDateAvailable } from "@/lib/format";
import OrderSummary from "@/components/order/OrderSummary";
import TermsCheckbox from "@/components/order/TermsCheckbox";
import type { OrderPrefill } from "@/components/order/OrderContext";
import { useBusiness } from "@/components/BusinessContext";
import type { DeliveryZoneRecord } from "@/lib/deliveryStore";

const EMPTY_PRODUCT: Product = { id: "", name: "", category: "", description: "", image: "", price: null, fields: [] };

export interface OrderSnapshot {
  orderId: string;
  fullName: string;
  phone: string;
  email?: string;
  productName: string;
  flavor?: string;
  comboFlavor?: string;
  comboCupcakeFlavor?: string;
  weight?: string;
  packSize?: string;
  quantity?: number;
  design?: string;
  cakeMessage?: string;
  occasion?: string;
  addOns?: string[];
  specialInstructions?: string;
  fulfillment: FulfillmentType;
  address?: string;
  preferredDate: string;
  preferredTime?: string;
  itemPrice: number | null;
  deliveryCharge: number | null;
  total: number | null;
  cashEligible: boolean;
  couponCode?: string;
  discountAmount?: number;
}

export default function ProductOrderForm({
  prefill,
  onOrderCreated
}: {
  prefill: OrderPrefill;
  onOrderCreated: (snapshot: OrderSnapshot) => void;
}) {
  const business = useBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [flavorsList, setFlavorsList] = useState<string[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [zones, setZones] = useState<DeliveryZoneRecord[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState(prefill.productId || "");
  const [flavor, setFlavor] = useState(prefill.flavor || "");
  const [comboFlavor, setComboFlavor] = useState("");
  const [comboCupcakeFlavor, setComboCupcakeFlavor] = useState("");
  const [weight, setWeight] = useState("");
  const [customWeight, setCustomWeight] = useState("");
  const [packSize, setPackSize] = useState("");
  const [design, setDesign] = useState(prefill.design || "");
  const [quantity, setQuantity] = useState(3);
  const [cakeMessage, setCakeMessage] = useState("");
  const [occasion, setOccasion] = useState("");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("pickup");
  const [deliveryAreaId, setDeliveryAreaId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [pickupSlot, setPickupSlot] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponId: string; code: string; discount: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/catalog").then((r) => r.json()), fetch("/api/delivery-zones").then((r) => r.json())])
      .then(([catalog, delivery]) => {
        if (cancelled) return;
        setProducts(catalog.products || []);
        setCategories(catalog.categories || []);
        setFlavorsList(catalog.flavors || []);
        setProductId((current) => current || prefill.productId || catalog.products?.[0]?.id || "");
        setZones(delivery.zones || []);
        setDeliveryAreaId((current) => current || delivery.zones?.[0]?.id || "");
        setCatalogLoaded(true);
      })
      .catch(() => setCatalogLoaded(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const product = useMemo(() => products.find((p) => p.id === productId) || EMPTY_PRODUCT, [products, productId]);
  const weightOptions = product.weightOptions || WEIGHTS;
  const packOptions = useMemo(() => product.packOptions || [], [product]);
  const minDate = minOrderDate(business.leadTimeDays);

  const deliveryArea = zones.find((a) => a.id === deliveryAreaId);
  const deliveryCharge = fulfillment === "delivery" ? (deliveryArea?.chargeType === "fixed" ? deliveryArea.fixedCharge : null) : 0;

  const itemPrice = useMemo(() => {
    if (product.price == null) return null;
    if (product.fields.includes("weight")) {
      const add = weightOptions.find((w) => w.value === weight)?.priceAdd;
      return add == null ? null : product.price + add;
    }
    if (product.fields.includes("packSize")) {
      const add = packOptions.find((p) => p.value === packSize)?.priceAdd;
      return add == null ? null : product.price + add;
    }
    if (product.fields.includes("quantity") && product.pricePerUnit) {
      return quantity > 0 ? product.price * quantity : null;
    }
    return product.price;
  }, [product, weightOptions, weight, packOptions, packSize, quantity]);

  const preDiscountTotal = itemPrice != null && deliveryCharge != null ? itemPrice + deliveryCharge : null;
  const total = preDiscountTotal != null && appliedCoupon ? Math.max(0, preDiscountTotal - appliedCoupon.discount) : preDiscountTotal;
  const cashEligible = fulfillment === "pickup";

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), orderAmount: itemPrice ?? 0, categoryId: product.category, productId: product.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "This coupon code isn't valid.");
      setAppliedCoupon({ couponId: data.couponId, code: data.code, discount: data.discount });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "This coupon code isn't valid.");
    } finally {
      setCouponApplying(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  function weightLabel() {
    if (!product.fields.includes("weight")) return undefined;
    if (weight === "custom") return customWeight ? `${customWeight} (custom)` : "Custom";
    return weightOptions.find((w) => w.value === weight)?.label;
  }

  function packLabel() {
    if (!product.fields.includes("packSize")) return undefined;
    return packOptions.find((p) => p.value === packSize)?.label;
  }

  function pickupSlotLabel() {
    return business.pickupSlots.find((s) => s.value === pickupSlot)?.label;
  }

  function toggleAddOn(name: string) {
    setAddOns((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));
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
    if (product.fields.includes("packSize") && !packSize) next.packSize = true;
    if (product.fields.includes("design") && !design) next.design = true;
    if (product.fields.includes("quantity") && (!quantity || quantity < 1)) next.quantity = true;
    if (!occasion) next.occasion = true;
    if (fulfillment === "delivery") {
      if (!address.trim()) next.address = true;
      if (!city.trim()) next.city = true;
    }
    if (!preferredDate || !isDateAvailable(preferredDate, business)) next.preferredDate = true;
    if (!pickupSlot) next.pickupSlot = true;
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
      packSize: packLabel(),
      quantity: product.fields.includes("quantity") ? quantity : undefined,
      design: product.fields.includes("design") ? design : undefined,
      cakeMessage: product.fields.includes("message") ? cakeMessage : undefined,
      occasion,
      addOns,
      specialInstructions: product.fields.includes("specialInstructions") ? specialInstructions : undefined,
      fulfillment,
      deliveryAreaId: fulfillment === "delivery" ? deliveryAreaId : undefined,
      address: fulfillment === "delivery" ? [address, city, postalCode].filter(Boolean).join(", ") : undefined,
      preferredDate,
      preferredTime: pickupSlotLabel(),
      pickupSlot,
      itemPrice,
      deliveryCharge,
      total,
      termsAccepted,
      couponCode: appliedCoupon?.code,
      couponId: appliedCoupon?.couponId,
      discountAmount: appliedCoupon?.discount
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
        email: email || undefined,
        productName: product.name,
        flavor: payload.flavor,
        comboFlavor: payload.comboFlavor,
        comboCupcakeFlavor: payload.comboCupcakeFlavor,
        weight: payload.weight,
        packSize: payload.packSize,
        quantity: payload.quantity,
        design: payload.design,
        cakeMessage: payload.cakeMessage,
        occasion,
        addOns,
        specialInstructions: payload.specialInstructions,
        fulfillment,
        address: payload.address,
        preferredDate,
        preferredTime: payload.preferredTime,
        itemPrice,
        deliveryCharge,
        total,
        cashEligible,
        couponCode: payload.couponCode,
        discountAmount: payload.discountAmount
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
    ...(product.fields.includes("packSize") ? [{ label: "Pack Size", value: packLabel() || "" }] : []),
    ...(product.fields.includes("design") ? [{ label: "Design", value: design }] : []),
    ...(product.fields.includes("quantity") ? [{ label: "Quantity", value: String(quantity) }] : []),
    { label: "Occasion", value: occasion },
    { label: "Delivery / Pickup", value: fulfillment === "delivery" ? "Delivery" : "Pickup" },
    ...(fulfillment === "delivery" ? [{ label: "Delivery Area", value: deliveryArea?.name || "" }] : []),
    { label: "Date", value: formatDate(preferredDate) },
    ...(pickupSlot ? [{ label: "Time Slot", value: pickupSlotLabel() || "" }] : [])
  ];

  if (!catalogLoaded) {
    return <p className="text-center text-text-muted py-16">Loading menu…</p>;
  }
  if (!products.length) {
    return <p className="text-center text-text-muted py-16">Our menu is being updated — please check back shortly, or reach out on WhatsApp.</p>;
  }

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

      <FormSection title="Occasion">
        <Field label="What are you celebrating?" error={errors.occasion}>
          <select className="field-input" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
            <option value="" disabled>Choose an occasion</option>
            {OCCASIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </Field>
      </FormSection>

      <FormSection title="Choose Your Product">
        <Field label="Product">
          <select className="field-input" value={productId} onChange={(e) => setProductId(e.target.value)}>
            {categories.map((cat) => {
              const items = products.filter((p) => p.category === cat.id);
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
              {flavorsList.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        )}
        {product.fields.includes("comboCupcakeFlavor") && (
          <Field label="Cupcake Flavor" error={errors.comboCupcakeFlavor}>
            <select className="field-input" value={comboCupcakeFlavor} onChange={(e) => setComboCupcakeFlavor(e.target.value)}>
              <option value="" disabled>Choose a flavor</option>
              {flavorsList.map((f) => (
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
                <option key={w.value} value={w.value}>
                  {w.label}{w.priceAdd != null ? ` — ₹${w.priceAdd}` : ""}
                </option>
              ))}
            </select>
            {weight === "custom" && (
              <input className="field-input mt-2.5" value={customWeight} onChange={(e) => setCustomWeight(e.target.value)} placeholder="e.g. 4 kg" />
            )}
          </Field>
        )}

        {product.fields.includes("packSize") && (
          <Field label="Pack Size" error={errors.packSize}>
            <select className="field-input" value={packSize} onChange={(e) => setPackSize(e.target.value)}>
              <option value="" disabled>Choose a pack size</option>
              {packOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}{p.priceAdd != null ? ` — ₹${p.priceAdd}` : ""}
                </option>
              ))}
            </select>
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
          <Field label={product.pricePerUnit ? `Quantity (₹${product.price} each)` : "Quantity"} error={errors.quantity}>
            <input className="field-input" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </Field>
        )}

        {product.fields.includes("message") && (
          <Field label="Message on Cake">
            <input className="field-input" value={cakeMessage} onChange={(e) => setCakeMessage(e.target.value)} placeholder="Happy Birthday Sarah!" maxLength={60} />
          </Field>
        )}

        <Field label="Extra Add-ons (optional)">
          <div className="flex flex-wrap gap-2.5">
            {ADD_ONS.map((a) => (
              <label
                key={a}
                className={`px-3.5 py-2 rounded-full border text-[0.84rem] cursor-pointer transition-colors ${
                  addOns.includes(a) ? "border-gold bg-blush-soft text-ink" : "border-border bg-ivory text-text-muted"
                }`}
              >
                <input type="checkbox" className="hidden" checked={addOns.includes(a)} onChange={() => toggleAddOn(a)} />
                {a}
              </label>
            ))}
          </div>
        </Field>

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
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} {zoneChargeLabel(z)}
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
            <span>Pickup from {business.area ? `our ${business.area} location` : "our location"} — the exact address is shared once your order is confirmed.</span>
          </div>
        )}
      </FormSection>

      <FormSection title="Date & Time">
        <Field label="Preferred Date" error={errors.preferredDate}>
          <input className="field-input" type="date" min={minDate} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
        </Field>
        <Field label="Preferred Time Slot" error={errors.pickupSlot}>
          <div className="flex flex-col gap-2.5">
            {business.pickupSlots.map((slot) => (
              <label
                key={slot.value}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-[10px] border cursor-pointer transition-colors ${
                  pickupSlot === slot.value ? "border-gold bg-blush-soft" : "border-border bg-ivory"
                }`}
              >
                <input type="radio" name="pickupSlot" value={slot.value} checked={pickupSlot === slot.value} onChange={() => setPickupSlot(slot.value)} className="w-[18px] h-[18px] accent-[var(--gold-dark)]" />
                <span className="text-[0.9rem] text-ink">{slot.label}</span>
              </label>
            ))}
          </div>
        </Field>
        <p className="field-hint">Please place your order in advance so we can prepare your cake fresh for your special occasion.</p>
      </FormSection>

      <FormSection title="Coupon Code">
        {appliedCoupon ? (
          <div className="flex items-center justify-between gap-3 rounded-[10px] px-4 py-3.5 border border-gold bg-blush-soft">
            <span className="text-[0.88rem] text-ink">
              <strong>{appliedCoupon.code}</strong> applied — you save ₹{appliedCoupon.discount}
            </span>
            <button type="button" onClick={removeCoupon} className="text-[0.8rem] text-danger font-medium">
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2.5">
              <input
                className="field-input"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
              />
              <button type="button" onClick={applyCoupon} disabled={couponApplying || !couponInput.trim()} className="btn btn-outline btn-sm flex-shrink-0">
                {couponApplying ? "Checking…" : "Apply"}
              </button>
            </div>
            {couponError && <span className="text-danger text-[0.78rem] mt-1.5 block">{couponError}</span>}
          </div>
        )}
      </FormSection>

      <OrderSummary
        rows={summaryRows}
        deliveryCharge={deliveryCharge}
        itemPrice={itemPrice}
        total={total}
        discount={appliedCoupon?.discount}
        discountLabel={appliedCoupon ? `Coupon (${appliedCoupon.code})` : undefined}
      />

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

function zoneChargeLabel(z: DeliveryZoneRecord) {
  if (z.chargeType === "fixed") return z.fixedCharge != null ? `— ₹${z.fixedCharge}` : "";
  if (z.chargeType === "range") return z.minCharge != null && z.maxCharge != null ? `— ₹${z.minCharge}–${z.maxCharge}` : "";
  return "— charges confirmed on request";
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
