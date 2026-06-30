import { db } from "../db";

const DEFAULT_WIDGETS = [
  { name: "Gross Revenue", type: "KPI_CARD", w: 3, h: 2, x: 0, y: 0, config: { metric: "gross_revenue", prefix: "₹" } },
  { name: "Total Orders", type: "KPI_CARD", w: 3, h: 2, x: 3, y: 0, config: { metric: "total_orders" } },
  { name: "Conversion Rate", type: "KPI_CARD", w: 3, h: 2, x: 6, y: 0, config: { metric: "conversion_rate", suffix: "%" } },
  { name: "New Customers", type: "KPI_CARD", w: 3, h: 2, x: 9, y: 0, config: { metric: "new_customers" } },
  { name: "Revenue Performance Trend", type: "REVENUE_CHART", w: 6, h: 4, x: 0, y: 2, config: { range: "30d" } },
  { name: "Checkout Funnel Drop-offs", type: "FUNNEL_CHART", w: 6, h: 4, x: 6, y: 2, config: {} }
];

export class DashboardWidgetService {
  /**
   * Resolve widgets list for a user, seeding default dashboard widgets if empty.
   */
  static async getWidgets(userId = "admin") {
    let widgets = await db.dashboardWidget.findMany({
      where: { userId },
      orderBy: [{ y: "asc" }, { x: "asc" }],
    });

    if (widgets.length === 0) {
      // Seed defaults
      await db.dashboardWidget.createMany({
        data: DEFAULT_WIDGETS.map(w => ({ ...w, userId })),
      });
      widgets = await db.dashboardWidget.findMany({
        where: { userId },
        orderBy: [{ y: "asc" }, { x: "asc" }],
      });
    }

    return widgets;
  }

  /**
   * Update widget layout dimensions.
   */
  static async saveLayout(userId = "admin", layout: { id: string; w: number; h: number; x: number; y: number }[]) {
    const transactions = layout.map((item) =>
      db.dashboardWidget.update({
        where: { id: item.id },
        data: {
          w: item.w,
          h: item.h,
          x: item.x,
          y: item.y,
        },
      })
    );
    return db.$transaction(transactions);
  }

  /**
   * Deletes a widget from view.
   */
  static async deleteWidget(id: string) {
    return db.dashboardWidget.delete({
      where: { id },
    });
  }

  /**
   * Appends a new metric widget configuration.
   */
  static async addWidget(userId = "admin", name: string, type: string, config: any) {
    return db.dashboardWidget.create({
      data: {
        userId,
        name,
        type,
        w: 3,
        h: 2,
        x: 0,
        y: 0,
        config: config ? JSON.parse(JSON.stringify(config)) : null,
      },
    });
  }
}
