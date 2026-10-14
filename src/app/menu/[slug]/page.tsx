import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MenuClientView from "./MenuClientView";

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
      products: {
        where: { isAvailable: true },
        include: {
          modifierGroups: {
            include: {
              options: true,
            },
          },
        },
      },
    },
  });

  if (!restaurant) {
    notFound();
  }

  return <MenuClientView restaurant={restaurant} />;
}
