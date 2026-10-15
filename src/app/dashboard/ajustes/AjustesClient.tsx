"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Save,
  Check,
  ExternalLink,
  Store,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Phone,
  Power,
  Sparkles,
} from "lucide-react";

export default function AjustesClient({ restaurant }: { restaurant: any }) {
  const [name, setName] = useState(restaurant.name || "");
  const [description, setDescription] = useState(restaurant.description || "");
  const [logoUrl, setLogoUrl] = useState(restaurant.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(restaurant.bannerUrl || "");
  const [whatsappNumber, setWhatsappNumber] = useState(restaurant.whatsappNumber || "");
  const [phone, setPhone] = useState(restaurant.phone || "");
  const [address, setAddress] = useState(restaurant.address || "");
  const [currency, setCurrency] = useState(restaurant.currency || "USD");
  const [deliveryFee, setDeliveryFee] = useState(restaurant.deliveryFee || 2.5);
  const [minOrder, setMinOrder] = useState(restaurant.minOrder || 5.0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(restaurant.estimatedMinutes || 25);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen !== false);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/restaurant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: restaurant.slug,
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
        }),
      });

      if (!res.ok) throw new Error("Error al guardar ajustes");

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Error al guardar los ajustes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Identidad de Marca & Configuración</h1>
          <p className="text-xs text-slate-400 mt-1">
            Personaliza el logo, banner, WhatsApp de recepción y tarifas de tu local gastronómico.
          </p>
        </div>

        <Link
          href={`/menu/${restaurant.slug}`}
          target="_blank"
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          Ver Menú en Vivo <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Switch de Estado del Restaurante: Abierto / Cerrado */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Estado del Restaurante</span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  isOpen ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {isOpen ? "Abierto para Pedidos" : "Cerrado / Fuera de Horario"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Si apagas este switch, tus clientes verán el cartel de local cerrado y no podrán ordenar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
              isOpen ? "bg-emerald-500 justify-end" : "bg-slate-800 justify-start"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 text-xs">
              <Power className="w-3 h-3" />
            </div>
          </button>
        </div>

        {/* 1. Identidad de Marca: Nombre, Logo y Banner */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            Identidad de Marca & Logotipo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del Restaurante *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Eslogan / Descripción Breve
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Las mejores smash burgers a la parrilla..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL del Logo (Icono / Cuadrado)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://misitio.com/logo.png"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Se mostrará en la cabecera de tu menú y en las comandas.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL del Banner / Portada
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Imagen horizontal de fondo para la cabecera del menú.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Contacto & Canal de WhatsApp */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            Canales de Recepción de Pedidos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp de Pedidos *
              </label>
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+573001234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Donde se enviarán las comandas con 1 clic.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono Fijo / Local (Opcional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 601 2345678"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dirección Física del Local
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Principal #12-34, Local 2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Tarifas, Moneda y Tiempos */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            Tarifas de Delivery & Operación
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="USD">USD ($ Dólar)</option>
                <option value="COP">COP ($ Peso Col)</option>
                <option value="MXN">MXN ($ Peso Mex)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="ARS">ARS ($ Peso Arg)</option>
                <option value="PEN">PEN (S/. Sol)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Costo Domicilio
              </label>
              <input
                type="number"
                step="0.1"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pedido Mínimo
              </label>
              <input
                type="number"
                step="0.5"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tiempo Estimado (Mins)
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Botón de Guardado */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando Cambios..." : "Guardar Configuración de Marca"}
          </button>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" /> ¡Cambios guardados exitosamente!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
