import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../core/command";
export const pingCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Vérifie que le bot répond."),
  async execute(interaction) { await interaction.reply({ content: "🏓 Pong.", ephemeral: true }); }
};
