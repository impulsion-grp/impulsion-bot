import "dotenv/config";

function boolEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return ["true", "1", "yes", "on"].includes(value.toLowerCase());
}
function intEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function strEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  DISCORD_TOKEN: strEnv("DISCORD_TOKEN"),
  CLIENT_ID: strEnv("CLIENT_ID"),
  GUILD_ID: strEnv("GUILD_ID"),
  TZ: strEnv("TZ", "Europe/Paris"),

  WELCOME_CHANNEL_NAME: strEnv("WELCOME_CHANNEL_NAME", "welcome"),
  PROJECT_ROLES_CHANNEL_NAME: strEnv("PROJECT_ROLES_CHANNEL_NAME", "rôles-des-projets"),
  PROJECT_LIST_CHANNEL_NAME: strEnv("PROJECT_LIST_CHANNEL_NAME", "listes-des-projets"),
  RESOURCES_CHANNEL_NAME: strEnv("RESOURCES_CHANNEL_NAME", "ressources"),
  PROJECT_PRIVATE_BY_DEFAULT: boolEnv("PROJECT_PRIVATE_BY_DEFAULT", true),

  AUTO_DIGEST_ENABLED: boolEnv("AUTO_DIGEST_ENABLED", true),
  AUTO_DIGEST_CRON: strEnv("AUTO_DIGEST_CRON", "0 16 * * *"),
  AUTO_IDEA_REMINDER_ENABLED: boolEnv("AUTO_IDEA_REMINDER_ENABLED", true),
  AUTO_IDEA_REMINDER_CRON: strEnv("AUTO_IDEA_REMINDER_CRON", "0 18 * * *"),
  AUTO_INACTIVE_PROJECTS_ENABLED: boolEnv("AUTO_INACTIVE_PROJECTS_ENABLED", true),
  AUTO_INACTIVE_PROJECTS_CRON: strEnv("AUTO_INACTIVE_PROJECTS_CRON", "0 10 * * 1"),
  INACTIVE_PROJECT_DAYS: intEnv("INACTIVE_PROJECT_DAYS", 7),
  IDEA_REMINDER_DAYS: intEnv("IDEA_REMINDER_DAYS", 7),
  MAX_DIGEST_ITEMS: intEnv("MAX_DIGEST_ITEMS", 4),

  MUSIC_ENABLED: boolEnv("MUSIC_ENABLED", true),

  INTELLIGENCE_REPORT_ENABLED: boolEnv("INTELLIGENCE_REPORT_ENABLED", true),
  INTELLIGENCE_REPORT_TIMEZONE: strEnv("INTELLIGENCE_REPORT_TIMEZONE", "Europe/Paris"),
  INTELLIGENCE_REPORT_DAILY_HOUR: intEnv("INTELLIGENCE_REPORT_DAILY_HOUR", 8),
  INTELLIGENCE_REPORT_DAILY_MINUTE: intEnv("INTELLIGENCE_REPORT_DAILY_MINUTE", 0),
  INTELLIGENCE_REPORT_OUTPUT_DIR: strEnv("INTELLIGENCE_REPORT_OUTPUT_DIR", "./data/reports"),
  INTELLIGENCE_REPORT_MAX_SOURCE_ITEMS: intEnv("INTELLIGENCE_REPORT_MAX_SOURCE_ITEMS", 80),
  INTELLIGENCE_REPORT_MAX_USED_ITEMS: intEnv("INTELLIGENCE_REPORT_MAX_USED_ITEMS", 12),
  INTELLIGENCE_REPORT_MAX_INPUT_CHARS: intEnv("INTELLIGENCE_REPORT_MAX_INPUT_CHARS", 45000),
  INTELLIGENCE_REPORT_DISCORD_ENABLED: boolEnv("INTELLIGENCE_REPORT_DISCORD_ENABLED", true),
  INTELLIGENCE_REPORT_DISCORD_CHANNEL_ID: strEnv("INTELLIGENCE_REPORT_DISCORD_CHANNEL_ID"),

  AI_REPORT_ENABLED: boolEnv("AI_REPORT_ENABLED", true),
  AI_PROVIDER: strEnv("AI_PROVIDER", "openai"),
  OPENAI_API_KEY: strEnv("OPENAI_API_KEY"),
  OPENAI_MODEL: strEnv("OPENAI_MODEL", "gpt-5-mini")
};

export function assertRequiredEnv(): void {
  const missing: string[] = [];
  if (!env.DISCORD_TOKEN) missing.push("DISCORD_TOKEN");
  if (!env.CLIENT_ID) missing.push("CLIENT_ID");
  if (!env.GUILD_ID) missing.push("GUILD_ID");
  if (missing.length) throw new Error(`Variables .env manquantes: ${missing.join(", ")}`);
}
