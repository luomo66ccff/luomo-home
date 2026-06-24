import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const forbidden = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /Authorization:\s*Bearer\s+[A-Za-z0-9._-]+/i,
  /\b(secret|token|cookie|private_key|ssh_key|password)\b\s*[:=]\s*['"][^'"]{8,}/i
];
const skipDirs = new Set(["node_modules", ".git"]);
const scanDirs = ["app", "components", "lib", "scripts", "public", ".next/server"];

async function walk(dir, files = []) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (entry.isFile()) {
      const info = await stat(fullPath);
      if (info.size <= 1024 * 1024) files.push(fullPath);
    }
  }
  return files;
}

const files = [];
for (const dir of scanDirs) {
  files.push(...(await walk(path.join(root, dir))));
}

for (const file of files) {
  const content = await readFile(file, "utf8").catch(() => "");
  for (const pattern of forbidden) {
    if (pattern.test(content)) {
      throw new Error(`Potential secret marker found in ${path.relative(root, file)}: ${pattern}`);
    }
  }
}

console.log(`No obvious secrets found in ${files.length} files`);
