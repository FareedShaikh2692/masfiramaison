import Image from "next/image";
import { getBusinessSettings } from "@/lib/settingsStore";
import Reveal from "@/components/Reveal";

export default async function About() {
  const business = await getBusinessSettings();
  return (
    <section id="about" className="py-28" style={{ background: "var(--ivory)" }}>
      <div className="container-app grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
        <Reveal className="rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(64,51,42,0.10)] border border-border order-first transition-all duration-500 hover:shadow-[0_30px_70px_rgba(64,51,42,0.16)] hover:-translate-y-1">
          <Image src="/images/product-bento-ribbon-box.jpg" alt={`${business.name} homemade celebration cake`} width={480} height={600} className="w-full aspect-[4/5] object-cover" />
        </Reveal>
        <Reveal delay={0.15} className="text-center lg:text-left">
          <span className="eyebrow justify-center lg:justify-start">Our Story</span>
          <h2 className="text-[clamp(1.9rem,3.4vw,2.6rem)] mt-3.5 mb-5">{business.tagline}</h2>
          <p className="text-text-muted text-[1.05rem] mb-4.5">
            {business.name} bakes everything by hand, in small batches, with the same care we&apos;d want for our own family&apos;s
            celebrations — from an everyday basic cake to a fully custom design.
          </p>
          <p className="text-text-muted text-[1.05rem]">
            We work closely with every customer to bring their vision to life, so your order feels made for exactly one
            moment: yours.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
