import { NextRequest, NextResponse } from "next/server";
import { stripe, FASTFOOD_PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { planId, slug } = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: slug || "fuego-burger" },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    const selectedPlan = planId === "CHAIN" ? FASTFOOD_PLANS.CHAIN : FASTFOOD_PLANS.PRO;

    // Si no hay clave real de Stripe configurada (o es placeholder), modo demo seguro
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { plan: selectedPlan.id },
      });
      return NextResponse.json({
        url: `${appUrl}/dashboard/suscripcion?success=true&mock=true`,
      });
    }

    // Asegurar que existe el Customer en Stripe
    let customerId = restaurant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: restaurant.email,
        name: restaurant.name,
        metadata: {
          restaurantId: restaurant.id,
          slug: restaurant.slug,
        },
      });
      customerId = customer.id;

      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Crear la sesión de suscripción recurrente en Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ComidaYa SaaS - ${selectedPlan.name}`,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.priceMonthly * 100, // en centavos
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        restaurantId: restaurant.id,
        planId: selectedPlan.id,
      },
      success_url: `${appUrl}/dashboard/suscripcion?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/suscripcion?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error en Stripe Checkout:", error);
    return NextResponse.json(
      { error: error?.message || "Error al iniciar suscripción recurrente con Stripe" },
      { status: 500 }
    );
  }
}
