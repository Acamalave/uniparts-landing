import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EquipmentFinder from "@/components/EquipmentFinder";
import AvailableNow from "@/components/AvailableNow";
import CompareOptions from "@/components/CompareOptions";
import Repuestos from "@/components/Repuestos";
import WhyUs from "@/components/WhyUs";
import QuoteForm from "@/components/QuoteForm";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <EquipmentFinder />
        <AvailableNow />
        <CompareOptions />
        <Repuestos />
        <WhyUs />
        <QuoteForm />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
