import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ComidaYa - El SaaS Estándar para Comidas Rápidas & Dark Kitchens",
  description: "Menú Digital QR, Pedidos sin Comisión, Comandera de Cocina en Tiempo Real (KDS) y Facturación Recurrente para restaurantes de comida rápida.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
