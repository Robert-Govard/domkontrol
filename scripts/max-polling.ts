/**
 * Long polling для локальной разработки без публичного HTTPS:
 * получает события из MAX (GET /updates) и передаёт их той же логике бота.
 *   npm run max:polling
 * Внимание: при активном вебхуке MAX не отдаёт события через /updates.
 */
import "dotenv/config";
import { handleIncomingEvent } from "../src/lib/bot/engine";
import { MaxAdapter } from "../src/lib/max/max-adapter";
import { parseIncomingMessage } from "../src/lib/max/parse";

async function main() {
  const token = process.env.MAX_BOT_TOKEN?.trim();
  if (!token) throw new Error("MAX_BOT_TOKEN не задан в .env");
  const adapter = new MaxAdapter(token, process.env.MAX_API_URL?.trim() || "https://platform-api2.max.ru");

  console.log("▶ ДомКонтроль: long polling MAX запущен. Ctrl+C — остановить.");
  let marker: number | undefined;

  for (;;) {
    try {
      const res = await adapter.getUpdates(marker);
      marker = res.marker ?? marker;
      for (const update of res.updates) {
        const event = parseIncomingMessage(update);
        if (!event) continue;
        console.log(`← ${event.kind} от ${event.userName}`);
        await handleIncomingEvent(event, adapter).catch((e) => console.error("[bot]", e));
      }
    } catch (e) {
      console.error("[polling]", e instanceof Error ? e.message : e);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  process.exit(1);
});
