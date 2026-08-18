import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import MaisonSpecials from "@/components/MaisonSpecials";
import CustomCakeCta from "@/components/CustomCakeCta";
import HowToOrder from "@/components/HowToOrder";
import WhyUs from "@/components/WhyUs";
import About from "@/components/About";
import DeliveryPayment from "@/components/DeliveryPayment";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import InstagramStrip from "@/components/InstagramStrip";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <MenuSection />
      <MaisonSpecials />
      <CustomCakeCta />
      <HowToOrder />
      <WhyUs />
      <About />
      <DeliveryPayment />
      <Gallery />
      <Testimonials />
      <InstagramStrip />
      <Contact />
    </>
  );
}
