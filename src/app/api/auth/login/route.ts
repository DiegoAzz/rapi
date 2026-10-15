import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Por favor ingresa tu correo y contraseña." },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "No existe ninguna cuenta con este correo electrónico." },
        { status: 401 }
      );
    }

    // Si la cuenta tiene contraseña, verificar hash. Si es la cuenta demo inicial sin hash, permitir acceso demo
    if (restaurant.password) {
      const isValid = verifyPassword(password, restaurant.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Contraseña incorrecta." },
          { status: 401 }
        );
      }
    }

    // Iniciar sesión
    await setSession(restaurant.id, restaurant.slug);

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        email: restaurant.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno al iniciar sesión." },
      { status: 500 }
    );
  }
}
