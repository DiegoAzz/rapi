import { prisma } from "@/lib/prisma";
import MenuManagerClient from "./MenuManagerClient";

export const dynamic = "force-dynamic";

export default async function DashboardMenuPage() {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: "fuego-burger" },
    include: {
      categories: {
        include: {
          products: {
            include: {
              modifierGroups: {
                include: { options: true },
              },
            },
          },
        },
      },
    },
  });

  if (!restaurant) {
    return <div className="p-8 text-center text-slate-400">Restaurante no encontrado.</div>;
  }

  return <MenuManagerClient restaurant={restaurant} />;
}
