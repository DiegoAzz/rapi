import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || session?.slug || "fuego-burger";

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        whatsappNumber: true,
        description: true,
        logoUrl: true,
        bannerUrl: true,
        address: true,
        currency: true,
        deliveryFee: true,
        minOrder: true,
        isOpen: true,
        estimatedMinutes: true,
        plan: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error("Error al obtener ajustes:", error);
    return NextResponse.json({ error: "Error al cargar configuración" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const {
      slug,
      name,
      description,
      logoUrl,
      bannerUrl,
      whatsappNumber,
      phone,
      address,
      currency,
      deliveryFee,
      minOrder,
      estimatedMinutes,
      isOpen,
    } = body;

    const targetSlug = slug || session?.slug || "fuego-burger";

    const updated = await prisma.restaurant.update({
      where: { slug: targetSlug },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(whatsappNumber !== undefined && { whatsappNumber: whatsappNumber.replace(/[^0-9+]/g, "") }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(currency !== undefined && { currency }),
        ...(deliveryFee !== undefined && { deliveryFee: Number(deliveryFee) || 0 }),
        ...(minOrder !== undefined && { minOrder: Number(minOrder) || 0 }),
        ...(estimatedMinutes !== undefined && { estimatedMinutes: Number(estimatedMinutes) || 20 }),
        ...(isOpen !== undefined && { isOpen: Boolean(isOpen) }),
      },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error: any) {
    console.error("Error al guardar ajustes:", error);
    return NextResponse.json({ error: "No se pudieron guardar los cambios" }, { status: 500 });
  }
}
