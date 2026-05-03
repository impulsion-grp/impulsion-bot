import "dotenv/config";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { env, assertRequiredEnv } from "./config/env.js";
import { logger } from "./core/logger";
import { commandMap } from "./commands/index";
import { handleWelcome, registerAutomations } from "./services/basic.services";
import { registerIntelligenceReportScheduler } from "./intelligence-report/intelligence-report.scheduler";

assertRequiredEnv();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates] });

client.once(Events.ClientReady, (readyClient) => {
  logger.success(`Connecté en tant que ${readyClient.user.tag}`);
  registerAutomations(readyClient);
  registerIntelligenceReportScheduler(readyClient);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commandMap.get(interaction.commandName);
  if (!command) { await interaction.reply({ephemeral:true, content:"Commande inconnue."}); return; }
  try { await command.execute(interaction); }
  catch (error) {
    logger.error(`Erreur commande /${interaction.commandName}`, error);
    const content = error instanceof Error ? `❌ ${error.message}` : "❌ Erreur inconnue.";
    if (interaction.deferred || interaction.replied) await interaction.editReply({ content });
    else await interaction.reply({ ephemeral:true, content });
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  try { await handleWelcome(member); } catch(e) { logger.warn("Erreur bienvenue", e); }
});

client.login(env.DISCORD_TOKEN);
