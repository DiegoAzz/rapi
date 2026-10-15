import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  TrendingUp,
  MonitorPlay,
  QrCode,
  Flame,
  CheckCircle2,
  Bike,
  Store,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const targetSlug = params.slug || session?.slug || "fuego-burger";

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: targetSlug },
    include: {
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
      products: true,
    },
  });

  if (!restaurant) {
    return (
      <div className="p-8 text-center text-slate-400">
        No se encontró el restaurante. Por favor inicia sesión o crea uno nuevo en /registro.
      </div>
    );
  }

  // Cálculos de métricas
  const orders = restaurant.orders;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "PAID" ? o.total : o.total), 0);
  const activeOrders = orders.filter((o) => o.status === "PENDING" || o.status === "PREPARING");
  const completedOrders = orders.filter((o) => o.status === "DELIVERED" || o.status === "READY");
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{restaurant.name}</h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
              PLAN {restaurant.plan}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Resumen operativo y métricas en tiempo real de tu local de comida rápida.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/kds"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <MonitorPlay className="w-4 h-4" />
            Abrir Cocina KDS
          </Link>
          <Link
            href="/menu/fuego-burger"
            target="_blank"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            Menú Digital
          </Link>
        </div>
      </div>

      {/* 4 Cards de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ventas de Hoy</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {formatPrice(totalRevenue, restaurant.currency)}
          </p>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 100% de ganancia directa (0% comisiones)
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">En Cocina Activos</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{activeOrders.length} comandas</p>
          <p className="text-xs text-amber-400">
            {orders.filter((o) => o.status === "PENDING").length} pendientes por iniciar
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {formatPrice(avgTicket, restaurant.currency)}
          </p>
          <p className="text-xs text-slate-400">{orders.length} pedidos totales registrados</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tiempo Promedio</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">12 min</p>
          <p className="text-xs text-purple-400">Meta fast food: &lt; 15 min</p>
        </div>
      </div>

      {/* Tabla de Comandas Recientes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-black text-base text-white">Historial de Comandas & Pedidos</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pedidos recibidos a través del Menú QR o tomados en el mostrador.
            </p>
          </div>
          <Link
            href="/dashboard/kds"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            Ver en Comandera KDS →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5"># Orden</th>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Modalidad</th>
                <th className="px-5 py-3.5">Productos</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Estado Cocina</th>
                <th className="px-5 py-3.5">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-black text-white">
                    #{order.orderNumber}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-white">{order.customerName}</p>
                    <p className="text-[11px] text-slate-400">{order.customerPhone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-300">
                      {order.type === "DELIVERY" ? (
                        <Bike className="w-3 h-3 text-blue-400" />
                      ) : order.type === "DINE_IN" ? (
                        <Store className="w-3 h-3 text-purple-400" />
                      ) : (
                        <ShoppingBag className="w-3 h-3 text-amber-400" />
                      )}
                      {order.type === "DINE_IN" ? order.tableNumber || "Mesa" : order.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      {order.items.map((it) => (
                        <p key={it.id} className="text-slate-300">
                          <strong className="text-white">{it.quantity}x</strong> {it.productName}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-black text-amber-400">
                    {formatPrice(order.total, restaurant.currency)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                          : order.status === "PREPARING"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : order.status === "READY"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
