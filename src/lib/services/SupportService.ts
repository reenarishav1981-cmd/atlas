import { db } from "../db";
import { AuditService } from "./AuditService";
import { eventDispatcher } from "@/lib/events/dispatcher/EventDispatcher";

export class SupportService {
  /**
   * Create a new support ticket.
   */
  static async createTicket(userId: string, subject: string, description: string, priority = "MEDIUM") {
    const count = await db.supportTicket.count();
    const ticketId = `#TIC-${1000 + count + 1}`;

    const ticket = await db.supportTicket.create({
      data: {
        ticketId,
        userId,
        subject,
        description,
        priority,
        status: "OPEN",
      },
    });

    // Dispatch event
    eventDispatcher.dispatch({
      eventId: `ticket-${ticket.id}`,
      eventName: "support.ticket_created",
      eventVersion: 1,
      correlationId: ticket.id,
      timestamp: new Date(),
      payload: { ticketId: ticket.ticketId, userId, subject, priority },
      sourceModule: "SupportSystem",
    });

    return ticket;
  }

  /**
   * Add message thread reply or internal note.
   */
  static async addMessage(
    ticketId: string,
    senderId: string,
    senderName: string,
    message: string,
    isInternal = false
  ) {
    const msg = await db.ticketMessage.create({
      data: {
        ticketId,
        senderId,
        senderName,
        message,
        isInternal,
      },
    });

    // Auto update status if client replies
    if (!isInternal) {
      await db.supportTicket.update({
        where: { id: ticketId },
        data: { status: "OPEN" },
      });
    }

    return msg;
  }

  /**
   * Transition ticket status or change assignee parameters.
   */
  static async updateTicket(
    id: string,
    updates: { status?: string; priority?: string; assignedTo?: string },
    updatedBy?: string
  ) {
    const existing = await db.supportTicket.findUnique({ where: { id } });

    const ticket = await db.supportTicket.update({
      where: { id },
      data: {
        status: updates.status ?? existing?.status,
        priority: updates.priority ?? existing?.priority,
        assignedTo: updates.assignedTo !== undefined ? updates.assignedTo : existing?.assignedTo,
      },
    });

    await AuditService.log({
      userId: updatedBy || "system",
      userName: updatedBy || "Support Agent",
      action: "UPDATE",
      entityType: "SupportTicket",
      entityId: id,
      oldValue: existing,
      newValue: ticket,
    });

    return ticket;
  }
}
