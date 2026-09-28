import type { Category, Priority } from "@/lib/domain";

export interface PriorityInput {
  category: Category;
  description: string;
}

export interface PriorityResult {
  priority: Priority;
  /** Почему выбран такой приоритет — показывается сотруднику УК. */
  reason: string;
}

/**
 * Стратегия определения приоритета. Сейчас — правила,
 * позже сюда подключается LLM-классификатор с тем же интерфейсом.
 */
export interface PriorityClassifier {
  readonly name: string;
  classify(input: PriorityInput): Promise<PriorityResult>;
}
