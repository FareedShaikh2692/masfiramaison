"use client";

import { WHATSAPP_GREETING } from "@/data/data";
import { waLink } from "@/lib/format";
import { useOrder } from "@/components/order/OrderContext";
import { useBusiness } from "@/components/BusinessContext";

export default function Contact() {
  const { openProductOrder } = useOrder();
  const business = useBusiness();

  return (
    <section id="contact" className="py-28 text-blush-soft" style={{ background: "var(--ink)" }}>
      <div className="container-app text-center">
        <span className="eyebrow justify-center" style={{ color: "var(--gold-light)" }}>
          Get In Touch
        </span>
        <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5 mb-3 text-white">Let&apos;s Make Something Delicious</h2>
        <p className="text-white/70 max-w-[600px] mx-auto mb-12">Have a question, or ready to order? We&apos;d love to hear from you.</p>

        <div className="grid sm:grid-cols-3 gap-6 max-w-[820px] mx-auto mb-2">
          <div className="rounded-[18px] p-7 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <h4 className="text-white text-[1.02rem] mb-1.5">WhatsApp</h4>
            <p className="text-white/65 text-[0.9rem] mb-4">+{business.countryCode} {business.phone}</p>
            <a href={waLink(WHATSAPP_GREETING, business)} target="_blank" rel="noopener" className="btn btn-whatsapp btn-sm">
              WhatsApp Us
            </a>
          </div>
          <div className="rounded-[18px] p-7 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <h4 className="text-white text-[1.02rem] mb-1.5">Instagram</h4>
            <p className="text-white/65 text-[0.9rem] mb-4">{business.instagramHandle}</p>
            <a href={business.instagramUrl} target="_blank" rel="noopener" className="btn btn-sm" style={{ border: "1px solid rgba(255,255,255,0.5)", color: "white" }}>
              Follow on Instagram
            </a>
          </div>
          <div className="rounded-[18px] p-7 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <h4 className="text-white text-[1.02rem] mb-1.5">Order A Cake</h4>
            <p className="text-white/65 text-[0.9rem] mb-4">Tell us about your celebration.</p>
            <button onClick={() => openProductOrder()} className="btn btn-primary btn-sm">
              Order Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
