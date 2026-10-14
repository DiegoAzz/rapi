import { prisma } from "@/lib/prisma";
import SubscriptionClientActions from "./SubscriptionClientActions";
import { FASTFOOD_PLANS } from "@/lib/stripe";
import { Check, ShieldCheck, Zap, Sparkles, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubscriptionDashboardPage() {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: "fuego-burger" },
  });

  const currentPlan = restaurant?.plan || "FREE";

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Suscripción SaaS & Facturación Recurrente
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tarifa plana transparente sin comisiones por pedido. Gestionado de forma segura con Stripe Billing.
        </p>
      </div>

      {/* Estado Actual */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-black tracking-wider text-amber-400">
            Tu Plan Actual
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            {currentPlan === "PRO"
              ? FASTFOOD_PLANS.PRO.name
              : currentPlan === "CHAIN"
              ? FASTFOOD_PLANS.CHAIN.name
              : FASTFOOD_PLANS.FREE.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {currentPlan === "PRO"
              ? "Disfrutas de pedidos ilimitados, KDS en cocina en tiempo real y 0% de comisiones."
              : "Plan básico con límites. Mejora a PRO para activar la pantalla de cocina y pedidos ilimitados."}
          </p>
        </div>

        <SubscriptionClientActions currentPlan={currentPlan} slug="fuego-burger" />
      </div>

      {/* Comparativa de Planes de Suscripción Recurrente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* PLAN FREE */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">{FASTFOOD_PLANS.FREE.name}</h3>
            <p className="text-xs text-slate-400">{FASTFOOD_PLANS.FREE.description}</p>
            <div className="text-3xl font-black text-white">
              $0 <span className="text-xs font-normal text-slate-400">/ mes</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {FASTFOOD_PLANS.FREE.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            disabled
            className="w-full bg-slate-800 text-slate-500 font-bold py-2.5 rounded-xl text-xs"
          >
            {currentPlan === "FREE" ? "Plan Actual" : "Básico"}
          </button>
        </div>

        {/* PLAN PRO (DESTACADO) */}
        <div className="bg-gradient-to-b from-slate-900 to-amber-950/20 border-2 border-amber-500 p-6 rounded-2xl flex flex-col justify-between space-y-6 relative shadow-2xl shadow-amber-500/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            MÁS POPULAR FAST FOOD 🔥
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">{FASTFOOD_PLANS.PRO.name}</h3>
            <p className="text-xs text-slate-300">{FASTFOOD_PLANS.PRO.description}</p>
            <div className="text-4xl font-black text-amber-400">
              $49 <span className="text-xs font-normal text-slate-400">/ mes (Stripe)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              {FASTFOOD_PLANS.PRO.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <SubscriptionClientActions
            currentPlan={currentPlan}
            slug="fuego-burger"
            targetPlan="PRO"
            isPrimaryButton
          />
        </div>

        {/* PLAN MULTI-SUCURSAL */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-white">{FASTFOOD_PLANS.CHAIN.name}</h3>
            <p className="text-xs text-slate-400">{FASTFOOD_PLANS.CHAIN.description}</p>
            <div className="text-3xl font-black text-white">
              $99 <span className="text-xs font-normal text-slate-400">/ mes</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {FASTFOOD_PLANS.CHAIN.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <SubscriptionClientActions
            currentPlan={currentPlan}
            slug="fuego-burger"
            targetPlan="CHAIN"
          />
        </div>
      </div>
    </div>
  );
}
