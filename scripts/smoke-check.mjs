import fs from "node:fs";
const files = ["src/index.ts","src/deploy-commands.ts","src/commands/index.ts","src/intelligence-report/intelligence-report.service.ts","package.json","tsconfig.json",".env.example"];
let ok = true;
for (const f of files) {
  if (!fs.existsSync(f)) { console.error("❌", f); ok = false; }
  else console.log("✅", f);
}
if (!ok) process.exit(1);
console.log("✅ Smoke check OK");
