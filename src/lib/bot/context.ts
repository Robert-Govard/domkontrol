import type { User } from "@prisma/client";
import type { MessengerAdapter, OutgoingMessage } from "@/lib/max";
import type { Session } from "./session";

export interface BotContext {
  user: User;
  session: Session;
  reply(message: OutgoingMessage): Promise<void>;
}

export function createContext(user: User, session: Session, adapter: MessengerAdapter): BotContext {
  return {
    user,
    session,
    reply: (message) => adapter.sendMessage(user.maxUserId, message),
  };
}
