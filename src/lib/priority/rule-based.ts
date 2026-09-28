import { PRIORITY_META, type Category, type Priority } from "@/lib/domain";
import type { PriorityClassifier, PriorityInput, PriorityResult } from "./types";

interface KeywordRule {
  priority: Priority;
  /** Корни слов в нижнем регистре — ищутся как подстроки. */
  keywords: string[];
  reason: string;
}

const KEYWORD_RULES: KeywordRule[] = [
  {
    priority: "EMERGENCY",
    keywords: ["пожар", "горит", "дым", "задымл", "газа", "газом", "искрит", "замкнул", "затоп", "прорвал", "прорыв", "застрял", "обрушен", "оголен", "оголён"],
    reason: "угроза жизни или крупная авария",
  },
  {
    priority: "HIGH",
    keywords: ["протеч", "течет", "течёт", "капает", "залива", "нет воды", "нет горяч", "нет холодн", "нет отоплен", "холодные батаре", "батареи холодн", "нет света", "нет электр", "лифт не работает", "лифт стоит", "домофон не работает", "не закрывается"],
    reason: "нарушено базовое обслуживание дома",
  },
  {
    priority: "LOW",
    keywords: ["лампа", "лампочк", "грязно", "мусор на", "паутин", "покрас", "табличк", "объявлен", "скрипит"],
    reason: "не влияет на безопасность и жизнеобеспечение",
  },
];

const CATEGORY_DEFAULT: Record<Category, Priority> = {
  WATER: "HIGH",
  HEATING: "HIGH",
  ELECTRICITY: "MEDIUM",
  ELEVATOR: "MEDIUM",
  GARBAGE: "LOW",
  CLEANING: "LOW",
  DOORS: "MEDIUM",
  OTHER: "MEDIUM",
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
}

/** Простые правила: ключевые слова в описании важнее категории. */
export class RuleBasedPriorityClassifier implements PriorityClassifier {
  readonly name = "rules";

  async classify({ category, description }: PriorityInput): Promise<PriorityResult> {
    const text = normalize(description);

    // Правила упорядочены по убыванию важности — берём первое совпадение.
    for (const rule of KEYWORD_RULES) {
      const hit = rule.keywords.find((k) => text.includes(normalize(k)));
      if (hit) {
        return { priority: rule.priority, reason: `«${hit}» — ${rule.reason}` };
      }
    }

    const priority = CATEGORY_DEFAULT[category];
    return {
      priority,
      reason: `по категории (${PRIORITY_META[priority].label.toLowerCase()} по умолчанию)`,
    };
  }
}
