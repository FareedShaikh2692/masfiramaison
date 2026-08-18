import { TESTIMONIALS } from "@/data/data";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-28" style={{ background: "var(--ivory)" }}>
      <div className="container-app">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="eyebrow justify-center">Kind Words</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Customer Reviews</h2>
        </div>

        {TESTIMONIALS.length === 0 ? (
          <div className="text-center p-14 card border-dashed max-w-[560px] mx-auto">
            <h3 className="text-[1.3rem] mb-2.5">Reviews Coming Soon</h3>
            <p className="text-text-muted m-0">We&apos;re just getting started collecting feedback — real customer reviews will appear here as they come in.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-8">
                <div className="text-gold tracking-[3px] mb-3.5">{"★".repeat(t.rating)}</div>
                <p className="italic mb-4.5">&ldquo;{t.text}&rdquo;</p>
                <strong className="font-serif text-[0.95rem] text-ink">&mdash; {t.name}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
