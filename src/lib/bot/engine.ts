import type { IncomingEvent, MessengerAdapter } from "@/lib/max";
import { findUserTicketByNumber, listTickets } from "@/lib/repositories/tickets";
import { upsertUserByMaxId } from "@/lib/repositories/users";
import { createContext, type BotContext } from "./context";
import { BTN, mainMenuKeyboard } from "./keyboards";
import { P, splitPayload } from "./payloads";
import { handleReportCallback, handleReportPhoto, handleReportText, startReport } from "./report-flow";
import { loadSession, storeSession } from "./session";
import { TEXT, ticketCardText, ticketDetailsText } from "./texts";

const MAX_CARDS = 5;

/**
 * Единая точка входа логики бота. Вызывается и вебхуком MAX,
 * и эмулятором /demo — отличается только adapter.
 */
export async function handleIncomingEvent(event: IncomingEvent, adapter: MessengerAdapter): Promise<void> {
  const user = await upsertUserByMaxId(event.userId, event.userName);
  const session = await loadSession(user.id);
  const ctx = createContext(user, session, adapter);

  if (event.kind === "callback" && event.callbackId) {
    await adapter.answerCallback(event.callbackId).catch((e) => console.warn("[bot] answerCallback failed", e));
  }

  try {
    await dispatch(ctx, event);
  } catch (error) {
    console.error("[bot] failed to handle event", error);
    ctx.session.state = "IDLE";
    ctx.session.draft = {};
    await ctx.reply({ text: TEXT.error, buttons: mainMenuKeyboard() }).catch(() => undefined);
  } finally {
    await storeSession(user.id, ctx.session);
  }
}

async function dispatch(ctx: BotContext, event: IncomingEvent): Promise<void> {
  switch (event.kind) {
    case "start":
      resetFlow(ctx);
      return ctx.reply({ text: TEXT.welcome(firstName(ctx.user.name)), buttons: mainMenuKeyboard() });
    case "callback":
      return handleCallback(ctx, event.payload);
    case "photo":
      return handleReportPhoto(ctx, event.photoUrl, event.text);
    case "text":
      return handleText(ctx, event.text);
  }
}

async function handleCallback(ctx: BotContext, payload: string): Promise<void> {
  // Глобальные команды работают из любого состояния.
  switch (payload) {
    case P.menu:
      return showMenu(ctx);
    case P.report:
      return startReport(ctx);
    case P.myTickets:
      return showMyTickets(ctx);
    case P.help:
      return ctx.reply({ text: TEXT.help, buttons: [[BTN.report], [BTN.menu]] });
    case P.cancel:
      resetFlow(ctx);
      return ctx.reply({ text: TEXT.cancelled, buttons: mainMenuKeyboard() });
  }

  const [kind, value] = splitPayload(payload);
  if (kind === "ticket") return showTicket(ctx, Number(value));

  const handled = await handleReportCallback(ctx, payload);
  if (!handled) {
    resetFlow(ctx);
    await ctx.reply({ text: TEXT.staleButton, buttons: mainMenuKeyboard() });
  }
}

/** Текстовые аналоги кнопок главного меню — на случай, если житель пишет словами. */
const TEXT_COMMANDS: { match: RegExp; run: (ctx: BotContext) => Promise<void> }[] = [
  { match: /^(меню|\/menu)$/i, run: showMenu },
  { match: /^(мои заявки|\/tickets)/i, run: showMyTickets },
  { match: /^(помощь|\/help)/i, run: (ctx) => ctx.reply({ text: TEXT.help, buttons: [[BTN.report], [BTN.menu]] }) },
  { match: /^(сообщить о проблеме|\/report)/i, run: startReport },
  {
    match: /^(отмена|\/cancel)/i,
    run: (ctx) => {
      resetFlow(ctx);
      return ctx.reply({ text: TEXT.cancelled, buttons: mainMenuKeyboard() });
    },
  },
];

async function handleText(ctx: BotContext, raw: string): Promise<void> {
  const text = raw.replace(/^[^\p{L}/]+/u, "").trim(); // срезаем эмодзи в начале
  // На шаге описания любой текст — это описание, кроме явной отмены.
  const command = TEXT_COMMANDS.find((c) => c.match.test(text));
  if (command && (ctx.session.state !== "AWAIT_DESCRIPTION" || /^(отмена|\/cancel)/i.test(text))) {
    return command.run(ctx);
  }
  if (ctx.session.state === "IDLE") return showMenu(ctx);
  return handleReportText(ctx, raw);
}

function resetFlow(ctx: BotContext): void {
  ctx.session.state = "IDLE";
  ctx.session.draft = {};
}

async function showMenu(ctx: BotContext): Promise<void> {
  resetFlow(ctx);
  await ctx.reply({ text: TEXT.menu, buttons: mainMenuKeyboard() });
}

async function showMyTickets(ctx: BotContext): Promise<void> {
  resetFlow(ctx);
  const tickets = await listTickets({ userId: ctx.user.id });
  if (tickets.length === 0) {
    return ctx.reply({ text: TEXT.noTickets, buttons: [[BTN.report], [BTN.menu]] });
  }
  const shown = tickets.slice(0, MAX_CARDS);
  const header =
    tickets.length > MAX_CARDS
      ? `📋 Ваши заявки: ${tickets.length}. Показаны последние ${MAX_CARDS}.`
      : `📋 Ваши заявки: ${tickets.length}`;
  await ctx.reply({ text: header });
  for (const t of shown) {
    await ctx.reply({ text: ticketCardText(t), buttons: [[{ text: "📄 Подробнее", payload: P.ticket(t.ticketNumber) }]] });
  }
  await ctx.reply({ text: "Нажмите «📄 Подробнее» под заявкой, чтобы увидеть историю статусов.", buttons: [[BTN.report], [BTN.menu]] });
}

async function showTicket(ctx: BotContext, ticketNumber: number): Promise<void> {
  const ticket = Number.isInteger(ticketNumber) ? await findUserTicketByNumber(ctx.user.id, ticketNumber) : null;
  if (!ticket) return ctx.reply({ text: TEXT.ticketNotFound, buttons: mainMenuKeyboard() });
  await ctx.reply({
    text: ticketDetailsText(ticket),
    imageUrl: ticket.photoUrl,
    buttons: [[BTN.myTickets], [BTN.menu]],
  });
}

function firstName(name: string): string {
  return name.split(" ")[0] || name;
}
