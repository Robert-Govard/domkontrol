import { ChevronRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import { CategoryIcon, categoryName, PriorityBadge, StatusBadge } from "@/components/ui/badges";
import { formatAddress, formatDateTime } from "@/lib/format";
import type { TicketWithRelations } from "@/lib/repositories/tickets";

/** Список заявок: строки-ссылки, одна сетка для десктопа и телефона. */
export function TicketList({ tickets }: { tickets: TicketWithRelations[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="hidden grid-cols-[72px_1.2fr_1fr_2fr_150px_120px_24px] gap-4 border-b border-line px-5 py-3 lg:grid">
        {["№", "Категория", "Адрес", "Описание", "Создана", "Статус", ""].map((h) => (
          <span key={h} className="eyebrow">
            {h}
          </span>
        ))}
      </div>
      <ul className="divide-y divide-line">
        {tickets.map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/tickets/${t.id}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-4 transition hover:bg-surface sm:px-5 lg:grid-cols-[72px_1.2fr_1fr_2fr_150px_120px_24px] lg:gap-4"
            >
              <span className="hidden font-mono text-sm text-muted lg:block">{t.ticketNumber}</span>

              <span className="flex min-w-0 items-center gap-3">
                <CategoryIcon category={t.category} size="sm" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 lg:block">
                    <span className="block truncate text-sm font-medium">{categoryName(t.category)}</span>
                    <span className="lg:mt-1 lg:block">
                      <PriorityBadge priority={t.priority} quiet />
                    </span>
                  </span>
                  <span className="block truncate text-xs text-muted lg:hidden">
                    №<span className="font-mono">{t.ticketNumber}</span> · {formatAddress(t.building)}, п. {t.entrance}
                  </span>
                </span>
              </span>

              <span className="hidden text-sm lg:block">
                {formatAddress(t.building)}
                <span className="block text-xs text-muted">подъезд {t.entrance}</span>
              </span>

              <span className="col-span-2 row-start-2 flex min-w-0 items-start gap-1.5 pl-11 text-sm text-ink-2 lg:col-span-1 lg:row-start-auto lg:pl-0">
                <span className="line-clamp-2">{t.description}</span>
                {t.photoUrl && <ImageIcon size={14} className="mt-0.5 shrink-0 text-muted" aria-label="Есть фото" />}
              </span>

              <span className="hidden text-sm lg:block">
                <span className="font-mono text-xs text-ink-2">{formatDateTime(t.createdAt)}</span>
                <span className="block truncate text-xs text-muted">{t.user.name}</span>
              </span>

              <span className="justify-self-end lg:justify-self-start">
                <StatusBadge status={t.status} />
              </span>

              <ChevronRight size={16} className="hidden text-muted transition group-hover:translate-x-0.5 group-hover:text-ink lg:block" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
