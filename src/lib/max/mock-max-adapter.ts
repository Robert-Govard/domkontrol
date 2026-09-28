import { insertChatMessage } from "@/lib/repositories/chat";
import type { MessengerAdapter, OutgoingMessage } from "./types";

/**
 * Локальный адаптер: вместо отправки в MAX сохраняет сообщения в БД,
 * откуда их показывает эмулятор чата на странице /demo.
 */
export class MockMaxAdapter implements MessengerAdapter {
  readonly kind = "mock" as const;

  async sendMessage(userId: string, message: OutgoingMessage): Promise<void> {
    await insertChatMessage({
      maxUserId: userId,
      direction: "out",
      text: message.text,
      buttons: message.buttons,
      imageUrl: message.imageUrl,
    });
  }

  async sendNotification(userId: string, message: OutgoingMessage): Promise<void> {
    await this.sendMessage(userId, message);
  }

  async answerCallback(): Promise<void> {
    // В эмуляторе нечего подтверждать.
  }
}
