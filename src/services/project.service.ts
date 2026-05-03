import { ChannelType, Guild, PermissionFlagsBits } from "discord.js";
import { env } from "../config/env";
import { createId, slugify } from "../core/utils";
import { updateStore, Project } from "../data/store";

export async function createProject(input: { guild: Guild; name: string; description: string; ideaId?: string }): Promise<Project> {
  const now = new Date().toISOString();
  const id = createId("proj");
  const slug = slugify(input.name);

  const role = await input.guild.roles.create({ name: `Projet - ${input.name}`.slice(0, 90), mentionable: true });
  const overwrites = env.PROJECT_PRIVATE_BY_DEFAULT ? [
    { id: input.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: role.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
    { id: input.guild.client.user!.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels] }
  ] : undefined;

  const category = await input.guild.channels.create({ name: `🚀 ${input.name}`.slice(0, 90), type: ChannelType.GuildCategory, permissionOverwrites: overwrites });
  const channels: Record<string,string> = {};
  for (const name of ["annonces","discussion","dev","docs","taches"]) {
    const ch = await input.guild.channels.create({ name: `${name}-${slug}`.slice(0, 90), type: ChannelType.GuildText, parent: category.id });
    channels[name] = ch.id;
  }
  const voice = await input.guild.channels.create({ name: `vocal-${slug}`.slice(0, 90), type: ChannelType.GuildVoice, parent: category.id });
  channels.voice = voice.id;

  const project: Project = { id, name: input.name, description: input.description, ideaId: input.ideaId, status: "active", roleId: role.id, categoryId: category.id, channels, createdAt: now, updatedAt: now, lastActivityAt: now };

  await updateStore((store) => {
    store.projects.push(project);
    if (input.ideaId) {
      const idea = store.ideas.find((i) => i.id === input.ideaId);
      if (idea) { idea.status = "validated"; idea.projectId = project.id; idea.updatedAt = now; }
    }
  });
  return project;
}
