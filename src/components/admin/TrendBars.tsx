import { TREND_DAYS } from "@/lib/services/stats-service";

const dayFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });

/** Подпись дня для i-го столбика (последний — сегодня). */
function dayLabel(i: number, count: number): string {
  if (i === count - 1) return "сегодня";
  const d = new Date();
  d.setDate(d.getDate() - (count - 1 - i));
  return dayFormatter.format(d).replace(".", "");
}

/** Центр по столбику, у крайних столбиков — выравнивание по краю. */
function align(i: number, count: number): string {
  if (i < 2) return "left-0";
  if (i > count - 3) return "right-0";
  return "left-1/2 -translate-x-1/2";
}

function reveal(always: boolean): string {
  return `transition duration-200 ${always ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`;
}

/** Минималистичный столбчатый график заявок по дням (без библиотек). */
export function TrendBars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const last = values.length - 1;
  return (
    <div>
      {/* pt-9 — место под подсказку над самым высоким столбиком */}
      <div className="flex h-32 items-end gap-1.5 pt-9" role="img" aria-label={`Новые заявки за ${TREND_DAYS} дней: ${values.join(", ")}`}>
        {values.map((v, i) => {
          const isToday = i === last;
          return (
            <div key={i} className="group flex h-full flex-1 items-end">
              <div
                className={`relative w-full rounded-full transition-colors ${isToday ? "bg-brand-gradient" : "bg-white/15 group-hover:bg-white/35"}`}
                style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
              >
                {/* Подсказка привязана к верху столбика; у краёв прижимается внутрь карточки */}
                <span className={`pointer-events-none absolute bottom-full z-10 mb-2 ${align(i, values.length)} ${reveal(isToday)}`}>
                  <span className="flex items-baseline gap-1.5 whitespace-nowrap rounded-full bg-white py-1 pl-2.5 pr-2 text-ink shadow-[0_6px_16px_-6px_rgb(0_0_0/0.5)]">
                    <span className="font-mono text-xs font-semibold tabular-nums">{v}</span>
                    <span className="text-[10px] text-muted">{dayLabel(i, values.length)}</span>
                  </span>
                </span>
                <span
                  className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-[5px] h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-white ${reveal(isToday)}`}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-white/40">
        <span>{TREND_DAYS} дн. назад</span>
        <span>сегодня</span>
      </div>
    </div>
  );
}
