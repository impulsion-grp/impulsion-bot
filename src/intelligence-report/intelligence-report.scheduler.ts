import cron from "node-cron";
import { Client } from "discord.js";
import { env } from "../config/env";
import { logger } from "../core/logger";
import { IntelligenceReportService } from "./intelligence-report.service";
let registered = false;
export function registerIntelligenceReportScheduler(client: Client): void {
  if (registered) return; registered = true;
  if (!env.INTELLIGENCE_REPORT_ENABLED) { logger.info("Veille IA désactivée."); return; }
  const expr = `${env.INTELLIGENCE_REPORT_DAILY_MINUTE} ${env.INTELLIGENCE_REPORT_DAILY_HOUR} * * *`;
  cron.schedule(expr, async()=>{ try { logger.info("Génération automatique veille IA..."); await new IntelligenceReportService().generate(client); } catch(e){ logger.error("Erreur veille IA", e); } }, { timezone: env.INTELLIGENCE_REPORT_TIMEZONE });
  logger.success(`Veille IA planifiée: ${expr} (${env.INTELLIGENCE_REPORT_TIMEZONE})`);
}
