import { config } from "@/lib/config";
import { MaxAdapter } from "./max-adapter";
import { MockMaxAdapter } from "./mock-max-adapter";
import type { MessengerAdapter } from "./types";

export type { Button, IncomingEvent, MessengerAdapter, OutgoingMessage } from "./types";
export { parseIncomingMessage } from "./parse";
export { MaxAdapter } from "./max-adapter";
export { MockMaxAdapter } from "./mock-max-adapter";

/** Демо-пользователи эмулятора имеют id вида "demo-…". */
export const DEMO_USER_PREFIX = "demo-";

/**
 * user_id в MAX — число. Всё остальное (демо-жители, seed-данные) —
 * локальные пользователи, которым пишем только в эмулятор.
 */
export function isDemoUser(maxUserId: string): boolean {
  return maxUserId.startsWith(DEMO_USER_PREFIX) || !/^\d+$/.test(maxUserId);
}

let realAdapter: MaxAdapter | undefined;
const mockAdapter = new MockMaxAdapter();

/** Реальный адаптер, если задан MAX_BOT_TOKEN, иначе мок. */
export function getMaxAdapter(): MessengerAdapter {
  if (!config.maxBotToken) return mockAdapter;
  realAdapter ??= new MaxAdapter(config.maxBotToken, config.maxApiUrl);
  return realAdapter;
}

/** Демо-пользователям всегда пишем в эмулятор, даже когда токен задан. */
export function getAdapterForUser(maxUserId: string): MessengerAdapter {
  return isDemoUser(maxUserId) ? mockAdapter : getMaxAdapter();
}
