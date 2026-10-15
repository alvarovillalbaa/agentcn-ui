import path from "node:path";
import { lstat, realpath, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const registryDirectory = fileURLToPath(
  new URL("../registry/", import.meta.url),
);
export const defaultConfig = {
  $schema:
    "https://raw.githubusercontent.com/alvarovillalbaa/agentcn-ui/main/agentcn.schema.json",
  version: 1,
  components: "components/agentcn",
  css: "styles/agentcn.css",
  palette: "forest",
  radius: "rounded",
  density: "comfortable",
};
export const choices = {
  palette: ["forest", "ink", "indigo", "ember"],
  radius: ["sharp", "rounded", "soft"],
  density: ["compact", "comfortable"],
};

export function validateConfig(config) {
  if (
    !config ||
    typeof config !== "object" ||
    Array.isArray(config) ||
    config.version !== 1
  )
    throw new Error("Unsupported agentcn.json. Expected version 1.");
  if (
    Object.keys(config).some(
      (key) =>
        ![
          "$schema",
          "version",
          "components",
          "css",
          ...Object.keys(choices),
        ].includes(key),
    )
  )
    throw new Error("Unknown configuration key in agentcn.json.");
  for (const key of ["components", "css"]) {
    const value = config[key];
    if (
      typeof value !== "string" ||
      !value ||
      value.includes("\\") ||
      path.isAbsolute(value) ||
      value
        .split("/")
        .some((s) => ["..", ".", ".git", "node_modules"].includes(s) || !s) ||
      value.includes("\0")
    )
      throw new Error(
        `Invalid ${key} path. Use a relative project path outside .git and node_modules.`,
      );
  }
  if (!config.css.endsWith(".css"))
    throw new Error("The css path must end in .css.");
  for (const [key, allowed] of Object.entries(choices))
    if (!allowed.includes(config[key]))
      throw new Error(`Invalid ${key}. Choose: ${allowed.join(", ")}.`);
  return config;
}

/** Reject symlinks in every existing path segment, even when overwrite was requested. */
export async function guardedPath(root, relative) {
  const base = await realpath(root);
  const target = path.resolve(base, relative);
  if (target === base || !target.startsWith(base + path.sep))
    throw new Error(`Path escapes project: ${relative}`);
  let current = base;
  for (const segment of path.relative(base, target).split(path.sep)) {
    current = path.join(current, segment);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink())
        throw new Error(`Refusing symlink path: ${relative}`);
      if (current !== target && !info.isDirectory())
        throw new Error(`Parent is not a directory: ${relative}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return target;
}

export async function loadConfig(cwd) {
  const filename = await guardedPath(cwd, "agentcn.json");
  try {
    return validateConfig(JSON.parse(await readFile(filename, "utf8")));
  } catch (error) {
    if (error.code === "ENOENT")
      throw new Error("No agentcn.json found. Run agentcn-ui init first.");
    throw error;
  }
}

export async function readCatalog() {
  return JSON.parse(
    await readFile(path.join(registryDirectory, "catalog.json"), "utf8"),
  );
}
export function themeCss(config, palettes) {
  const p = palettes[config.palette];
  const radius = { sharp: "4px", rounded: "12px", soft: "20px" }[config.radius];
  const space = config.density === "compact" ? "14px" : "20px";
  return `\n/* agentcn-ui configuration */\n:root, .ac-theme { --ac-accent: ${p.accent}; --ac-accent-fg: ${p.foreground}; --ac-radius: ${radius}; --ac-space: ${space}; }\n.dark, [data-ac-theme="dark"] { --ac-accent: ${p.dark}; --ac-accent-fg: ${p.darkForeground}; }\n`;
}
