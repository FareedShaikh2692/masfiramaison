"use client";

import Image from "next/image";
import { useOrder } from "@/components/order/OrderContext";

export default function Hero() {
  const { openProductOrder } = useOrder();

  return (
    <section id="home" className="min-h-screen flex items-center pt-[84px] relative overflow-hidden" style={{ background: "linear-gradient(180deg, var(--ivory) 0%, var(--cream) 100%)" }}>
      <div className="container-app grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center py-16">
        <div className="text-center lg:text-left">
          <span className="eyebrow justify-center lg:justify-start">Premium Homemade Bakery</span>
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] leading-[1.15] mt-5 mb-5">
            Beautifully Baked.
            <br />
            Made For Your <em className="italic text-gold-dark">Moments</em>.
          </h1>
          <p className="text-[1.1rem] text-text-muted max-w-[520px] mx-auto lg:mx-0 mb-8">
            Handcrafted homemade cakes and desserts, freshly prepared with love for birthdays, celebrations, and every special moment.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-7">
            <button onClick={() => openProductOrder()} className="btn btn-primary">
              Order Now
            </button>
            <a href="#menu" className="btn btn-outline">
              Explore Our Menu
            </a>
          </div>
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-5 gap-y-2 text-[0.88rem] text-text-muted font-medium">
            <span className="inline-flex items-center gap-2"><i className="w-[5px] h-[5px] rounded-full bg-gold" />Freshly Baked</span>
            <span className="inline-flex items-center gap-2"><i className="w-[5px] h-[5px] rounded-full bg-gold" />Homemade</span>
            <span className="inline-flex items-center gap-2"><i className="w-[5px] h-[5px] rounded-full bg-gold" />Made to Order</span>
          </div>
        </div>

        <div className="relative flex justify-center order-first lg:order-last">
          <div className="relative w-[min(480px,90%)] rounded-[28px] overflow-hidden shadow-[0_30px_80px_rgba(64,51,42,0.16)] bg-ivory border border-border">
            <Image src="/images/hero-cake.svg" alt="Elegant handcrafted celebration cake by Masfira Maison" width={600} height={600} priority className="w-full aspect-square object-cover" />
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:-left-5 bg-white rounded-[18px] px-5 py-4 shadow-[0_20px_50px_rgba(64,51,42,0.10)] flex items-center gap-3 max-w-[240px]">
            <strong className="font-serif text-[1.05rem] text-ink">100%</strong>
            <span className="text-[0.8rem] text-text-muted">Homemade &amp; Made to Order</span>
          </div>
        </div>
      </div>
    </section>
  );
}
