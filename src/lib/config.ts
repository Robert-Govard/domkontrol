function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

const maxBotToken = env("MAX_BOT_TOKEN");

export const config = {
  maxBotToken,
  maxApiUrl: env("MAX_API_URL") ?? "https://platform-api2.max.ru",
  maxWebhookSecret: env("MAX_WEBHOOK_SECRET"),
  /** Демо включено явно или автоматически, если нет токена MAX. */
  demoMode: env("DEMO_MODE") === "true" || !maxBotToken,
  adminPassword: env("ADMIN_PASSWORD"),
} as const;
