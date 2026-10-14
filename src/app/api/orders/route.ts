import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "fuego-burger";
    const status = searchParams.get("status");

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    const whereClause: any = {
      restaurantId: restaurant.id,
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, orders, restaurant });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      type,
      tableNumber,
      customerName,
      customerPhone,
      customerAddress,
      customerNotes,
      paymentMethod,
      items,
    } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios (nombre, teléfono o artículos del pedido)" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: slug || "fuego-burger" },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    // Calcular el siguiente orderNumber
    const lastOrder = await prisma.order.findFirst({
      where: { restaurantId: restaurant.id },
      orderBy: { orderNumber: "desc" },
    });

    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 101;

    // Calcular subtotales
    let subtotal = 0;
    const preparedItems = items.map((item: any) => {
      let itemPrice = Number(item.unitPrice) || 0;
      if (item.modifiers && Array.isArray(item.modifiers)) {
        item.modifiers.forEach((m: any) => {
          itemPrice += Number(m.price) || 0;
        });
      }
      const itemTotal = itemPrice * (Number(item.quantity) || 1);
      subtotal += itemTotal;

      return {
        productId: item.productId,
        productName: item.productName,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: itemTotal,
        selectedModifiers: item.modifiers ? JSON.stringify(item.modifiers) : null,
        specialInstructions: item.specialInstructions || null,
      };
    });

    const deliveryFee = type === "DELIVERY" ? restaurant.deliveryFee : 0;
    const total = subtotal + deliveryFee;

    const newOrder = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        orderNumber: nextOrderNumber,
        type: type || "DELIVERY",
        tableNumber: type === "DINE_IN" ? tableNumber : null,
        customerName,
        customerPhone,
        customerAddress: type === "DELIVERY" ? customerAddress : null,
        customerNotes,
        subtotal,
        deliveryFee,
        total,
        status: "PENDING",
        paymentMethod: paymentMethod || "CASH",
        paymentStatus: "PENDING",
        items: {
          create: preparedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return NextResponse.json({ error: "Error al procesar el pedido" }, { status: 500 });
  }
}
