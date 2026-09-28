import { z } from "zod";
import { CATEGORIES } from "@/lib/domain";
import { getSession, saveSession } from "@/lib/repositories/sessions";

export const BOT_STATES = [
  "IDLE",
  "AWAIT_CATEGORY",
  "AWAIT_BUILDING",
  "AWAIT_ENTRANCE",
  "AWAIT_DESCRIPTION",
  "AWAIT_PHOTO",
  "CONFIRM",
] as const;
export type BotState = (typeof BOT_STATES)[number];

const draftSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  buildingId: z.string().optional(),
  entrance: z.number().int().positive().optional(),
  description: z.string().optional(),
  photoUrl: z.string().nullable().optional(),
  /** Пользователь уже прикрепил фото или нажал «Пропустить». */
  photoDecided: z.boolean().optional(),
});
export type Draft = z.infer<typeof draftSchema>;

export interface Session {
  state: BotState;
  draft: Draft;
}

export async function loadSession(userId: string): Promise<Session> {
  const row = await getSession(userId);
  const state = (BOT_STATES as readonly string[]).includes(row.state) ? (row.state as BotState) : "IDLE";
  let draft: Draft = {};
  try {
    const parsed = draftSchema.safeParse(JSON.parse(row.draft));
    if (parsed.success) draft = parsed.data;
  } catch {
    // повреждённый черновик — начинаем с чистого
  }
  return { state, draft };
}

export async function storeSession(userId: string, session: Session): Promise<void> {
  await saveSession(userId, session.state, session.draft);
}
