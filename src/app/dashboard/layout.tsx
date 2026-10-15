import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  UtensilsCrossed,
  LayoutDashboard,
  MonitorPlay,
  MenuSquare,
  Users,
  Settings,
  CreditCard,
  QrCode,
  LogOut,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const slug = session?.slug || "fuego-burger";

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar para desktop */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo y Nombre del Restaurante */}
          <Link href="/" className="flex items-center gap-2.5 mb-6 px-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-white shadow-lg shadow-amber-500/20 shrink-0">
              {restaurant?.logoUrl ? (
                <img
                  src={restaurant.logoUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <UtensilsCrossed className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-base font-black tracking-tight text-white block truncate">
                {restaurant?.name || "ComidaYa"}
              </span>
              <span className="block text-[10px] uppercase font-bold text-amber-400">
                Plan {restaurant?.plan || "PRO"}
              </span>
            </div>
          </Link>

          {/* Menú de Navegación Multi-Tenant */}
          <nav className="space-y-1">
            <Link
              href={`/dashboard?slug=${slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              Métricas & Ventas
            </Link>

            <Link
              href={`/dashboard/kds?slug=${slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <MonitorPlay className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                Cocina KDS
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded">
                EN VIVO
              </span>
            </Link>

            <Link
              href={`/dashboard/menu?slug=${slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <MenuSquare className="w-4 h-4 text-blue-400" />
              Platos & Carta
            </Link>

            <Link
              href={`/dashboard/clientes?slug=${slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Users className="w-4 h-4 text-pink-400" />
              Clientes & CRM
            </Link>

            <Link
              href={`/dashboard/ajustes?slug=${slug}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              Ajustes & Marca
            </Link>

            <Link
              href={`/dashboard/suscripcion?slug=${slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-purple-400" />
                Suscripción Stripe
              </div>
            </Link>
          </nav>
        </div>

        {/* Acceso Directo al Menú QR & Logout */}
        <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">
          <Link
            href={`/menu/${slug}`}
            target="_blank"
            className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-3 rounded-2xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Menú Digital QR</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">/menu/{slug}</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-slate-850 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
