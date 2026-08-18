"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrder } from "@/components/order/OrderContext";

const LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#menu", label: "Our Menu" },
  { href: "/#custom-cakes", label: "Custom Cakes" },
  { href: "/#about", label: "About Us" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#how-to-order", label: "How to Order" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/#contact", label: "Contact" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openProductOrder } = useOrder();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[900] h-[84px] flex items-center transition-all duration-300 ${
          scrolled ? "h-[72px] bg-[rgba(251,246,238,0.92)] backdrop-blur-md shadow-[0_2px_24px_rgba(64,51,42,0.08)]" : "bg-transparent"
        }`}
      >
        <div className="container-app flex items-center justify-between gap-5">
          <Link href="/#home" className="flex items-center gap-3">
            <Image src="/images/monogram.svg" alt="" width={42} height={42} priority />
            <span className="font-serif text-2xl font-bold text-ink">Masfira Maison</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-[clamp(10px,1.4vw,22px)]" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[0.84rem] font-medium text-ink whitespace-nowrap hover:text-gold-dark transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3.5">
            <button onClick={() => openProductOrder()} className="btn btn-primary btn-sm hidden lg:inline-flex">
              Order Now
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="lg:hidden flex flex-col gap-1.5 p-2"
            >
              <span className="w-6 h-0.5 bg-ink rounded" />
              <span className="w-6 h-0.5 bg-ink rounded" />
              <span className="w-6 h-0.5 bg-ink rounded" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[950] bg-ivory flex flex-col px-8 pt-[100px] pb-10 transition-transform duration-400 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="absolute top-7 right-6 text-3xl leading-none text-ink">
          &times;
        </button>
        <nav className="flex flex-col" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-serif text-2xl py-4 border-b border-border text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => {
            setMenuOpen(false);
            openProductOrder();
          }}
          className="btn btn-primary btn-block mt-7"
        >
          Order Now
        </button>
      </div>
    </>
  );
}
