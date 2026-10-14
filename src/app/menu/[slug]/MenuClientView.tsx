"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UtensilsCrossed,
  Clock,
  Bike,
  ShoppingBag,
  Store,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Sparkles,
  Phone,
  Flame,
  ArrowRight,
  Send,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { generateWhatsAppOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";

interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  badge: string | null;
  prepTime: number;
  isAvailable: boolean;
  modifierGroups: ModifierGroup[];
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  whatsappNumber: string;
  currency: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  estimatedMinutes: number;
  categories: Category[];
  products: Product[];
}

interface CartItem {
  id: string; // unique cart line id
  product: Product;
  quantity: number;
  selectedModifiers: { group: string; option: string; price: number }[];
  specialInstructions: string;
  unitPriceCalculated: number;
  totalPriceCalculated: number;
}

export default function MenuClientView({ restaurant }: { restaurant: Restaurant }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderType, setOrderType] = useState<"DELIVERY" | "TAKEAWAY" | "DINE_IN">("DELIVERY");

  // Modal de Personalización de Producto
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [groupId: string]: ModifierOption[] }>({});
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Carrito de compras
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Formulario de Checkout
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return restaurant.products.filter((p) => {
      const matchesCategory = selectedCategory === "ALL" || p.categoryId === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [restaurant.products, selectedCategory, searchQuery]);

  // Abrir modal de personalización
  const handleOpenProduct = (product: Product) => {
    setActiveProduct(product);
    setModalQuantity(1);
    setSpecialInstructions("");

    // Preseleccionar primera opción obligatoria si existe
    const initialOptions: { [groupId: string]: ModifierOption[] } = {};
    product.modifierGroups.forEach((group) => {
      if (group.required && group.options.length > 0) {
        initialOptions[group.id] = [group.options[0]];
      } else {
        initialOptions[group.id] = [];
      }
    });
    setSelectedOptions(initialOptions);
  };

  // Manejo de selección de modificadores
  const toggleModifier = (group: ModifierGroup, option: ModifierOption) => {
    setSelectedOptions((prev) => {
      const current = prev[group.id] || [];
      if (group.maxSelect === 1) {
        // Radio behavior
        return { ...prev, [group.id]: [option] };
      } else {
        // Multi-select behavior
        const exists = current.some((o) => o.id === option.id);
        if (exists) {
          return { ...prev, [group.id]: current.filter((o) => o.id !== option.id) };
        } else {
          if (current.length >= group.maxSelect) return prev;
          return { ...prev, [group.id]: [...current, option] };
        }
      }
    });
  };

  // Calcular precio unitario en modal
  const modalUnitPrice = useMemo(() => {
    if (!activeProduct) return 0;
    let extra = 0;
    Object.values(selectedOptions).forEach((opts) => {
      opts.forEach((o) => {
        extra += o.price;
      });
    });
    return activeProduct.price + extra;
  }, [activeProduct, selectedOptions]);

  // Agregar al carrito
  const handleAddToCart = () => {
    if (!activeProduct) return;

    // Aplanar opciones seleccionadas
    const flatModifiers: { group: string; option: string; price: number }[] = [];
    activeProduct.modifierGroups.forEach((group) => {
      const opts = selectedOptions[group.id] || [];
      opts.forEach((o) => {
        flatModifiers.push({
          group: group.name,
          option: o.name,
          price: o.price,
        });
      });
    });

    const newItem: CartItem = {
      id: `${activeProduct.id}-${Date.now()}`,
      product: activeProduct,
      quantity: modalQuantity,
      selectedModifiers: flatModifiers,
      specialInstructions,
      unitPriceCalculated: modalUnitPrice,
      totalPriceCalculated: modalUnitPrice * modalQuantity,
    };

    setCart((prev) => [...prev, newItem]);
    setActiveProduct(null);
  };

  // Totales del carrito
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.totalPriceCalculated, 0);
  }, [cart]);

  const deliveryFee = orderType === "DELIVERY" ? restaurant.deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryFee;
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Enviar pedido (Dual: KDS DB + WhatsApp)
  const handleCheckout = async (sendWhatsApp: boolean = false) => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Por favor ingresa tu Nombre y Teléfono.");
      return;
    }

    if (orderType === "DELIVERY" && !customerAddress.trim()) {
      alert("Por favor ingresa la dirección de entrega para tu domicilio.");
      return;
    }

    if (orderType === "DINE_IN" && !tableNumber.trim()) {
      alert("Por favor indica el número de mesa.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Guardar en Base de Datos de ComidaYa (para KDS de cocina en tiempo real)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: restaurant.slug,
          type: orderType,
          tableNumber,
          customerName,
          customerPhone,
          customerAddress,
          customerNotes,
          paymentMethod,
          items: cart.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price,
            modifiers: item.selectedModifiers,
            specialInstructions: item.specialInstructions,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar el pedido");
      }

      const createdOrder = data.order;
      setConfirmedOrder(createdOrder);

      // 2. Si se solicitó WhatsApp o como flujo estándar, preparar el link
      if (sendWhatsApp || true) {
        const waMessage = generateWhatsAppOrderMessage({
          orderNumber: createdOrder.orderNumber,
          restaurantName: restaurant.name,
          orderType,
          tableNumber,
          customerName,
          customerPhone,
          customerAddress,
          customerNotes,
          items: cart.map((i) => ({
            productName: i.product.name,
            quantity: i.quantity,
            unitPrice: i.unitPriceCalculated,
            totalPrice: i.totalPriceCalculated,
            modifiers: i.selectedModifiers,
            specialInstructions: i.specialInstructions,
          })),
          subtotal: cartSubtotal,
          deliveryFee,
          total: cartTotal,
          paymentMethod,
          currency: restaurant.currency,
        });

        const waUrl = buildWhatsAppLink(restaurant.whatsappNumber, waMessage);
        if (sendWhatsApp) {
          window.open(waUrl, "_blank");
        }
      }

      // Limpiar carrito
      setCart([]);
      setIsCartOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Barra superior de navegación / Regresar al SaaS */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs flex items-center justify-between text-slate-400">
        <Link href="/" className="hover:text-amber-400 flex items-center gap-1 font-medium">
          ← Volver a ComidaYa SaaS
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/kds"
            target="_blank"
            className="text-amber-400 hover:underline flex items-center gap-1"
          >
            🔥 Ver Pantalla de Cocina (KDS en vivo)
          </Link>
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
            0% Comisión
          </span>
        </div>
      </div>

      {/* Header del Restaurante */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/10 text-white font-black text-2xl">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">{restaurant.name}</h1>
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Abierto
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{restaurant.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {restaurant.estimatedMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-blue-400" />
                    Domicilio: {formatPrice(restaurant.deliveryFee, restaurant.currency)}
                  </span>
                  <span>Mínimo: {formatPrice(restaurant.minOrder, restaurant.currency)}</span>
                </div>
              </div>
            </div>

            {/* Selector de Modalidad */}
            <div className="w-full sm:w-auto bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setOrderType("DELIVERY")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  orderType === "DELIVERY"
                    ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                Delivery
              </button>
              <button
                onClick={() => setOrderType("TAKEAWAY")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  orderType === "TAKEAWAY"
                    ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Para Llevar
              </button>
              <button
                onClick={() => setOrderType("DINE_IN")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  orderType === "DINE_IN"
                    ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                En Mesa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categorías Sticky */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "ALL"
                ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            🔥 Todo el Menú
          </button>
          {restaurant.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleOpenProduct(product)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-4 flex gap-4 cursor-pointer transition-all hover:scale-[1.01] group shadow-sm"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {product.badge && (
                    <span className="inline-block bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-md mb-1.5 uppercase">
                      {product.badge}
                    </span>
                  )}
                  <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                  <span className="font-black text-amber-400 text-lg">
                    {formatPrice(product.price, restaurant.currency)}
                  </span>
                  <span className="bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    Personalizar
                  </span>
                </div>
              </div>

              {product.imageUrl && (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden relative shrink-0 bg-slate-800">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Personalización del Producto */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header del modal */}
            <div className="relative">
              {activeProduct.imageUrl && (
                <div className="w-full h-44 sm:h-48 relative overflow-hidden bg-slate-800">
                  <img
                    src={activeProduct.imageUrl}
                    alt={activeProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>
              )}
              <button
                onClick={() => setActiveProduct(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <div>
                <h2 className="text-xl font-black text-white">{activeProduct.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{activeProduct.description}</p>
                <p className="text-lg font-bold text-amber-400 mt-2">
                  Precio base: {formatPrice(activeProduct.price, restaurant.currency)}
                </p>
              </div>

              {/* Grupos de Modificadores */}
              {activeProduct.modifierGroups.map((group) => (
                <div key={group.id} className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{group.name}</h4>
                    {group.required ? (
                      <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                        Obligatorio
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Opcional</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {group.options.map((opt) => {
                      const isSelected = (selectedOptions[group.id] || []).some(
                        (o) => o.id === opt.id
                      );
                      return (
                        <div
                          key={opt.id}
                          onClick={() => toggleModifier(group, opt)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500 text-white"
                              : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-amber-400 bg-amber-400 text-slate-950"
                                  : "border-slate-600"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                            </div>
                            <span className="text-xs font-semibold">{opt.name}</span>
                          </div>
                          {opt.price > 0 && (
                            <span className="text-xs font-bold text-amber-400">
                              +{formatPrice(opt.price, restaurant.currency)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Instrucciones especiales */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-white block mb-1.5">
                  Notas de cocina (ej. sin cebolla, salsa tártara aparte)
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Escribe alguna indicación para el chef..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold">{modalQuantity}</span>
                <button
                  onClick={() => setModalQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-sm flex items-center justify-between transition-all"
              >
                <span>Agregar al Pedido</span>
                <span>{formatPrice(modalUnitPrice * modalQuantity, restaurant.currency)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra Flotante de Carrito (Sticky Bottom) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 font-black p-4 rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-between hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-slate-950 text-amber-400 text-xs flex items-center justify-center font-black">
                {cartItemsCount}
              </span>
              <span className="text-sm font-bold text-white">Ver Mi Pedido</span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <span className="text-base font-black">
                {formatPrice(cartTotal, restaurant.currency)}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Drawer / Modal de Carrito y Checkout */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full flex flex-col border-l border-slate-800 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header Carrito */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-white">Tu Pedido</h3>
                <span className="text-xs text-amber-400 font-semibold">
                  Modalidad: {orderType === "DELIVERY" ? "🛵 Delivery" : orderType === "TAKEAWAY" ? "🥡 Retiro" : "🍽️ En Mesa"}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400 text-sm">{item.quantity}x</span>
                      <h4 className="font-bold text-sm text-white">{item.product.name}</h4>
                    </div>
                    {item.selectedModifiers.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedModifiers.map((m, i) => (
                          <p key={i} className="text-[11px] text-slate-400">
                            • {m.option} {m.price > 0 && `(+${formatPrice(m.price, restaurant.currency)})`}
                          </p>
                        ))}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <p className="text-[11px] text-amber-400/80 italic mt-1">
                        Nota: "{item.specialInstructions}"
                      </p>
                    )}
                    <p className="font-bold text-xs text-white mt-1.5">
                      {formatPrice(item.totalPriceCalculated, restaurant.currency)}
                    </p>
                  </div>
                  <button
                    onClick={() => setCart((prev) => prev.filter((i) => i.id !== item.id))}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold self-start"
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              {/* Formulario de Datos del Cliente */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Datos de Entrega & Contacto
                </h4>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Tu Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej. +57 300 123 4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {orderType === "DELIVERY" && (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      Dirección de Entrega Exacta *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Calle, número de casa/apto, barrio"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                {orderType === "DINE_IN" && (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Número de Mesa *</label>
                    <input
                      type="text"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Ej. Mesa 04"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="EFECTIVO">💵 Efectivo al recibir</option>
                    <option value="TARJETA">💳 Datáfono / Tarjeta</option>
                    <option value="TRANSFERENCIA">📱 Transferencia (Nequi/Daviplata/Zelle)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer con Totales y Botones de Acción */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartSubtotal, restaurant.currency)}</span>
                </div>
                {orderType === "DELIVERY" && (
                  <div className="flex justify-between text-slate-400">
                    <span>Domicilio</span>
                    <span>{formatPrice(deliveryFee, restaurant.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-base text-white pt-1 border-t border-slate-800">
                  <span>Total</span>
                  <span className="text-amber-400">
                    {formatPrice(cartTotal, restaurant.currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleCheckout(false)}
                  className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <Flame className="w-4 h-4 text-amber-200" />
                  {isSubmitting ? "Enviando a Cocina..." : "Confirmar Pedido y Enviar a Cocina"}
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleCheckout(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Pedir Directo por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Exitosa */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                ¡Pedido Recibido con Éxito!
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Orden #{confirmedOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Gracias, <strong className="text-white">{confirmedOrder.customerName}</strong>. Tu
                comanda ya entró directamente a la pantalla de cocina del restaurante.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Modalidad:</span>
                <span className="font-bold text-white">{confirmedOrder.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estado en Cocina:</span>
                <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">
                  {confirmedOrder.status}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-800">
                <span>Total a pagar:</span>
                <span className="text-amber-400">
                  {formatPrice(confirmedOrder.total, restaurant.currency)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/dashboard/kds"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs block transition-colors"
              >
                🔥 Ver en la Comandera de Cocina (KDS Demo)
              </Link>
              <button
                onClick={() => setConfirmedOrder(null)}
                className="w-full text-slate-400 hover:text-white text-xs font-medium py-1.5"
              >
                Cerrar y volver al menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
