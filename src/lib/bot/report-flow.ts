import { DESCRIPTION_MAX, DESCRIPTION_MIN, isCategory } from "@/lib/domain";
import { findBuilding, listBuildings } from "@/lib/repositories/buildings";
import { createTicket } from "@/lib/services/ticket-service";
import type { BotContext } from "./context";
import {
  buildingKeyboard,
  categoryKeyboard,
  confirmKeyboard,
  editKeyboard,
  entranceKeyboard,
  mainMenuKeyboard,
  photoKeyboard,
} from "./keyboards";
import { EDIT_FIELDS, P, splitPayload, type EditField } from "./payloads";
import { summaryText, TEXT, ticketCreatedText } from "./texts";

/**
 * Пошаговое создание заявки. Каждый шаг заполняет поле черновика,
 * а advance() спрашивает первое незаполненное — поэтому «Изменить»
 * просто очищает поле и снова вызывает advance().
 */
export async function startReport(ctx: BotContext): Promise<void> {
  ctx.session.draft = {};
  await advance(ctx);
}

export async function advance(ctx: BotContext): Promise<void> {
  const d = ctx.session.draft;

  if (!d.category) {
    ctx.session.state = "AWAIT_CATEGORY";
    return ctx.reply({ text: TEXT.askCategory, buttons: categoryKeyboard() });
  }
  const building = d.buildingId ? await findBuilding(d.buildingId) : null;
  if (!building) {
    ctx.session.state = "AWAIT_BUILDING";
    return ctx.reply({ text: TEXT.askBuilding, buttons: buildingKeyboard(await listBuildings()) });
  }
  if (!d.entrance || d.entrance > building.entrances) {
    ctx.session.state = "AWAIT_ENTRANCE";
    return ctx.reply({ text: TEXT.askEntrance, buttons: entranceKeyboard(building.entrances) });
  }
  if (!d.description) {
    ctx.session.state = "AWAIT_DESCRIPTION";
    return ctx.reply({ text: TEXT.askDescription, buttons: [[{ text: "❌ Отмена", payload: P.cancel }]] });
  }
  if (!d.photoDecided) {
    ctx.session.state = "AWAIT_PHOTO";
    return ctx.reply({ text: TEXT.askPhoto, buttons: photoKeyboard() });
  }

  ctx.session.state = "CONFIRM";
  await ctx.reply({
    text: summaryText({ ...d, building }),
    imageUrl: d.photoUrl,
    buttons: confirmKeyboard(),
  });
}

/** Нажатие кнопки внутри сценария. Возвращает false, если кнопка не к месту. */
export async function handleReportCallback(ctx: BotContext, payload: string): Promise<boolean> {
  const [kind, value] = splitPayload(payload);
  const { state, draft } = ctx.session;

  switch (kind) {
    case "cat":
      if (state !== "AWAIT_CATEGORY" || !isCategory(value)) return false;
      draft.category = value;
      break;
    case "bld": {
      if (state !== "AWAIT_BUILDING") return false;
      const building = await findBuilding(value);
      if (!building) return false;
      draft.buildingId = building.id;
      break;
    }
    case "ent": {
      const n = Number(value);
      if (state !== "AWAIT_ENTRANCE" || !Number.isInteger(n) || n < 1) return false;
      draft.entrance = n;
      break;
    }
    case "photo":
      if (state !== "AWAIT_PHOTO") return false;
      draft.photoUrl = null;
      draft.photoDecided = true;
      break;
    case "confirm":
      if (state !== "CONFIRM") return false;
      if (value === "send") return submit(ctx);
      if (value === "edit") {
        await ctx.reply({ text: TEXT.editWhat, buttons: editKeyboard() });
        return true;
      }
      return false;
    case "edit":
      if (state !== "CONFIRM") return false;
      if (value !== "back") clearField(ctx, value);
      break;
    default:
      return false;
  }

  await advance(ctx);
  return true;
}

function clearField(ctx: BotContext, field: string): void {
  if (!(EDIT_FIELDS as readonly string[]).includes(field)) return;
  const d = ctx.session.draft;
  switch (field as EditField) {
    case "category":
      delete d.category;
      break;
    case "address":
      // У другого дома может быть другое число подъездов.
      delete d.buildingId;
      delete d.entrance;
      break;
    case "entrance":
      delete d.entrance;
      break;
    case "description":
      delete d.description;
      break;
    case "photo":
      d.photoUrl = null;
      d.photoDecided = false;
      break;
  }
}

/** Текст пользователя внутри сценария. */
export async function handleReportText(ctx: BotContext, text: string): Promise<void> {
  const { state, draft } = ctx.session;

  if (state === "AWAIT_DESCRIPTION") {
    const description = text.trim().replace(/\s+/g, " ");
    if (description.length < DESCRIPTION_MIN) {
      return ctx.reply({ text: `Опишите проблему чуть подробнее (минимум ${DESCRIPTION_MIN} символов).` });
    }
    if (description.length > DESCRIPTION_MAX) {
      return ctx.reply({ text: `Слишком длинное описание — уложитесь в ${DESCRIPTION_MAX} символов.` });
    }
    draft.description = description;
    return advance(ctx);
  }
  if (state === "AWAIT_BUILDING") {
    return ctx.reply({ text: TEXT.buildingTyped, buttons: buildingKeyboard(await listBuildings()) });
  }
  if (state === "AWAIT_PHOTO") {
    return ctx.reply({ text: TEXT.photoExpected, buttons: photoKeyboard() });
  }
  // На шагах с кнопками повторяем текущий вопрос.
  await ctx.reply({ text: TEXT.useButtons });
  await advance(ctx);
}

/** Фото от пользователя. Подпись к фото на шаге описания засчитываем как описание. */
export async function handleReportPhoto(ctx: BotContext, photoUrl: string, caption?: string): Promise<void> {
  const { state, draft } = ctx.session;
  if (state === "AWAIT_DESCRIPTION" && caption && caption.trim().length >= DESCRIPTION_MIN) {
    draft.description = caption.trim().slice(0, DESCRIPTION_MAX);
  } else if (state !== "AWAIT_PHOTO" && state !== "CONFIRM") {
    await ctx.reply({ text: "Фото можно будет прикрепить на последнем шаге 👌" });
    return advance(ctx);
  }
  draft.photoUrl = photoUrl;
  draft.photoDecided = true;
  await advance(ctx);
}

async function submit(ctx: BotContext): Promise<boolean> {
  const d = ctx.session.draft;
  if (!d.category || !d.buildingId || !d.entrance || !d.description) {
    await advance(ctx);
    return true;
  }
  const ticket = await createTicket({
    userId: ctx.user.id,
    buildingId: d.buildingId,
    entrance: d.entrance,
    category: d.category,
    description: d.description,
    photoUrl: d.photoUrl ?? null,
  });
  ctx.session.state = "IDLE";
  ctx.session.draft = {};
  await ctx.reply({
    text: ticketCreatedText(ticket) + (ticket.priority === "EMERGENCY" ? TEXT.emergencyHint : ""),
    buttons: mainMenuKeyboard(),
  });
  return true;
}
