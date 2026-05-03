import { ChannelType, SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../core/command";
import { getDocContent, playMusic, stopMusic } from "../services/basic.services";

export const musicCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("music").setDescription("Musique simple.")
    .addSubcommand(s=>s.setName("play").setDescription("Jouer URL").addStringOption(o=>o.setName("url").setDescription("URL").setRequired(true)))
    .addSubcommand(s=>s.setName("stop").setDescription("Stop")),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "play") { await interaction.deferReply(); await interaction.editReply(await playMusic(interaction, interaction.options.getString("url", true))); return; }
    if (!interaction.guild) { await interaction.reply({ephemeral:true, content:"Serveur invalide."}); return; }
    await interaction.reply(await stopMusic(interaction.guild.id));
  }
};

export const docsCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("docs").setDescription("Documentation.")
    .addSubcommand(s=>s.setName("afficher").setDescription("Afficher").addStringOption(o=>o.setName("type").setDescription("Type").setRequired(true).addChoices({name:"fonctionnement",value:"fonctionnement"},{name:"commandes",value:"commandes"},{name:"veille",value:"veille"})))
    .addSubcommand(s=>s.setName("publier").setDescription("Publier").addStringOption(o=>o.setName("type").setDescription("Type").setRequired(true).addChoices({name:"fonctionnement",value:"fonctionnement"},{name:"commandes",value:"commandes"},{name:"veille",value:"veille"})).addChannelOption(o=>o.setName("salon").setDescription("Salon").setRequired(true).addChannelTypes(ChannelType.GuildText))),
  async execute(interaction) {
    const type = interaction.options.getString("type", true) as "fonctionnement"|"commandes"|"veille";
    const content = getDocContent(type);
    if (interaction.options.getSubcommand() === "afficher") { await interaction.reply({ephemeral:true, content}); return; }
    const channel = interaction.options.getChannel("salon", true);
    if (channel.type !== ChannelType.GuildText) { await interaction.reply({ephemeral:true, content:"Salon invalide."}); return; }
    await channel.send(content);
    await interaction.reply({ephemeral:true, content:"✅ Documentation publiée."});
  }
};
