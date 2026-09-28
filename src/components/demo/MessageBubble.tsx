import { BellRing } from "lucide-react";
import type { ChatMessageDto } from "@/app/api/demo/messages/dto";
import type { Button } from "@/lib/max";

function time(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  message: ChatMessageDto;
  disabled: boolean;
  onButton: (button: Button) => void;
}

export function MessageBubble({ message, disabled, onButton }: Props) {
  const fromResident = message.direction === "in";
  const isNotification = !fromResident && message.text.startsWith("🔔");
  const text = isNotification ? message.text.replace(/^🔔\s*/, "") : message.text;

  return (
    <div className={`animate-bubble flex flex-col ${fromResident ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[84%] overflow-hidden text-[14.5px] leading-[1.45] ${
          fromResident
            ? "rounded-[20px] rounded-br-md bg-brand-600 text-white"
            : isNotification
              ? "rounded-[20px] rounded-bl-md bg-ink text-white"
              : "rounded-[20px] rounded-bl-md border border-line bg-canvas text-ink"
        }`}
      >
        {isNotification && (
          <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2 text-[11px] font-medium tracking-wide text-white/60 uppercase">
            <BellRing size={13} className="text-brand-300" /> Уведомление
          </div>
        )}
        {message.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- локальные загрузки
          <img src={message.imageUrl} alt="Фото" className="max-h-56 w-full object-cover" />
        )}
        {(text || !message.imageUrl) && (
          <p className="whitespace-pre-line break-words px-3.5 py-2.5">
            {text}
            <span className={`float-right ml-3 mt-1.5 font-mono text-[10px] ${fromResident || isNotification ? "text-white/50" : "text-muted"}`}>
              {time(message.createdAt)}
            </span>
          </p>
        )}
      </div>

      {message.buttons && message.buttons.length > 0 && (
        <div className="mt-1.5 flex w-full max-w-[84%] flex-col gap-1">
          {message.buttons.map((row, i) => (
            <div key={i} className="flex gap-1">
              {row.map((b) => (
                <button
                  key={b.payload}
                  type="button"
                  disabled={disabled}
                  onClick={() => onButton(b)}
                  className="min-h-10 flex-1 rounded-2xl border border-line bg-canvas/90 px-2.5 py-2 text-[13px] font-medium text-ink backdrop-blur transition hover:border-brand-300 hover:text-brand-700 active:scale-[0.98] disabled:opacity-50"
                >
                  {b.text}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
