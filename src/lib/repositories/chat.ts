import { prisma } from "@/lib/db";

export interface ChatRecord {
  maxUserId: string;
  direction: "in" | "out";
  text: string;
  buttons?: unknown;
  imageUrl?: string | null;
}

export function insertChatMessage(record: ChatRecord) {
  return prisma.chatMessage.create({
    data: {
      maxUserId: record.maxUserId,
      direction: record.direction,
      text: record.text,
      buttons: record.buttons ? JSON.stringify(record.buttons) : null,
      imageUrl: record.imageUrl ?? null,
    },
  });
}

export function listChatMessages(maxUserId: string, afterId = 0) {
  return prisma.chatMessage.findMany({
    where: { maxUserId, id: { gt: afterId } },
    orderBy: { id: "asc" },
    take: 200,
  });
}

export function clearChat(maxUserId: string) {
  return prisma.chatMessage.deleteMany({ where: { maxUserId } });
}
