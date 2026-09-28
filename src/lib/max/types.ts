/** Кнопка инлайн-клавиатуры (в MAX — кнопка типа "callback"). */
export interface Button {
  text: string;
  payload: string;
}

/** Платформенно-независимое исходящее сообщение бота. */
export interface OutgoingMessage {
  text: string;
  /** Ряды кнопок. */
  buttons?: Button[][];
  /** Картинка к сообщению (например, фото заявки). */
  imageUrl?: string | null;
}

/** Нормализованное входящее событие — то, с чем работает логика бота. */
export type IncomingEvent =
  | { kind: "start"; userId: string; userName: string }
  | { kind: "text"; userId: string; userName: string; text: string }
  | { kind: "photo"; userId: string; userName: string; photoUrl: string; text?: string }
  | { kind: "callback"; userId: string; userName: string; payload: string; callbackId?: string };

/**
 * Транспорт до пользователя. Бизнес-логика знает только этот интерфейс,
 * поэтому реальный MAX API и локальный мок взаимозаменяемы.
 */
export interface MessengerAdapter {
  readonly kind: "max" | "mock";
  sendMessage(userId: string, message: OutgoingMessage): Promise<void>;
  /** Уведомление по инициативе системы (смена статуса заявки). */
  sendNotification(userId: string, message: OutgoingMessage): Promise<void>;
  /** Подтвердить нажатие callback-кнопки (убирает «часики» в клиенте). */
  answerCallback(callbackId: string): Promise<void>;
}
