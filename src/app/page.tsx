"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Flame,
  UtensilsCrossed,
  MonitorPlay,
  QrCode,
  CreditCard,
  Printer,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Smartphone,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FASTFOOD_PLANS } from "@/lib/stripe";

export default function HomePage() {
  // Calculadora de ROI interactiva
  const [monthlySales, setMonthlySales] = useState(4000); // USD
  const appCommission = monthlySales * 0.3; // 30% en apps
  const saasCost = 49; // ComidaYa Pro
  const monthlySavings = Math.max(0, appCommission - saasCost);
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-slate-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 to-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
            <Flame className="w-4 h-4 fill-amber-400" />
            La Solución Estándar para Comidas Rápidas & Dark Kitchens
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight">
            Crea tu SaaS de Comidas Rápidas con{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Cobros Recurrentes
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            La arquitectura más sólida y escalable de la industria:{" "}
            <strong className="text-white">Next.js 16 + Prisma + Stripe Billing</strong>.
            Equipado con Menú QR ultra-rápido, personalizador de combos con extras,
            pantalla de cocina en tiempo real (KDS) y 0% comisiones para los restaurantes.
          </p>

          {/* Botones de Acción Inmediata (Demo en Vivo) */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/menu/fuego-burger"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
            >
              <QrCode className="w-4 h-4" />
              Probar Menú Digital QR (Cliente)
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard/kds"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all hover:scale-105"
            >
              <MonitorPlay className="w-4 h-4 text-emerald-400" />
              Ver Comandera Cocina (KDS)
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white font-medium text-sm px-5 py-3.5 rounded-2xl border border-slate-800 transition-colors"
            >
              Panel de Control Dueño
            </Link>
          </div>

          {/* Badges de Confianza Técnica */}
          <div className="mt-12 pt-8 border-t border-slate-850/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-500" /> Multi-Tenant (1 SaaS para miles de locales)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Stripe Subscriptions Automatizado
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" /> Impresión Térmica 80mm ESC/POS
            </span>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE ROI (Ahorro vs Apps Tradicionales 30%) */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                La Razón por la que los Restaurantes Compran este SaaS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Calculadora de Ahorro: 30% en Apps vs Tarifa Plana SaaS
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Las apps de delivery (Rappi, Uber Eats, DoorDash) cobran entre 25% y 35% de comisión. Con tu plataforma SaaS, el restaurante solo paga tu suscripción mensual fija.
              </p>
            </div>

            {/* Slider de Ventas */}
            <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">
                  Ventas Mensuales en Domicilios del Restaurante:
                </label>
                <span className="text-xl font-black text-amber-400">
                  ${monthlySales.toLocaleString()} USD / mes
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={monthlySales}
                onChange={(e) => setMonthlySales(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>$1,000 USD (Food Truck)</span>
                <span>$10,000 USD (Local Exitoso)</span>
                <span>$25,000 USD (Cadena)</span>
              </div>
            </div>

            {/* Comparativa Gráfica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-red-950/20 border border-red-900/40 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-red-400 uppercase">
                  Comisión Perdida en Apps (30%)
                </span>
                <p className="text-3xl font-black text-red-400">
                  -${appCommission.toFixed(0)} <span className="text-xs text-red-300">USD/mes</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Dinero que se va de las manos del dueño mes tras mes.
                </p>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase">
                  Ahorro Neto con tu SaaS ComidaYa
                </span>
                <p className="text-3xl font-black text-emerald-400">
                  +${monthlySavings.toFixed(0)} <span className="text-xs text-emerald-300">USD/mes</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  ¡El dueño se ahorra <strong>${yearlySavings.toLocaleString()} USD al año</strong> pagando tu suscripción de $49!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOS 4 PILARES DEL SISTEMA PARA COMIDAS RÁPIDAS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-black tracking-wider text-amber-400">
            Módulos Específicos para Comida Rápida
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Diseñado para la Velocidad Extrema de Despacho
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            A diferencia de los restaurantes tradicionales, la comida rápida exige pedidos en menos de 60 segundos y comandas que caen al instante en la parrilla.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pilar 1 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Menú QR Ultra-rápido</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Carga en menos de 1 segundo en el celular del cliente. Sin descargas de apps ni registros pesados. Compatible con delivery, retiro y consumo en mesa.
            </p>
            <Link
              href="/menu/fuego-burger"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1"
            >
              Ver Menú Demo →
            </Link>
          </div>

          {/* Pilar 2 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">KDS Pantalla de Cocina</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comandera digital táctil para la parrilla con alertas sonoras. Controla pedidos nuevos, en preparación y listos con cronómetros por minuto.
            </p>
            <Link
              href="/dashboard/kds"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1"
            >
              Abrir KDS Cocina →
            </Link>
          </div>

          {/* Pilar 3 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-blue-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Tickets Térmicos 80mm</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Formato de impresión nativo para impresoras térmicas de cocina (ESC/POS). Imprime con 1 clic para pegar la comanda en la bolsa o bandeja.
            </p>
            <span className="text-xs text-blue-400 font-semibold block">Listo para imprimir</span>
          </div>

          {/* Pilar 4 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-purple-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Stripe Recurrente B2B</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monetización SaaS mensual ($49/mes) cobrada automáticamente a la tarjeta del dueño del restaurante con Stripe Billing y Customer Portal.
            </p>
            <Link
              href="/dashboard/suscripcion"
              className="text-xs text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1"
            >
              Ver Planes Stripe →
            </Link>
          </div>
        </div>
      </section>

      {/* PLANES Y PRICING DE SUSCRIPCIÓN RECURRENTE */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-black tracking-wider text-amber-400">
              Modelo de Monetización SaaS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Planes de Suscripción Recurrente para Restaurantes
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Cobro recurrente mensual o anual con tarjeta de crédito vía Stripe, con actualización de plan y cancelación en autoservicio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* FREE */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-base text-white">{FASTFOOD_PLANS.FREE.name}</h3>
                <p className="text-xs text-slate-400">{FASTFOOD_PLANS.FREE.description}</p>
                <div className="text-3xl font-black text-white">
                  $0 <span className="text-xs font-normal text-slate-400">/ mes</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {FASTFOOD_PLANS.FREE.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/menu/fuego-burger"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs text-center block transition-colors"
              >
                Probar Gratis
              </Link>
            </div>

            {/* PRO (DESTACADO) */}
            <div className="bg-gradient-to-b from-slate-900 to-amber-950/20 border-2 border-amber-500 rounded-3xl p-6 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-amber-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                RECOMENDADO FAST FOOD 🔥
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-base text-white">{FASTFOOD_PLANS.PRO.name}</h3>
                <p className="text-xs text-slate-300">{FASTFOOD_PLANS.PRO.description}</p>
                <div className="text-4xl font-black text-amber-400">
                  $49 <span className="text-xs font-normal text-slate-400">/ mes</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {FASTFOOD_PLANS.PRO.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/dashboard/suscripcion"
                className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 text-white font-black py-3 rounded-xl text-xs text-center block shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                Suscribirme con Stripe ($49/mes)
              </Link>
            </div>

            {/* CHAIN */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-base text-white">{FASTFOOD_PLANS.CHAIN.name}</h3>
                <p className="text-xs text-slate-400">{FASTFOOD_PLANS.CHAIN.description}</p>
                <div className="text-3xl font-black text-white">
                  $99 <span className="text-xs font-normal text-slate-400">/ mes</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {FASTFOOD_PLANS.CHAIN.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/dashboard/suscripcion"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs text-center block transition-colors"
              >
                Contactar Ventas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
