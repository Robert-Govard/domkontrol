import { prisma } from "@/lib/db";

export async function getSession(userId: string) {
  return prisma.botSession.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export function saveSession(userId: string, state: string, draft: object) {
  const data = { state, draft: JSON.stringify(draft) };
  return prisma.botSession.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}
