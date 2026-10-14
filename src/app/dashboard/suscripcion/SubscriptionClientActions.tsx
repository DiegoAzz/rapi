"use client";

import { useState } from "react";
import { CreditCard, Zap, ExternalLink, Loader2 } from "lucide-react";

interface Props {
  currentPlan: string;
  slug: string;
  targetPlan?: "PRO" | "CHAIN";
  isPrimaryButton?: boolean;
}

export default function SubscriptionClientActions({
  currentPlan,
  slug,
  targetPlan,
  isPrimaryButton,
}: Props) {
  const [loading, setLoading] = useState(false);

  // Abrir Checkout de Stripe para Suscripción Recurrente
  const handleUpgrade = async (plan: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan, slug }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "No se pudo iniciar el proceso de pago.");
      }
    } catch (err: any) {
      alert("Error al conectar con Stripe.");
    } finally {
      setLoading(false);
    }
  };

  // Abrir Portal de Facturación de Stripe (Customer Portal)
  const handleOpenPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          data.error ||
            "Aún no tienes un perfil de cliente Stripe activo. Mejora a PRO para generarlo automáticamente."
        );
      }
    } catch (err: any) {
      alert("Error al abrir portal de Stripe.");
    } finally {
      setLoading(false);
    }
  };

  // Si es un botón de tarjeta de plan específico
  if (targetPlan) {
    const isCurrent = currentPlan === targetPlan;
    if (isCurrent) {
      return (
        <button
          disabled
          className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 rounded-xl text-xs"
        >
          ✓ Tu Plan Activo
        </button>
      );
    }

    return (
      <button
        disabled={loading}
        onClick={() => handleUpgrade(targetPlan)}
        className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
          isPrimaryButton
            ? "bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
            : "bg-slate-800 hover:bg-slate-700 text-white"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Zap className="w-4 h-4 fill-current" />
        )}
        Suscribirme con Stripe (${targetPlan === "PRO" ? "49" : "99"}/mes)
      </button>
    );
  }

  // Si es la acción del banner superior (Portal de Stripe)
  return (
    <div className="flex items-center gap-3">
      {currentPlan !== "FREE" ? (
        <button
          disabled={loading}
          onClick={handleOpenPortal}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CreditCard className="w-3.5 h-3.5" />
          )}
          Gestionar Facturas & Tarjeta (Portal Stripe)
        </button>
      ) : (
        <button
          disabled={loading}
          onClick={() => handleUpgrade("PRO")}
          className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5 fill-current" />
          )}
          Activar Plan Pro ($49/mes)
        </button>
      )}
    </div>
  );
}
