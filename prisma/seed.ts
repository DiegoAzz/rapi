import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos previa...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.restaurant.deleteMany();

  console.log("Creando restaurante demo para Comidas Rápidas...");
  const restaurant = await prisma.restaurant.create({
    data: {
      id: "rest-demo-123",
      name: "Fuego & Burger Craft",
      slug: "fuego-burger",
      email: "contacto@fuegoburger.com",
      phone: "+57 300 123 4567",
      whatsappNumber: "573001234567",
      description: "Las mejores Smash Burgers artesanales a la parrilla, papas rústicas y malteadas espesas.",
      address: "Av. Gastronómica #45-12, Zona Rosa",
      currency: "USD",
      deliveryFee: 2.50,
      minOrder: 8.00,
      isOpen: true,
      estimatedMinutes: 20,
      plan: "PRO",
    },
  });

  console.log("Creando categorías...");
  const catSmash = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Hamburguesas Smash & Craft",
      icon: "Utensils",
      order: 1,
    },
  });

  const catCombos = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Combos Todo Incluido",
      icon: "Flame",
      order: 2,
    },
  });

  const catSides = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Acompañamientos & Papas",
      icon: "Sparkles",
      order: 3,
    },
  });

  const catDrinks = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Bebidas & Malteadas",
      icon: "Coffee",
      order: 4,
    },
  });

  console.log("Creando productos con modificadores...");

  // Producto 1: Doble Bacon Smash
  const burger1 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSmash.id,
      name: "Doble Bacon Monster Smash",
      description: "Dos carnes smash 120g certified Angus, triple cheddar americano fundido, tocineta ahumada crujiente y salsa secreta de la casa en pan brioche artesanal tostado con mantequilla.",
      price: 11.50,
      badge: "MÁS VENDIDO 🔥",
      isAvailable: true,
      prepTime: 12,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    },
  });

  // Modificadores para la Burger 1
  const modGroupPan = await prisma.modifierGroup.create({
    data: {
      productId: burger1.id,
      name: "Elige tu tipo de Pan",
      required: true,
      minSelect: 1,
      maxSelect: 1,
    },
  });

  await prisma.modifierOption.createMany({
    data: [
      { modifierGroupId: modGroupPan.id, name: "Pan Brioche de Mantequilla", price: 0 },
      { modifierGroupId: modGroupPan.id, name: "Pan Artesanal de Papa", price: 0.50 },
      { modifierGroupId: modGroupPan.id, name: "Opción Keto (Envoltura en Lechuga)", price: 0 },
    ],
  });

  const modGroupExtras = await prisma.modifierGroup.create({
    data: {
      productId: burger1.id,
      name: "¿Quieres potenciar tu burger?",
      required: false,
      minSelect: 0,
      maxSelect: 4,
    },
  });

  await prisma.modifierOption.createMany({
    data: [
      { modifierGroupId: modGroupExtras.id, name: "Doble Tocineta Ahumada Crispy", price: 2.00 },
      { modifierGroupId: modGroupExtras.id, name: "Extra Carne Smash Angus 120g", price: 3.20 },
      { modifierGroupId: modGroupExtras.id, name: "Pepinillos agridulces extra", price: 0.80 },
      { modifierGroupId: modGroupExtras.id, name: "Cebolla Caramelizada al Bourbón", price: 1.20 },
    ],
  });

  // Producto 2: Trufa & Hongo Smash
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSmash.id,
      name: "Truffle & Mushroom Gourmet",
      description: "Carne smash seleccionada, queso suizo madurado, champiñones salteados al romero y mayonesa trufada artesanal.",
      price: 13.00,
      badge: "CHEF SPECIAL ✨",
      isAvailable: true,
      prepTime: 14,
      imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80",
    },
  });

  // Producto 3: Combo Salvaje
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catCombos.id,
      name: "Combo Brutal: Smash Clásica + Papas + Bebida",
      description: "Nuestra hamburguesa clásica con queso cheddar + porción de papas rústicas sazonadas con páprika + refresco 400ml a elección.",
      price: 14.50,
      badge: "AHORRA 20% ⚡",
      isAvailable: true,
      prepTime: 10,
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80",
    },
  });

  // Producto 4: Papas Loaded Cheese & Bacon
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSides.id,
      name: "Loaded Bacon & Cheese Fries",
      description: "Papas fritas corte rústico crujientes bañadas en queso cheddar fundido artesanal, lluvia de tocineta crujiente y cebollín fresco.",
      price: 6.50,
      badge: "PARA COMPARTIR 🍟",
      isAvailable: true,
      prepTime: 8,
      imageUrl: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&auto=format&fit=crop&q=80",
    },
  });

  // Producto 5: Malteada de Oreo Cremosa
  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDrinks.id,
      name: "Thick Shake de Oreo Suprema",
      description: "Batido denso con helado de vainilla premium, galletas Oreo trituradas, crema chantilly y fudge de chocolate.",
      price: 5.50,
      badge: "FAVORITO DULCE 🥤",
      isAvailable: true,
      prepTime: 5,
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80",
    },
  });

  console.log("Creando pedidos de ejemplo para el KDS de cocina...");
  const order1 = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      orderNumber: 101,
      type: "DELIVERY",
      customerName: "Carlos Mendoza",
      customerPhone: "+57 311 987 6543",
      customerAddress: "Calle 100 #15-30, Apto 402",
      customerNotes: "Timbre 402, dejar en portería si no abro de inmediato.",
      subtotal: 17.00,
      deliveryFee: 2.50,
      total: 19.50,
      status: "PREPARING", // En cocina
      paymentMethod: "CARD",
      paymentStatus: "PAID",
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: burger1.id,
      productName: "Doble Bacon Monster Smash",
      quantity: 1,
      unitPrice: 11.50,
      totalPrice: 13.50,
      selectedModifiers: JSON.stringify([
        { group: "Elige tu tipo de Pan", option: "Pan Brioche de Mantequilla", price: 0 },
        { group: "¿Quieres potenciar tu burger?", option: "Doble Tocineta Ahumada Crispy", price: 2.00 },
      ]),
      specialInstructions: "Carne a punto jugoso, sin salsa tártara.",
    },
  });

  const order2 = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      orderNumber: 102,
      type: "DINE_IN",
      tableNumber: "Mesa 04",
      customerName: "Camila Torres",
      customerPhone: "+57 315 555 1234",
      subtotal: 21.00,
      deliveryFee: 0,
      total: 21.00,
      status: "PENDING", // Nuevo pedido parpadeando
      paymentMethod: "CASH",
      paymentStatus: "PENDING",
    },
  });

  console.log("¡Seed completado con éxito! Restaurante slug: fuego-burger");
}

main()
  .catch((e) => {
    console.error("Error al ejecutar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
