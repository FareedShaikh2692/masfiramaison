import Image from "next/image";
import { getPublishedReviews } from "@/lib/reviewStore";
import { getReviewSettings } from "@/lib/settingsStore";
import WriteReviewButton from "@/components/review/WriteReviewButton";
import Reveal from "@/components/Reveal";

export default async function Testimonials() {
  const [settings, reviews] = await Promise.all([getReviewSettings(), getPublishedReviews()]);
  if (!settings.showOnHomepage) return null;

  return (
    <section id="testimonials" className="py-28" style={{ background: "var(--ivory)" }}>
      <div className="container-app">
        <Reveal className="text-center max-w-[680px] mx-auto mb-10">
          <span className="eyebrow justify-center">Kind Words</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Love Your Masfira Maison Experience? 💕</h2>
          <p className="mt-4 text-[1.08rem] text-text-muted">Share your cake, your experience and a little love with us!</p>
        </Reveal>

        <div className="flex justify-center mb-12">
          <WriteReviewButton />
        </div>

        {reviews.length === 0 ? (
          <div className="text-center p-14 card border-dashed max-w-[560px] mx-auto">
            <h3 className="text-[1.3rem] mb-2.5">Reviews Coming Soon</h3>
            <p className="text-text-muted m-0">We&apos;re just getting started collecting feedback — real customer reviews will appear here as they come in.</p>
          </div>
        ) : (
          <Reveal delay={0.1} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {reviews.slice(0, 9).map((r) => (
              <div key={r.id} className="card p-8 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(64,51,42,0.12)]">
                <div className="text-gold tracking-[3px] mb-3.5">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                <p className="italic mb-4.5">&ldquo;{r.reviewText}&rdquo;</p>
                {settings.showPhotosPublicly && r.images.length > 0 && (
                  <div className="flex gap-2 mb-4.5">
                    {r.images.slice(0, 3).map((img, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-[8px] overflow-hidden border border-border">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <strong className="font-serif text-[0.95rem] text-ink">&mdash; {r.customerName}</strong>
                  {settings.enableVerifiedBadge && r.isVerified && (
                    <span className="text-[0.7rem] font-semibold text-gold-dark">✓ Verified Purchase</span>
                  )}
                </div>
                {r.responseStatus === "published" && r.responseText && (
                  <div className="mt-4 pt-4 border-t border-dashed border-border">
                    <p className="text-[0.68rem] uppercase tracking-wide font-semibold text-gold-dark mb-1.5">Masfira Maison Replied</p>
                    <p className="text-text-muted text-[0.86rem] m-0 italic">{r.responseText}</p>
                  </div>
                )}
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
