import { NextResponse } from "next/server";
import { z } from "zod";
import { handleIncomingEvent } from "@/lib/bot/engine";
import { config } from "@/lib/config";
import { DEMO_USER } from "@/lib/demo";
import { handleApiError, jsonError } from "@/lib/http/responses";
import { MockMaxAdapter, type IncomingEvent } from "@/lib/max";
import { saveSession } from "@/lib/repositories/sessions";
import { clearChat, insertChatMessage, listChatMessages } from "@/lib/repositories/chat";
import { upsertUserByMaxId } from "@/lib/repositories/users";
import { toChatMessageDto } from "./dto";

export const dynamic = "force-dynamic";

const adapter = new MockMaxAdapter();
const base = { userId: DEMO_USER.maxUserId, userName: DEMO_USER.name };

const inputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("start") }),
  z.object({ kind: z.literal("text"), text: z.string().trim().min(1, "Пустое сообщение").max(2000) }),
  z.object({ kind: z.literal("callback"), payload: z.string().min(1).max(64), label: z.string().max(100) }),
  z.object({
    kind: z.literal("photo"),
    photoUrl: z.string().regex(/^\/api\/uploads\/[\w.-]+$/, "Некорректная ссылка на фото"),
    text: z.string().max(2000).optional(),
  }),
]);

/** История демо-чата (для опроса: ?after=<id>). */
export async function GET(req: Request) {
  if (!config.demoMode) return jsonError("Демо-режим выключен", 403);
  const after = Number(new URL(req.url).searchParams.get("after") ?? 0) || 0;
  const rows = await listChatMessages(DEMO_USER.maxUserId, after);
  return NextResponse.json({ messages: rows.map(toChatMessageDto) });
}

/** Сообщение «от жителя»: сохраняем в ленту и прогоняем через логику бота. */
export async function POST(req: Request) {
  if (!config.demoMode) return jsonError("Демо-режим выключен", 403);
  try {
    const input = inputSchema.parse(await req.json());
    let event: IncomingEvent;

    switch (input.kind) {
      case "start":
        await insertChatMessage({ maxUserId: base.userId, direction: "in", text: "/start" });
        event = { kind: "start", ...base };
        break;
      case "text":
        await insertChatMessage({ maxUserId: base.userId, direction: "in", text: input.text });
        event = { kind: "text", ...base, text: input.text };
        break;
      case "callback":
        // В MAX нажатие кнопки не создаёт сообщения; в демо показываем его для наглядности.
        await insertChatMessage({ maxUserId: base.userId, direction: "in", text: input.label });
        event = { kind: "callback", ...base, payload: input.payload };
        break;
      case "photo":
        await insertChatMessage({ maxUserId: base.userId, direction: "in", text: input.text ?? "", imageUrl: input.photoUrl });
        event = { kind: "photo", ...base, photoUrl: input.photoUrl, text: input.text };
        break;
    }

    await handleIncomingEvent(event, adapter);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

/** Очистить чат и сбросить диалог (заявки не удаляются). */
export async function DELETE() {
  if (!config.demoMode) return jsonError("Демо-режим выключен", 403);
  const user = await upsertUserByMaxId(DEMO_USER.maxUserId, DEMO_USER.name);
  await clearChat(DEMO_USER.maxUserId);
  await saveSession(user.id, "IDLE", {});
  return NextResponse.json({ ok: true });
}
