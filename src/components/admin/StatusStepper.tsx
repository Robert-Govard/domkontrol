import { Check } from "lucide-react";
import { STATUS_META, type TicketStatus } from "@/lib/domain";

const MAIN_PATH: TicketStatus[] = ["NEW", "ACCEPTED", "IN_PROGRESS", "DONE"];

/** Прогресс по основному пути статусов. Отклонённая заявка показывается отдельно. */
export function StatusStepper({ status }: { status: TicketStatus }) {
  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Заявка отклонена
      </div>
    );
  }
  const current = MAIN_PATH.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {MAIN_PATH.map((s, i) => {
        const done = i < current || status === "DONE";
        const active = i === current && status !== "DONE";
        return (
          <li key={s} className="min-w-0">
            <div className={`h-1 rounded-full ${done ? "bg-ink" : active ? "bg-brand-gradient" : "bg-line"}`} />
            <p className={`mt-2 flex items-center gap-1 truncate text-xs ${done || active ? "font-medium text-ink" : "text-muted"}`}>
              {done && <Check size={12} strokeWidth={2.5} />}
              {STATUS_META[s].label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
