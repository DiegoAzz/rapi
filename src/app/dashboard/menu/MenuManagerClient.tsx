"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, X, Sparkles, ExternalLink, Flame } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function MenuManagerClient({ restaurant }: { restaurant: any }) {
  const [categories, setCategories] = useState(restaurant.categories);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    setUpdatingId(productId);
    const newStatus = !currentStatus;

    try {
      const res = await fetch(`/api/products/${productId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (res.ok) {
        setCategories((prev: any[]) =>
          prev.map((cat) => ({
            ...cat,
            products: cat.products.map((p: any) =>
              p.id === productId ? { ...p, isAvailable: newStatus } : p
            ),
          }))
        );
      }
    } catch (e) {
      alert("Error al actualizar la disponibilidad");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Catálogo de Menú & Stock Rápido</h1>
          <p className="text-xs text-slate-400 mt-1">
            Activa o desactiva platos en 1 clic cuando se agote un ingrediente en la cocina.
          </p>
        </div>

        <Link
          href="/menu/fuego-burger"
          target="_blank"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          Ver Menú en Vivo <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-6">
        {categories.map((cat: any) => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                {cat.name}
              </h2>
              <span className="text-xs text-slate-400">{cat.products.length} platos</span>
            </div>

            <div className="divide-y divide-slate-800">
              {cat.products.map((product: any) => (
                <div
                  key={product.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{product.name}</h3>
                        {product.badge && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
                      <p className="text-xs font-black text-amber-400 mt-1">
                        {formatPrice(product.price, restaurant.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      disabled={updatingId === product.id}
                      onClick={() => toggleAvailability(product.id, product.isAvailable)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        product.isAvailable
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                      }`}
                    >
                      {product.isAvailable ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> En Stock
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" /> Agotado
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
