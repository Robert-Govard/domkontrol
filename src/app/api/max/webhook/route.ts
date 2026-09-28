import { after, NextResponse } from "next/server";
import { handleIncomingEvent } from "@/lib/bot/engine";
import { config } from "@/lib/config";
import { jsonError } from "@/lib/http/responses";
import { getMaxAdapter, parseIncomingMessage } from "@/lib/max";

/**
 * Вебхук MAX Bot API. Регистрация: npm run max:webhook
 * MAX присылает секрет в заголовке X-Max-Bot-Api-Secret.
 */
export async function POST(req: Request) {
  if (config.maxWebhookSecret && req.headers.get("x-max-bot-api-secret") !== config.maxWebhookSecret) {
    return jsonError("Forbidden", 403);
  }

  let update: unknown;
  try {
    update = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const event = parseIncomingMessage(update);
  if (event) {
    // Отвечаем MAX сразу, а обработку доводим после ответа.
    after(() => handleIncomingEvent(event, getMaxAdapter()).catch((e) => console.error("[webhook]", e)));
  }
  return NextResponse.json({ ok: true });
}

export function GET() {
  return NextResponse.json({ ok: true, mode: config.maxBotToken ? "max" : "mock" });
}
