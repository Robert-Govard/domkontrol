import type { ChatMessage } from "@prisma/client";
import type { Button } from "@/lib/max";

export interface ChatMessageDto {
  id: number;
  direction: "in" | "out";
  text: string;
  buttons: Button[][] | null;
  imageUrl: string | null;
  createdAt: string;
}

export function toChatMessageDto(m: ChatMessage): ChatMessageDto {
  let buttons: Button[][] | null = null;
  if (m.buttons) {
    try {
      buttons = JSON.parse(m.buttons) as Button[][];
    } catch {
      buttons = null;
    }
  }
  return {
    id: m.id,
    direction: m.direction === "in" ? "in" : "out",
    text: m.text,
    buttons,
    imageUrl: m.imageUrl,
    createdAt: m.createdAt.toISOString(),
  };
}
