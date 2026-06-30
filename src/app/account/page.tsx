import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import AccountDashboardClient from "@/components/AccountDashboardClient";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/register?redirect=/account");

  const dbOrders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const orders = dbOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
    items: o.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty,
    })),
  }));

  return (
    <AccountDashboardClient user={user as any} orders={orders} />
  );
}
