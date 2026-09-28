import { prisma } from "@/lib/db";

export function listBuildings() {
  return prisma.building.findMany({ orderBy: [{ street: "asc" }, { house: "asc" }] });
}

export function findBuilding(id: string) {
  return prisma.building.findUnique({ where: { id } });
}
