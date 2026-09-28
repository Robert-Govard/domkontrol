export const STATUSES = ["NEW", "ACCEPTED", "IN_PROGRESS", "DONE", "REJECTED"] as const;

export type TicketStatus = (typeof STATUSES)[number];

export interface StatusMeta {
  emoji: string;
  label: string;
  /** Множественное число — для фильтров панели УК. */
  plural: string;
}

export const STATUS_META: Record<TicketStatus, StatusMeta> = {
  NEW: { emoji: "🆕", label: "Новая", plural: "Новые" },
  ACCEPTED: { emoji: "🔵", label: "Принята", plural: "Принятые" },
  IN_PROGRESS: { emoji: "🟡", label: "В работе", plural: "В работе" },
  DONE: { emoji: "🟢", label: "Выполнена", plural: "Выполненные" },
  REJECTED: { emoji: "🔴", label: "Отклонена", plural: "Отклонённые" },
};

/**
 * Допустимые переходы статусов. Основной путь:
 * Новая → Принята → В работе → Выполнена. Закрытые заявки можно переоткрыть.
 */
export const STATUS_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  NEW: ["ACCEPTED", "IN_PROGRESS", "REJECTED"],
  ACCEPTED: ["IN_PROGRESS", "DONE", "REJECTED"],
  IN_PROGRESS: ["DONE", "REJECTED"],
  DONE: ["IN_PROGRESS"],
  REJECTED: ["ACCEPTED"],
};

export function isStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

export function statusTitle(status: string): string {
  if (!isStatus(status)) return status;
  return `${STATUS_META[status].emoji} ${STATUS_META[status].label}`;
}
