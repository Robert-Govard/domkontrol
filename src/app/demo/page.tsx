import { ArrowUpRight, Lock } from "lucide-react";
import { DemoChat } from "@/components/demo/DemoChat";
import { PhoneFrame } from "@/components/demo/PhoneFrame";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Logo } from "@/components/ui/Logo";
import { ModeBadge } from "@/components/ui/ModeBadge";
import { config } from "@/lib/config";
import { DEMO_USER } from "@/lib/demo";

export const dynamic = "force-dynamic";

const SCRIPT = [
  "Нажмите «Сообщить о проблеме»",
  "Выберите категорию, дом и подъезд",
  "Напишите «Пахнет газом на 3 этаже» — приоритет станет «Авария»",
  "Прикрепите фото или пропустите шаг",
  "Отправьте заявку и откройте панель УК",
  "Смените статус — уведомление придёт сюда",
];

export default function DemoPage() {
  if (!config.demoMode) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24">
        <EmptyState icon={Lock} title="Демо-режим выключен" text="Установите DEMO_MODE=true в .env, чтобы открыть эмулятор MAX." />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center gap-16 sm:px-6 sm:py-6">
      <aside className="animate-fade-up hidden max-w-[360px] lg:block">
        <div className="flex items-center justify-between">
          <Logo />
          <ModeBadge maxConnected={Boolean(config.maxBotToken)} />
        </div>
        <p className="eyebrow mt-14">Эмулятор MAX</p>
        <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight">
          Так житель
          <br />
          видит бота
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
          Вы — {DEMO_USER.name}, ул. Тестовая, 10. Логика бота та же, что в реальном MAX, — меняется только транспорт.
        </p>
        <ol className="mt-8 space-y-3.5">
          {SCRIPT.map((step, i) => (
            <li key={step} className="flex gap-3.5 text-sm">
              <span className="font-mono text-xs leading-5 text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-ink-2">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <ButtonLink href="/admin" external>
            Открыть панель УК <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
      </aside>

      <PhoneFrame>
        <DemoChat />
      </PhoneFrame>
    </main>
  );
}
