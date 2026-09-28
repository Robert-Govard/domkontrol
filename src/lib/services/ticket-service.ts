import { P } from "@/lib/bot/payloads";
import { statusChangedText } from "@/lib/bot/texts";
import { canTransition, isStatus, type Category, type TicketStatus } from "@/lib/domain";
import { getAdapterForUser } from "@/lib/max";
import { getPriorityClassifier } from "@/lib/priority";
import { findTicketById, insertTicket, updateTicketStatus } from "@/lib/repositories/tickets";

export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "INVALID_TRANSITION" | "VALIDATION",
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export interface CreateTicketInput {
  userId: string;
  buildingId: string;
  entrance: number;
  category: Category;
  description: string;
  photoUrl: string | null;
}

export async function createTicket(input: CreateTicketInput) {
  const { priority, reason } = await getPriorityClassifier().classify({
    category: input.category,
    description: input.description,
  });
  return insertTicket({ ...input, priority, priorityReason: reason });
}

export interface StatusChangeResult {
  ticketNumber: number;
  oldStatus: TicketStatus;
  newStatus: TicketStatus;
  notified: boolean;
  channel: "max" | "mock";
  notifyError?: string;
}

/**
 * Меняет статус заявки и уведомляет жителя в MAX.
 * Ошибка отправки уведомления не откатывает смену статуса.
 */
export async function changeTicketStatus(ticketId: string, newStatus: TicketStatus): Promise<StatusChangeResult> {
  const ticket = await findTicketById(ticketId);
  if (!ticket) throw new DomainError("Заявка не найдена", "NOT_FOUND");

  const oldStatus = ticket.status;
  if (!isStatus(oldStatus) || !canTransition(oldStatus, newStatus)) {
    throw new DomainError(`Нельзя перевести заявку из «${oldStatus}» в «${newStatus}»`, "INVALID_TRANSITION");
  }

  const updated = await updateTicketStatus(ticketId, oldStatus, newStatus);
  const adapter = getAdapterForUser(updated.user.maxUserId);

  try {
    await adapter.sendNotification(updated.user.maxUserId, {
      text: statusChangedText(updated.ticketNumber, oldStatus, newStatus),
      buttons: [[{ text: "📄 Открыть заявку", payload: P.ticket(updated.ticketNumber) }], [{ text: "📋 Мои заявки", payload: P.myTickets }]],
    });
    return { ticketNumber: updated.ticketNumber, oldStatus, newStatus, notified: true, channel: adapter.kind };
  } catch (error) {
    console.error("[notify] failed to send status notification", error);
    return {
      ticketNumber: updated.ticketNumber,
      oldStatus,
      newStatus,
      notified: false,
      channel: adapter.kind,
      notifyError: error instanceof Error ? error.message : String(error),
    };
  }
}
