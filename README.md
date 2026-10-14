# 🍔 ComidaYa - Plataforma SaaS para Restaurantes de Comida Rápida con Cobros Recurrentes

Plataforma SaaS multi-tenant verticalmente especializada en **Comidas Rápidas, Dark Kitchens, Hamburgueserías, Pizzerías y Food Trucks**.

Permite a los negocios gastronómicos tener su **propio canal de pedidos digitales**, ahorrar hasta un **30% en comisiones** de apps de delivery, operar con una **pantalla de cocina KDS en tiempo real**, imprimir **comandas térmicas (ESC/POS 80mm/58mm)** y monetizar mediante **suscripciones recurrentes automatizadas con Stripe**.

---

## 🚀 La Opción Estándar en la Industria: Arquitectura & Stack

| Capa | Tecnología Estándar | Razón de Elección |
|---|---|---|
| **Framework Fullstack** | Next.js 16 + React 19 + Turbopack | SSR para SEO, Server Actions/API Routes para latencia ultrabaja en pedidos |
| **Base de Datos & ORM** | Prisma ORM + SQLite (local) / PostgreSQL (producción) | Modelado multi-inquilino de alta velocidad, migraciones declarativas y tipos estrictos |
| **Estilos & UI** | Tailwind CSS v4 + Lucide Icons | Interfaz mobile-first ultra veloz (< 1s de carga en redes 4G móviles) |
| **Facturación Recurrente** | Stripe Billing (Subscriptions + Customer Portal + Webhooks) | Estándar global de cobros recurrentes B2B con gestión de tarjetas y facturas en autoservicio |
| **Operación de Cocina** | Kitchen Display System (KDS) en tiempo real con alertas sonoras | Elimina el desorden de comandas en papel y reduce los tiempos de despacho a menos de 15 min |
| **Impresión Térmica** | CSS Print Nativo ESC/POS (80mm / 58mm) | Imprime comandas con un toque directo a la impresora térmica de cocina |

---

## ⚡ Módulos Incluidos

1. **Menú Digital QR para Clientes (`/menu/[slug]`):**
   - Carga instantánea sin instalación ni registro forzado.
   - Selector de modalidades: **Delivery**, **Para Llevar (Takeaway)** y **Consumo en Mesa**.
   - Personalizador de platos con modificadores obligatorios/opcionales (tipo de pan, salsas, extras de tocineta/queso).
   - Checkout dual: Registro directo en Base de Datos para la cocina + Envío estructurado a WhatsApp del restaurante.

2. **Comandera de Cocina KDS en Tiempo Real (`/dashboard/kds`):**
   - Pantalla táctil para parrilla y ensamble.
   - 3 Columnas: *Nuevos en Espera*, *En Parrilla & Cocina*, *Listos para Despacho*.
   - Cronómetros con alerta de color por minuto transcurrido (Verde < 8m, Amarillo 8-12m, Rojo > 12m).
   - Alerta acústica configurable al entrar nuevos pedidos.
   - Botón de impresión de comanda térmica 80mm.

3. **Panel Administrativo del Restaurante (`/dashboard`):**
   - Métricas en vivo: Ventas del día, pedidos activos, ticket promedio y tiempo medio de preparación.
   - Tabla de historial de comandas con actualización de estado.

4. **Gestión de Carta & Stock Inmediato (`/dashboard/menu`):**
   - Interruptores rápidos para apagar o encender productos cuando se acabe un ingrediente en la cocina.

5. **Suscripciones Recurrentes SaaS (`/dashboard/suscripcion`):**
   - Planes: **Plan Gratis**, **Plan Pro ($49/mes)** y **Plan Cadena ($99/mes)**.
   - Integración nativa con Stripe Checkout y Stripe Customer Portal.

---

## 🛠️ Puesta en Marcha Rápida (Local)

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente de Prisma y base de datos local
npx prisma generate
npx prisma db push

# 3. Cargar datos de prueba (Restaurante demo Fuego & Burger Craft)
npx tsx prisma/seed.ts

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre en tu navegador:
- **Landing Page & Calculadora ROI:** [http://localhost:3000](http://localhost:3000)
- **Menú Digital del Cliente:** [http://localhost:3000/menu/fuego-burger](http://localhost:3000/menu/fuego-burger)
- **Pantalla de Cocina (KDS):** [http://localhost:3000/dashboard/kds](http://localhost:3000/dashboard/kds)
- **Panel Administrativo:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Suscripciones Stripe:** [http://localhost:3000/dashboard/suscripcion](http://localhost:3000/dashboard/suscripcion)

---

## 🐳 Despliegue en Producción (Docker / Coolify / VPS)

El proyecto incluye un `Dockerfile` multi-stage optimizado:

```bash
docker build -t comidaya-saas .
docker run -p 3000:3000 comidaya-saas
```
