const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: process.env.NEXT_PUBLIC_TZ ?? "Europe/Moscow",
});

/** 28.09.2026 18:35 */
export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date)).replace(",", "");
}

export function formatAddress(b: { street: string; house: string }): string {
  return `${b.street}, ${b.house}`;
}

export function formatFullAddress(b: { city: string; street: string; house: string }): string {
  return `г. ${b.city}, ${b.street}, д. ${b.house}`;
}
