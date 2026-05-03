import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../core/command";
import { env } from "../config/env";
import { IntelligenceReportService } from "../intelligence-report/intelligence-report.service";
export const veilleCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("veille").setDescription("Rapport quotidien IA & Développement Web.")
    .addSubcommand(s=>s.setName("statut").setDescription("Statut"))
    .addSubcommand(s=>s.setName("run").setDescription("Générer maintenant").addBooleanOption(o=>o.setName("force").setDescription("Inclure éléments déjà vus")))
    .addSubcommand(s=>s.setName("dernier").setDescription("Dernier rapport")),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand(); const service = new IntelligenceReportService();
    if (sub === "statut") { await interaction.reply({ephemeral:true, content:[`🧠 **Statut veille IA & Dev Web**`,"",`Activée : \`${env.INTELLIGENCE_REPORT_ENABLED}\``,`Heure : \`${String(env.INTELLIGENCE_REPORT_DAILY_HOUR).padStart(2,"0")}:${String(env.INTELLIGENCE_REPORT_DAILY_MINUTE).padStart(2,"0")}\``,`Salon : \`${env.INTELLIGENCE_REPORT_DISCORD_CHANNEL_ID || "non configuré"}\``,`IA : \`${env.AI_REPORT_ENABLED}\``,`Modèle : \`${env.OPENAI_MODEL}\``].join("\n")}); return; }
    if (sub === "dernier") { const r = await service.latest(); await interaction.reply({ephemeral:true, content:r ? r.discordSummary : "Aucun rapport généré."}); return; }
    await interaction.deferReply({ ephemeral: true });
    const result = await service.generate(interaction.client, { force: interaction.options.getBoolean("force") ?? false });
    await interaction.editReply(["✅ Rapport généré.","",`Markdown : \`${result.markdownPath}\``,`JSON : \`${result.jsonPath}\``,result.discordMessageId ? `Message Discord : \`${result.discordMessageId}\`` : "Message Discord : non envoyé"].join("\n"));
  }
};
