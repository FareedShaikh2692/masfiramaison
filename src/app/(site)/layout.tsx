import type { Metadata } from "next";
import { BUSINESS } from "@/data/data";
import { getBusinessSettings } from "@/lib/settingsStore";
import { BusinessProvider } from "@/components/BusinessContext";
import { OrderProvider } from "@/components/order/OrderContext";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import OrderPanel from "@/components/order/OrderPanel";

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
    description: "Handcrafted homemade cakes, bento cakes, cupcakes and custom celebration cakes — freshly baked to order."
  }
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const business = await getBusinessSettings();

  return (
    <div className="min-h-screen flex flex-col pb-[78px] md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Bakery",
            name: business.name,
            description: "Premium homemade cakes, bento cakes and custom celebration cakes, freshly baked to order.",
            telephone: `+${business.countryCode}${business.phone}`,
            priceRange: "₹₹",
            sameAs: [business.instagramUrl],
            ...(business.addressLine
              ? {
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: business.addressLine,
                    addressLocality: business.area,
                    addressRegion: business.city,
                    addressCountry: "IN"
                  }
                }
              : {})
          })
        }}
      />
      <BusinessProvider business={business}>
        <OrderProvider>
          <a href="#main" className="sr-only focus:not-sr-only fixed top-0 left-0 z-[2000] bg-ink text-white px-5 py-3">
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer business={business} />
          <MobileBottomNav />
          <WhatsappFloat />
          <OrderPanel />
        </OrderProvider>
      </BusinessProvider>
    </div>
  );
}
