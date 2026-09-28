export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_META: Record<Priority, { label: string; emoji: string; rank: number }> = {
  LOW: { label: "Низкий", emoji: "▫️", rank: 0 },
  MEDIUM: { label: "Средний", emoji: "🔷", rank: 1 },
  HIGH: { label: "Высокий", emoji: "🔶", rank: 2 },
  EMERGENCY: { label: "Авария", emoji: "🚨", rank: 3 },
};

export function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && (PRIORITIES as readonly string[]).includes(value);
}
