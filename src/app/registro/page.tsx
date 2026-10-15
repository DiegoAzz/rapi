"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles,
  Store,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [foodType, setFoodType] = useState("BURGER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar vista previa del slug
  const previewSlug = name
    ? name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
    : "tu-restaurante";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          whatsappNumber,
          foodType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al registrar el restaurante");
      }

      // Redirigir al dashboard con sesión activa
      router.push(`/dashboard?slug=${data.restaurant.slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Luz ambiental */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Comida<span className="text-amber-500">Ya</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Crea tu Restaurante en 60 Segundos
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Tu menú digital QR, comandas de cocina y pedidos sin comisiones listo para vender hoy.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Nombre del Negocio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nombre de tu Restaurante / Local *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Smash Bros Burger"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tu enlace público será:{" "}
                <span className="text-amber-400 font-mono font-bold">
                  comidaya.com/menu/{previewSlug}
                </span>
              </p>
            </div>

            {/* 2. Categoría Gastronómica */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                ¿Qué tipo de comida rápida vendes?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFoodType("BURGER")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    foodType === "BURGER"
                      ? "bg-amber-500/20 border-amber-500 text-white font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl block mb-1">🍔</span>
                  <span className="text-xs">Hamburguesas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFoodType("PIZZA")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    foodType === "PIZZA"
                      ? "bg-amber-500/20 border-amber-500 text-white font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl block mb-1">🍕</span>
                  <span className="text-xs">Pizzas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFoodType("TACOS")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    foodType === "TACOS"
                      ? "bg-amber-500/20 border-amber-500 text-white font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl block mb-1">🌮</span>
                  <span className="text-xs">Tacos / Varios</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Te precargaremos automáticamente productos iniciales con fotos para que no empieces en blanco.
              </p>
            </div>

            {/* 3. WhatsApp para Pedidos */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Número de WhatsApp para Recibir Pedidos *
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Ej. +573001234567 o +52155..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 4. Correo y Contraseña */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@turestaurante.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Contraseña de Acceso *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black py-3.5 px-4 rounded-xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando tu Restaurante y Menú...
                </>
              ) : (
                <>
                  Crear mi Restaurante y Empezar Gratis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            ¿Ya tienes una cuenta de restaurante registrada?{" "}
            <Link href="/login" className="text-amber-400 font-bold hover:underline">
              Iniciar Sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
