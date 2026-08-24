import { WHY_US } from "@/data/data";
import Reveal from "@/components/Reveal";

const ICONS: Record<string, React.ReactNode> = {
  sparkle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /></svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M12 20s-7-4.35-9.5-8.5C.9 8.2 2.8 5 6.2 5c2 0 3.3 1 4.8 2.8C12.5 6 13.8 5 15.8 5c3.4 0 5.3 3.2 3.7 6.5C19 15.65 12 20 12 20z" /></svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M5 20c8 0 14-6 14-14V5h-1C10 5 5 10 5 18v2z" /><path d="M5 20c3-6 6-9 12-13" /></svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><rect x="3" y="9" width="18" height="12" rx="1.5" /><path d="M3 9h18M12 9v12M12 9C10 4 5 4 5 7s3 2 7 2zM12 9c2-5 7-5 7-2s-3 2-7 2z" /></svg>
  ),
  detail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>
  )
};

export default function WhyUs() {
  return (
    <section id="why" className="py-28" style={{ background: "var(--ivory)" }}>
      <div className="container-app">
        <Reveal className="text-center max-w-[680px] mx-auto mb-14">
          <span className="eyebrow justify-center">Our Promise</span>
          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] mt-3.5">Why Masfira Maison?</h2>
        </Reveal>
        <Reveal delay={0.1} className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {WHY_US.map((item) => (
            <div key={item.title} className="text-center p-8 card hover:shadow-[0_20px_45px_rgba(64,51,42,0.10)] hover:-translate-y-2 transition-all duration-500 ease-out">
              <div className="w-16 h-16 mx-auto mb-4.5 rounded-full flex items-center justify-center text-gold-dark" style={{ background: "var(--blush-soft)" }}>
                <span className="w-7 h-7 block">{ICONS[item.icon]}</span>
              </div>
              <h3 className="text-[1.05rem] mb-2">{item.title}</h3>
              <p className="text-[0.88rem] text-text-muted m-0">{item.text}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
