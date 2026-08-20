import Hero from "@/components/Hero";
import SpecialOffers from "@/components/SpecialOffers";
import MenuSection from "@/components/MenuSection";
import MaisonSpecials from "@/components/MaisonSpecials";
import CustomCakeCta from "@/components/CustomCakeCta";
import HowToOrder from "@/components/HowToOrder";
import WhyUs from "@/components/WhyUs";
import About from "@/components/About";
import DeliveryPayment from "@/components/DeliveryPayment";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import CustomerGallery from "@/components/review/CustomerGallery";
import InstagramStrip from "@/components/InstagramStrip";
import Contact from "@/components/Contact";
import { getHeroBanner } from "@/lib/contentStore";

export default async function Home() {
  const banner = await getHeroBanner();
  return (
    <>
      <Hero banner={banner} />
      <SpecialOffers />
      <MenuSection />
      <MaisonSpecials />
      <CustomCakeCta />
      <HowToOrder />
      <WhyUs />
      <About />
      <DeliveryPayment />
      <Gallery />
      <Testimonials />
      <CustomerGallery />
      <InstagramStrip />
      <Contact />
    </>
  );
}
