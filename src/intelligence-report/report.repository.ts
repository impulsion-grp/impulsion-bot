import { promises as fs } from "node:fs";
import path from "node:path";
import { DailyReport, SourceItem } from "./intelligence-report.types";
export class ReportRepository {
  constructor(private readonly outputDir: string) {}
  async saveReport(report: DailyReport): Promise<{markdownPath:string; jsonPath:string}> {
    const date = report.period.end.slice(0,10); const [y,m]=date.split("-"); const dir=path.join(this.outputDir,y,m); await fs.mkdir(dir,{recursive:true});
    const markdownPath=path.join(dir,`${date}-ai-dev-report.md`); const jsonPath=path.join(dir,`${date}-ai-dev-report.json`);
    await fs.writeFile(markdownPath, report.articleMarkdown, "utf-8"); await fs.writeFile(jsonPath, JSON.stringify(report,null,2), "utf-8");
    await fs.mkdir(path.join(this.outputDir,".state"),{recursive:true}); await fs.writeFile(path.join(this.outputDir,".state","latest.json"), JSON.stringify({markdownPath,jsonPath},null,2));
    return { markdownPath, jsonPath };
  }
  async loadLatest(): Promise<DailyReport|undefined> { try { const latest=JSON.parse(await fs.readFile(path.join(this.outputDir,".state","latest.json"),"utf-8")) as {jsonPath:string}; return JSON.parse(await fs.readFile(latest.jsonPath,"utf-8")) as DailyReport; } catch { return undefined; } }
  async loadSeenHashes(): Promise<Set<string>> { try { return new Set(JSON.parse(await fs.readFile(path.join(this.outputDir,".state","seen.json"),"utf-8")) as string[]); } catch { return new Set(); } }
  async saveSeenHashes(existing: Set<string>, items: SourceItem[]): Promise<void> { for(const i of items) existing.add(i.hash); await fs.mkdir(path.join(this.outputDir,".state"),{recursive:true}); await fs.writeFile(path.join(this.outputDir,".state","seen.json"), JSON.stringify([...existing].slice(-5000),null,2)); }
}
