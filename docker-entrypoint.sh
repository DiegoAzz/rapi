#!/bin/sh
set -e

echo "🚀 Iniciando ComidaYa SaaS..."

if [ -n "$DATABASE_URL" ]; then
  echo "📦 Sincronizando esquema de base de datos con PostgreSQL..."
  npx prisma db push --accept-data-loss || echo "Aviso: prisma db push falló o ya está sincronizado"

  echo "🍔 Verificando datos demo del restaurante..."
  npx tsx prisma/seed.ts || echo "Aviso: seed ya inicializado"
else
  echo "⚠️ DATABASE_URL no encontrada, iniciando sin migración previa..."
fi

echo "✨ Servidor listo en el puerto $PORT. Ejecutando Next.js..."
exec node server.js
