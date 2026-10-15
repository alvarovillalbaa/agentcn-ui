import { mkdir, readFile, writeFile, lstat } from "node:fs/promises";
import path from "node:path";
import {
  guardedPath,
  loadConfig,
  readCatalog,
  registryDirectory,
  themeCss,
} from "./config.mjs";

/** Validate the entire write plan before touching an existing project. */
export async function writePlan(
  cwd,
  files,
  { overwrite = false, dryRun = false } = {},
) {
  const plan = [];
  for (const [relative, content] of files) {
    const filename = await guardedPath(cwd, relative);
    let exists = false,
      identical = false;
    try {
      const stat = await lstat(filename);
      exists = true;
      if (!stat.isFile()) throw new Error(`Expected a file: ${relative}`);
      identical = (await readFile(filename, "utf8")) === content;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (exists && !identical && !overwrite)
      throw new Error(
        `Existing file differs: ${relative}. Review it, then pass --overwrite to replace it.`,
      );
    plan.push({
      relative,
      filename,
      content,
      action: identical ? "unchanged" : exists ? "replace" : "create",
    });
  }
  if (!dryRun)
    for (const entry of plan) {
      if (entry.action === "unchanged") continue;
      // Recheck after any await before opening the destination. wx protects new files.
      await guardedPath(cwd, entry.relative);
      await mkdir(path.dirname(entry.filename), { recursive: true });
      await writeFile(entry.filename, entry.content, {
        flag: entry.action === "create" ? "wx" : "w",
      });
    }
  return plan;
}

export async function addComponents(cwd, names, options) {
  const config = await loadConfig(cwd);
  const { catalog, palettes } = await readCatalog();
  const selected = names.includes("--all")
    ? catalog.map((i) => i.name)
    : [...new Set(names)];
  if (!selected.length)
    throw new Error("Choose at least one component. Run agentcn-ui list.");
  const files = new Map();
  for (const name of selected) {
    if (!catalog.some((i) => i.name === name))
      throw new Error(`Unknown component: ${name}. Run agentcn-ui list.`);
    const item = JSON.parse(
      await readFile(path.join(registryDirectory, `${name}.json`), "utf8"),
    );
    for (const file of item.files) {
      const target = file.path.endsWith(".css")
        ? config.css
        : `${config.components}/${file.path}`;
      files.set(
        target,
        file.path.endsWith(".css")
          ? file.content + themeCss(config, palettes)
          : file.content,
      );
    }
  }
  return writePlan(cwd, files, options);
}
