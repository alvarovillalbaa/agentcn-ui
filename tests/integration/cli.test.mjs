// Data tier T1: local disposable files only. No network or external service calls.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtemp,
  readFile,
  writeFile,
  readdir,
  symlink,
  mkdir,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, presets } from "../../catalog.mjs";
const cli = fileURLToPath(
  new URL("../../packages/cli/bin/agentcn.mjs", import.meta.url),
);
const run = (cwd, ...args) =>
  execFileSync(process.execPath, [cli, ...args, "--cwd", cwd], {
    encoding: "utf8",
  });
const fail = (cwd, ...args) =>
  spawnSync(process.execPath, [cli, ...args, "--cwd", cwd], {
    encoding: "utf8",
  });
async function project(t) {
  const dir = await mkdtemp(path.join(tmpdir(), "agentcn-test-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test("init/add apply configuration, install all source, and are idempotent", async (t) => {
  const dir = await project(t);
  run(
    dir,
    "init",
    "--yes",
    "--palette",
    "indigo",
    "--radius",
    "soft",
    "--density",
    "compact",
  );
  const config = JSON.parse(
    await readFile(path.join(dir, "agentcn.json"), "utf8"),
  );
  assert.equal(config.palette, "indigo");
  run(dir, "add", "--all");
  const files = await readdir(path.join(dir, "components/agentcn"));
  assert.equal(files.length, catalog.length + 1);
  assert.match(
    await readFile(path.join(dir, config.css), "utf8"),
    /--ac-radius: 20px; --ac-space: 14px/,
  );
  assert.match(run(dir, "add", "agent-run"), /unchanged/);
  assert.match(
    await readFile(path.join(dir, "components/agentcn/agent-run.tsx"), "utf8"),
    /from "\.\/_shared"/,
  );
});

test("dry run does not create files", async (t) => {
  const dir = await project(t);
  run(dir, "init", "--yes", "--dry-run");
  assert.deepEqual(await readdir(dir), []);
  run(dir, "create", "demo", "--yes", "--dry-run");
  assert.deepEqual(await readdir(dir), []);
});

test("conflicting files fail before writing other components; overwrite is explicit", async (t) => {
  const dir = await project(t);
  run(dir, "init", "--yes");
  run(dir, "add", "tool-call");
  const filename = path.join(dir, "components/agentcn/tool-call.tsx");
  await writeFile(filename, "user changes\n");
  const result = fail(dir, "add", "agent-run", "tool-call");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Existing file differs/);
  assert.deepEqual((await readdir(path.dirname(filename))).sort(), [
    "_shared.tsx",
    "tool-call.tsx",
  ]);
  assert.equal(await readFile(filename, "utf8"), "user changes\n");
  run(dir, "add", "tool-call", "--overwrite");
  assert.match(await readFile(filename, "utf8"), /export function ToolCall/);
});

test("unknown component leaves initialized project untouched", async (t) => {
  const dir = await project(t);
  run(dir, "init", "--yes");
  const result = fail(dir, "add", "agent-run", "../../bad");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown component/);
  assert.deepEqual((await readdir(dir)).sort(), ["agentcn.json", "styles"]);
});

test("configuration rejects traversal and symlink destinations", async (t) => {
  const dir = await project(t);
  const outside = await project(t);
  run(dir, "init", "--yes");
  const config = JSON.parse(
    await readFile(path.join(dir, "agentcn.json"), "utf8"),
  );
  await writeFile(
    path.join(dir, "agentcn.json"),
    JSON.stringify({ ...config, components: "../escape" }),
  );
  assert.match(fail(dir, "add", "agent-run").stderr, /Invalid components path/);
  await writeFile(path.join(dir, "agentcn.json"), JSON.stringify(config));
  await mkdir(path.join(dir, "components"));
  await symlink(outside, path.join(dir, "components/agentcn"));
  assert.match(
    fail(dir, "add", "agent-run", "--overwrite").stderr,
    /Refusing symlink/,
  );
  assert.deepEqual(await readdir(outside), []);
});

for (const preset of Object.keys(presets))
  test(`create ${preset} produces a Next.js starter with its source`, async (t) => {
    const dir = await project(t);
    run(dir, "create", "my-agent", "--yes", "--preset", preset);
    const app = path.join(dir, "my-agent");
    const manifest = JSON.parse(
      await readFile(path.join(app, "package.json"), "utf8"),
    );
    assert.equal(manifest.dependencies.next, "16.4.1");
    assert.equal(manifest.scripts.dev, "next dev");
    const files = await readdir(path.join(app, "components/agentcn"));
    for (const name of presets[preset])
      assert.ok(files.includes(`${name}.tsx`));
    assert.match(
      await readFile(path.join(app, "app/layout.tsx"), "utf8"),
      /\.\.\/styles\/agentcn.css/,
    );
    assert.match(
      fail(dir, "create", "my-agent", "--yes").stderr,
      /already exists/,
    );
  });

test("list exposes all shipped registry names", async (t) => {
  const dir = await project(t);
  const output = run(dir, "list");
  for (const item of catalog) assert.ok(output.includes(item.name));
});
