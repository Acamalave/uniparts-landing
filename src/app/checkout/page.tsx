import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Checkout from "@/components/shop/Checkout";

export const metadata: Metadata = {
  title: "Finalizar pedido | Uniparts Andina",
  description: "Confirma tu carrito, indica los datos de entrega y elige cómo pagar. Sin cuenta, en minutos.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="bg-brand-gray-light min-h-screen pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Checkout />
        </div>
      </main>
      <Footer />
    </>
  );
}
