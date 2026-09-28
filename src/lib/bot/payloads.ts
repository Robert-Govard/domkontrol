/** Payload'ы callback-кнопок. Единое место, чтобы не опечататься. */
export const P = {
  menu: "menu",
  report: "report",
  myTickets: "tickets",
  help: "help",
  category: (c: string) => `cat:${c}`,
  building: (id: string) => `bld:${id}`,
  entrance: (n: number) => `ent:${n}`,
  skipPhoto: "photo:skip",
  send: "confirm:send",
  edit: "confirm:edit",
  cancel: "confirm:cancel",
  editField: (f: EditField) => `edit:${f}`,
  backToSummary: "edit:back",
  ticket: (n: number) => `ticket:${n}`,
} as const;

export const EDIT_FIELDS = ["category", "address", "entrance", "description", "photo"] as const;
export type EditField = (typeof EDIT_FIELDS)[number];

/** Разбирает "prefix:value" → ["prefix", "value"]. */
export function splitPayload(payload: string): [string, string] {
  const i = payload.indexOf(":");
  return i === -1 ? [payload, ""] : [payload.slice(0, i), payload.slice(i + 1)];
}
