"use client";

import Link from "next/link";
import { UtensilsCrossed, MonitorPlay, QrCode, CreditCard, ChevronRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              Comida<span className="text-amber-500">Ya</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
              SaaS Fast Food
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            href="/menu/fuego-burger"
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-500" />
            Menú Digital QR
          </Link>
          <Link
            href="/dashboard/kds"
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <MonitorPlay className="w-4 h-4 text-emerald-400" />
            Comandera Cocina (KDS)
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-amber-400 transition-colors"
          >
            Panel Restaurante
          </Link>
          <Link
            href="/dashboard/suscripcion"
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-blue-400" />
            Planes & Stripe
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-all"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/menu/fuego-burger"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            Demo en Vivo
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
