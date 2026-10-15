import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import {
  Users,
  MessageCircle,
  ShoppingBag,
  Clock,
  Sparkles,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardClientesPage({
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
      customers: {
        orderBy: { totalOrders: "desc" },
      },
    },
  });

  if (!restaurant) {
    return <div className="p-8 text-center text-slate-400">Restaurante no encontrado.</div>;
  }

  const customers = restaurant.customers;
  const totalCustomers = customers.length;
  const totalCustomerSales = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Directorio de Clientes & CRM</h1>
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {totalCustomers} clientes registrados
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tu propia base de datos de comensales. Sin intermediarios, con acceso directo a su WhatsApp para fidelizarlos con promociones.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Total Ventas Clientes
            </span>
            <span className="text-sm font-black text-emerald-400">
              {formatPrice(totalCustomerSales, restaurant.currency)}
            </span>
          </div>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Aún no tienes clientes registrados</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Apenas tus clientes comiencen a pedir desde tu Menú QR o mostrador, se registrarán automáticamente aquí con su teléfono y compras totales.
          </p>
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs mt-2"
          >
            Abrir mi Menú Digital para simular una compra
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">WhatsApp / Contacto</th>
                  <th className="px-5 py-3.5">Dirección Habitual</th>
                  <th className="px-5 py-3.5">Pedidos Totales</th>
                  <th className="px-5 py-3.5">Total Gastado</th>
                  <th className="px-5 py-3.5">Último Pedido</th>
                  <th className="px-5 py-3.5 text-right">Acción Fidelización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customers.map((c) => {
                  const cleanPhone = c.phone.replace(/[^0-9]/g, "");
                  const promoMsg = encodeURIComponent(
                    `¡Hola ${c.name}! 🔥 Te saludamos de *${restaurant.name}*. Queremos agradecerte por ser nuestro cliente frecuente y te regalamos un descuento especial en tu próximo combo de comida rápida. ¡Pide aquí: http://localhost:3000/menu/${restaurant.slug} !`
                  );
                  const waUrl = `https://wa.me/${cleanPhone}?text=${promoMsg}`;

                  return (
                    <tr key={c.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">{c.name}</p>
                          {c.totalOrders >= 3 && (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              VIP ⭐
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-mono">
                        {c.phone}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {c.address ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            {c.address}
                          </span>
                        ) : (
                          <span className="text-slate-600">No especificada</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-slate-800 text-white font-bold px-2 py-0.5 rounded">
                          {c.totalOrders} órdenes
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-amber-400">
                        {formatPrice(c.totalSpent, restaurant.currency)}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(c.lastOrderAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Enviar Promo WhatsApp
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
