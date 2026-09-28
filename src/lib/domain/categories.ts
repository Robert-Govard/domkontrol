export const CATEGORIES = [
  "WATER",
  "HEATING",
  "ELECTRICITY",
  "ELEVATOR",
  "GARBAGE",
  "CLEANING",
  "DOORS",
  "OTHER",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface CategoryMeta {
  emoji: string;
  /** Полное название — для кнопок выбора. */
  label: string;
  /** Короткое название — для карточек. */
  short: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  WATER: { emoji: "💧", label: "Водоснабжение", short: "Водоснабжение" },
  HEATING: { emoji: "🔥", label: "Отопление", short: "Отопление" },
  ELECTRICITY: { emoji: "💡", label: "Электричество / освещение", short: "Освещение" },
  ELEVATOR: { emoji: "🛗", label: "Лифт", short: "Лифт" },
  GARBAGE: { emoji: "🗑", label: "Мусор", short: "Мусор" },
  CLEANING: { emoji: "🧹", label: "Подъезд / уборка", short: "Уборка" },
  DOORS: { emoji: "🚪", label: "Двери / домофон", short: "Двери / домофон" },
  OTHER: { emoji: "🔧", label: "Другое", short: "Другое" },
};

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

export function categoryTitle(category: string): string {
  if (!isCategory(category)) return category;
  const meta = CATEGORY_META[category];
  return `${meta.emoji} ${meta.short}`;
}
