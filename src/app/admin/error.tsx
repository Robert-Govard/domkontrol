"use client";

import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClass } from "@/components/ui/Button";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="Не удалось загрузить заявки"
      text="Проверьте, что база данных создана: npm run db:reset"
      action={
        <button onClick={reset} className={buttonClass("primary")}>
          Повторить
        </button>
      }
    />
  );
}
