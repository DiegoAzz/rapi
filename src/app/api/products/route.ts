import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const {
      slug,
      categoryId,
      name,
      description,
      price,
      imageUrl,
      badge,
      prepTime = 12,
    } = body;

    const targetSlug = slug || session?.slug || "fuego-burger";

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: targetSlug },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Nombre, precio y categoría son obligatorios." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        restaurantId: restaurant.id,
        categoryId,
        name: name.trim(),
        description: description?.trim() || null,
        price: Number(price) || 0,
        imageUrl: imageUrl?.trim() || null,
        badge: badge?.trim() || null,
        prepTime: Number(prepTime) || 12,
        isAvailable: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de producto requerido" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
