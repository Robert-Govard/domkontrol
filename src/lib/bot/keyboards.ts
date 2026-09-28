import type { Building } from "@prisma/client";
import { CATEGORIES, CATEGORY_META } from "@/lib/domain";
import { formatAddress } from "@/lib/format";
import type { Button } from "@/lib/max";
import { P, type EditField } from "./payloads";

export const BTN = {
  report: { text: "🏠 Сообщить о проблеме", payload: P.report },
  myTickets: { text: "📋 Мои заявки", payload: P.myTickets },
  help: { text: "ℹ️ Помощь", payload: P.help },
  menu: { text: "⬅️ В меню", payload: P.menu },
  cancel: { text: "❌ Отмена", payload: P.cancel },
} satisfies Record<string, Button>;

export const mainMenuKeyboard = (): Button[][] => [[BTN.report], [BTN.myTickets], [BTN.help]];

export function categoryKeyboard(): Button[][] {
  const buttons = CATEGORIES.map((c) => ({
    text: `${CATEGORY_META[c].emoji} ${CATEGORY_META[c].label}`,
    payload: P.category(c),
  }));
  const rows: Button[][] = [];
  for (let i = 0; i < buttons.length; i += 2) rows.push(buttons.slice(i, i + 2));
  rows.push([BTN.cancel]);
  return rows;
}

export function buildingKeyboard(buildings: Building[]): Button[][] {
  return [
    ...buildings.map((b) => [{ text: `📍 ${formatAddress(b)}`, payload: P.building(b.id) }]),
    [BTN.cancel],
  ];
}

export function entranceKeyboard(count: number): Button[][] {
  const row = Array.from({ length: count }, (_, i) => ({ text: String(i + 1), payload: P.entrance(i + 1) }));
  return [row, [BTN.cancel]];
}

export const photoKeyboard = (): Button[][] => [[{ text: "⏭ Пропустить", payload: P.skipPhoto }], [BTN.cancel]];

export const confirmKeyboard = (): Button[][] => [
  [{ text: "✅ Отправить заявку", payload: P.send }],
  [{ text: "✏️ Изменить", payload: P.edit }, BTN.cancel],
];

const EDIT_LABELS: Record<EditField, string> = {
  category: "Категорию",
  address: "Адрес",
  entrance: "Подъезд",
  description: "Описание",
  photo: "Фото",
};

export function editKeyboard(): Button[][] {
  const fields = Object.keys(EDIT_LABELS) as EditField[];
  return [
    fields.slice(0, 3).map((f) => ({ text: EDIT_LABELS[f], payload: P.editField(f) })),
    fields.slice(3).map((f) => ({ text: EDIT_LABELS[f], payload: P.editField(f) })),
    [{ text: "⬅️ Назад к заявке", payload: P.backToSummary }],
  ];
}
