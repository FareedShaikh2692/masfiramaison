"use client";

import Image from "next/image";
import { useOrder } from "@/components/order/OrderContext";
import Reveal from "@/components/Reveal";

const OCCASIONS = [
  "Birthdays",
  "Anniversaries",
  "Weddings",
  "Engagements",
  "Baby Showers",
  "Kids' Parties",
  "Corporate Events",
  "Special Celebrations"
];

export default function CustomCakeCta() {
  const { openCustomOrder } = useOrder();

  return (
    <section id="custom-cakes" className="py-28" style={{ background: "var(--ivory)" }}>
      <div className="container-app grid lg:grid-cols-2 gap-16 items-center">
        <Reveal className="relative order-last lg:order-first">
          <div className="rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(64,51,42,0.10)] border border-border transition-all duration-500 hover:shadow-[0_30px_70px_rgba(64,51,42,0.16)] hover:-translate-y-1">
            <Image
              src="/images/category-custom.svg"
              alt="Custom designed celebration cake by Masfira Maison"
              width={480}
              height={560}
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.15} className="text-center lg:text-left">
          <span className="eyebrow justify-center lg:justify-start">Made Just For You</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.7rem)] mt-3.5 mb-3">Your Cake. Your Story.</h2>
          <p className="text-gold-dark font-serif text-lg mb-5">Customized Cakes Available</p>
          <ul className="flex flex-wrap justify-center lg:justify-start gap-2.5 mb-8">
            {OCCASIONS.map((o) => (
              <li key={o} className="px-4 py-2 rounded-full text-[0.85rem] font-medium text-ink" style={{ background: "var(--blush-soft)" }}>
                {o}
              </li>
            ))}
          </ul>
          <button onClick={openCustomOrder} className="btn btn-primary">
            Request A Custom Cake
          </button>
        </Reveal>
      </div>
    </section>
  );
}
