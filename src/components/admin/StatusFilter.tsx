import Link from "next/link";
import { STATUS_DOT } from "@/components/ui/badges";
import { STATUS_META, type TicketStatus } from "@/lib/domain";
import type { DashboardStats } from "@/lib/services/stats-service";

const FILTERS: { status?: TicketStatus; label: string; count: (s: DashboardStats) => number }[] = [
  { label: "Все", count: (s) => s.total },
  { status: "NEW", label: STATUS_META.NEW.plural, count: (s) => s.new },
  { status: "ACCEPTED", label: STATUS_META.ACCEPTED.plural, count: (s) => s.accepted },
  { status: "IN_PROGRESS", label: STATUS_META.IN_PROGRESS.plural, count: (s) => s.inProgress },
  { status: "DONE", label: STATUS_META.DONE.plural, count: (s) => s.done },
  { status: "REJECTED", label: STATUS_META.REJECTED.plural, count: (s) => s.rejected },
];

/** Сегментированный переключатель статусов. */
export function StatusFilter({ active, stats }: { active?: TicketStatus; stats: DashboardStats }) {
  return (
    <nav className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Фильтр по статусу">
      <div className="inline-flex gap-1 rounded-full border border-line bg-canvas p-1">
        {FILTERS.map((f) => {
          const isActive = f.status === active;
          return (
            <Link
              key={f.label}
              href={f.status ? `/admin?status=${f.status}` : "/admin"}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition ${
                isActive ? "bg-ink text-white" : "text-ink-2 hover:bg-surface"
              }`}
            >
              {f.status && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[f.status]}`} />}
              {f.label}
              <span className={`font-mono text-xs tabular-nums ${isActive ? "text-white/60" : "text-muted"}`}>{f.count(stats)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
