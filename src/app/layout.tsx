import type { Metadata } from "next";
import { Inter, Barlow } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Fuente display para titulares (hero, tienda): industrial y moderna, tipo señalética.
// Cambiar aquí la fuente la sustituye en todos los titulares (usan `font-display`).
const display = Barlow({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Uniparts Andina | Montacargas de Litio y Repuestos en Venezuela",
  description:
    "Montacargas de litio y de combustión, nuevos y usados, repuestos originales y alternativos, cauchos y servicio técnico en toda Venezuela. Cotiza ahora.",
  keywords:
    "montacargas, montacargas usados, montacargas combustión, repuestos montacargas, cauchos montacargas, montacargas litio, Venezuela, apiladores, transpaletas",
  openGraph: {
    title: "Uniparts Andina | Montacargas y Repuestos en Venezuela",
    description:
      "Tu operación no puede parar. Montacargas de litio, repuestos y servicio técnico especializado.",
    type: "website",
    locale: "es_VE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} ${display.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
