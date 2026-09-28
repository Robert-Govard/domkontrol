import { countOpenUrgent, countTicketsByStatus, listTicketDatesSince } from "@/lib/repositories/tickets";

export const TREND_DAYS = 14;
const DAY_MS = 86_400_000;

export interface DashboardStats {
  total: number;
  new: number;
  accepted: number;
  inProgress: number;
  done: number;
  rejected: number;
  /** Открытые заявки высокого приоритета и аварии. */
  urgentOpen: number;
  /** Количество новых заявок по дням, от старых к новым. */
  daily: number[];
}

function dailyCounts(dates: Date[], now = Date.now()): number[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const start = today.getTime() - (TREND_DAYS - 1) * DAY_MS;
  const days = new Array<number>(TREND_DAYS).fill(0);
  for (const d of dates) {
    const i = Math.floor((d.getTime() - start) / DAY_MS);
    if (i >= 0 && i < TREND_DAYS) days[i]! += 1;
  }
  return days;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const since = new Date(Date.now() - TREND_DAYS * DAY_MS);
  const [c, urgentOpen, dates] = await Promise.all([countTicketsByStatus(), countOpenUrgent(), listTicketDatesSince(since)]);
  const n = (k: string) => c[k] ?? 0;
  return {
    total: Object.values(c).reduce((a, b) => a + b, 0),
    new: n("NEW"),
    accepted: n("ACCEPTED"),
    inProgress: n("IN_PROGRESS"),
    done: n("DONE"),
    rejected: n("REJECTED"),
    urgentOpen,
    daily: dailyCounts(dates.map((d) => d.createdAt)),
  };
}
