import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

// Serialise writes per file so concurrent requests don't clobber each other.
const queues = new Map<string, Promise<unknown>>();

async function readJson<T>(file: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T[];
  } catch {
    return [];
  }
}

export function appendRecord<T>(name: string, record: T): Promise<void> {
  const file = path.join(DATA_DIR, `${name}.json`);
  const prev = queues.get(file) ?? Promise.resolve();
  const next = prev.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const rows = await readJson<T>(file);
    rows.push(record);
    await fs.writeFile(file, JSON.stringify(rows, null, 2));
  });
  queues.set(file, next.catch(() => {}));
  return next;
}
