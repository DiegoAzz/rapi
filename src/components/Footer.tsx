import Link from "next/link";
import { UtensilsCrossed, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">
                Comida<span className="text-amber-500">Ya</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm text-sm">
              La plataforma SaaS con cobros recurrentes diseñada para que restaurantes de comida rápida, dark kitchens y hamburgueserías vendan directo, aceleren su cocina y se ahorren hasta un 30% en comisiones.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Módulos del Sistema</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/menu/fuego-burger" className="hover:text-amber-400 transition-colors">
                  Menú Digital Interactivo QR
                </Link>
              </li>
              <li>
                <Link href="/dashboard/kds" className="hover:text-amber-400 transition-colors">
                  Comandera de Cocina (KDS en Tiempo Real)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
                  Panel de Métricas y Ventas
                </Link>
              </li>
              <li>
                <Link href="/dashboard/suscripcion" className="hover:text-amber-400 transition-colors">
                  Suscripciones Recurrentes Stripe
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Stack Tecnológico</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Next.js 16 + React 19</li>
              <li>• TypeScript + Tailwind CSS</li>
              <li>• Prisma ORM (SQLite / PostgreSQL)</li>
              <li>• Stripe Billing (Suscripciones B2B)</li>
              <li>• Tickets Térmicos ESC/POS 80mm/58mm</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} ComidaYa SaaS. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Construido con <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> para la industria gastronómica rápida.
          </p>
        </div>
      </div>
    </footer>
  );
}
