import type { MaxAttachmentRequest, MaxNewMessageBody } from "./api-types";
import type { MessengerAdapter, OutgoingMessage } from "./types";

export class MaxApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "MaxApiError";
  }
}

/** Реальный адаптер MAX Bot API (https://dev.max.ru/docs-api). */
export class MaxAdapter implements MessengerAdapter {
  readonly kind = "max" as const;

  constructor(
    private readonly token: string,
    private readonly baseUrl: string,
  ) {}

  async sendMessage(userId: string, message: OutgoingMessage): Promise<void> {
    await this.request("POST", `/messages?user_id=${encodeURIComponent(userId)}`, this.toBody(message));
  }

  async sendNotification(userId: string, message: OutgoingMessage): Promise<void> {
    await this.request("POST", `/messages?user_id=${encodeURIComponent(userId)}`, {
      ...this.toBody(message),
      notify: true,
    });
  }

  async answerCallback(callbackId: string): Promise<void> {
    await this.request("POST", `/answers?callback_id=${encodeURIComponent(callbackId)}`, {});
  }

  /** Регистрирует вебхук: POST /subscriptions. */
  async subscribe(url: string, secret?: string): Promise<unknown> {
    return this.request("POST", "/subscriptions", {
      url,
      update_types: ["message_created", "message_callback", "bot_started"],
      ...(secret ? { secret } : {}),
    });
  }

  /** Long polling: GET /updates. */
  async getUpdates(marker?: number, timeoutSec = 30): Promise<{ updates: unknown[]; marker?: number }> {
    const params = new URLSearchParams({ timeout: String(timeoutSec), limit: "100" });
    params.set("types", "message_created,message_callback,bot_started");
    if (marker !== undefined) params.set("marker", String(marker));
    // Сервер держит соединение до timeoutSec, плюс запас на сеть.
    const res = await this.request("GET", `/updates?${params}`, undefined, (timeoutSec + 60) * 1000);
    return res as { updates: unknown[]; marker?: number };
  }

  private toBody(message: OutgoingMessage): MaxNewMessageBody {
    const attachments: MaxAttachmentRequest[] = [];
    // MAX скачивает картинку по URL сам, поэтому URL должен быть публичным.
    if (message.imageUrl?.startsWith("https://")) {
      attachments.push({ type: "image", payload: { url: message.imageUrl } });
    }
    if (message.buttons?.length) {
      attachments.push({
        type: "inline_keyboard",
        payload: {
          buttons: message.buttons.map((row) =>
            row.map((b) => ({ type: "callback" as const, text: b.text, payload: b.payload })),
          ),
        },
      });
    }
    return { text: message.text, ...(attachments.length ? { attachments } : {}) };
  }

  private async request(method: "GET" | "POST", path: string, body?: unknown, timeoutMs = 10_000): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: this.token,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new MaxApiError(`MAX API ${method} ${path.split("?")[0]} → ${res.status}: ${text.slice(0, 300)}`, res.status);
    }
    return text ? JSON.parse(text) : null;
  }
}
