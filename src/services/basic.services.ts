import cron from "node-cron";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";
import { ChatInputCommandInteraction, Client, GuildMember } from "discord.js";
import play from "play-dl";
import { env } from "../config/env";
import { logger } from "../core/logger";
import { findTextChannelByName } from "../core/utils";
import { loadStore } from "../data/store";

export async function handleWelcome(member: GuildMember): Promise<void> {
  const channel = findTextChannelByName(member.guild, env.WELCOME_CHANNEL_NAME);
  if (!channel) return;
  await channel.send(`👋 Bienvenue ${member} sur **Impulsion**. Lis les salons de fondation et demande les rôles projet nécessaires.`);
}

export function getDocContent(type: "fonctionnement" | "commandes" | "veille"): string {
  if (type === "veille") return "# Veille IA & Développement Web\n\nLe bot génère chaque jour un rapport sur les dernières 24h. Commandes : `/veille statut`, `/veille run`, `/veille dernier`.";
  if (type === "commandes") return "# Commandes\n\n`/idee`, `/projet`, `/tache`, `/veille`, `/music`, `/docs`, `/ping`.";
  return "# Fonctionnement Impulsion\n\nUne idée peut être créée, qualifiée, validée puis transformée automatiquement en projet Discord avec rôle, catégorie et salons.";
}

const players = new Map<string, ReturnType<typeof createAudioPlayer>>();
export async function playMusic(interaction: ChatInputCommandInteraction, url: string): Promise<string> {
  if (!env.MUSIC_ENABLED) return "Le module musique est désactivé.";
  const member = interaction.member as GuildMember | null;
  const voiceChannel = member?.voice.channel;
  if (!voiceChannel) return "Tu dois être dans un salon vocal.";
  const valid = await play.validate(url);
  if (!valid) return "Lien non reconnu. Pour V10, utilise une URL directe.";
  const stream = await play.stream(url);
  const resource = createAudioResource(stream.stream, { inputType: stream.type });
  const connection = joinVoiceChannel({ channelId: voiceChannel.id, guildId: voiceChannel.guild.id, adapterCreator: voiceChannel.guild.voiceAdapterCreator });
  const player = players.get(voiceChannel.guild.id) ?? createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
  players.set(voiceChannel.guild.id, player);
  connection.subscribe(player);
  player.play(resource);
  player.once(AudioPlayerStatus.Idle, () => { try { connection.destroy(); } catch {} });
  return "Lecture lancée.";
}
export async function stopMusic(guildId: string): Promise<string> {
  players.get(guildId)?.stop();
  players.delete(guildId);
  getVoiceConnection(guildId)?.destroy();
  return "Musique arrêtée.";
}

export function registerAutomations(client: Client): void {
  if (env.AUTO_DIGEST_ENABLED) cron.schedule(env.AUTO_DIGEST_CRON, () => sendDigest(client), { timezone: env.TZ });
  if (env.AUTO_IDEA_REMINDER_ENABLED) cron.schedule(env.AUTO_IDEA_REMINDER_CRON, () => sendIdeaReminder(client), { timezone: env.TZ });
  if (env.AUTO_INACTIVE_PROJECTS_ENABLED) cron.schedule(env.AUTO_INACTIVE_PROJECTS_CRON, () => sendInactiveProjects(client), { timezone: env.TZ });
  logger.success("Automatisations enregistrées.");
}
async function sendDigest(client: Client) {
  const guild = client.guilds.cache.get(env.GUILD_ID); if (!guild) return;
  const channel = findTextChannelByName(guild, env.RESOURCES_CHANNEL_NAME) ?? findTextChannelByName(guild, env.PROJECT_LIST_CHANNEL_NAME); if (!channel) return;
  const s = await loadStore();
  await channel.send(`📌 **Digest Impulsion**\n\nIdées : ${s.ideas.length}\nProjets actifs : ${s.projects.filter(p=>p.status==="active").length}\nTâches ouvertes : ${s.tasks.filter(t=>t.status!=="done").length}`);
}
async function sendIdeaReminder(client: Client) {
  const guild = client.guilds.cache.get(env.GUILD_ID); if (!guild) return;
  const channel = findTextChannelByName(guild, env.RESOURCES_CHANNEL_NAME); if (!channel) return;
  const s = await loadStore();
  const old = s.ideas.filter(i => i.status === "new").slice(0, env.MAX_DIGEST_ITEMS);
  if (old.length) await channel.send(`💡 **Idées à traiter**\n${old.map(i => `- \`${i.id}\` ${i.title}`).join("\n")}`);
}
async function sendInactiveProjects(client: Client) {
  const guild = client.guilds.cache.get(env.GUILD_ID); if (!guild) return;
  const channel = findTextChannelByName(guild, env.PROJECT_LIST_CHANNEL_NAME) ?? findTextChannelByName(guild, env.RESOURCES_CHANNEL_NAME); if (!channel) return;
  const s = await loadStore();
  const limit = Date.now() - env.INACTIVE_PROJECT_DAYS * 86400000;
  const inactive = s.projects.filter(p => p.status === "active" && new Date(p.lastActivityAt).getTime() < limit).slice(0, env.MAX_DIGEST_ITEMS);
  if (inactive.length) await channel.send(`🕒 **Projets inactifs**\n${inactive.map(p => `- \`${p.id}\` ${p.name}`).join("\n")}`);
}
