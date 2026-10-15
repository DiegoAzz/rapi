import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, whatsappNumber, foodType = "BURGER" } = body;

    if (!name || !email || !password || !whatsappNumber) {
      return NextResponse.json(
        { error: "Por favor completa todos los campos obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Generar slug URL-friendly
    let slug = name
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remover acentos
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) slug = `local-${Date.now()}`;

    // Verificar si el email ya existe
    const existingEmail = await prisma.restaurant.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Ya existe un restaurante registrado con este correo electrónico." },
        { status: 400 }
      );
    }

    // Si el slug ya existe, agregar un sufijo único
    const existingSlug = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const hashedPassword = hashPassword(password);

    // Crear Restaurante en PostgreSQL
    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        slug,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        whatsappNumber: whatsappNumber.replace(/[^0-9+]/g, ""),
        plan: "FREE",
        isOpen: true,
        estimatedMinutes: 25,
        currency: "USD",
        deliveryFee: 2.5,
        minOrder: 5.0,
        description: `Los mejores platos de ${name} con despacho rápido a domicilio y retiro.`,
      },
    });

    // Precargar menú inicial según el tipo de comida rápida seleccionado
    await createStarterMenu(restaurant.id, foodType);

    // Iniciar sesión automáticamente
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
  } catch (error: any) {
    console.error("Error al registrar restaurante:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el registro. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

async function createStarterMenu(restaurantId: string, foodType: string) {
  try {
    if (foodType === "PIZZA") {
      const cat = await prisma.category.create({
        data: {
          restaurantId,
          name: "Pizzas Artesanales",
          order: 1,
        },
      });

      await prisma.product.createMany({
        data: [
          {
            restaurantId,
            categoryId: cat.id,
            name: "Pizza Pepperoni Suprema",
            description: "Masa madre crocante, salsa de tomates italianos, mozzarella fundida y abundante pepperoni.",
            price: 13.99,
            badge: "MÁS VENDIDA 🔥",
            imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80",
          },
          {
            restaurantId,
            categoryId: cat.id,
            name: "Pizza Cuatro Quesos",
            description: "Mozzarella, gorgonzola, parmesano reggiano y queso provolone suave.",
            price: 14.50,
            imageUrl: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80",
          },
        ],
      });
    } else if (foodType === "TACOS") {
      const cat = await prisma.category.create({
        data: {
          restaurantId,
          name: "Tacos & Antojitos",
          order: 1,
        },
      });

      await prisma.product.createMany({
        data: [
          {
            restaurantId,
            categoryId: cat.id,
            name: "Orden de Tacos al Pastor (3 uds)",
            description: "Carne marinada al achiote con piña asada, cebolla, cilantro y tortillas de maíz nixtamalizado.",
            price: 8.50,
            badge: "TOP DEL CHEF 🌮",
            imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=80",
          },
          {
            restaurantId,
            categoryId: cat.id,
            name: "Quesadilla de Birria con Consomé",
            description: "Tortilla dorada a la plancha rellena de carne de res jugosa y queso Oaxaca con consomé para chopear.",
            price: 10.00,
            imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80",
          },
        ],
      });
    } else {
      // Default: BURGERS & FAST FOOD
      const cat = await prisma.category.create({
        data: {
          restaurantId,
          name: "Hamburguesas Clásicas & Smash",
          order: 1,
        },
      });

      const catDrinks = await prisma.category.create({
        data: {
          restaurantId,
          name: "Bebidas & Acompañamientos",
          order: 2,
        },
      });

      const p1 = await prisma.product.create({
        data: {
          restaurantId,
          categoryId: cat.id,
          name: "Classic Cheeseburger",
          description: "Carne seleccionada a la plancha, doble queso cheddar fundido, lechuga fresca, tomate y salsa de la casa.",
          price: 9.50,
          badge: "CLÁSICO 🍔",
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
        },
      });

      // Crear grupo de modificador para la hamburguesa
      const mod = await prisma.modifierGroup.create({
        data: {
          productId: p1.id,
          name: "¿Deseas agregar extras?",
          required: false,
          minSelect: 0,
          maxSelect: 3,
        },
      });

      await prisma.modifierOption.createMany({
        data: [
          { modifierGroupId: mod.id, name: "Tocineta Crujiente", price: 1.50 },
          { modifierGroupId: mod.id, name: "Extra Queso Cheddar", price: 1.00 },
          { modifierGroupId: mod.id, name: "Papas Fritas Medianas", price: 2.50 },
        ],
      });

      await prisma.product.create({
        data: {
          restaurantId,
          categoryId: catDrinks.id,
          name: "Papas Rústicas Sazonadas",
          description: "Papas crujientes con paprika, sal marina y dip de mayonesa de ajo.",
          price: 4.00,
          imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&auto=format&fit=crop&q=80",
        },
      });
    }
  } catch (e) {
    console.error("Error al precargar menú inicial:", e);
  }
}
