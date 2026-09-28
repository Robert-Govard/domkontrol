import type { Building, Ticket, TicketStatusHistory } from "@prisma/client";
import { CATEGORY_META, isCategory, statusTitle, type Category } from "@/lib/domain";
import { formatAddress, formatDateTime } from "@/lib/format";

export const TEXT = {
  welcome: (name: string) =>
    `👋 Здравствуйте, ${name}!\n\n` +
    `Это «ДомКонтроль» — заявки в управляющую компанию без потерянных сообщений.\n\n` +
    `Сообщите о проблеме в пару касаний, а мы пришлём уведомление, когда статус заявки изменится.`,
  menu: "Главное меню. Что хотите сделать?",
  help:
    "ℹ️ Как это работает\n\n" +
    "1. Нажмите «🏠 Сообщить о проблеме».\n" +
    "2. Выберите категорию, дом и подъезд.\n" +
    "3. Коротко опишите проблему и при желании приложите фото.\n" +
    "4. Получите номер заявки — УК увидит её сразу.\n\n" +
    "Когда сотрудник УК меняет статус, бот пришлёт уведомление.\n\n" +
    "Статусы: 🆕 Новая → 🔵 Принята → 🟡 В работе → 🟢 Выполнена (или 🔴 Отклонена).\n\n" +
    "🚨 При пожаре или запахе газа сначала звоните 112!",
  askCategory: "Шаг 1 из 5. Выберите категорию проблемы:",
  askBuilding: "Шаг 2 из 5. Выберите адрес дома:",
  buildingTyped: "Пока сервис подключён только к домам из списка. Выберите адрес кнопкой ниже:",
  askEntrance: "Шаг 3 из 5. Выберите подъезд:",
  askDescription:
    "Шаг 4 из 5. Коротко опишите проблему одним сообщением.\n\n" +
    "Например: «На пятом этаже возле лифта не работает освещение».",
  askPhoto: "Шаг 5 из 5. Прикрепите фото проблемы — так УК быстрее разберётся.\n\nФото необязательно.",
  photoExpected: "Пришлите фотографию или нажмите «⏭ Пропустить».",
  editWhat: "Что хотите изменить?",
  cancelled: "❌ Заявка отменена. Ничего не отправлено.",
  noTickets: "У вас пока нет заявок.\n\nНажмите «🏠 Сообщить о проблеме», чтобы создать первую.",
  ticketNotFound: "Заявка не найдена.",
  useButtons: "Пожалуйста, воспользуйтесь кнопками ниже 👇",
  staleButton: "Эта кнопка уже неактуальна. Вернёмся в меню.",
  error: "😔 Что-то пошло не так. Попробуйте ещё раз чуть позже.",
  emergencyHint: "\n\n🚨 Заявка помечена как аварийная. Если есть угроза жизни — звоните 112.",
};

export function categoryLine(category: string): string {
  if (!isCategory(category)) return category;
  const meta = CATEGORY_META[category];
  return `${meta.emoji} ${meta.short}`;
}

export interface DraftView {
  category?: Category;
  building?: Building | null;
  entrance?: number;
  description?: string;
  photoUrl?: string | null;
}

export function summaryText(d: DraftView): string {
  return [
    "📝 Проверьте заявку перед отправкой:",
    "",
    `Категория: ${d.category ? categoryLine(d.category) : "—"}`,
    `Адрес: ${d.building ? formatAddress(d.building) : "—"}`,
    `Подъезд: ${d.entrance ?? "—"}`,
    `Описание: ${d.description ?? "—"}`,
    `Фото: ${d.photoUrl ? "📎 прикреплено" : "нет"}`,
  ].join("\n");
}

type TicketView = Ticket & { building: Building };

export function ticketCreatedText(t: TicketView): string {
  return [
    `✅ Заявка №${t.ticketNumber} создана.`,
    "",
    `Категория: ${categoryLine(t.category)}`,
    `Адрес: ${formatAddress(t.building)}`,
    `Подъезд: ${t.entrance}`,
    "",
    "Статус:",
    statusTitle(t.status),
    "",
    "Мы уведомим вас при изменении статуса.",
  ].join("\n");
}

/** Карточка заявки в списке «Мои заявки». */
export function ticketCardText(t: TicketView): string {
  return [
    `№${t.ticketNumber}`,
    categoryLine(t.category),
    formatAddress(t.building),
    `Подъезд ${t.entrance}`,
    "",
    statusTitle(t.status),
    "",
    "Создана:",
    formatDateTime(t.createdAt),
  ].join("\n");
}

export function ticketDetailsText(t: TicketView & { history: TicketStatusHistory[] }): string {
  const history = t.history.map((h) => `• ${formatDateTime(h.createdAt)} — ${statusTitle(h.newStatus)}`);
  return [
    `📄 Заявка №${t.ticketNumber}`,
    "",
    `Категория: ${categoryLine(t.category)}`,
    `Адрес: ${formatAddress(t.building)}`,
    `Подъезд: ${t.entrance}`,
    `Описание: ${t.description}`,
    `Фото: ${t.photoUrl ? "📎 есть" : "нет"}`,
    "",
    `Статус: ${statusTitle(t.status)}`,
    `Создана: ${formatDateTime(t.createdAt)}`,
    "",
    "История:",
    ...history,
  ].join("\n");
}

export function statusChangedText(ticketNumber: number, oldStatus: string, newStatus: string): string {
  const tail =
    newStatus === "DONE"
      ? "\n\nСпасибо, что сообщили о проблеме! 🙌"
      : newStatus === "REJECTED"
        ? "\n\nЕсли проблема сохраняется — создайте новую заявку или свяжитесь с УК."
        : "";
  return `🔔 Статус заявки №${ticketNumber} изменился.\n\nБыло:\n${statusTitle(oldStatus)}\n\nСтало:\n${statusTitle(newStatus)}${tail}`;
}
