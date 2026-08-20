"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import type { BusinessSettings, TermsItem } from "@/lib/settingsStore";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"business" | "terms">("business");
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [terms, setTerms] = useState<TermsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setBusiness(data.business);
        setTerms(data.terms);
        setLoading(false);
      });
  }, []);

  async function saveBusiness() {
    if (!business) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business })
      });
      if (!res.ok) throw new Error("Could not save.");
      showToast("Business settings saved.");
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveTerms() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terms })
      });
      if (!res.ok) throw new Error("Could not save.");
      showToast("Terms & Conditions saved.");
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !business) return <div className="card h-64 animate-pulse max-w-[600px]" />;

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[1.6rem] mb-6">Settings</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("business")} className={`px-4 py-2 rounded-full text-[0.85rem] font-medium ${tab === "business" ? "text-white" : "text-ink border border-border"}`} style={tab === "business" ? { background: "var(--gold-dark)" } : undefined}>
          Business Info
        </button>
        <button onClick={() => setTab("terms")} className={`px-4 py-2 rounded-full text-[0.85rem] font-medium ${tab === "terms" ? "text-white" : "text-ink border border-border"}`} style={tab === "terms" ? { background: "var(--gold-dark)" } : undefined}>
          Terms &amp; Conditions
        </button>
      </div>

      {tab === "business" ? (
        <div className="card p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Business Name</label>
              <input className="field-input" value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Tagline</label>
              <input className="field-input" value={business.tagline} onChange={(e) => setBusiness({ ...business, tagline: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">WhatsApp / Phone</label>
              <input className="field-input" value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Country Code</label>
              <input className="field-input" value={business.countryCode} onChange={(e) => setBusiness({ ...business, countryCode: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label">Instagram Handle</label>
            <input className="field-input" value={business.instagramHandle} onChange={(e) => setBusiness({ ...business, instagramHandle: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Instagram URL</label>
            <input className="field-input" value={business.instagramUrl} onChange={(e) => setBusiness({ ...business, instagramUrl: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">City</label>
              <input className="field-input" value={business.city} onChange={(e) => setBusiness({ ...business, city: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Area</label>
              <input className="field-input" value={business.area} onChange={(e) => setBusiness({ ...business, area: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="field-label">Full Address</label>
            <input className="field-input" value={business.addressLine} onChange={(e) => setBusiness({ ...business, addressLine: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Order Lead Time (days)</label>
            <input
              className="field-input max-w-[140px]"
              type="number"
              min={0}
              value={business.leadTimeDays}
              onChange={(e) => setBusiness({ ...business, leadTimeDays: Number(e.target.value) })}
            />
            <span className="field-hint">Minimum days&apos; notice required before a pickup/delivery date.</span>
          </div>
          <button onClick={saveBusiness} disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : "Save Business Info"}
          </button>
        </div>
      ) : (
        <div className="card p-6 space-y-5">
          {terms.map((t, i) => (
            <div key={i} className="pb-4 border-b border-border last:border-0">
              <input
                className="field-input mb-2 font-semibold"
                value={t.title}
                onChange={(e) => {
                  const next = [...terms];
                  next[i] = { ...t, title: e.target.value };
                  setTerms(next);
                }}
              />
              <textarea
                className="field-input min-h-[60px]"
                value={t.text}
                onChange={(e) => {
                  const next = [...terms];
                  next[i] = { ...t, text: e.target.value };
                  setTerms(next);
                }}
              />
              <button
                onClick={() => setTerms(terms.filter((_, idx) => idx !== i))}
                className="text-danger text-[0.8rem] mt-1.5"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => setTerms([...terms, { title: `${terms.length + 1}. New Policy`, text: "" }])}
            className="btn btn-outline btn-sm"
          >
            + Add Policy
          </button>
          <div>
            <button onClick={saveTerms} disabled={saving} className="btn btn-primary">
              {saving ? "Saving…" : "Save Terms & Conditions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
