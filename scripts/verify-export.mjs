import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "../catalog.mjs";
const out = fileURLToPath(new URL("../apps/www/out/", import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const failures = [];
let pages = 0;
async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await check(filename);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    const html = await readFile(filename, "utf8");
    pages++;
    for (const match of html.matchAll(
      /(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g,
    )) {
      let target = match[1];
      if (!target.startsWith("/") || target.startsWith("//")) continue;
      if (
        basePath &&
        !target.startsWith(basePath + "/") &&
        target !== basePath
      ) {
        failures.push(
          `${path.relative(out, filename)}: link misses base path: ${target}`,
        );
        continue;
      }
      target = decodeURIComponent(target.slice(basePath.length)).replace(
        /^\//,
        "",
      );
      const destination = path.join(out, target);
      if (
        !(await exists(destination)) &&
        !(await exists(path.join(destination, "index.html")))
      )
        failures.push(`${path.relative(out, filename)}: missing ${target}`);
    }
  }
}
await check(out);
for (const item of catalog) {
  const registry = JSON.parse(
    await readFile(path.join(out, "r", `${item.name}.json`), "utf8"),
  );
  if (registry.name !== item.name || !registry.files.length)
    failures.push(`Invalid registry: ${item.name}`);
}
if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Verified ${pages} exported HTML pages, local asset/navigation targets, and ${catalog.length} registry endpoints for base path ${basePath || "/"}. Browser behavior is a separate check.`,
  );
