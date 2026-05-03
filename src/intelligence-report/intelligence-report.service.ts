import { subHours } from "date-fns";
import { Client } from "discord.js";
import { env } from "../config/env";
import { logger } from "../core/logger";
import { collectSource } from "./collectors";
import { WATCH_SOURCES } from "./sources.config";
import { dedupeItems, filterLast24h, scoreItems, selectItems } from "./processing";
import { generateReportWithOpenAI } from "./openai-report.provider";
import { ReportRepository } from "./report.repository";
import { SourceItem } from "./intelligence-report.types";

export class IntelligenceReportService {
  async generate(client?: Client, options?: { force?: boolean }) {
    const now = new Date();
    const start = subHours(now, 24);

    const period = {
      start: start.toISOString(),
      end: now.toISOString(),
      timezone: env.INTELLIGENCE_REPORT_TIMEZONE
    };

    const sources = WATCH_SOURCES.filter((source) => source.enabled);
    const collected: SourceItem[] = [];

    for (const source of sources) {
      try {
        const items = await collectSource(source);
        collected.push(...items);
      } catch (error) {
        logger.warn(`Source veille ignorée: ${source.name}`, error);
      }
    }

    const last24h = filterLast24h(collected, start, now);
    const dedupedLast24h = dedupeItems(last24h);
    const dedupedAll = dedupeItems(collected);

    /**
     * V10 — Sécurité importante :
     *
     * Certaines sources officielles n'exposent pas toujours une date exploitable.
     * Résultat : le filtre "dernières 24h" peut vider entièrement la liste.
     *
     * Donc :
     * - priorité aux items datés dans les dernières 24h ;
     * - fallback sur les meilleurs items collectés si le filtre 24h est vide.
     */
    const candidatePool =
      dedupedLast24h.length > 0
        ? dedupedLast24h
        : dedupedAll;

    /**
     * V10 — on désactive le filtre "déjà vu" pour le moment.
     *
     * Pendant les tests, le système seenHashes peut vider les rapports.
     * On le remettra plus tard quand le rapport sera stable.
     */
    const selected = selectItems(
      scoreItems(candidatePool),
      env.INTELLIGENCE_REPORT_MAX_USED_ITEMS
    );

    const limited = limitChars(
      selected,
      env.INTELLIGENCE_REPORT_MAX_INPUT_CHARS
    );

    console.log("[veille] sources:", sources.length);
    console.log("[veille] collected:", collected.length);
    console.log("[veille] last24h:", last24h.length);
    console.log("[veille] dedupedLast24h:", dedupedLast24h.length);
    console.log("[veille] dedupedAll:", dedupedAll.length);
    console.log("[veille] candidatePool:", candidatePool.length);
    console.log("[veille] selected:", selected.length);
    console.log("[veille] limited:", limited.length);

    const report = await generateReportWithOpenAI({
      period,
      items: limited,
      sourcesScanned: sources.length,
      itemsDetected: collected.length
    });

    const repository = new ReportRepository(env.INTELLIGENCE_REPORT_OUTPUT_DIR);
    const paths = await repository.saveReport(report);

    let discordMessageId: string | undefined;

    if (
      client &&
      env.INTELLIGENCE_REPORT_DISCORD_ENABLED &&
      env.INTELLIGENCE_REPORT_DISCORD_CHANNEL_ID
    ) {
      const channel = await client.channels.fetch(
        env.INTELLIGENCE_REPORT_DISCORD_CHANNEL_ID
      );

      if (channel && "send" in channel) {
        const message = await channel.send({
          content: [
            report.discordSummary,
            "",
            `📄 Rapport complet généré : \`${paths.markdownPath}\``
          ].join("\n"),
          allowedMentions: { parse: [] }
        });

        discordMessageId = message.id;
      }
    }

    return {
      report,
      ...paths,
      discordMessageId
    };
  }

  async latest() {
    const repository = new ReportRepository(env.INTELLIGENCE_REPORT_OUTPUT_DIR);
    return repository.loadLatest();
  }
}

function limitChars<T extends { title: string; excerpt: string }>(
  items: T[],
  maxChars: number
): T[] {
  let total = 0;
  const result: T[] = [];

  for (const item of items) {
    const size = item.title.length + item.excerpt.length;

    if (total + size > maxChars && result.length > 0) {
      break;
    }

    result.push(item);
    total += size;
  }

  return result;
}