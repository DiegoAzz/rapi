export interface FastFoodWhatsAppOrderPayload {
  orderNumber: number;
  restaurantName: string;
  orderType: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  tableNumber?: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  customerNotes?: string | null;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    modifiers?: { group: string; option: string; price: number }[];
    specialInstructions?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  currency: string;
}

export function generateWhatsAppOrderMessage(payload: FastFoodWhatsAppOrderPayload): string {
  const typeText =
    payload.orderType === "DELIVERY"
      ? "🛵 DOMICILIO / DELIVERY"
      : payload.orderType === "TAKEAWAY"
      ? "🥡 PARA RETIRAR EN LOCAL (TAKE AWAY)"
      : `🍽️ CONSUMO EN MESA (${payload.tableNumber || "Mesa"})`;

  let msg = `🔥 *NUEVO PEDIDO #${payload.orderNumber}* - ${payload.restaurantName}\n`;
  msg += `--------------------------------------\n`;
  msg += `📍 *Modalidad:* ${typeText}\n`;
  msg += `👤 *Cliente:* ${payload.customerName}\n`;
  msg += `📱 *Teléfono:* ${payload.customerPhone}\n`;

  if (payload.orderType === "DELIVERY" && payload.customerAddress) {
    msg += `🏠 *Dirección de Entrega:* ${payload.customerAddress}\n`;
  }

  msg += `--------------------------------------\n`;
  msg += `🍔 *DETALLE DEL PEDIDO:*\n`;

  payload.items.forEach((item, index) => {
    msg += `\n*${item.quantity}x ${item.productName}* - $${item.totalPrice.toFixed(2)}\n`;

    if (item.modifiers && item.modifiers.length > 0) {
      item.modifiers.forEach((m) => {
        msg += `   ▫️ ${m.option} ${m.price > 0 ? `(+$${m.price.toFixed(2)})` : ""}\n`;
      });
    }

    if (item.specialInstructions) {
      msg += `   ⚠️ _Nota: ${item.specialInstructions}_\n`;
    }
  });

  msg += `\n--------------------------------------\n`;
  msg += `💵 *Subtotal:* $${payload.subtotal.toFixed(2)}\n`;
  if (payload.orderType === "DELIVERY" && payload.deliveryFee > 0) {
    msg += `🛵 *Costo Domicilio:* $${payload.deliveryFee.toFixed(2)}\n`;
  }
  msg += `💰 *TOTAL A PAGAR:* $${payload.total.toFixed(2)} ${payload.currency}\n`;
  msg += `💳 *Método de Pago:* ${payload.paymentMethod}\n`;

  if (payload.customerNotes) {
    msg += `\n📝 *Comentarios del Cliente:*\n"${payload.customerNotes}"\n`;
  }

  msg += `--------------------------------------\n`;
  msg += `⚡ _Pedido enviado automáticamente desde el Menú Digital ComidaYa_`;

  return msg;
}

export function buildWhatsAppLink(whatsappNumber: string, message: string): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
