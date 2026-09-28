import { CircleCheck, CircleDot, Loader, Siren } from "lucide-react";
import { STATUS_DOT } from "@/components/ui/badges";
import { STATUS_META, STATUSES } from "@/lib/domain";
import type { DashboardStats } from "@/lib/services/stats-service";
import { TrendBars } from "./TrendBars";

function Tile({ label, value, icon, hint, accent = false }: { label: string; value: number; icon: React.ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col justify-between p-5 ${accent ? "rounded-3xl bg-rose-600 text-white" : "card"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${accent ? "text-white/80" : "text-muted"}`}>{label}</span>
        <span className={accent ? "text-white/80" : "text-muted"}>{icon}</span>
      </div>
      <div className="mt-6">
        <p className="font-mono text-4xl font-medium tracking-tighter tabular-nums">{value}</p>
        {hint && <p className={`mt-1 text-xs ${accent ? "text-white/70" : "text-muted"}`}>{hint}</p>}
      </div>
    </div>
  );
}

export function StatsBento({ stats }: { stats: DashboardStats }) {
  const counts = { NEW: stats.new, ACCEPTED: stats.accepted, IN_PROGRESS: stats.inProgress, DONE: stats.done, REJECTED: stats.rejected };
  const doneRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const week = stats.daily.slice(-7).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
      <div className="card-dark col-span-2 flex flex-col justify-between p-6 lg:row-span-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/60">Всего заявок</p>
            <p className="mt-2 font-mono text-6xl font-medium tracking-tighter tabular-nums sm:text-7xl">{stats.total}</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white/80">+{week} за неделю</span>
        </div>

        <div className="mt-8">
          <TrendBars values={stats.daily} />
        </div>

        <div className="mt-6">
          <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
            {STATUSES.map((s) =>
              counts[s] ? <div key={s} className={STATUS_DOT[s]} style={{ width: `${(counts[s] / Math.max(1, stats.total)) * 100}%` }} title={`${STATUS_META[s].label}: ${counts[s]}`} /> : null,
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {STATUSES.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s]}`} />
                {STATUS_META[s].label}
                <span className="font-mono text-white">{counts[s]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <Tile label="Новые" value={stats.new} icon={<CircleDot size={18} strokeWidth={1.75} />} hint="ждут реакции УК" />
      <Tile label="В работе" value={stats.inProgress} icon={<Loader size={18} strokeWidth={1.75} />} hint={stats.accepted ? `+ ${stats.accepted} принято` : "исполняются"} />
      <Tile label="Выполнено" value={stats.done} icon={<CircleCheck size={18} strokeWidth={1.75} />} hint={`${doneRate}% от всех заявок`} />
      <Tile label="Срочные" value={stats.urgentOpen} icon={<Siren size={18} strokeWidth={1.75} />} hint="открытые, высокий приоритет" accent={stats.urgentOpen > 0} />
    </div>
  );
}
