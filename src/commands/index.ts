import { Collection } from "discord.js";
import { BotCommand } from "../core/command";
import { pingCommand } from "./ping.command";
import { ideaCommand } from "./idee.command";
import { projetCommand } from "./projet.command";
import { tacheCommand } from "./tache.command";
import { musicCommand, docsCommand } from "./misc.commands";
import { veilleCommand } from "./veille.command";

export const commands: BotCommand[] = [pingCommand, ideaCommand, projetCommand, tacheCommand, musicCommand, docsCommand, veilleCommand];
export const commandMap = new Collection<string, BotCommand>();
for (const command of commands) commandMap.set(command.data.name, command);
