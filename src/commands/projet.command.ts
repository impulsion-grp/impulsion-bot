import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../core/command";
import { loadStore } from "../data/store";
import { createProject } from "../services/project.service";

export const projetCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("projet").setDescription("Gère les projets.")
    .addSubcommand(s=>s.setName("creer").setDescription("Créer projet").addStringOption(o=>o.setName("nom").setDescription("Nom").setRequired(true)).addStringOption(o=>o.setName("description").setDescription("Description").setRequired(true)))
    .addSubcommand(s=>s.setName("liste").setDescription("Lister"))
    .addSubcommand(s=>s.setName("detail").setDescription("Détail").addStringOption(o=>o.setName("id").setDescription("ID").setRequired(true))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "creer") {
      if (!interaction.guild) { await interaction.reply({ephemeral:true, content:"Serveur invalide."}); return; }
      await interaction.deferReply();
      const p = await createProject({ guild: interaction.guild, name: interaction.options.getString("nom", true), description: interaction.options.getString("description", true) });
      await interaction.editReply(`🚀 Projet créé : \`${p.id}\` — **${p.name}**`);
      return;
    }
    const s = await loadStore();
    if (sub === "liste") {
      const list = s.projects.slice(-20).reverse();
      await interaction.reply({ ephemeral:true, content: list.length ? list.map(p=>`- \`${p.id}\` **${p.name}** — ${p.status}`).join("\n") : "Aucun projet." });
      return;
    }
    const id = interaction.options.getString("id", true); const p = s.projects.find(x=>x.id===id);
    await interaction.reply({ ephemeral:true, content: p ? `🚀 **${p.name}**\nID: \`${p.id}\`\nStatut: \`${p.status}\`\n${p.description}\n${p.roleId ? `Rôle: <@&${p.roleId}>` : ""}` : "Projet introuvable." });
  }
};
