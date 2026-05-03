export type SourceCategory = "ai_model"|"ai_api"|"ai_coding"|"dev_web"|"dev_tools"|"automation"|"cloud"|"security"|"other";
export interface WatchSource { id:string; provider:string; name:string; url:string; type:"html"|"rss"; category:SourceCategory; official:boolean; priority:number; enabled:boolean; }
export interface SourceItem { id:string; sourceId:string; provider:string; sourceName:string; title:string; url:string; publishedAt?:string; detectedAt:string; excerpt:string; category:SourceCategory; official:boolean; priority:number; hash:string; score?:number; }
export interface ReportPeriod { start:string; end:string; timezone:string; }
export interface DailyReport {
  title:string; slug:string; period:ReportPeriod; summary:string; articleMarkdown:string; discordSummary:string;
  sections:Array<{title:string; content:string; impactForImpulsion:string; priority:"low"|"medium"|"high"; sourceIds:string[]}>;
  actionsForImpulsion:Array<{label:string; priority:"low"|"medium"|"high"; effort:"low"|"medium"|"high"}>;
  sources:Array<{id:string; provider:string; title:string; url:string; official:boolean; publishedAt:string}>;
  stats:{sourcesScanned:number; itemsDetected:number; itemsUsed:number; officialSourceRatio:number};
}
