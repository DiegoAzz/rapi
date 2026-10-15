"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Check,
  X,
  Trash2,
  ExternalLink,
  Flame,
  Loader2,
  FolderPlus,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function MenuManagerClient({ restaurant }: { restaurant: any }) {
  const [categories, setCategories] = useState(restaurant.categories);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Formulario Producto
  const [newProductName, setNewProductName] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [newProductBadge, setNewProductBadge] = useState("");
  const [newProductCategory, setNewProductCategory] = useState(
    categories[0]?.id || ""
  );
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Formulario Categoría
  const [newCategoryName, setNewCategoryName] = useState("");
  const [submittingCategory, setSubmittingCategory] = useState(false);

  // Toggle de stock
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
    } catch {
      alert("Error al actualizar disponibilidad");
    } finally {
      setUpdatingId(null);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto de la carta?")) return;

    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCategories((prev: any[]) =>
          prev.map((cat) => ({
            ...cat,
            products: cat.products.filter((p: any) => p.id !== productId),
          }))
        );
      }
    } catch {
      alert("Error al eliminar el producto");
    }
  };

  // Crear Producto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductCategory) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    setSubmittingProduct(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: restaurant.slug,
          categoryId: newProductCategory,
          name: newProductName,
          description: newProductDesc,
          price: Number(newProductPrice),
          imageUrl: newProductImage || null,
          badge: newProductBadge || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Agregar a la categoría correspondiente
      setCategories((prev: any[]) =>
        prev.map((cat) =>
          cat.id === newProductCategory
            ? { ...cat, products: [...cat.products, data.product] }
            : cat
        )
      );

      // Reset
      setNewProductName("");
      setNewProductDesc("");
      setNewProductPrice("");
      setNewProductImage("");
      setNewProductBadge("");
      setIsProductModalOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Crear Categoría
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSubmittingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: restaurant.slug,
          name: newCategoryName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCategories((prev: any[]) => [...prev, { ...data.category, products: [] }]);
      if (!newProductCategory) setNewProductCategory(data.category.id);
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingCategory(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Catálogo de Menú & Stock Rápido</h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra los platos, precios, categorías y disponibilidad instantánea de tu local.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
            + Nueva Categoría
          </button>

          <button
            onClick={() => setIsProductModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            + Crear Plato
          </button>

          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1"
          >
            Ver QR <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Categorías y Platos */}
      <div className="space-y-6">
        {categories.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
            <p className="text-sm text-slate-400">Aún no has creado ninguna categoría en tu menú.</p>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Crear mi primera categoría
            </button>
          </div>
        ) : (
          categories.map((cat: any) => (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
            >
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <h2 className="font-bold text-sm text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  {cat.name}
                </h2>
                <span className="text-xs text-slate-400">{cat.products.length} platos</span>
              </div>

              {cat.products.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No hay productos en esta categoría todavía.
                </div>
              ) : (
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
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {product.description}
                          </p>
                          <p className="text-xs font-black text-amber-400 mt-1">
                            {formatPrice(product.price, restaurant.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
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

                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Eliminar plato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Crear Plato */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Crear Nuevo Plato o Combo</h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoría *
                </label>
                <select
                  required
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Plato *
                </label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ej. Doble Cheddar Crispy Burger"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Precio ({restaurant.currency}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="9.99"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descripción e Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Carne 150g, queso cheddar, cebolla crispy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL de Imagen (Opcional)
                </label>
                <input
                  type="url"
                  value={newProductImage}
                  onChange={(e) => setNewProductImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Etiqueta / Badge (Opcional)
                </label>
                <input
                  type="text"
                  value={newProductBadge}
                  onChange={(e) => setNewProductBadge(e.target.value)}
                  placeholder="Ej. MÁS VENDIDO 🔥 o NUEVO"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  {submittingProduct ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Guardar Plato en la Carta"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Categoría */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Nueva Categoría</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej. Postres, Bebidas, Alitas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingCategory}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                {submittingCategory ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Crear Categoría"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
