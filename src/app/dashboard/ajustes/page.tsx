import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import AjustesClient from "./AjustesClient";

export const dynamic = "force-dynamic";

export default async function DashboardAjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const targetSlug = params.slug || session?.slug || "fuego-burger";

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: targetSlug },
  });

  if (!restaurant) {
    return <div className="p-8 text-center text-slate-400">Restaurante no encontrado.</div>;
  }

  return <AjustesClient restaurant={restaurant} />;
}
