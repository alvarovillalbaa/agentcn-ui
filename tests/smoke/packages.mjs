// Data tier T1: clean disposable consumers. Downloads public npm dependencies only.
import { mkdtemp, writeFile, readFile, rm, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const root = fileURLToPath(new URL("../../", import.meta.url));
const temporary = await mkdtemp(path.join(tmpdir(), "agentcn-packages-"));
const environment = {
  ...process.env,
  npm_config_cache:
    process.env.npm_config_cache ?? path.join(temporary, "npm-cache"),
  npm_config_fetch_retries: "0",
  npm_config_fetch_timeout: "15000",
  npm_config_update_notifier: "false",
  ...(process.env.AGENTCN_SMOKE_OFFLINE === "1"
    ? { npm_config_offline: "true" }
    : {}),
};
const library = path.join(root, "alvarovillalbaa-agentcn-ui-0.1.0.tgz"),
  cli = path.join(root, "agentcn-ui-0.1.0.tgz");
const npm = (cwd, args) =>
  execFileSync("npm", args, {
    cwd,
    env: environment,
    encoding: "utf8",
    timeout: 60000,
    stdio: ["ignore", "pipe", "pipe"],
  });
try {
  for (const version of ["18.2.0", "19.3.1"]) {
    const consumer = path.join(temporary, `react-${version}`);
    await mkdir(consumer);
    await writeFile(
      path.join(consumer, "package.json"),
      JSON.stringify({
        name: "agentcn-package-smoke",
        private: true,
        type: "module",
      }),
    );
    npm(consumer, [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      library,
      `react@${version}`,
      `react-dom@${version}`,
    ]);
    const output = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import React from "react"; import { renderToStaticMarkup } from "react-dom/server"; import { ContextWindow, ApprovalRequest } from "@alvarovillalbaa/agentcn-ui"; import { AgentRun } from "@alvarovillalbaa/agentcn-ui/agent-run"; const html = renderToStaticMarkup(React.createElement(ContextWindow, { capacity: 100, segments: [{ id: "a", label: "Input", tokens: 20 }] })); if (!html.includes('aria-valuenow="20"') || typeof ApprovalRequest !== "function" || typeof AgentRun !== "function") throw new Error("Package exports failed"); console.log(React.version);`,
      ],
      { cwd: consumer, encoding: "utf8" },
    );
    assert.match(output, new RegExp(version.replaceAll(".", "\\.")));
    assert.match(
      await readFile(
        path.join(
          consumer,
          "node_modules/@alvarovillalbaa/agentcn-ui/styles.css",
        ),
        "utf8",
      ),
      /\.ac-surface/,
    );
    console.log(
      `npm archive install, public exports, CSS and SSR passed with React ${version}.`,
    );
  }
  const source = path.join(temporary, "source-consumer");
  await mkdir(source);
  const execution = ["exec", "--yes", `--package=${cli}`, "--", "agentcn-ui"];
  npm(source, [...execution, "init", "--yes"]);
  npm(source, [...execution, "add", "agent-run", "approval-request"]);
  assert.match(
    await readFile(
      path.join(source, "components/agentcn/agent-run.tsx"),
      "utf8",
    ),
    /export function AgentRun/,
  );
  const npxOutput = execFileSync(
    "npx",
    ["--yes", `--package=${cli}`, "agentcn-ui", "list"],
    { cwd: source, env: environment, encoding: "utf8", timeout: 120000 },
  );
  assert.match(npxOutput, /approval-request/);
  console.log(
    "npm exec and npx execute the packaged CLI and install component source.",
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
