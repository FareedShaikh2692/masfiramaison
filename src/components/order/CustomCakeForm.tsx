"use client";

import { useEffect, useRef, useState } from "react";
import { CAKE_TYPES_FOR_CUSTOM, WEIGHTS, DESIGN_OPTIONS } from "@/data/data";
import { minOrderDate, isDateAvailable } from "@/lib/format";
import TermsCheckbox from "@/components/order/TermsCheckbox";
import { useBusiness } from "@/components/BusinessContext";
import CustomSelect from "@/components/CustomSelect";

export interface CustomOrderSnapshot {
  orderId: string;
  fullName: string;
  phone: string;
  cakeType: string;
  flavor: string;
  weight: string;
  design: string;
  theme: string;
  cakeColor: string;
  cakeMessage: string;
  preferredDate: string;
  preferredTime: string;
  specialInstructions: string;
}

export default function CustomCakeForm({ onOrderCreated }: { onOrderCreated: (s: CustomOrderSnapshot) => void }) {
  const business = useBusiness();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cakeType, setCakeType] = useState("");
  const [flavor, setFlavor] = useState("");
  const [weight, setWeight] = useState("");
  const [design, setDesign] = useState("");
  const [theme, setTheme] = useState("");
  const [cakeColor, setCakeColor] = useState("");
  const [cakeMessage, setCakeMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [flavorsList, setFlavorsList] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => setFlavorsList(data.flavors || []))
      .catch(() => setFlavorsList([]));
  }, []);

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setReferenceImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const next: Record<string, boolean> = {};
    if (!fullName.trim()) next.fullName = true;
    if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) next.phone = true;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = true;
    if (!cakeType) next.cakeType = true;
    if (!flavor) next.flavor = true;
    if (!weight) next.weight = true;
    if (!design) next.design = true;
    if (!preferredDate || !isDateAvailable(preferredDate, business)) next.preferredDate = true;
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

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "custom",
          fullName,
          phone,
          email,
          productName: `Custom Cake — ${cakeType}`,
          flavor,
          weight,
          design,
          theme,
          cakeColor,
          cakeMessage,
          specialInstructions,
          referenceImage,
          fulfillment: "pickup",
          preferredDate,
          preferredTime,
          termsAccepted
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      onOrderCreated({
        orderId: data.orderId,
        fullName,
        phone,
        cakeType,
        flavor,
        weight,
        design,
        theme,
        cakeColor,
        cakeMessage,
        preferredDate,
        preferredTime,
        specialInstructions
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <FormSection title="Customer Information">
        <Field label="Full Name" error={errors.fullName}>
          <input className="field-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone / WhatsApp Number" error={errors.phone}>
            <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          </Field>
          <Field label="Email" error={errors.email}>
            <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Cake Information">
        <Field label="Cake Type" error={errors.cakeType}>
          <CustomSelect
            value={cakeType}
            onChange={setCakeType}
            placeholder="Choose a cake type"
            error={errors.cakeType}
            options={CAKE_TYPES_FOR_CUSTOM.map((t) => ({ value: t, label: t }))}
          />
        </Field>
        <Field label="Flavor" error={errors.flavor}>
          <CustomSelect
            value={flavor}
            onChange={setFlavor}
            placeholder="Choose a flavor"
            error={errors.flavor}
            options={[...flavorsList.map((f) => ({ value: f, label: f })), { value: "Custom", label: "Custom / Discuss with us" }]}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Weight" error={errors.weight}>
            <CustomSelect
              value={weight}
              onChange={setWeight}
              placeholder="Choose a weight"
              error={errors.weight}
              options={WEIGHTS.map((w) => ({ value: w.label, label: w.label }))}
            />
          </Field>
          <Field label="Preferred Design" error={errors.design}>
            <CustomSelect
              value={design}
              onChange={setDesign}
              placeholder="Choose a design"
              error={errors.design}
              options={DESIGN_OPTIONS.map((d) => ({ value: d, label: d }))}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Theme">
            <input className="field-input" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. Enchanted Garden" />
          </Field>
          <Field label="Cake Color">
            <input className="field-input" value={cakeColor} onChange={(e) => setCakeColor(e.target.value)} placeholder="e.g. Pastel pink & gold" />
          </Field>
        </div>
        <Field label="Cake Message">
          <input className="field-input" value={cakeMessage} onChange={(e) => setCakeMessage(e.target.value)} placeholder="Happy Birthday Sarah!" maxLength={60} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Preferred Date" error={errors.preferredDate}>
            <input className="field-input" type="date" min={minOrderDate(business.leadTimeDays)} value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
          </Field>
          <Field label="Preferred Time" error={errors.preferredTime}>
            <input className="field-input" type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />
          </Field>
        </div>

        <div>
          <label className="field-label">Reference Image</label>
          <label
            htmlFor="referenceImageInput"
            className="block border-2 border-dashed border-border rounded-[18px] p-6 text-center cursor-pointer hover:border-gold hover:bg-blush-soft transition-colors"
          >
            <p className="text-[0.88rem] text-text-muted m-0">Click or drag an inspiration photo here</p>
            <input
              ref={fileRef}
              id="referenceImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          {referenceImage && (
            <div className="relative inline-block mt-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={referenceImage} alt="Reference preview" className="w-[120px] h-[120px] object-cover rounded-[10px] border border-border" />
              <button
                type="button"
                onClick={() => {
                  setReferenceImage(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                aria-label="Remove image"
                className="absolute -top-2 -right-2 w-[26px] h-[26px] rounded-full bg-danger text-white border-2 border-ivory text-[0.85rem]"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Additional Requirements">
        <Field label="Tell us about your cake requirements">
          <textarea
            className="field-input min-h-[100px]"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Please create a pastel pink floral cake with gold lettering."
          />
        </Field>
      </FormSection>

      <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} error={errors.termsAccepted} />

      {submitError && <p className="text-danger text-[0.85rem]">{submitError}</p>}

      <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
        {submitting ? "Submitting…" : "Submit Custom Cake Request"}
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
