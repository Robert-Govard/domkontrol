/**
 * Подмножество типов MAX Bot API, которое использует проект.
 * Источник: официальная документация https://dev.max.ru/docs-api
 * и официальный SDK github.com/max-messenger/max-bot-api-client-ts.
 */

export interface MaxUser {
  user_id: number;
  first_name: string;
  last_name?: string | null;
  /** @deprecated в API, но всё ещё присылается. */
  name?: string;
  username?: string | null;
}

export interface MaxAttachment {
  type: string;
  payload?: { url?: string; token?: string; photo_id?: number } | null;
}

export interface MaxMessage {
  sender?: MaxUser;
  recipient: { chat_id?: number | null; chat_type?: string; user_id?: number | null };
  timestamp: number;
  body?: { mid: string; seq?: number; text?: string | null; attachments?: MaxAttachment[] | null } | null;
}

export type MaxUpdate =
  | { update_type: "message_created"; timestamp: number; message: MaxMessage }
  | {
      update_type: "message_callback";
      timestamp: number;
      callback: { timestamp: number; callback_id: string; payload?: string; user: MaxUser };
      message?: MaxMessage | null;
    }
  | { update_type: "bot_started"; timestamp: number; chat_id: number; user: MaxUser; payload?: string | null }
  | { update_type: string; timestamp: number };

export interface MaxCallbackButton {
  type: "callback";
  text: string;
  payload: string;
}

export type MaxAttachmentRequest =
  | { type: "inline_keyboard"; payload: { buttons: MaxCallbackButton[][] } }
  | { type: "image"; payload: { url: string } };

/** Тело POST /messages */
export interface MaxNewMessageBody {
  text: string;
  attachments?: MaxAttachmentRequest[];
  notify?: boolean;
}
