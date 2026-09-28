import { SearchX } from "lucide-react";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { StatsBento } from "@/components/admin/StatsBento";
import { StatusFilter } from "@/components/admin/StatusFilter";
import { TicketList } from "@/components/admin/TicketList";
import { EmptyState } from "@/components/ui/EmptyState";
import { isStatus, STATUS_META } from "@/lib/domain";
import { listTickets } from "@/lib/repositories/tickets";
import { getDashboardStats } from "@/lib/services/stats-service";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = isStatus(raw) ? raw : undefined;
  const [stats, tickets] = await Promise.all([getDashboardStats(), listTickets({ status })]);

  return (
    <div className="space-y-10">
      <AutoRefresh />
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Обзор</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Заявки жителей</h1>
          </div>
          <p className="inline-flex items-center gap-2 text-xs text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Обновляется в реальном времени
          </p>
        </div>
        <StatsBento stats={stats} />
      </section>

      <section className="space-y-4">
        <StatusFilter active={status} stats={stats} />
        {tickets.length > 0 ? (
          <TicketList tickets={tickets} />
        ) : (
          <EmptyState
            icon={SearchX}
            title={status ? `Нет заявок «${STATUS_META[status].label}»` : "Заявок пока нет"}
            text="Как только житель отправит заявку через MAX, она появится здесь."
          />
        )}
      </section>
    </div>
  );
}
