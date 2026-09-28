import type { MaxUpdate, MaxUser } from "./api-types";
import type { IncomingEvent } from "./types";

function displayName(user: MaxUser): string {
  const full = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return full || user.name || user.username || `Пользователь ${user.user_id}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Превращает Update из MAX Bot API в IncomingEvent.
 * Неподдерживаемые события (добавление в чат и т. п.) → null.
 */
export function parseIncomingMessage(raw: unknown): IncomingEvent | null {
  if (!isObject(raw) || typeof raw.update_type !== "string") return null;
  const update = raw as MaxUpdate;

  if (update.update_type === "bot_started" && "user" in update) {
    return { kind: "start", userId: String(update.user.user_id), userName: displayName(update.user) };
  }

  if (update.update_type === "message_callback" && "callback" in update) {
    const { callback } = update;
    return {
      kind: "callback",
      userId: String(callback.user.user_id),
      userName: displayName(callback.user),
      payload: callback.payload ?? "",
      callbackId: callback.callback_id,
    };
  }

  if (update.update_type === "message_created" && "message" in update) {
    const { message } = update;
    // Сообщения в групповых чатах и каналах игнорируем — бот работает в личке.
    if (!message.sender || (message.recipient.chat_type && message.recipient.chat_type !== "dialog")) {
      return null;
    }
    const base = { userId: String(message.sender.user_id), userName: displayName(message.sender) };
    const text = message.body?.text?.trim() ?? "";
    const image = message.body?.attachments?.find((a) => a.type === "image" && a.payload?.url);

    if (image?.payload?.url) {
      return { kind: "photo", ...base, photoUrl: image.payload.url, text: text || undefined };
    }
    if (text === "/start") return { kind: "start", ...base };
    if (text) return { kind: "text", ...base, text };
  }

  return null;
}
