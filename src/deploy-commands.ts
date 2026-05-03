import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands/index";
import { env, assertRequiredEnv } from "./config/env";
import { logger } from "./core/logger";

async function main() {
  assertRequiredEnv();

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  const body = commands.map((command) => command.data.toJSON());

  logger.info(`Déploiement de ${body.length} commandes slash...`);

  await rest.put(
    Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID),
    { body }
  );

  logger.success("Commandes slash déployées.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});