import Link from "next/link";
import {
  UtensilsCrossed,
  LayoutDashboard,
  MonitorPlay,
  MenuSquare,
  CreditCard,
  QrCode,
  Flame,
  ExternalLink,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar para desktop */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-white shadow-lg shadow-amber-500/20">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                Comida<span className="text-amber-500">Ya</span>
              </span>
              <span className="block text-[10px] uppercase font-bold text-slate-400 -mt-1">
                Panel Dueño
              </span>
            </div>
          </Link>

          {/* Menú de Navegación */}
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              Métricas & Ventas
            </Link>

            <Link
              href="/dashboard/kds"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <MonitorPlay className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                Cocina KDS
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded">
                EN VIVO
              </span>
            </Link>

            <Link
              href="/dashboard/menu"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <MenuSquare className="w-4 h-4 text-blue-400" />
              Carta & Stock
            </Link>

            <Link
              href="/dashboard/suscripcion"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-purple-400" />
                Suscripción Stripe
              </div>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                PRO
              </span>
            </Link>
          </nav>
        </div>

        {/* Acceso Directo al Menú QR */}
        <div className="mt-8 pt-4 border-t border-slate-800">
          <Link
            href="/menu/fuego-burger"
            target="_blank"
            className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-3 rounded-2xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Menú QR Online</p>
                <p className="text-[10px] text-slate-400">/menu/fuego-burger</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </Link>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
