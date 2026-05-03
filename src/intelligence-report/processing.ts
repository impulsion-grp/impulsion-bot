import { SourceItem } from "./intelligence-report.types";
const keywords = ["api","model","models","agent","agents","codex","claude code","copilot","cursor","gemini","chatgpt","openai","anthropic","release","changelog","breaking","deprecated","security","vulnerability","next.js","react","typescript","node.js","supabase","vercel","automation","workflow","n8n","pricing","sdk","framework"];
export function filterLast24h(items: SourceItem[], start: Date, end: Date): SourceItem[] {
  return items.filter(i => { const d = new Date(i.publishedAt ?? i.detectedAt); if(Number.isNaN(d.getTime())) return true; return d >= start && d <= end; });
}
export function dedupeItems(items: SourceItem[]): SourceItem[] {
  const seen = new Set<string>(); return items.filter(i => { const k = `${normalizeUrl(i.url)}|${i.title.toLowerCase()}`; if(seen.has(k)) return false; seen.add(k); return true; });
}
export function scoreItems(items: SourceItem[]): SourceItem[] {
  return items.map(i => { let score = i.priority + (i.official ? 20 : 0); const text = `${i.title} ${i.excerpt}`.toLowerCase(); for (const k of keywords) if(text.includes(k)) score += 6; if(["ai_coding","dev_web","ai_api"].includes(i.category)) score += 15; return { ...i, score }; });
}
export function selectItems(items: SourceItem[], max: number): SourceItem[] { return [...items].sort((a,b)=>(b.score??0)-(a.score??0)).slice(0,max); }
function normalizeUrl(url: string): string { try { const u=new URL(url); u.hash=""; for(const k of [...u.searchParams.keys()]) if(k.startsWith("utm_")) u.searchParams.delete(k); return u.toString(); } catch { return url; } }
