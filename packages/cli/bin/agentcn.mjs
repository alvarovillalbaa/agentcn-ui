#!/usr/bin/env node
import path from "node:path";
import { mkdir, readFile, stat } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import {
  defaultConfig,
  choices,
  guardedPath,
  readCatalog,
  themeCss,
  validateConfig,
  registryDirectory,
} from "../lib/config.mjs";
import { addComponents, writePlan } from "../lib/install.mjs";

const help = `agentcn-ui 0.1.0 — components for AI-native apps

  init                         Configure an existing React / Next.js app
  add <name...> | --all        Copy component source and styles into your app
  create <directory>          Scaffold a Next.js app with an AI workflow preset
  list                        Browse the component catalog

Options:
  --cwd <directory>           Project directory (default: current directory)
  --palette <name>            forest | ink | indigo | ember
  --radius <name>             sharp | rounded | soft
  --density <name>            compact | comfortable
  --components <path>         Component directory (init/create)
  --css <path>                CSS file path (init/create)
  --preset <name>             copilot | research | operations (create)
  --yes                       Use defaults without interactive prompts
  --dry-run                   Print planned changes without writing
  --overwrite                 Replace conflicting files after review
  --help                      Show help
  --version                   Show version

Examples:
  npx agentcn-ui@latest init
  pnpm dlx agentcn-ui@latest add agent-run approval-request
  npx agentcn-ui@latest create my-agent --preset research --palette ink
`;

async function main() {
  const raw = process.argv.slice(2);
  if (raw.includes("--help") || !raw.length) {
    console.log(help);
    return;
  }
  if (raw.includes("--version")) {
    console.log("0.1.0");
    return;
  }
  const command = raw.shift();
  const positional = [];
  const options = {};
  const values = new Set([
    "cwd",
    "palette",
    "radius",
    "density",
    "components",
    "css",
    "preset",
  ]);
  const flags = new Set(["yes", "dry-run", "overwrite", "all"]);
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (values.has(key)) {
      const value = raw[++i];
      if (!value || value.startsWith("--"))
        throw new Error(`Missing value for --${key}.`);
      options[key] = value;
    } else if (flags.has(key)) options[key] = true;
    else throw new Error(`Unknown option: ${arg}. Run with --help.`);
  }
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const { catalog, presets, palettes } = await readCatalog();
  if (command === "list") {
    for (const item of catalog)
      console.log(
        `${item.name.padEnd(20)} ${item.category.padEnd(19)} ${item.description}`,
      );
    return;
  }
  const report = (plan) =>
    plan.forEach((p) =>
      console.log(
        `${options["dry-run"] ? "would " : ""}${p.action.padEnd(10)} ${p.relative}`,
      ),
    );
  const writeOptions = {
    dryRun: !!options["dry-run"],
    overwrite: !!options.overwrite,
  };
  if (command === "add") {
    report(
      await addComponents(
        cwd,
        options.all ? ["--all"] : positional,
        writeOptions,
      ),
    );
    const config = JSON.parse(
      await readFile(await guardedPath(cwd, "agentcn.json"), "utf8"),
    );
    console.log(
      `\nImport ${config.css} once from your root layout or stylesheet. React 18.2+ is required. No runtime dependencies are installed.`,
    );
    return;
  }
  if (!["init", "create"].includes(command))
    throw new Error(`Unknown command: ${command}. Run with --help.`);
  const config = { ...defaultConfig };
  for (const key of ["components", "css", ...Object.keys(choices)])
    if (options[key]) config[key] = options[key];
  if (!options.yes && process.stdin.isTTY) {
    const prompt = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      for (const [key, allowed] of Object.entries(choices))
        if (!options[key]) {
          const answer = await prompt.question(
            `${key} (${allowed.join(" / ")}) [${config[key]}]: `,
          );
          if (answer.trim()) config[key] = answer.trim();
        }
    } finally {
      prompt.close();
    }
  }
  validateConfig(config);
  const files = new Map([
    ["agentcn.json", JSON.stringify(config, null, 2) + "\n"],
  ]);
  const sample = JSON.parse(
    await readFile(path.join(registryDirectory, "agent-run.json"), "utf8"),
  );
  files.set(
    config.css,
    sample.files.find((f) => f.path.endsWith(".css")).content +
      themeCss(config, palettes),
  );
  if (command === "init") {
    report(await writePlan(cwd, files, writeOptions));
    console.log(
      `\nNext: import ${config.css} in your root layout, then run agentcn-ui add agent-run.`,
    );
    return;
  }
  if (
    positional.length !== 1 ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(positional[0])
  )
    throw new Error(
      "create requires one new directory name using letters, numbers, dashes, or underscores.",
    );
  const preset = options.preset ?? "copilot";
  if (!Object.hasOwn(presets, preset))
    throw new Error(
      `Unknown preset: ${preset}. Choose: ${Object.keys(presets).join(", ")}.`,
    );
  const destination = await guardedPath(cwd, positional[0]);
  try {
    await stat(destination);
    throw new Error(
      `Destination already exists: ${positional[0]}. Use init inside existing apps.`,
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  for (const name of presets[preset]) {
    const item = JSON.parse(
      await readFile(path.join(registryDirectory, `${name}.json`), "utf8"),
    );
    for (const f of item.files.filter((f) => f.path.endsWith(".tsx")))
      files.set(`${config.components}/${f.path}`, f.content);
  }
  files.set(
    "package.json",
    JSON.stringify(
      {
        name: positional[0].toLowerCase().replaceAll("_", "-"),
        private: true,
        version: "0.1.0",
        scripts: { dev: "next dev", build: "next build", start: "next start" },
        dependencies: {
          next: "16.4.1",
          react: "^19.3.1",
          "react-dom": "^19.3.1",
        },
        devDependencies: {
          typescript: "^5.9.3",
          "@types/node": "^22",
          "@types/react": "^19",
          "@types/react-dom": "^19",
        },
      },
      null,
      2,
    ) + "\n",
  );
  const cssImport = path.posix.relative("app", config.css);
  files.set(
    "app/layout.tsx",
    `import "${cssImport.startsWith(".") ? cssImport : "./" + cssImport}";\nimport "./globals.css";\nimport type { ReactNode } from "react";\nexport const metadata = { title: "My agent", description: "Built with agentcn-ui" };\nexport default function Layout({ children }: { children: ReactNode }) { return <html lang="en"><body>{children}</body></html>; }\n`,
  );
  files.set(
    "app/globals.css",
    (files.get("app/globals.css") ?? "") +
      "body { margin: 0; padding: 48px 24px; background: #f6f7f8; font-family: system-ui, sans-serif; } main { max-width: 720px; margin: auto; display: grid; gap: 24px; } h1 { letter-spacing: -.04em; }\n",
  );
  const first = presets[preset][0];
  const imported = path.posix.relative("app", `${config.components}/${first}`);
  const importPath = imported.startsWith(".") ? imported : "./" + imported;
  const starter =
    preset === "operations"
      ? `import { PlanReview } from "${importPath}";\nexport default function Page() { const [confirmed, setConfirmed] = useState(false); return <main><h1>Review your agent's plan.</h1><PlanReview title="First workflow" steps={[{ id: "1", title: "Inspect inputs", selected: true, required: true }, { id: "2", title: "Prepare a proposal", selected: true }]} confirmed={confirmed} onConfirm={() => setConfirmed(true)} /></main>; }`
      : `import { PromptComposer } from "${importPath}";\nexport default function Page() { const [prompt, setPrompt] = useState(""); const [task, setTask] = useState(""); return <main><h1>What should your agent do?</h1><p>Connect onSubmit to your server to start a real agent.</p><PromptComposer value={prompt} onValueChange={setPrompt} onSubmit={value => { setTask(value); setPrompt(""); }} />{task && <p role="status">Task prepared: {task}</p>}</main>; }`;
  files.set(
    "app/page.tsx",
    `"use client";\nimport { useState } from "react";\n${starter}\n`,
  );
  files.set(
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["dom", "dom.iterable", "esnext"],
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "react-jsx",
          plugins: [{ name: "next" }],
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      },
      null,
      2,
    ) + "\n",
  );
  files.set(".gitignore", "node_modules/\n.next/\n.env*\n");
  if (options["dry-run"]) {
    for (const file of files.keys())
      console.log(`would create ${positional[0]}/${file}`);
    return;
  }
  await mkdir(destination);
  report(await writePlan(destination, files));
  console.log(
    `\nCreated ${positional[0]} with the ${preset} preset.\nNext: cd ${positional[0]} && npm install && npm run dev\nOr use pnpm install && pnpm dev.\nComponents are local source. Connect callbacks to your application's runtime.`,
  );
}

main().catch((error) => {
  console.error(`agentcn-ui: ${error.message}`);
  process.exitCode = 1;
});
