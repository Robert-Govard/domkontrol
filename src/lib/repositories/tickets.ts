import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { Category, Priority, TicketStatus } from "@/lib/domain";

/** Первый номер заявки — чтобы номера выглядели «живыми» (№1001, №1002…). */
const FIRST_TICKET_NUMBER = 1001;

const withRelations = {
  user: true,
  building: true,
} satisfies Prisma.TicketInclude;

export type TicketWithRelations = Prisma.TicketGetPayload<{ include: typeof withRelations }>;

export type TicketWithHistory = Prisma.TicketGetPayload<{
  include: typeof withRelations & { history: true };
}>;

export interface NewTicketData {
  userId: string;
  buildingId: string;
  entrance: number;
  category: Category;
  description: string;
  photoUrl: string | null;
  priority: Priority;
  priorityReason: string;
}

/** Создаёт заявку со следующим номером и первой записью истории — атомарно. */
export function insertTicket(data: NewTicketData): Promise<TicketWithRelations> {
  return prisma.$transaction(async (tx) => {
    const last = await tx.ticket.aggregate({ _max: { ticketNumber: true } });
    const ticketNumber = (last._max.ticketNumber ?? FIRST_TICKET_NUMBER - 1) + 1;
    return tx.ticket.create({
      data: {
        ...data,
        ticketNumber,
        status: "NEW",
        history: { create: { oldStatus: null, newStatus: "NEW" } },
      },
      include: withRelations,
    });
  });
}

export function listTickets(filter: { status?: TicketStatus; userId?: string; take?: number } = {}) {
  return prisma.ticket.findMany({
    where: { status: filter.status, userId: filter.userId },
    include: withRelations,
    orderBy: { createdAt: "desc" },
    take: filter.take,
  });
}

export function findTicketById(id: string): Promise<TicketWithHistory | null> {
  return prisma.ticket.findUnique({
    where: { id },
    include: { ...withRelations, history: { orderBy: { createdAt: "asc" } } },
  });
}

export function findUserTicketByNumber(userId: string, ticketNumber: number) {
  return prisma.ticket.findFirst({
    where: { userId, ticketNumber },
    include: { ...withRelations, history: { orderBy: { createdAt: "asc" } } },
  });
}

export function updateTicketStatus(id: string, oldStatus: TicketStatus, newStatus: TicketStatus) {
  return prisma.ticket.update({
    where: { id },
    data: { status: newStatus, history: { create: { oldStatus, newStatus } } },
    include: withRelations,
  });
}

export async function countTicketsByStatus(): Promise<Record<string, number>> {
  const groups = await prisma.ticket.groupBy({ by: ["status"], _count: { _all: true } });
  return Object.fromEntries(groups.map((g) => [g.status, g._count._all]));
}

export function listTicketDatesSince(since: Date) {
  return prisma.ticket.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
}

/** Открытые заявки с высоким приоритетом или аварией. */
export function countOpenUrgent() {
  return prisma.ticket.count({
    where: { status: { in: ["NEW", "ACCEPTED", "IN_PROGRESS"] }, priority: { in: ["HIGH", "EMERGENCY"] } },
  });
}
