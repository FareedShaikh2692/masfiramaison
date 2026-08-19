import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { BUSINESS } from "@/data/data";
import { OrderProvider } from "@/components/order/OrderContext";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import OrderPanel from "@/components/order/OrderPanel";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"]
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Masfira Maison | Homemade Cakes, Bento Cakes & Custom Celebration Cakes",
  description:
    "Masfira Maison bakes premium homemade cakes, bento cakes, cupcakes and custom celebration cakes to order. Advance payment via Google Pay, UPI or Paytm — no COD. Order on WhatsApp.",
  keywords: [
    "homemade cakes",
    "custom cakes",
    "bento cake",
    "birthday cakes",
    "freshly baked cakes",
    "homemade bakery",
    "custom celebration cakes",
    "tres leches cake",
    "cupcakes"
  ],
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    title: "Masfira Maison | Homemade at heart. Premium by design.",
    description:
      "Handcrafted homemade cakes, bento cakes, cupcakes and custom celebration cakes — freshly baked to order."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Bakery",
              name: BUSINESS.name,
              description: "Premium homemade cakes, bento cakes and custom celebration cakes, freshly baked to order.",
              telephone: `+${BUSINESS.countryCode}${BUSINESS.phone}`,
              priceRange: "₹₹",
              sameAs: [BUSINESS.instagramUrl],
              address: {
                "@type": "PostalAddress",
                streetAddress: BUSINESS.addressLine,
                addressLocality: BUSINESS.area,
                addressRegion: BUSINESS.city,
                postalCode: "411048",
                addressCountry: "IN"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased pb-[78px] md:pb-0">
        <OrderProvider>
          <a href="#main" className="sr-only focus:not-sr-only fixed top-0 left-0 z-[2000] bg-ink text-white px-5 py-3">
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <WhatsappFloat />
          <OrderPanel />
        </OrderProvider>
      </body>
    </html>
  );
}
