import { db } from "../db";
import { AuditService } from "./AuditService";
import { eventDispatcher } from "@/lib/events/dispatcher/EventDispatcher";

export class WalletService {
  /**
   * Resolve customer wallet details, seeding defaults if missing.
   */
  static async getWallet(userId: string) {
    return db.wallet.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        balance: 0.0,
        storeCredits: 0.0,
        loyaltyPoints: 0,
      },
    });
  }

  /**
   * Manually adjust credit balances or store credits.
   */
  static async adjustBalance(
    userId: string,
    amount: number,
    type: "CREDIT" | "DEBIT",
    description: string,
    updatedBy?: string
  ) {
    const wallet = await this.getWallet(userId);
    const multiplier = type === "CREDIT" ? 1 : -1;
    const finalAdjustment = amount * multiplier;

    const updated = await db.wallet.update({
      where: { id: userId },
      data: {
        balance: wallet.balance + finalAdjustment,
      },
    });

    const tx = await db.walletTransaction.create({
      data: {
        walletId: userId,
        amount: finalAdjustment,
        points: 0,
        type,
        description,
      },
    });

    // Log administrative action
    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "Wallet Service",
      action: "UPDATE",
      entityType: "Wallet",
      entityId: userId,
      oldValue: wallet,
      newValue: updated,
    });

    // Dispatch Event
    eventDispatcher.dispatch({
      eventId: `wallet-tx-${tx.id}`,
      eventName: "wallet.balance_adjusted",
      eventVersion: 1,
      correlationId: tx.id,
      timestamp: new Date(),
      payload: { userId, adjustment: finalAdjustment, currentBalance: updated.balance, txId: tx.id },
      sourceModule: "LoyaltyWallet",
    });

    return updated;
  }

  /**
   * Adjust loyalty reward points.
   */
  static async adjustLoyaltyPoints(
    userId: string,
    points: number,
    type: "CREDIT" | "DEBIT",
    description: string,
    updatedBy?: string
  ) {
    const wallet = await this.getWallet(userId);
    const multiplier = type === "CREDIT" ? 1 : -1;
    const pointsAdjustment = points * multiplier;

    const updated = await db.wallet.update({
      where: { id: userId },
      data: {
        loyaltyPoints: Math.max(0, wallet.loyaltyPoints + pointsAdjustment),
      },
    });

    const tx = await db.walletTransaction.create({
      data: {
        walletId: userId,
        amount: 0.0,
        points: pointsAdjustment,
        type,
        description,
      },
    });

    // Log administrative action
    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "Wallet Service",
      action: "UPDATE",
      entityType: "WalletPoints",
      entityId: userId,
      oldValue: wallet,
      newValue: updated,
    });

    // Dispatch Event
    eventDispatcher.dispatch({
      eventId: `points-tx-${tx.id}`,
      eventName: "wallet.points_adjusted",
      eventVersion: 1,
      correlationId: tx.id,
      timestamp: new Date(),
      payload: { userId, pointsAdjustment, currentPoints: updated.loyaltyPoints, txId: tx.id },
      sourceModule: "LoyaltyWallet",
    });

    return updated;
  }

  /**
   * Fetch complete history logs.
   */
  static async getTransactionHistory(userId: string) {
    return db.walletTransaction.findMany({
      where: { walletId: userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
