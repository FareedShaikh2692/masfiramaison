import { HOW_TO_ORDER } from "@/data/data";
import Reveal from "@/components/Reveal";

export default function HowToOrder() {
  return (
    <section id="how-to-order" className="py-28">
      <div className="container-app">
        <Reveal className="text-center max-w-[680px] mx-auto mb-14">
          <span className="eyebrow justify-center">Simple &amp; Easy</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">How To Order</h2>
        </Reveal>
        <Reveal delay={0.1} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {HOW_TO_ORDER.map((s) => (
            <div key={s.step} className="card text-center p-6 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(64,51,42,0.10)]">
              <div
                className="w-10 h-10 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-serif font-bold text-[1rem]"
                style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))" }}
              >
                {s.step}
              </div>
              <h4 className="text-[0.98rem] mb-1.5">{s.title}</h4>
              <p className="text-[0.82rem] text-text-muted m-0">{s.text}</p>
            </div>
          ))}
        </Reveal>
        <p className="text-center mt-9 text-text-muted italic">
          Please place your order in advance so we can prepare your cake fresh for your special occasion.
        </p>
      </div>
    </section>
  );
}
