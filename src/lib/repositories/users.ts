import { prisma } from "@/lib/db";

export function upsertUserByMaxId(maxUserId: string, name: string) {
  return prisma.user.upsert({
    where: { maxUserId },
    create: { maxUserId, name },
    update: { name },
  });
}
