"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/admin/Toast";
import PageHeader from "@/components/admin/PageHeader";

interface HeroBanner {
  image: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface SpecialOffer {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
  ctaText: string;
  ctaLink: string;
}

export default function AdminContentPage() {
  const { showToast } = useToast();
  const [banner, setBanner] = useState<HeroBanner | null>(null);
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetch("/api/admin/content")
        .then((r) => r.json())
        .then((data) => {
          setBanner(data.banner);
          setOffers(data.offers || []);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banner, offers })
      });
      showToast("Website content saved.");
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  }

  function addOffer() {
    setOffers([...offers, { id: crypto.randomUUID(), image: "", title: "", description: "", price: "", ctaText: "Order Now", ctaLink: "#" }]);
  }

  if (loading || !banner) return <div className="card h-64 animate-pulse max-w-[640px]" />;

  return (
    <div className="max-w-[640px]">
      <PageHeader title="Website Content" description="Edit the homepage banner and special offers shown to customers." />

      <div className="card p-6 mb-6 space-y-5">
        <h2 className="text-[1.1rem]">Homepage Banner</h2>
        <div>
          <label className="field-label">Banner Image URL</label>
          <input className="field-input" value={banner.image} onChange={(e) => setBanner({ ...banner, image: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Heading</label>
          <input className="field-input" value={banner.heading} onChange={(e) => setBanner({ ...banner, heading: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea className="field-input min-h-[70px]" value={banner.description} onChange={(e) => setBanner({ ...banner, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Button Text</label>
            <input className="field-input" value={banner.buttonText} onChange={(e) => setBanner({ ...banner, buttonText: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Button Link</label>
            <input className="field-input" value={banner.buttonLink} onChange={(e) => setBanner({ ...banner, buttonLink: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[1.1rem]">Special Offers</h2>
          <button onClick={addOffer} className="btn btn-outline btn-sm">
            + Add Offer
          </button>
        </div>
        {offers.length === 0 && <p className="text-text-muted text-[0.88rem]">No special offers configured — they won&apos;t show on the site until you add one.</p>}
        {offers.map((offer, i) => (
          <div key={offer.id} className="pb-5 border-b border-border last:border-0 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="field-input" placeholder="Title" value={offer.title} onChange={(e) => setOffers(offers.map((o, idx) => (idx === i ? { ...o, title: e.target.value } : o)))} />
              <input className="field-input" placeholder="Price / label" value={offer.price} onChange={(e) => setOffers(offers.map((o, idx) => (idx === i ? { ...o, price: e.target.value } : o)))} />
            </div>
            <input className="field-input" placeholder="Image URL" value={offer.image} onChange={(e) => setOffers(offers.map((o, idx) => (idx === i ? { ...o, image: e.target.value } : o)))} />
            <textarea className="field-input min-h-[50px]" placeholder="Description" value={offer.description} onChange={(e) => setOffers(offers.map((o, idx) => (idx === i ? { ...o, description: e.target.value } : o)))} />
            <div className="grid grid-cols-2 gap-3">
              <input className="field-input" placeholder="Button text" value={offer.ctaText} onChange={(e) => setOffers(offers.map((o, idx) => (idx === i ? { ...o, ctaText: e.target.value } : o)))} />
              <input className="field-input" placeholder="Button link" value={offer.ctaLink} onChange={(e) => setOffers(offers.map((o, idx) => (idx === i ? { ...o, ctaLink: e.target.value } : o)))} />
            </div>
            <button onClick={() => setOffers(offers.filter((_, idx) => idx !== i))} className="text-danger text-[0.8rem]">
              Remove Offer
            </button>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn btn-primary">
        {saving ? "Saving…" : "Save Website Content"}
      </button>
    </div>
  );
}
