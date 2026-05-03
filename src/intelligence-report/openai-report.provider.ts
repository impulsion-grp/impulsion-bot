import OpenAI from "openai";
import { env } from "../config/env";
import { DailyReport, ReportPeriod, SourceItem } from "./intelligence-report.types";

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["title","slug","period","summary","articleMarkdown","discordSummary","sections","actionsForImpulsion","sources","stats"],
  properties: {
    title:{type:"string"}, slug:{type:"string"},
    period:{type:"object",additionalProperties:false,required:["start","end","timezone"],properties:{start:{type:"string"},end:{type:"string"},timezone:{type:"string"}}},
    summary:{type:"string"}, articleMarkdown:{type:"string"}, discordSummary:{type:"string"},
    sections:{type:"array",items:{type:"object",additionalProperties:false,required:["title","content","impactForImpulsion","priority","sourceIds"],properties:{title:{type:"string"},content:{type:"string"},impactForImpulsion:{type:"string"},priority:{type:"string",enum:["low","medium","high"]},sourceIds:{type:"array",items:{type:"string"}}}}},
    actionsForImpulsion:{type:"array",items:{type:"object",additionalProperties:false,required:["label","priority","effort"],properties:{label:{type:"string"},priority:{type:"string",enum:["low","medium","high"]},effort:{type:"string",enum:["low","medium","high"]}}}},
    sources:{type:"array",items:{type:"object",additionalProperties:false,required:["id","provider","title","url","official","publishedAt"],properties:{id:{type:"string"},provider:{type:"string"},title:{type:"string"},url:{type:"string"},official:{type:"boolean"},publishedAt:{type:"string"}}}},
    stats:{type:"object",additionalProperties:false,required:["sourcesScanned","itemsDetected","itemsUsed","officialSourceRatio"],properties:{sourcesScanned:{type:"number"},itemsDetected:{type:"number"},itemsUsed:{type:"number"},officialSourceRatio:{type:"number"}}}
  }
};

export async function generateReportWithOpenAI(input: { period: ReportPeriod; items: SourceItem[]; sourcesScanned: number; itemsDetected: number; }): Promise<DailyReport> {
  if (!env.OPENAI_API_KEY || !env.AI_REPORT_ENABLED) return fallbackReport(input, "IA désactivée ou clé OpenAI absente.");
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const payload = {
    period: input.period,
    items: input.items.map(i => ({ id:i.id, provider:i.provider, title:i.title, url:i.url, publishedAt:i.publishedAt ?? i.detectedAt, excerpt:i.excerpt, category:i.category, official:i.official, score:i.score ?? 0 })),
    stats: { sourcesScanned: input.sourcesScanned, itemsDetected: input.itemsDetected, itemsUsed: input.items.length }
  };
  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    input: [
  {
    role: "system",
    content: [
      "Tu es rédacteur de veille technique pour Impulsion, un collectif qui développe des applications web, outils IA, automatisations et produits numériques.",
      "",
      "Ta mission est de produire un rapport quotidien en français sur : IA, outils IA, agents, développement web, frameworks, APIs, GitHub, automatisation, cloud et outils développeur.",
      "",
      "RÈGLES ABSOLUES :",
      "- Tu utilises uniquement les sources fournies dans le JSON.",
      "- Tu n’inventes aucune annonce, aucune date, aucun produit, aucune fonctionnalité.",
      "- Si une information n’est pas clairement présente dans les sources, tu ne l’écris pas.",
      "- Tu ne dois jamais écrire un rapport marketing ou vague.",
      "- Tu dois écrire comme un article de veille clair, concret et utile.",
      "- Tu dois expliquer ce que les nouveautés changent concrètement pour des développeurs.",
      "- Tu dois toujours relier les analyses aux sources fournies.",
      "- Tu dois conserver les liens exacts des sources utilisées.",
      "",
      "IMPORTANT SUR LA PÉRIODE :",
      "- Le rapport vise les dernières 24h.",
      "- Si les items fournis n’ont pas de date fiable ou si la collecte 24h stricte est vide, tu dois l’indiquer clairement dans l’article.",
      "- Dans ce cas, écris que le rapport s’appuie sur les éléments officiels les plus récents détectés, et non sur une garantie stricte des dernières 24h.",
      "",
      "STYLE :",
      "- Français naturel.",
      "- Ton professionnel, direct, lisible.",
      "- Pas de blabla.",
      "- Pas de liste de liens brute.",
      "- Pas de phrases creuses.",
      "- Objectif : lisible en 3 à 5 minutes.",
      "",
      "STRUCTURE OBLIGATOIRE DE articleMarkdown :",
      "1. Titre principal",
      "2. Introduction éditoriale",
      "3. Section : ## Ce qui a vraiment changé",
      "4. Sections d’analyse par sujet ou fournisseur",
      "5. Section : ## Actions recommandées pour Impulsion",
      "6. Section : ## À surveiller",
      "7. Section : ## Sources utilisées",
      "",
      "La section ## Sources utilisées est obligatoire.",
      "Elle doit contenir une liste Markdown avec le fournisseur, le titre et le lien exact.",
      "",
      "La section ## Actions recommandées pour Impulsion est obligatoire.",
      "Elle doit contenir des actions concrètes, par exemple : tester, surveiller, ignorer, comparer, intégrer plus tard.",
      "",
      "FORMAT :",
      "- Tu dois répondre uniquement en JSON strict conforme au schéma demandé.",
      "- articleMarkdown contient l’article complet.",
      "- discordSummary contient un résumé Discord de maximum 1800 caractères.",
      "- sections doit contenir les grandes parties du rapport.",
      "- actionsForImpulsion doit contenir les actions recommandées.",
      "- sources doit contenir les sources réellement utilisées."
    ].join("\n")
  },
  {
    role: "user",
    content: [
      "Génère le rapport quotidien IA & Développement Web pour Impulsion.",
      "",
      "Contraintes :",
      "- Article complet : 800 à 1500 mots si les sources sont suffisantes.",
      "- Si les sources sont faibles ou peu exploitables, fais un rapport plus court et dis-le clairement.",
      "- Discord : maximum 1800 caractères.",
      "- JSON strict.",
      "- Ne parle que des éléments présents dans les sources.",
      "- Regroupe les informations par sens et par impact, pas seulement par fournisseur.",
      "",
      "Tu dois particulièrement faire ressortir :",
      "- ce qui change vraiment ;",
      "- ce qui est utile pour un collectif de développement ;",
      "- ce qui peut être testé rapidement ;",
      "- ce qui est à surveiller ;",
      "- ce qui n’est pas prioritaire.",
      "",
      "Données collectées :",
      JSON.stringify(payload, null, 2)
    ].join("\n")
  }
],
    text: { format: { type: "json_schema", name: "daily_intelligence_report", strict: true, schema } },
    max_output_tokens: 9000
  } as any);
  const text = (response as any).output_text;
  if (!text) throw new Error("Réponse OpenAI vide.");
  const report = JSON.parse(text) as DailyReport;
  report.period = input.period;
  report.stats = { sourcesScanned: input.sourcesScanned, itemsDetected: input.itemsDetected, itemsUsed: input.items.length, officialSourceRatio: input.items.length === 0 ? 1 : input.items.filter(i=>i.official).length / input.items.length };
  if (report.discordSummary.length > 1900) report.discordSummary = report.discordSummary.slice(0,1850).trim() + "…";
  return report;
}

function fallbackReport(input: { period: ReportPeriod; items: SourceItem[]; sourcesScanned: number; itemsDetected: number; }, reason: string): DailyReport {
  const date = input.period.end.slice(0,10); const title = `Veille IA & Développement Web — ${date}`;
  const sources = input.items.map(i=>({id:i.id, provider:i.provider, title:i.title, url:i.url, official:i.official, publishedAt:i.publishedAt ?? i.detectedAt}));
  const summary = `Rapport généré en mode fallback. Raison : ${reason}`;
  const articleMarkdown = [`# ${title}`,"","## Résumé","",summary,"","## Éléments détectés","",...input.items.map(i=>`- ${i.provider} — [${i.title}](${i.url})`),"","## Sources","",...sources.map(s=>`- ${s.provider} — [${s.title}](${s.url})`)].join("\\n");
  return { title, slug:`veille-ia-developpement-web-${date}`, period: input.period, summary, articleMarkdown, discordSummary:`🧠 **${title}**\\n\\n${summary}\\n\\nSources détectées : ${input.items.length}`, sections:[], actionsForImpulsion:[], sources, stats:{sourcesScanned:input.sourcesScanned, itemsDetected:input.itemsDetected, itemsUsed:input.items.length, officialSourceRatio:input.items.length===0?1:input.items.filter(i=>i.official).length/input.items.length} };
}
