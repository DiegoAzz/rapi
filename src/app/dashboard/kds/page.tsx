"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bike,
  Store,
  ShoppingBag,
  ArrowRight,
  Maximize2,
  Volume2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  selectedModifiers: string | null;
  specialInstructions: string | null;
}

interface Order {
  id: string;
  orderNumber: number;
  type: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  tableNumber: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  customerNotes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function KitchenDisplaySystemPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoSoundEnabled, setAutoSoundEnabled] = useState(true);

  const prevPendingCount = useRef(0);

  const fetchOrders = async () => {
    try {
      const slug =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("slug") || "fuego-burger"
          : "fuego-burger";
      const res = await fetch(`/api/orders?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
        setLastRefreshed(new Date());

        const pending = data.orders.filter((o: Order) => o.status === "PENDING").length;
        if (pending > prevPendingCount.current && autoSoundEnabled) {
          // Reproducir beep suave para nueva comanda
          playAlertSound();
        }
        prevPendingCount.current = pending;
      }
    } catch (e) {
      console.error("Error al refrescar pedidos KDS:", e);
    } finally {
      setLoading(false);
    }
  };

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio autoplay policy
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // Polling KDS en tiempo real
    return () => clearInterval(interval);
  }, [autoSoundEnabled]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
      }
    } catch (e) {
      alert("Error al actualizar el estado");
    }
  };

  const handlePrintReceipt = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Filtrar pedidos activos
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");

  // Calcular minutos transcurridos
  const getElapsedMinutes = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Barra de Control KDS */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-amber-500/20">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg text-white tracking-wide">
                KDS COCINA & COMANDERA
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En Vivo (4s)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fuego & Burger Craft • Última sincronización: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoSoundEnabled(!autoSoundEnabled)}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              autoSoundEnabled
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Alerta Sonora: {autoSoundEnabled ? "Activada" : "Muda"}
          </button>

          <button
            onClick={fetchOrders}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Refrescar ahora"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/dashboard"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Panel Principal
          </Link>

          <Link
            href="/menu/fuego-burger"
            target="_blank"
            className="text-xs bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
          >
            + Simular Pedido Cliente
          </Link>
        </div>
      </header>

      {/* Grid de 3 Columnas KDS */}
      <main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto">
        {/* COLUMNA 1: NUEVOS / PENDIENTES */}
        <div className="bg-slate-900/50 border border-amber-500/30 rounded-2xl flex flex-col overflow-hidden">
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h2 className="font-black text-amber-300 text-sm tracking-wider uppercase">
                1. Nuevos en Espera
              </h2>
            </div>
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
              {pendingOrders.length}
            </span>
          </div>

          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-40 text-emerald-400" />
                No hay pedidos en espera.
                <span className="text-[10px] mt-1 text-slate-600">
                  Los nuevos pedidos del menú QR aparecerán aquí al instante.
                </span>
              </div>
            ) : (
              pendingOrders.map((order) => {
                const mins = getElapsedMinutes(order.createdAt);
                return (
                  <div
                    key={order.id}
                    className="bg-slate-900 border-2 border-amber-500/80 rounded-xl p-4 shadow-xl space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-white">
                            #{order.orderNumber}
                          </span>
                          <span className="bg-slate-800 text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            {order.type === "DELIVERY" ? (
                              <Bike className="w-3 h-3 text-blue-400" />
                            ) : order.type === "DINE_IN" ? (
                              <Store className="w-3 h-3 text-purple-400" />
                            ) : (
                              <ShoppingBag className="w-3 h-3 text-amber-400" />
                            )}
                            {order.type === "DINE_IN" ? order.tableNumber || "Mesa" : order.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-semibold mt-0.5">
                          {order.customerName}
                        </p>
                      </div>

                      <div
                        className={`text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                          mins >= 10
                            ? "bg-red-500 text-white animate-pulse"
                            : mins >= 5
                            ? "bg-yellow-500 text-slate-950"
                            : "bg-emerald-500 text-slate-950"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {mins} min
                      </div>
                    </div>

                    {/* Desglose de comida */}
                    <div className="border-t border-b border-slate-800 py-2 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs">
                          <div className="flex items-start gap-2">
                            <span className="font-black text-amber-400 text-sm">
                              {item.quantity}x
                            </span>
                            <div className="flex-1">
                              <span className="font-bold text-white text-sm">
                                {item.productName}
                              </span>
                              {item.selectedModifiers && (
                                <div className="text-[11px] text-amber-300/90 font-medium pl-1 mt-0.5">
                                  {JSON.parse(item.selectedModifiers).map((m: any, i: number) => (
                                    <span key={i} className="block">
                                      + {m.option}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {item.specialInstructions && (
                                <p className="text-[11px] text-red-400 font-bold bg-red-950/40 p-1 rounded mt-1 border border-red-900/50">
                                  ⚠️ {item.specialInstructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.customerNotes && (
                      <p className="text-[11px] text-slate-400 italic">
                        Nota: "{order.customerNotes}"
                      </p>
                    )}

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 font-semibold"
                        title="Imprimir comanda térmica"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "PREPARING")}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        A Cocina (Empezar)
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA 2: EN COCINA / PREPARANDO */}
        <div className="bg-slate-900/50 border border-blue-500/30 rounded-2xl flex flex-col overflow-hidden">
          <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-400" />
              <h2 className="font-black text-blue-300 text-sm tracking-wider uppercase">
                2. En Parrilla & Cocina
              </h2>
            </div>
            <span className="bg-blue-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                <Flame className="w-8 h-8 mb-2 opacity-30 text-blue-400" />
                Ningún plato en preparación en este momento.
              </div>
            ) : (
              preparingOrders.map((order) => {
                const mins = getElapsedMinutes(order.createdAt);
                return (
                  <div
                    key={order.id}
                    className="bg-slate-900 border border-blue-500/60 rounded-xl p-4 shadow-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-white">
                            #{order.orderNumber}
                          </span>
                          <span className="bg-slate-800 text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded">
                            {order.type === "DINE_IN" ? order.tableNumber || "Mesa" : order.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-semibold mt-0.5">
                          {order.customerName}
                        </p>
                      </div>

                      <div
                        className={`text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                          mins >= 12
                            ? "bg-red-500 text-white animate-pulse"
                            : mins >= 8
                            ? "bg-yellow-500 text-slate-950"
                            : "bg-blue-500 text-slate-950"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {mins} min
                      </div>
                    </div>

                    <div className="border-t border-b border-slate-800 py-2 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-xs">
                          <div className="flex items-start gap-2">
                            <span className="font-black text-blue-400 text-sm">
                              {item.quantity}x
                            </span>
                            <div className="flex-1">
                              <span className="font-bold text-white text-sm">
                                {item.productName}
                              </span>
                              {item.selectedModifiers && (
                                <div className="text-[11px] text-slate-300 font-medium pl-1 mt-0.5">
                                  {JSON.parse(item.selectedModifiers).map((m: any, i: number) => (
                                    <span key={i} className="block">
                                      + {m.option}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {item.specialInstructions && (
                                <p className="text-[11px] text-red-400 font-bold bg-red-950/40 p-1 rounded mt-1 border border-red-900/50">
                                  ⚠️ {item.specialInstructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "READY")}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ¡Listo! (Pasar a Empaque)
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA 3: LISTOS PARA DESPACHO / ENTREGA */}
        <div className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl flex flex-col overflow-hidden">
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="font-black text-emerald-300 text-sm tracking-wider uppercase">
                3. Listos para Despacho
              </h2>
            </div>
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-30 text-emerald-400" />
                Ningún pedido esperando por repartidor o comensal.
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-emerald-500/60 rounded-xl p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">
                          #{order.orderNumber}
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[11px] px-2 py-0.5 rounded">
                          {order.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-semibold mt-0.5">
                        {order.customerName} • {order.customerPhone}
                      </p>
                      {order.customerAddress && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          📍 {order.customerAddress}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handlePrintReceipt(order)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold py-2 rounded-lg text-xs transition-colors"
                    >
                      Marcar como Entregado
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Recibo Térmico Oculto para Impresión 80mm ESC/POS */}
      {printingOrder && (
        <div id="thermal-receipt" className="hidden print:block text-black bg-white">
          <div className="text-center font-bold text-base mb-1">FUEGO & BURGER CRAFT</div>
          <div className="text-center text-xs mb-2">Av. Gastronómica #45-12 • Fast Food</div>
          <div className="border-t border-b border-black py-1 my-1 flex justify-between font-bold text-sm">
            <span>ORDEN #{printingOrder.orderNumber}</span>
            <span>{printingOrder.type}</span>
          </div>
          <div className="text-xs my-1">
            <div>Fecha: {new Date(printingOrder.createdAt).toLocaleString()}</div>
            <div>Cliente: {printingOrder.customerName}</div>
            <div>Tel: {printingOrder.customerPhone}</div>
            {printingOrder.customerAddress && (
              <div>Dir: {printingOrder.customerAddress}</div>
            )}
            {printingOrder.tableNumber && <div>Mesa: {printingOrder.tableNumber}</div>}
          </div>
          <div className="border-t border-black my-1 pt-1">
            {printingOrder.items.map((it) => (
              <div key={it.id} className="text-xs mb-1">
                <div className="flex justify-between font-bold">
                  <span>
                    {it.quantity}x {it.productName}
                  </span>
                  <span>${it.totalPrice.toFixed(2)}</span>
                </div>
                {it.selectedModifiers && (
                  <div className="text-[10px] pl-2 text-gray-700">
                    {JSON.parse(it.selectedModifiers).map((m: any, i: number) => (
                      <div key={i}>+ {m.option}</div>
                    ))}
                  </div>
                )}
                {it.specialInstructions && (
                  <div className="text-[10px] pl-2 font-bold italic">
                    NOTA: {it.specialInstructions}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-black my-1 pt-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${printingOrder.subtotal.toFixed(2)}</span>
            </div>
            {printingOrder.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>${printingOrder.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm mt-1">
              <span>TOTAL:</span>
              <span>${printingOrder.total.toFixed(2)}</span>
            </div>
            <div className="text-center text-[10px] mt-2 border-t border-dashed border-black pt-1">
              *** Comanda generada con ComidaYa SaaS ***
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
