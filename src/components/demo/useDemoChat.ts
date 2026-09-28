"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessageDto } from "@/app/api/demo/messages/dto";

export type DemoInput =
  | { kind: "start" }
  | { kind: "text"; text: string }
  | { kind: "callback"; payload: string; label: string }
  | { kind: "photo"; photoUrl: string; text?: string };

const POLL_MS = 2000;

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? `Ошибка ${res.status}`;
  } catch {
    return `Ошибка ${res.status}`;
  }
}

/** Состояние демо-чата: загрузка истории, отправка, опрос уведомлений. */
export function useDemoChat() {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastId = useRef(0);
  const fetching = useRef(false);

  const refetchRequested = useRef(false);
  const initialized = useRef(false);

  /** Догружает новые сообщения. Если загрузка уже идёт — повторит её после завершения. */
  const fetchNew = useCallback(async (): Promise<ChatMessageDto[]> => {
    if (fetching.current) {
      refetchRequested.current = true;
      return [];
    }
    fetching.current = true;
    const received: ChatMessageDto[] = [];
    try {
      do {
        refetchRequested.current = false;
        const res = await fetch(`/api/demo/messages?after=${lastId.current}`, { cache: "no-store" });
        if (!res.ok) throw new Error(await readError(res));
        const { messages: fresh } = (await res.json()) as { messages: ChatMessageDto[] };
        if (fresh.length) {
          lastId.current = fresh[fresh.length - 1]!.id;
          received.push(...fresh);
          setMessages((prev) => [...prev, ...fresh.filter((m) => !prev.some((p) => p.id === m.id))]);
        }
      } while (refetchRequested.current);
      setError(null);
      return received;
    } finally {
      fetching.current = false;
    }
  }, []);

  const send = useCallback(
    async (input: DemoInput) => {
      setSending(true);
      setError(null);
      try {
        const res = await fetch("/api/demo/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error(await readError(res));
        await fetchNew();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка сети");
      } finally {
        setSending(false);
      }
    },
    [fetchNew],
  );

  const uploadPhoto = useCallback(async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/demo/upload", { method: "POST", body: form });
    if (!res.ok) {
      setError(await readError(res));
      return null;
    }
    return ((await res.json()) as { url: string }).url;
  }, []);

  const reset = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/demo/messages", { method: "DELETE" });
      lastId.current = 0;
      setMessages([]);
      await send({ kind: "start" });
    } finally {
      setLoading(false);
    }
  }, [send]);

  // Первая загрузка: история или приветствие бота (один раз, в т. ч. в StrictMode).
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      try {
        const initial = await fetchNew();
        if (initial.length === 0 && lastId.current === 0) await send({ kind: "start" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось загрузить чат");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchNew, send]);

  // Опрос: так в чат «прилетают» уведомления о смене статуса из панели УК.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchNew().catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNew]);

  return { messages, loading, sending, error, send, uploadPhoto, reset, clearError: () => setError(null) };
}
