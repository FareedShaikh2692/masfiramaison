import type { Metadata } from "next";
import { BUSINESS } from "@/data/data";
import { getTerms } from "@/lib/settingsStore";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${BUSINESS.name}`,
  description: `Ordering, payment, delivery and cancellation policies for ${BUSINESS.name}.`
};

export default async function TermsPage() {
  const terms = await getTerms();
  return (
    <section className="pt-[130px] pb-24">
      <div className="container-app max-w-[760px]">
        <span className="eyebrow">Please Read</span>
        <h1 className="text-[clamp(2rem,4vw,2.8rem)] mt-3.5 mb-8">Terms &amp; Conditions</h1>
        <div className="space-y-6">
          {terms.map((t) => (
            <div key={t.title} className="card p-6">
              <h2 className="text-[1.1rem] mb-1.5">{t.title}</h2>
              <p className="text-text-muted m-0">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
