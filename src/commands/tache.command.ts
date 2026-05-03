import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../core/command";
import { createId } from "../core/utils";
import { loadStore, updateStore, TaskStatus } from "../data/store";
const statuses: TaskStatus[] = ["todo","doing","done","cancelled"];
export const tacheCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("tache").setDescription("Gère les tâches.")
    .addSubcommand(s=>s.setName("creer").setDescription("Créer").addStringOption(o=>o.setName("project_id").setDescription("Projet").setRequired(true)).addStringOption(o=>o.setName("titre").setDescription("Titre").setRequired(true)).addStringOption(o=>o.setName("description").setDescription("Description").setRequired(false)).addUserOption(o=>o.setName("assigne").setDescription("Assigné").setRequired(false)))
    .addSubcommand(s=>s.setName("liste").setDescription("Lister").addStringOption(o=>o.setName("project_id").setDescription("Projet").setRequired(false)))
    .addSubcommand(s=>s.setName("statut").setDescription("Statut").addStringOption(o=>o.setName("id").setDescription("ID").setRequired(true)).addStringOption(o=>o.setName("statut").setDescription("Statut").setRequired(true).addChoices(...statuses.map(v=>({name:v,value:v}))))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "creer") {
      const projectId = interaction.options.getString("project_id", true); const store = await loadStore();
      if (!store.projects.some(p=>p.id===projectId)) { await interaction.reply({ephemeral:true, content:"Projet introuvable."}); return; }
      const now = new Date().toISOString(); const assignee = interaction.options.getUser("assigne");
      const task = { id:createId("task"), projectId, title:interaction.options.getString("titre", true), description:interaction.options.getString("description")??undefined, status:"todo" as const, assigneeId:assignee?.id, createdBy:interaction.user.id, createdAt:now, updatedAt:now };
      await updateStore(s=>{ s.tasks.push(task); const p=s.projects.find(x=>x.id===projectId); if(p) p.lastActivityAt=now; });
      await interaction.reply(`✅ Tâche créée : \`${task.id}\` — **${task.title}**`);
      return;
    }
    if (sub === "liste") {
      const projectId = interaction.options.getString("project_id"); const s = await loadStore(); const tasks = s.tasks.filter(t=>!projectId || t.projectId===projectId).slice(-20).reverse();
      await interaction.reply({ephemeral:true, content: tasks.length ? tasks.map(t=>`- \`${t.id}\` **${t.title}** — ${t.status} — projet \`${t.projectId}\``).join("\n") : "Aucune tâche."});
      return;
    }
    const id = interaction.options.getString("id", true); const status = interaction.options.getString("statut", true) as TaskStatus; let found=false;
    await updateStore(s=>{ const t=s.tasks.find(x=>x.id===id); if(t){ t.status=status; t.updatedAt=new Date().toISOString(); found=true; }});
    await interaction.reply(found ? `✅ Tâche \`${id}\` passée en \`${status}\`.` : "Tâche introuvable.");
  }
};
