import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Note: route is also protected at middleware level (/api/admin/*), this is a defense-in-depth check.
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sincePrev30d = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [revenueAgg, prevRevenueAgg, orderCount, prevOrderCount, newCustomers, prevNewCustomers, paidOrders] =
    await Promise.all([
      db.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: since30d } }, _sum: { total: true } }),
      db.order.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: sincePrev30d, lt: since30d } },
        _sum: { total: true },
      }),
      db.order.count({ where: { createdAt: { gte: since30d } } }),
      db.order.count({ where: { createdAt: { gte: sincePrev30d, lt: since30d } } }),
      db.user.count({ where: { createdAt: { gte: since30d }, role: "CUSTOMER" } }),
      db.user.count({ where: { createdAt: { gte: sincePrev30d, lt: since30d }, role: "CUSTOMER" } }),
      db.order.findMany({ where: { createdAt: { gte: since30d } }, select: { createdAt: true, total: true } }),
    ]);

  const pct = (curr: number, prev: number) => (prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100);

  const revenue = revenueAgg._sum.total ?? 0;
  const prevRevenue = prevRevenueAgg._sum.total ?? 0;

  // Group revenue by day for the chart (last 30 days)
  const revenueByDay = new Map<string, number>();
  for (const o of paidOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + o.total);
  }
  const revenueChart = Array.from(revenueByDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total]) => ({ date, revenue: total / 100 }));

  const liveOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { user: { select: { name: true } }, items: { take: 1, select: { name: true } } },
  });

  const topProducts = await db.orderItem.groupBy({
    by: ["productId"],
    _sum: { qty: true, price: true },
    orderBy: { _sum: { qty: "desc" } },
    take: 5,
  });
  const topProductIds = topProducts.map((p) => p.productId);
  const productDetails = await db.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, stock: true },
  });
  const topProductsResolved = topProducts.map((tp) => {
    const detail = productDetails.find((p) => p.id === tp.productId);
    return {
      name: detail?.name ?? "Unknown",
      sales: tp._sum.qty ?? 0,
      revenue: ((tp._sum.price ?? 0) * (tp._sum.qty ?? 0)) / 100,
      stock: detail?.stock ?? 0,
    };
  });

  const lowStock = await db.product.findMany({
    where: { isActive: true, stock: { lt: 15 } },
    orderBy: { stock: "asc" },
    take: 8,
    select: { id: true, name: true, stock: true },
  });

  const conversionRate = orderCount > 0 && newCustomers > 0 ? (orderCount / (newCustomers * 4)) * 100 : 0;

  return NextResponse.json({
    kpis: {
      revenue: revenue / 100,
      revenueChangePct: pct(revenue, prevRevenue),
      orders: orderCount,
      ordersChangePct: pct(orderCount, prevOrderCount),
      newCustomers,
      customersChangePct: pct(newCustomers, prevNewCustomers),
      conversionRate: Math.min(100, conversionRate),
    },
    revenueChart,
    liveOrders: liveOrders.map((o) => ({
      id: o.orderNumber,
      customer: o.user.name,
      product: o.items[0]?.name ?? "—",
      amount: o.total / 100,
      status: o.status,
      time: o.createdAt.toISOString(),
    })),
    topProducts: topProductsResolved,
    lowStock,
  });
}
