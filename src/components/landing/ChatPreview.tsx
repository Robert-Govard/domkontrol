import { BellRing } from "lucide-react";

/** Статичное превью диалога для главной — показывает суть продукта одним взглядом. */
export function ChatPreview() {
  return (
    <div className="space-y-2.5 text-[13px] leading-snug">
      <div className="ml-auto w-fit max-w-[80%] rounded-[18px] rounded-br-md bg-brand-600 px-3.5 py-2 text-white">
        На пятом этаже возле лифта не работает освещение
      </div>
      <div className="w-fit max-w-[85%] rounded-[18px] rounded-bl-md bg-white/10 px-3.5 py-2.5 text-white">
        <p className="font-medium">Заявка №1048 создана</p>
        <p className="mt-1 text-white/60">Освещение · ул. Тестовая, 10 · подъезд 2</p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky-400/15 px-2 py-0.5 text-[11px] text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Новая
        </p>
      </div>
      <div className="w-fit max-w-[85%] overflow-hidden rounded-[18px] rounded-bl-md bg-white text-ink">
        <p className="flex items-center gap-1.5 border-b border-line px-3.5 py-1.5 text-[10px] font-medium tracking-wide text-muted uppercase">
          <BellRing size={12} className="text-brand-600" /> Уведомление
        </p>
        <p className="px-3.5 py-2">
          Статус заявки №1048: <span className="font-medium">В работе</span>
        </p>
      </div>
    </div>
  );
}
