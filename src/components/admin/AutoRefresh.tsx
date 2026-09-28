"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Периодически обновляет серверные данные — новые заявки из MAX появляются без перезагрузки. */
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);
  return null;
}
