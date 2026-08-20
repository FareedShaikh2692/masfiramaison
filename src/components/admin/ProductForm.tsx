"use client";

import { useState } from "react";
import type { ProductFieldKey, WeightOption } from "@/lib/types";
import type { CategoryRecord, FlavorRecord, ProductRecord } from "@/lib/catalogStore";

const FIELD_OPTIONS: { key: ProductFieldKey; label: string }[] = [
  { key: "flavor", label: "Flavor" },
  { key: "weight", label: "Weight (with per-weight pricing)" },
  { key: "packSize", label: "Pack Size (with per-pack pricing)" },
  { key: "design", label: "Design" },
  { key: "message", label: "Message on Cake" },
  { key: "quantity", label: "Quantity" },
  { key: "comboFlavor", label: "Combo: Bento Flavor" },
  { key: "comboCupcakeFlavor", label: "Combo: Cupcake Flavor" },
  { key: "specialInstructions", label: "Special Instructions" }
];

export interface ProductFormValue {
  name: string;
  categoryId: string;
  description: string;
  image: string;
  flavors: string[];
  fields: ProductFieldKey[];
  price: string;
  pricePerUnit: boolean;
  weightOptions: WeightOption[];
  packOptions: WeightOption[];
  badge: string;
  featured: boolean;
  active: boolean;
}

const emptyOption = (): WeightOption => ({ label: "", value: "", priceAdd: null });

export function blankProductForm(): ProductFormValue {
  return {
    name: "",
    categoryId: "",
    description: "",
    image: "",
    flavors: [],
    fields: [],
    price: "",
    pricePerUnit: false,
    weightOptions: [],
    packOptions: [],
    badge: "",
    featured: false,
    active: true
  };
}

export function productToForm(p: ProductRecord): ProductFormValue {
  return {
    name: p.name,
    categoryId: p.categoryId || "",
    description: p.description,
    image: p.image,
    flavors: p.flavors || [],
    fields: p.fields,
    price: p.price == null ? "" : String(p.price),
    pricePerUnit: Boolean(p.pricePerUnit),
    weightOptions: p.weightOptions || [],
    packOptions: p.packOptions || [],
    badge: p.badge || "",
    featured: Boolean(p.featured),
    active: p.active
  };
}

function OptionListEditor({
  options,
  onChange,
  unitLabel
}: {
  options: WeightOption[];
  onChange: (next: WeightOption[]) => void;
  unitLabel: string;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_90px_32px] gap-2 items-center">
          <input
            className="field-input"
            placeholder={`${unitLabel} label, e.g. 1 kg`}
            value={opt.label}
            onChange={(e) => {
              const next = [...options];
              next[i] = { ...opt, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "") };
              onChange(next);
            }}
          />
          <input className="field-input bg-blush-soft" placeholder="value (auto)" value={opt.value} readOnly />
          <input
            className="field-input"
            type="number"
            placeholder="₹ price"
            value={opt.priceAdd ?? ""}
            onChange={(e) => {
              const next = [...options];
              next[i] = { ...opt, priceAdd: e.target.value === "" ? null : Number(e.target.value) };
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(options.filter((_, idx) => idx !== i))}
            aria-label="Remove"
            className="w-8 h-8 rounded-full bg-danger text-white text-sm"
          >
            &times;
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...options, emptyOption()])} className="btn btn-outline btn-sm">
        + Add {unitLabel}
      </button>
    </div>
  );
}

export default function ProductForm({
  value,
  onChange,
  categories,
  flavors
}: {
  value: ProductFormValue;
  onChange: (next: ProductFormValue) => void;
  categories: CategoryRecord[];
  flavors: FlavorRecord[];
}) {
  const [imageUploading, setImageUploading] = useState(false);

  function set<K extends keyof ProductFormValue>(key: K, v: ProductFormValue[K]) {
    onChange({ ...value, [key]: v });
  }

  function toggleField(key: ProductFieldKey) {
    set("fields", value.fields.includes(key) ? value.fields.filter((f) => f !== key) : [...value.fields, key]);
  }

  function toggleFlavor(name: string) {
    set("flavors", value.flavors.includes(name) ? value.flavors.filter((f) => f !== name) : [...value.flavors, name]);
  }

  function handleImageFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      set("image", e.target?.result as string);
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="field-label">Product Name</label>
        <input className="field-input" value={value.name} onChange={(e) => set("name", e.target.value)} />
      </div>

      <div>
        <label className="field-label">Category</label>
        <select className="field-input" value={value.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Description</label>
        <textarea className="field-input min-h-[80px]" value={value.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div>
        <label className="field-label">Product Image</label>
        {value.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.image} alt="" className="w-24 h-24 object-cover rounded-[10px] border border-border mb-2.5" />
        )}
        <label className="block border-2 border-dashed border-border rounded-[14px] p-4 text-center cursor-pointer hover:border-gold hover:bg-blush-soft transition-colors">
          <span className="text-[0.85rem] text-text-muted">{imageUploading ? "Uploading…" : "Click or drag an image here"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFile(e.target.files?.[0])} />
        </label>
        <input
          className="field-input mt-2"
          placeholder="…or paste an image URL"
          value={value.image.startsWith("data:") ? "" : value.image}
          onChange={(e) => set("image", e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Flavors</label>
        <div className="flex flex-wrap gap-2">
          {flavors.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => toggleFlavor(f.name)}
              className={`px-3 py-1.5 rounded-full text-[0.82rem] border transition-colors ${
                value.flavors.includes(f.name) ? "border-gold bg-blush-soft text-ink" : "border-border text-text-muted"
              }`}
            >
              {f.name}
            </button>
          ))}
          {!flavors.length && <p className="text-text-muted text-[0.85rem]">No flavors yet — add some on the Flavors page.</p>}
        </div>
      </div>

      <div>
        <label className="field-label">Order Form Fields</label>
        <div className="flex flex-wrap gap-2">
          {FIELD_OPTIONS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => toggleField(f.key)}
              className={`px-3 py-1.5 rounded-full text-[0.82rem] border transition-colors ${
                value.fields.includes(f.key) ? "border-gold bg-blush-soft text-ink" : "border-border text-text-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Base Price (₹)</label>
          <input className="field-input" type="number" placeholder="Leave blank for &quot;Price on request&quot;" value={value.price} onChange={(e) => set("price", e.target.value)} />
        </div>
        <div className="flex items-end pb-3">
          <label className="flex items-center gap-2 text-[0.88rem] text-ink cursor-pointer">
            <input type="checkbox" checked={value.pricePerUnit} onChange={(e) => set("pricePerUnit", e.target.checked)} className="w-4 h-4 accent-[var(--gold-dark)]" />
            Price is per unit (price × quantity)
          </label>
        </div>
      </div>

      {value.fields.includes("weight") && (
        <div>
          <label className="field-label">Weight Pricing</label>
          <OptionListEditor options={value.weightOptions} onChange={(o) => set("weightOptions", o)} unitLabel="weight" />
        </div>
      )}

      {value.fields.includes("packSize") && (
        <div>
          <label className="field-label">Pack Size Pricing</label>
          <OptionListEditor options={value.packOptions} onChange={(o) => set("packOptions", o)} unitLabel="pack" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Badge (optional)</label>
          <input className="field-input" placeholder="e.g. Bestseller" value={value.badge} onChange={(e) => set("badge", e.target.value)} />
        </div>
        <div className="flex items-end gap-5 pb-3">
          <label className="flex items-center gap-2 text-[0.88rem] text-ink cursor-pointer">
            <input type="checkbox" checked={value.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-[var(--gold-dark)]" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-[0.88rem] text-ink cursor-pointer">
            <input type="checkbox" checked={value.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-[var(--gold-dark)]" />
            Active (visible on site)
          </label>
        </div>
      </div>
    </div>
  );
}
