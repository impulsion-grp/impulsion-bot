import * as cheerio from "cheerio";
import Parser from "rss-parser";
import { SourceItem, WatchSource } from "./intelligence-report.types";
import { sha256 } from "../core/utils";
const rssParser = new Parser({ timeout: 15000 });

export async function collectSource(source: WatchSource): Promise<SourceItem[]> {
  if (source.type === "rss") return collectRss(source);
  return collectHtml(source);
}
async function collectRss(source: WatchSource): Promise<SourceItem[]> {
  const feed = await rssParser.parseURL(source.url); const now = new Date().toISOString();
  return (feed.items ?? []).slice(0,20).map((item:any, idx:number) => makeItem(source, item.title || `${source.name} ${idx+1}`, item.link || source.url, item.contentSnippet || item.content || item.summary || "", item.isoDate || item.pubDate || now, now));
}
async function collectHtml(source: WatchSource): Promise<SourceItem[]> {
  const html = await fetchText(source.url); const $ = cheerio.load(html); const now = new Date().toISOString(); const items: SourceItem[] = [];
  $("article, main a, a").each((_, element) => {
    if (items.length >= 15) return;
    const el = $(element); const title = clean(el.find("h1,h2,h3").first().text()) || clean(el.text());
    if (!isUsefulTitle(title)) return;
    const href = el.attr("href") || el.find("a").first().attr("href") || "";
    const url = absolute(source.url, href); if (!url) return;
    const excerpt = clean(el.text()).slice(0, 2500);
    const publishedAt = normalizeDate(el.find("time").attr("datetime") || el.find("time").text()) ?? now;
    items.push(makeItem(source, title.slice(0,220), url, excerpt, publishedAt, now));
  });
  return unique(items);
}
function makeItem(source: WatchSource, title: string, url: string, excerpt: string, publishedAt: string, now: string): SourceItem {
  const cleanTitle = clean(title); const cleanExcerpt = clean(excerpt).slice(0,2500);
  const hash = sha256(`${source.id}|${cleanTitle}|${url}|${publishedAt}|${cleanExcerpt}`);
  return { id: hash.slice(0,24), sourceId: source.id, provider: source.provider, sourceName: source.name, title: cleanTitle, url, publishedAt, detectedAt: now, excerpt: cleanExcerpt, category: source.category, official: source.official, priority: source.priority, hash };
}
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "user-agent": "ImpulsionBot/10.0", "accept": "text/html,application/xml,application/rss+xml,*/*" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
  return res.text();
}
function clean(v?: string): string { return (v ?? "").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); }
function isUsefulTitle(t: string): boolean { if(!t || t.length<12 || t.length>260) return false; return !["cookie","privacy","terms","subscribe","newsletter","sign in","login","menu"].some(w=>t.toLowerCase().includes(w)); }
function absolute(base: string, href: string): string|undefined { try { return new URL(href || base, base).toString(); } catch { return undefined; } }
function normalizeDate(v?: string): string|undefined { if(!v) return undefined; const d=new Date(v); return Number.isNaN(d.getTime()) ? undefined : d.toISOString(); }
function unique(items: SourceItem[]): SourceItem[] { const seen=new Set<string>(); return items.filter(i=>{ const k=i.url.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; }); }
