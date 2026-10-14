import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: slug || "fuego-burger" },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      return NextResponse.json({
        url: `${appUrl}/dashboard/suscripcion?mock_portal=true`,
      });
    }

    if (!restaurant.stripeCustomerId) {
      return NextResponse.json(
        { error: "No hay cliente de Stripe registrado para este restaurante" },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: restaurant.stripeCustomerId,
      return_url: `${appUrl}/dashboard/suscripcion`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error en Stripe Customer Portal:", error);
    return NextResponse.json(
      { error: error?.message || "Error al acceder al portal de Stripe" },
      { status: 500 }
    );
  }
}
