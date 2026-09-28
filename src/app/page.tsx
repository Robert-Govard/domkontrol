import { ArrowRight, ArrowUpRight, Siren, WifiOff } from "lucide-react";
import Link from "next/link";
import { ChatPreview } from "@/components/landing/ChatPreview";
import { STATUS_DOT } from "@/components/ui/badges";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { ModeBadge } from "@/components/ui/ModeBadge";
import { config } from "@/lib/config";
import { STATUS_META, type TicketStatus } from "@/lib/domain";

export const dynamic = "force-dynamic";

const FLOW: TicketStatus[] = ["NEW", "ACCEPTED", "IN_PROGRESS", "DONE"];
const STEPS = ["Категория", "Дом", "Подъезд", "Описание", "Фото"];

export default function HomePage() {
  const maxConnected = Boolean(config.maxBotToken);
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6">
      <header className="flex h-20 items-center justify-between gap-3">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/admin" className="hidden h-9 items-center rounded-full px-4 text-sm text-ink-2 transition hover:bg-canvas sm:inline-flex">
            Панель УК
          </Link>
          <ModeBadge maxConnected={maxConnected} />
        </nav>
      </header>

      <section className="animate-fade-up pb-14 pt-14 sm:pt-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1 text-xs text-ink-2">
          <span className="bg-brand-gradient h-1.5 w-1.5 rounded-full" /> Бот для мессенджера MAX
        </p>
        <h1 className="mt-6 max-w-4xl text-[44px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[88px]">
          Проблемы дома —
          <br />
          <span className="text-brand-gradient">без потерянных</span> сообщений
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
          Житель отправляет заявку в УК за пару касаний прямо в MAX и получает уведомление при каждом изменении статуса.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/demo">
            Открыть демо жителя <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink href="/admin" variant="ghost">
            Панель УК <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-3 pb-16 md:grid-cols-3 md:grid-rows-[auto_auto]">
        <Link href="/demo" className="card-dark group relative overflow-hidden p-6 md:row-span-2 md:p-7">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Житель</p>
            <ArrowUpRight size={18} className="text-white/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">Заявка в чате MAX</p>
          <div className="mt-8">
            <ChatPreview />
          </div>
        </Link>

        <div className="card p-6 md:col-span-2 md:p-7">
          <p className="text-sm text-muted">5 шагов вместо звонка</p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {STEPS.map((s, i) => (
              <span key={s} className="inline-flex items-center gap-2">
                <span className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm">
                  <span className="font-mono text-xs text-muted">{i + 1}</span>
                  {s}
                </span>
                {i < STEPS.length - 1 && <span className="h-px w-3 bg-line" />}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5">
            {FLOW.map((s, i) => (
              <span key={s} className="inline-flex items-center gap-2 text-sm text-ink-2">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
                {STATUS_META[s].label}
                {i < FLOW.length - 1 && <ArrowRight size={14} className="text-muted" />}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-brand-gradient rounded-3xl p-6 text-white md:p-7">
          <Siren size={22} strokeWidth={1.75} />
          <p className="mt-8 text-xl font-semibold tracking-tight">Автоприоритет</p>
          <p className="mt-1.5 text-sm text-white/75">«Пахнет газом» — сразу авария. «Не горит лампа» — низкий.</p>
        </div>

        <div className="card p-6 md:p-7">
          <WifiOff size={22} strokeWidth={1.75} className="text-ink-2" />
          <p className="mt-8 text-xl font-semibold tracking-tight">Работает без токена</p>
          <p className="mt-1.5 text-sm text-muted">Демо-режим эмулирует MAX — весь сценарий виден локально.</p>
        </div>
      </section>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line py-6 text-xs text-muted">
        <span>ДомКонтроль · MVP для хакатона на платформе MAX</span>
        <span className="font-mono">Next.js · Prisma · MAX Bot API</span>
      </footer>
    </main>
  );
}
