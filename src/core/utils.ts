import { createHash } from "node:crypto";
import { ChannelType, Guild, TextChannel } from "discord.js";

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 8)}`;
}
export function slugify(input: string): string {
  return input.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "sans-nom";
}
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
export function findTextChannelByName(guild: Guild, name: string): TextChannel | undefined {
  return guild.channels.cache.find((c) => c.type === ChannelType.GuildText && c.name === name) as TextChannel | undefined;
}
