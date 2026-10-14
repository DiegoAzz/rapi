import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && webhookSecret !== "whsec_placeholder_webhook") {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Modo desarrollo o fallback si no hay webhook secret configurado
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`⚠️ Error al verificar firma de webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const restaurantId = session.metadata?.restaurantId;
        const planId = session.metadata?.planId || "PRO";

        if (restaurantId) {
          await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
              plan: planId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const periodEnd = (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000)
          : null;

        await prisma.restaurant.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeCurrentPeriodEnd: periodEnd,
            plan: subscription.status === "active" ? "PRO" : "FREE",
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.restaurant.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        break;
      }

      default:
        // Evento no manejado específicamente
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error al procesar webhook de Stripe:", error);
    return NextResponse.json({ error: "Error al procesar webhook" }, { status: 500 });
  }
}
