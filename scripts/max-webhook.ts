/**
 * Регистрирует вебхук бота в MAX: POST /subscriptions.
 * Требует MAX_BOT_TOKEN и PUBLIC_URL (HTTPS) в .env.
 *   npm run max:webhook
 */
import "dotenv/config";
import { MaxAdapter } from "../src/lib/max/max-adapter";

async function main() {
  const token = process.env.MAX_BOT_TOKEN?.trim();
  const publicUrl = process.env.PUBLIC_URL?.trim().replace(/\/$/, "");
  if (!token) throw new Error("MAX_BOT_TOKEN не задан в .env");
  if (!publicUrl?.startsWith("https://")) throw new Error("PUBLIC_URL должен начинаться с https://");

  const adapter = new MaxAdapter(token, process.env.MAX_API_URL?.trim() || "https://platform-api2.max.ru");
  const url = `${publicUrl}/api/max/webhook`;
  const result = await adapter.subscribe(url, process.env.MAX_WEBHOOK_SECRET?.trim() || undefined);
  console.log(`✔ Вебхук зарегистрирован: ${url}`);
  console.log(result);
}

main().catch((e) => {
  console.error("✖", e instanceof Error ? e.message : e);
  process.exit(1);
});
