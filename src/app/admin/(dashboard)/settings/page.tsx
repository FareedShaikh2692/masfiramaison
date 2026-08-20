"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import type { BusinessSettings, TermsItem, ReviewSettings } from "@/lib/settingsStore";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"business" | "availability" | "reviews" | "terms">("business");
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [terms, setTerms] = useState<TermsItem[]>([]);
  const [reviewSettings, setReviewSettings] = useState<ReviewSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlackoutDate, setNewBlackoutDate] = useState("");
  const [newSlotLabel, setNewSlotLabel] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setBusiness(data.business);
        setTerms(data.terms);
        setReviewSettings(data.reviewSettings);
        setLoading(false);
      });
  }, []);

  async function saveReviewSettings() {
    if (!reviewSettings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewSettings })
      });
      if (!res.ok) throw new Error("Could not save.");
      showToast("Review settings saved.");
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

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
        <button onClick={() => setTab("availability")} className={`px-4 py-2 rounded-full text-[0.85rem] font-medium ${tab === "availability" ? "text-white" : "text-ink border border-border"}`} style={tab === "availability" ? { background: "var(--gold-dark)" } : undefined}>
          Pickup &amp; Availability
        </button>
        <button onClick={() => setTab("reviews")} className={`px-4 py-2 rounded-full text-[0.85rem] font-medium ${tab === "reviews" ? "text-white" : "text-ink border border-border"}`} style={tab === "reviews" ? { background: "var(--gold-dark)" } : undefined}>
          Reviews
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
      ) : tab === "availability" ? (
        <div className="card p-6 space-y-6">
          <div>
            <label className="field-label mb-2">Closed Weekdays</label>
            <div className="flex flex-wrap gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => {
                const active = business.closedWeekdays.includes(i);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setBusiness({
                        ...business,
                        closedWeekdays: active ? business.closedWeekdays.filter((d) => d !== i) : [...business.closedWeekdays, i]
                      })
                    }
                    className={`px-3.5 py-2 rounded-full text-[0.82rem] font-medium border transition-colors ${
                      active ? "text-white" : "text-ink border-border bg-ivory"
                    }`}
                    style={active ? { background: "var(--danger)", borderColor: "var(--danger)" } : undefined}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <span className="field-hint">Customers won&apos;t be able to select these days for pickup or delivery.</span>
          </div>

          <div>
            <label className="field-label mb-2">Blackout Dates</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {business.blackoutDates.length === 0 && <span className="text-text-muted text-[0.85rem]">No blackout dates set.</span>}
              {business.blackoutDates.map((d) => (
                <span key={d} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.8rem]" style={{ background: "var(--blush-soft)" }}>
                  {d}
                  <button
                    type="button"
                    onClick={() => setBusiness({ ...business, blackoutDates: business.blackoutDates.filter((x) => x !== d) })}
                    className="text-danger font-bold"
                    aria-label={`Remove ${d}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2.5">
              <input className="field-input max-w-[200px]" type="date" value={newBlackoutDate} onChange={(e) => setNewBlackoutDate(e.target.value)} />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  if (!newBlackoutDate || business.blackoutDates.includes(newBlackoutDate)) return;
                  setBusiness({ ...business, blackoutDates: [...business.blackoutDates, newBlackoutDate].sort() });
                  setNewBlackoutDate("");
                }}
              >
                + Add Date
              </button>
            </div>
            <span className="field-hint">Specific dates (holidays, fully booked days) that are unavailable regardless of weekday.</span>
          </div>

          <div>
            <label className="field-label mb-2">Pickup Time Slots</label>
            <div className="space-y-2 mb-3">
              {business.pickupSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <input
                    className="field-input"
                    value={slot.label}
                    onChange={(e) => {
                      const next = [...business.pickupSlots];
                      next[i] = { ...slot, label: e.target.value };
                      setBusiness({ ...business, pickupSlots: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setBusiness({ ...business, pickupSlots: business.pickupSlots.filter((_, idx) => idx !== i) })}
                    className="text-danger text-[0.8rem] flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5">
              <input className="field-input" placeholder="e.g. Late Evening · 8 PM – 10 PM" value={newSlotLabel} onChange={(e) => setNewSlotLabel(e.target.value)} />
              <button
                type="button"
                className="btn btn-outline btn-sm flex-shrink-0"
                onClick={() => {
                  if (!newSlotLabel.trim()) return;
                  const value = newSlotLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  setBusiness({ ...business, pickupSlots: [...business.pickupSlots, { value: value || `slot-${Date.now()}`, label: newSlotLabel.trim() }] });
                  setNewSlotLabel("");
                }}
              >
                + Add Slot
              </button>
            </div>
            <span className="field-hint">Shown to customers as time-slot choices when placing an order.</span>
          </div>

          <button onClick={saveBusiness} disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : "Save Availability"}
          </button>
        </div>
      ) : tab === "reviews" && reviewSettings ? (
        <div className="card p-6 space-y-4">
          {(
            [
              ["enabled", "Enable customer reviews"],
              ["requireApproval", "Require admin approval before publishing"],
              ["allowPhotos", "Allow customers to upload photos"],
              ["enableAI", "Enable the AI Reply Assistant"],
              ["enableAutoRequest", "Automatically request a review when an order is marked completed"],
              ["showOnHomepage", "Show reviews section on the homepage"],
              ["showPhotosPublicly", "Show customer photos publicly"],
              ["enableVerifiedBadge", "Show the Verified Purchase badge"]
            ] as [keyof ReviewSettings, string][]
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 py-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-[18px] h-[18px] accent-[var(--gold-dark)]"
                checked={Boolean(reviewSettings[key])}
                onChange={(e) => setReviewSettings({ ...reviewSettings, [key]: e.target.checked })}
              />
              <span className="text-[0.9rem] text-ink">{label}</span>
            </label>
          ))}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="field-label">Max Photos Per Review</label>
              <input
                className="field-input"
                type="number"
                min={1}
                max={5}
                value={reviewSettings.maxPhotos}
                onChange={(e) => setReviewSettings({ ...reviewSettings, maxPhotos: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="field-label">Minimum Rating Allowed</label>
              <input
                className="field-input"
                type="number"
                min={1}
                max={5}
                value={reviewSettings.minRating}
                onChange={(e) => setReviewSettings({ ...reviewSettings, minRating: Number(e.target.value) })}
              />
            </div>
          </div>
          <button onClick={saveReviewSettings} disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : "Save Review Settings"}
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
