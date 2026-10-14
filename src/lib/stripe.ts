import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key_comidaya";

export const stripe = new Stripe(apiKey, {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});

export const FASTFOOD_PLANS = {
  FREE: {
    id: "FREE",
    name: "Plan Emprendedor (Gratis)",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Para pequeños puestos o food trucks que inician.",
    features: [
      "Hasta 50 pedidos al mes",
      "Menú digital con código QR",
      "Pedidos directos a WhatsApp",
      "Hasta 10 productos en el menú",
      "Soporte por email",
    ],
    limits: {
      maxMonthlyOrders: 50,
      kdsRealtime: false,
      thermalPrint: false,
      customBranding: false,
    },
  },
  PRO: {
    id: "PRO",
    name: "Plan Fast Food Pro",
    priceMonthly: 49,
    priceYearly: 470,
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
    description: "El estándar para hamburgueserías, pizzerías y locales de comida rápida en alto volumen.",
    badge: "MÁS POPULAR 🔥",
    features: [
      "Pedidos ilimitados (0% comisión)",
      "Pantalla de Cocina KDS en Tiempo Real",
      "Impresión de comandas térmicas (58/80mm)",
      "Modificadores y extras ilimitados",
      "Modos Delivery, Retiro y Mesas con QR",
      "Alertas sonoras en cocina al entrar pedidos",
      "Reportes de ventas y platos estrella",
      "Soporte prioritario WhatsApp 24/7",
    ],
    limits: {
      maxMonthlyOrders: Infinity,
      kdsRealtime: true,
      thermalPrint: true,
      customBranding: true,
    },
  },
  CHAIN: {
    id: "CHAIN",
    name: "Plan Multi-Sucursal / Cadena",
    priceMonthly: 99,
    priceYearly: 950,
    stripePriceId: process.env.STRIPE_PRICE_CHAIN_MONTHLY || "price_chain_monthly",
    description: "Para cadenas de comida rápida con múltiples sucursales y cocinas ocultas (Dark Kitchens).",
    features: [
      "Todo lo incluido en el Plan Pro",
      "Múltiples sucursales y cocinas conectadas",
      "Control de inventario de ingredientes",
      "Dominio web propio (pedidos.turestaurante.com)",
      "Múltiples pantallas KDS (Parrilla, Ensamble, Empaque)",
      "API de integración con sistemas POS físicos",
      "Gerente de cuenta dedicado",
    ],
    limits: {
      maxMonthlyOrders: Infinity,
      kdsRealtime: true,
      thermalPrint: true,
      customBranding: true,
    },
  },
};
