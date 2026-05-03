import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../core/command";
import { createId } from "../core/utils";
import { loadStore, updateStore, IdeaStatus } from "../data/store";
import { createProject } from "../services/project.service";

const statuses: IdeaStatus[] = ["new","waiting","validated","refused","reformulate"];

export const ideaCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("idee").setDescription("Gère les idées.")
    .addSubcommand(s => s.setName("creer").setDescription("Créer une idée").addStringOption(o=>o.setName("titre").setDescription("Titre").setRequired(true)).addStringOption(o=>o.setName("description").setDescription("Description").setRequired(true)))
    .addSubcommand(s => s.setName("liste").setDescription("Lister").addStringOption(o=>o.setName("statut").setDescription("Statut").setRequired(false).addChoices(...statuses.map(v=>({name:v,value:v})))))
    .addSubcommand(s => s.setName("detail").setDescription("Détail").addStringOption(o=>o.setName("id").setDescription("ID").setRequired(true)))
    .addSubcommand(s => s.setName("statut").setDescription("Changer statut").addStringOption(o=>o.setName("id").setDescription("ID").setRequired(true)).addStringOption(o=>o.setName("statut").setDescription("Statut").setRequired(true).addChoices(...statuses.map(v=>({name:v,value:v})))).addStringOption(o=>o.setName("commentaire").setDescription("Commentaire").setRequired(false)))
    .addSubcommand(s => s.setName("valider").setDescription("Valider et créer le projet").addStringOption(o=>o.setName("id").setDescription("ID").setRequired(true)).addStringOption(o=>o.setName("nom_projet").setDescription("Nom projet").setRequired(false))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "creer") {
      const now = new Date().toISOString();
      const idea = { id: createId("idea"), title: interaction.options.getString("titre", true), description: interaction.options.getString("description", true), authorId: interaction.user.id, status: "new" as const, createdAt: now, updatedAt: now };
      await updateStore(s => { s.ideas.push(idea); });
      await interaction.reply(`💡 Idée créée : \`${idea.id}\` — **${idea.title}**`);
      return;
    }
    if (sub === "liste") {
      const status = interaction.options.getString("statut") as IdeaStatus | null;
      const s = await loadStore();
      const list = s.ideas.filter(i => !status || i.status === status).slice(-15).reverse();
      await interaction.reply({ ephemeral: true, content: list.length ? list.map(i=>`- \`${i.id}\` **${i.title}** — ${i.status}`).join("\n") : "Aucune idée." });
      return;
    }
    if (sub === "detail") {
      const id = interaction.options.getString("id", true); const s = await loadStore(); const i = s.ideas.find(x=>x.id===id);
      await interaction.reply({ ephemeral: true, content: i ? `💡 **${i.title}**\nID: \`${i.id}\`\nStatut: \`${i.status}\`\nAuteur: <@${i.authorId}>\n\n${i.description}${i.projectId ? `\nProjet: \`${i.projectId}\`` : ""}` : "Idée introuvable." });
      return;
    }
    if (sub === "statut") {
      const id = interaction.options.getString("id", true); const status = interaction.options.getString("statut", true) as IdeaStatus; const comment = interaction.options.getString("commentaire") ?? undefined; let found = false;
      await updateStore(s => { const i=s.ideas.find(x=>x.id===id); if(i){ i.status=status; i.comment=comment; i.updatedAt=new Date().toISOString(); found=true; }});
      await interaction.reply(found ? `✅ Idée \`${id}\` passée en \`${status}\`.` : "Idée introuvable.");
      return;
    }
    if (sub === "valider") {
      const id = interaction.options.getString("id", true); const s = await loadStore(); const idea = s.ideas.find(x=>x.id===id);
      if (!idea || !interaction.guild) { await interaction.reply({ ephemeral: true, content: "Idée introuvable ou serveur invalide." }); return; }
      await interaction.deferReply();
      const project = await createProject({ guild: interaction.guild, name: interaction.options.getString("nom_projet") ?? idea.title, description: idea.description, ideaId: idea.id });
      await interaction.editReply(`🚀 Projet créé : \`${project.id}\` — **${project.name}**`);
    }
  }
};
