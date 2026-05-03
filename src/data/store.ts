import { promises as fs } from "node:fs";
import path from "node:path";

export type IdeaStatus = "new" | "waiting" | "validated" | "refused" | "reformulate";
export type ProjectStatus = "active" | "paused" | "done" | "archived";
export type TaskStatus = "todo" | "doing" | "done" | "cancelled";

export interface Idea {
  id: string; title: string; description: string; authorId: string; status: IdeaStatus; comment?: string; projectId?: string; createdAt: string; updatedAt: string;
}
export interface Project {
  id: string; name: string; description: string; ideaId?: string; status: ProjectStatus; roleId?: string; categoryId?: string; channels?: Record<string,string>; createdAt: string; updatedAt: string; lastActivityAt: string;
}
export interface Task {
  id: string; projectId: string; title: string; description?: string; status: TaskStatus; assigneeId?: string; createdBy: string; createdAt: string; updatedAt: string;
}
export interface StoreData {
  ideas: Idea[]; projects: Project[]; tasks: Task[]; meta: { version: string; updatedAt: string };
}

const STORE_PATH = path.join(process.cwd(), "data", "store.json");
const defaultStore: StoreData = { ideas: [], projects: [], tasks: [], meta: { version: "10.0.0", updatedAt: new Date().toISOString() } };

export async function loadStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as StoreData;
    return { ...defaultStore, ...parsed, ideas: parsed.ideas ?? [], projects: parsed.projects ?? [], tasks: parsed.tasks ?? [], meta: parsed.meta ?? defaultStore.meta };
  } catch {
    await saveStore(defaultStore);
    return structuredClone(defaultStore);
  }
}
export async function saveStore(store: StoreData): Promise<void> {
  store.meta.updatedAt = new Date().toISOString();
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}
export async function updateStore(mutator: (store: StoreData) => void | Promise<void>): Promise<StoreData> {
  const store = await loadStore();
  await mutator(store);
  await saveStore(store);
  return store;
}
