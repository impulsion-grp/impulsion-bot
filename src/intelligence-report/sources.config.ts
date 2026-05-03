import { WatchSource } from "./intelligence-report.types";
export const WATCH_SOURCES: WatchSource[] = [
  { id:"openai-news", provider:"OpenAI", name:"OpenAI News", url:"https://openai.com/news/rss.xml", type:"rss", category:"ai_model", official:true, priority:100, enabled:true },
  { id:"openai-api", provider:"OpenAI", name:"OpenAI API Changelog", url:"https://developers.openai.com/api/docs/changelog", type:"html", category:"ai_api", official:true, priority:100, enabled:true },
  { id:"openai-codex", provider:"OpenAI", name:"OpenAI Codex Changelog", url:"https://developers.openai.com/codex/changelog", type:"html", category:"ai_coding", official:true, priority:95, enabled:true },
  { id:"anthropic-news", provider:"Anthropic", name:"Anthropic News", url:"https://www.anthropic.com/news", type:"html", category:"ai_model", official:true, priority:95, enabled:true },
  { id:"claude-code", provider:"Anthropic", name:"Claude Code Changelog", url:"https://code.claude.com/docs/en/changelog", type:"html", category:"ai_coding", official:true, priority:95, enabled:true },
  { id:"gemini-api", provider:"Google", name:"Gemini API Release Notes", url:"https://ai.google.dev/gemini-api/docs/changelog", type:"html", category:"ai_api", official:true, priority:90, enabled:true },
  { id:"gemini-code-assist", provider:"Google", name:"Gemini Code Assist", url:"https://developers.google.com/gemini-code-assist/resources/release-notes", type:"html", category:"ai_coding", official:true, priority:85, enabled:true },
  { id:"github-changelog", provider:"GitHub", name:"GitHub Changelog", url:"https://github.blog/changelog/", type:"html", category:"dev_tools", official:true, priority:90, enabled:true },
  { id:"cursor-changelog", provider:"Cursor", name:"Cursor Changelog", url:"https://cursor.com/changelog", type:"html", category:"ai_coding", official:true, priority:80, enabled:true },
  { id:"opencode", provider:"OpenCode", name:"OpenCode", url:"https://opencode.ai/", type:"html", category:"ai_coding", official:true, priority:70, enabled:true },
  { id:"perplexity-docs", provider:"Perplexity", name:"Perplexity Docs", url:"https://docs.perplexity.ai/", type:"html", category:"ai_api", official:true, priority:65, enabled:true },
  { id:"nextjs-blog", provider:"Vercel", name:"Next.js Blog", url:"https://nextjs.org/blog", type:"html", category:"dev_web", official:true, priority:90, enabled:true },
  { id:"vercel-changelog", provider:"Vercel", name:"Vercel Changelog", url:"https://vercel.com/changelog", type:"html", category:"dev_web", official:true, priority:85, enabled:true },
  { id:"react-blog", provider:"React", name:"React Blog", url:"https://react.dev/blog", type:"html", category:"dev_web", official:true, priority:85, enabled:true },
  { id:"typescript-blog", provider:"Microsoft", name:"TypeScript Blog", url:"https://devblogs.microsoft.com/typescript/", type:"html", category:"dev_web", official:true, priority:80, enabled:true },
  { id:"nodejs-blog", provider:"Node.js", name:"Node.js Blog", url:"https://nodejs.org/en/blog", type:"html", category:"dev_web", official:true, priority:80, enabled:true },
  { id:"supabase-changelog", provider:"Supabase", name:"Supabase Changelog", url:"https://supabase.com/changelog", type:"html", category:"dev_web", official:true, priority:75, enabled:true },
  { id:"n8n-release-notes", provider:"n8n", name:"n8n Release Notes", url:"https://docs.n8n.io/release-notes/", type:"html", category:"automation", official:true, priority:70, enabled:true },
  { id:"azure-ai-blog", provider:"Microsoft", name:"Azure AI Blog", url:"https://azure.microsoft.com/en-us/blog/product/azure-ai/", type:"html", category:"cloud", official:true, priority:70, enabled:true },
  { id:"mistral-news", provider:"Mistral AI", name:"Mistral News", url:"https://mistral.ai/news", type:"html", category:"ai_model", official:true, priority:55, enabled:false }
];
