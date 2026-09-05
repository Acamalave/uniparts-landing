import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Store from "@/components/Store";
import EquipmentFinder from "@/components/EquipmentFinder";
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
        <Store />
        <EquipmentFinder />
        <Repuestos />
        <WhyUs />
        <QuoteForm />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
