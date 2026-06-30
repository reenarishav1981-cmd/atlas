import { AuditService } from "@/lib/services/AuditService";
import { eventDispatcher } from "../dispatcher/EventDispatcher";
import { DomainEvent } from "../types";
import { OrderTimelineService } from "@/lib/services/OrderTimelineService";
import { WalletService } from "@/lib/services/WalletService";

/**
 * Audit Log listener that intercepts domain events and registers them in the database history.
 */
async function auditLogEventListener(event: DomainEvent) {
  await AuditService.log({
    userId: "event-system",
    userName: `Source Module: ${event.sourceModule}`,
    action: event.eventName.toUpperCase(),
    entityType: event.sourceModule,
    entityId: event.payload.orderId || event.payload.productId || event.payload.customerId || "unknown",
    newValue: event.payload,
  });
}

/**
 * Handles automated order placement timeline logs.
 */
async function orderPlacedListener(event: DomainEvent) {
  const payload = event.payload || {};
  if (payload.orderId) {
    await OrderTimelineService.logEvent(payload.orderId, "PLACED", "Order placed successfully via checkout pipeline.");
  }
}

/**
 * Auto-awards loyalty reward points when payments succeed.
 */
async function orderPaidListener(event: DomainEvent) {
  const payload = event.payload || {};
  if (payload.orderId) {
    await OrderTimelineService.logEvent(payload.orderId, "PAID", `Payment confirmation received.`);
    if (payload.userId && payload.totalAmount) {
      const points = Math.floor(payload.totalAmount * 0.1); // 10% points reward
      await WalletService.adjustLoyaltyPoints(payload.userId, points, "CREDIT", `Points accrued for order: ${payload.orderId}`);
    }
  }
}

let isRegistered = false;

/**
 * Initialize and attach all listeners.
 */
export function registerDefaultEventListeners() {
  if (isRegistered) return;
  
  eventDispatcher.subscribe("OrderPlaced", auditLogEventListener);
  eventDispatcher.subscribe("ProductUpdated", auditLogEventListener);
  eventDispatcher.subscribe("CustomerRegistered", auditLogEventListener);

  // Business operations domain flows
  eventDispatcher.subscribe("order.placed", orderPlacedListener);
  eventDispatcher.subscribe("order.paid", orderPaidListener);
  
  isRegistered = true;
  console.log("✓ All default domain event listeners registered successfully.");
}

/**
 * Remove/cleanup all registered listeners.
 */
export function deregisterDefaultEventListeners() {
  eventDispatcher.unsubscribe("OrderPlaced", auditLogEventListener);
  eventDispatcher.unsubscribe("ProductUpdated", auditLogEventListener);
  eventDispatcher.unsubscribe("CustomerRegistered", auditLogEventListener);
  eventDispatcher.unsubscribe("order.placed", orderPlacedListener);
  eventDispatcher.unsubscribe("order.paid", orderPaidListener);
}
