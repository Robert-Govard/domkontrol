"use client";

import { BellRing, CircleAlert, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { STATUS_TRANSITIONS, type TicketStatus } from "@/lib/domain";

interface Feedback {
  kind: "success" | "warning" | "error";
  text: string;
}

const PRIMARY_NEXT: Partial<Record<TicketStatus, TicketStatus>> = {
  NEW: "ACCEPTED",
  ACCEPTED: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
};

const ACTION_LABEL: Record<TicketStatus, string> = {
  NEW: "Вернуть в новые",
  ACCEPTED: "Принять",
  IN_PROGRESS: "Взять в работу",
  DONE: "Выполнена",
  REJECTED: "Отклонить",
};

const FEEDBACK_STYLE = {
  success: { cls: "bg-emerald-400/10 text-emerald-300", Icon: BellRing },
  warning: { cls: "bg-amber-400/10 text-amber-300", Icon: TriangleAlert },
  error: { cls: "bg-rose-400/10 text-rose-300", Icon: CircleAlert },
} as const;

/** Тёмный блок действий: основное действие — крупная кнопка, остальные — вторичные. */
export function StatusActions({ ticketId, status }: { ticketId: string; status: TicketStatus }) {
  const router = useRouter();
  const [pending, setPending] = useState<TicketStatus | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [, startTransition] = useTransition();

  const options = STATUS_TRANSITIONS[status];
  const primary = PRIMARY_NEXT[status];
  const secondary = options.filter((s) => s !== primary);

  async function change(next: TicketStatus) {
    setPending(next);
    setFeedback(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = (await res.json()) as { error?: string; notified?: boolean; channel?: "max" | "mock"; notifyError?: string };
      if (!res.ok) throw new Error(data.error ?? "Не удалось изменить статус");
      setFeedback(
        data.notified
          ? { kind: "success", text: `Житель уведомлён ${data.channel === "max" ? "в MAX" : "в демо-чате MAX"}` }
          : { kind: "warning", text: `Статус изменён, но уведомление не отправлено: ${data.notifyError ?? "ошибка MAX API"}` },
      );
      startTransition(() => router.refresh());
    } catch (e) {
      setFeedback({ kind: "error", text: e instanceof Error ? e.message : "Ошибка сети" });
    } finally {
      setPending(null);
    }
  }

  const fb = feedback ? FEEDBACK_STYLE[feedback.kind] : null;

  return (
    <div className="space-y-3">
      {primary && (
        <button
          type="button"
          disabled={pending !== null}
          onClick={() => change(primary)}
          className="bg-brand-gradient flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-medium text-white transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
        >
          {pending === primary && <Spinner />}
          {ACTION_LABEL[primary]}
        </button>
      )}
      {secondary.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {secondary.map((next) => (
            <button
              key={next}
              type="button"
              disabled={pending !== null}
              onClick={() => change(next)}
              className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition disabled:opacity-60 ${
                next === "REJECTED" ? "bg-white/5 text-rose-300 hover:bg-rose-500/15" : "bg-white/10 text-white hover:bg-white/15"
              } ${secondary.length === 1 ? "col-span-2" : ""}`}
            >
              {pending === next && <Spinner />}
              {ACTION_LABEL[next]}
            </button>
          ))}
        </div>
      )}
      {fb && feedback && (
        <p role="status" className={`flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm ${fb.cls}`}>
          <fb.Icon size={16} className="mt-0.5 shrink-0" />
          {feedback.text}
        </p>
      )}
    </div>
  );
}
