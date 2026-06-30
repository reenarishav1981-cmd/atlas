import { db } from "../db";

export class AnalyticsService {
  /**
   * Record a numerical metric event.
   */
  static async recordMetric(name: string, value: number, dimensions?: any) {
    return db.analyticsMetric.create({
      data: {
        name,
        value,
        dimensions: dimensions ? JSON.parse(JSON.stringify(dimensions)) : null,
      },
    });
  }

  /**
   * Records a user step inside the conversion pipeline.
   */
  static async recordFunnelStage(stageName: "VISIT" | "PRODUCT_VIEW" | "ADD_TO_CART" | "CHECKOUT" | "PURCHASE") {
    // Check if stage for current hour exists, else upsert increment
    const startOfHour = new Date();
    startOfHour.setMinutes(0, 0, 0);

    const existing = await db.funnelStageMetric.findFirst({
      where: {
        stageName,
        timestamp: {
          gte: startOfHour,
        },
      },
    });

    if (existing) {
      return db.funnelStageMetric.update({
        where: { id: existing.id },
        data: { count: existing.count + 1 },
      });
    } else {
      return db.funnelStageMetric.create({
        data: {
          stageName,
          count: 1,
          timestamp: startOfHour,
        },
      });
    }
  }

  /**
   * Get funnel drop-off statistics.
   */
  static async getFunnelReport() {
    const metrics = await db.funnelStageMetric.findMany({
      orderBy: { timestamp: "desc" },
      take: 100, // retrieve recent metrics
    });

    // Group counts by stage
    const stages = { VISIT: 0, PRODUCT_VIEW: 0, ADD_TO_CART: 0, CHECKOUT: 0, PURCHASE: 0 };
    metrics.forEach((m) => {
      if (m.stageName in stages) {
        stages[m.stageName as keyof typeof stages] += m.count;
      }
    });

    return stages;
  }

  /**
   * Fetch aggregated analytics summary for a date range.
   */
  static async getAnalyticsSummary(startDate: Date, endDate: Date) {
    const metrics = await db.analyticsMetric.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const summary: Record<string, number> = {
      gross_revenue: 0,
      total_orders: 0,
      new_customers: 0,
      conversion_rate: 0,
    };

    metrics.forEach((m) => {
      if (m.name in summary) {
        summary[m.name] += m.value;
      }
    });

    return summary;
  }
}
