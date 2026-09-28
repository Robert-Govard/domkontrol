"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { LogoMark } from "@/components/ui/Logo";
import { Spinner } from "@/components/ui/Spinner";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";
import { useDemoChat } from "./useDemoChat";

/** Эмулятор диалога с ботом в MAX. Логика бота — та же, что для реального MAX. */
export function DemoChat() {
  const { messages, loading, sending, error, send, uploadPhoto, reset, clearError } = useDemoChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sending]);

  return (
    <div className="bg-dots flex h-full flex-col bg-surface">
      <div className="flex items-center gap-3 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-xl">
        <LogoMark size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight tracking-tight">ДомКонтроль</p>
          <p className="text-xs text-muted">{sending ? <span className="text-brand-600">печатает…</span> : "бот"}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={loading || sending}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface hover:text-ink disabled:opacity-50"
          title="Очистить чат и начать заново"
          aria-label="Сбросить чат"
        >
          <RotateCcw size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="scrollbar-none flex-1 space-y-2.5 overflow-y-auto px-3 py-4" aria-live="polite">
        {loading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted">
            <Spinner className="h-5 w-5" />
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} message={m} disabled={sending} onButton={(b) => send({ kind: "callback", payload: b.payload, label: b.text })} />
          ))
        )}
        {sending && (
          <div className="inline-flex gap-1 rounded-full border border-line bg-canvas px-3 py-2.5" aria-label="Бот печатает">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <button type="button" onClick={clearError} className="mx-3 rounded-2xl bg-rose-50 px-4 py-2 text-left text-sm text-rose-700">
          {error} <span className="text-rose-400">· скрыть</span>
        </button>
      )}

      <Composer
        disabled={sending || loading}
        onText={(text) => send({ kind: "text", text })}
        onPhoto={async (file, caption) => {
          const url = await uploadPhoto(file);
          if (url) await send({ kind: "photo", photoUrl: url, text: caption || undefined });
        }}
      />
    </div>
  );
}
