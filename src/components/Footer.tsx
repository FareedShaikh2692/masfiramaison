import Link from "next/link";
import { BUSINESS } from "@/data/data";

export default function Footer() {
  return (
    <footer className="print:hidden text-white/60 text-[0.88rem]" style={{ background: "#34291F" }}>
      <div className="container-app flex flex-wrap items-center justify-between gap-5 py-12">
        <span className="font-serif text-lg text-white">{BUSINESS.name}</span>
        <nav className="flex flex-wrap gap-5" aria-label="Footer">
          <Link href="/#home" className="hover:text-gold-light">Home</Link>
          <Link href="/#menu" className="hover:text-gold-light">Our Menu</Link>
          <Link href="/#custom-cakes" className="hover:text-gold-light">Custom Cakes</Link>
          <Link href="/#gallery" className="hover:text-gold-light">Gallery</Link>
          <Link href="/terms" className="hover:text-gold-light">Terms &amp; Conditions</Link>
          <Link href="/#contact" className="hover:text-gold-light">Contact</Link>
        </nav>
      </div>
      <div className="text-center opacity-60 text-[0.8rem] pb-7">
        &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}
