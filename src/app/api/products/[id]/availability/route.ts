import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isAvailable } = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: { isAvailable: Boolean(isAvailable) },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    return NextResponse.json({ error: "No se pudo actualizar el producto" }, { status: 500 });
  }
}
