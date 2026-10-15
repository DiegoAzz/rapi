import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const { name, slug } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre de la categoría es obligatorio." }, { status: 400 });
    }

    const targetSlug = slug || session?.slug || "fuego-burger";
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: targetSlug },
      include: { categories: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    const category = await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: name.trim(),
        order: restaurant.categories.length + 1,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de categoría requerido" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json({ error: "Error al eliminar categoría" }, { status: 500 });
  }
}
