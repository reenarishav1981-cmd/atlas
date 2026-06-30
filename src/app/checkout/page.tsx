import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import CheckoutPageClient from "@/components/CheckoutPageClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          brand: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (items.length === 0) {
    redirect("/cart");
  }

  const cartItems = items.map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.product.name,
    brand: i.product.brand?.name || "ATLAS",
    price: i.product.price / 100,
    image: i.product.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format",
    qty: i.qty,
    variant: i.variant || "Standard",
  }));

  return <CheckoutPageClient initialItems={cartItems} user={user} />;
}
