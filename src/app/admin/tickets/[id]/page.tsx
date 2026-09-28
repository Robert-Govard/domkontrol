import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusActions } from "@/components/admin/StatusActions";
import { StatusStepper } from "@/components/admin/StatusStepper";
import { StatusTimeline } from "@/components/admin/StatusTimeline";
import { CategoryIcon, categoryName, PriorityBadge, StatusBadge } from "@/components/ui/badges";
import { isStatus } from "@/lib/domain";
import { formatDateTime, formatFullAddress } from "@/lib/format";
import { findTicketById } from "@/lib/repositories/tickets";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await findTicketById(id);
  if (!ticket || !isStatus(ticket.status)) notFound();

  const fields = [
    { label: "Адрес", value: formatFullAddress(ticket.building) },
    { label: "Подъезд", value: String(ticket.entrance) },
    { label: "Житель", value: ticket.user.name },
    { label: "Создана", value: formatDateTime(ticket.createdAt), mono: true },
    { label: "Обновлена", value: formatDateTime(ticket.updatedAt), mono: true },
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink">
        <ArrowLeft size={15} /> Все заявки
      </Link>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <CategoryIcon category={ticket.category} size="lg" />
                <div>
                  <p className="text-sm text-muted">
                    №<span className="font-mono">{ticket.ticketNumber}</span>
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{categoryName(ticket.category)}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} size="lg" />
              </div>
            </div>

            <p className="mt-8 text-xl leading-relaxed tracking-tight text-ink sm:text-2xl">«{ticket.description}»</p>

            {ticket.priorityReason && (
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-ink-2">
                <Sparkles size={13} className="text-brand-600" />
                Приоритет определён автоматически: {ticket.priorityReason}
              </p>
            )}

            <div className="mt-8">
              <StatusStepper status={ticket.status} />
            </div>
          </section>

          <section className="card grid gap-px overflow-hidden bg-line sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.label} className="bg-canvas px-6 py-4">
                <p className="eyebrow">{f.label}</p>
                <p className={`mt-1.5 text-sm font-medium ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
              </div>
            ))}
            {fields.length % 2 === 1 && <div className="hidden bg-canvas sm:block" />}
          </section>

          {ticket.photoUrl && (
            <section className="card overflow-hidden">
              <a href={ticket.photoUrl} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element -- фото из локального хранилища или CDN MAX */}
                <img src={ticket.photoUrl} alt="Фото проблемы" className="max-h-[420px] w-full object-cover" />
              </a>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="card-dark p-6">
            <p className="text-sm text-white/60">Изменить статус</p>
            <p className="mb-5 mt-1 text-xs text-white/40">Житель сразу получит уведомление в MAX</p>
            <StatusActions ticketId={ticket.id} status={ticket.status} />
          </section>
          <section className="card p-6">
            <p className="eyebrow mb-5">История</p>
            <StatusTimeline history={ticket.history} />
          </section>
        </aside>
      </div>
    </div>
  );
}
