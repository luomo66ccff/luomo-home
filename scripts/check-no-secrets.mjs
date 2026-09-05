import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const forbidden = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /Authorization:\s*Bearer\s+[A-Za-z0-9._-]+/i,
];
const secretAssignment = /\b(secret|token|cookie|private_key|ssh_key|password)\b\s*[:=]\s*['"]([^'"]{8,})['"]/gi;
const testPlaceholder = /^(?:must-not-leak|example|placeholder|dummy|test(?:[-_].*)?|change[-_]?me)$/i;
// Next's generated navigation inspector clears a cookie via a template string.
// This contains a constant name and an expired, empty value, not a credential.
const nextCookieClear = /^\$\{[\w$.]*NEXT_INSTANT_TEST_COOKIE\}=;[^'"]*max-age=0$/i;
const skipDirs = new Set(["node_modules", ".git"]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".map", ".html", ".css", ".svg", ".txt", ".md", ".yml", ".yaml"]);
const skipEnvFile = (name) => name === ".env" || name.startsWith(".env.");
const scanDirs = [
  "app",
  "components",
  "content",
  "config",
  "hooks",
  "lib",
  "scripts",
  "tests",
  "public",
  ".github",
  ".next/server",
  ".next/static",
];
const scanFiles = [
  "next.config.js",
  "postcss.config.js",
  "tailwind.config.ts",
  "tsconfig.json",
  "vitest.config.js",
  "vitest.config.ts",
  "package.json",
];

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return files;
    throw new Error(`Unable to scan ${path.relative(root, dir)}: ${error.message}`);
  }

  for (const entry of entries) {
    if (skipDirs.has(entry.name) || skipEnvFile(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (entry.isFile()) {
      if (textExtensions.has(path.extname(entry.name))) files.push(fullPath);
    }
  }
  return files;
}

const files = [];
for (const dir of scanDirs) {
  files.push(...(await walk(path.join(root, dir))));
}
for (const file of scanFiles) {
  if (!skipEnvFile(file)) {
    const fullPath = path.join(root, file);
    try {
      const info = await stat(fullPath);
      if (info.isFile()) files.push(fullPath);
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw new Error(`Unable to scan ${file}: ${error.message}`);
      }
    }
  }
}

for (const file of files) {
  let content;
  try {
    content = await readFile(file, "utf8");
  } catch (error) {
    throw new Error(`Unable to read ${path.relative(root, file)}: ${error.message}`);
  }
  for (const pattern of forbidden) {
    if (pattern.test(content)) {
      throw new Error(`Potential secret marker found in ${path.relative(root, file)}: ${pattern}`);
    }
  }
  for (const match of content.matchAll(secretAssignment)) {
    if (!testPlaceholder.test(match[2]) && !(match[1].toLowerCase() === "cookie" && nextCookieClear.test(match[2]))) {
      throw new Error(`Potential secret marker found in ${path.relative(root, file)}: ${secretAssignment}`);
    }
  }
}

console.log(`No obvious secrets found in ${files.length} files`);
