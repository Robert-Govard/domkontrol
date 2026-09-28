import type { PriorityClassifier } from "./types";
import { RuleBasedPriorityClassifier } from "./rule-based";

export type { PriorityClassifier, PriorityInput, PriorityResult } from "./types";

let classifier: PriorityClassifier | undefined;

/**
 * Точка подключения классификатора. Чтобы добавить LLM, реализуйте
 * PriorityClassifier (например, LlmPriorityClassifier с fallback на правила)
 * и верните его здесь по переменной окружения.
 */
export function getPriorityClassifier(): PriorityClassifier {
  classifier ??= new RuleBasedPriorityClassifier();
  return classifier;
}
