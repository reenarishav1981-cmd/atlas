import { db } from "../db";

export class OrderTimelineService {
  /**
   * Log an event on the timeline of a specific order.
   */
  static async logEvent(orderId: string, type: string, description: string, payload?: any) {
    return db.orderTimelineEvent.create({
      data: {
        orderId,
        type,
        description,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
      },
    });
  }

  /**
   * Retrieve timeline log events for an order.
   */
  static async getTimeline(orderId: string) {
    return db.orderTimelineEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    });
  }
}
