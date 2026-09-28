import type { TicketStatusHistory } from "@prisma/client";
import { STATUS_DOT } from "@/components/ui/badges";
import { isStatus, STATUS_META } from "@/lib/domain";
import { formatDateTime } from "@/lib/format";

export function StatusTimeline({ history }: { history: TicketStatusHistory[] }) {
  return (
    <ol className="space-y-0">
      {[...history].reverse().map((h, i, arr) => (
        <li key={h.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < arr.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-line" aria-hidden />}
          <span className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-canvas ${isStatus(h.newStatus) ? STATUS_DOT[h.newStatus] : "bg-muted"}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium">{isStatus(h.newStatus) ? STATUS_META[h.newStatus].label : h.newStatus}</p>
            <p className="mt-0.5 text-xs text-muted">
              <span className="font-mono">{formatDateTime(h.createdAt)}</span> · {h.oldStatus ? "сотрудник УК" : "житель через MAX"}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
