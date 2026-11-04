import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { gzipSync } from "node:zlib";

const SEAL = "docs/results/2026/11-04/brief-components-checks-source.json";
const ACTIVE = ".github/workflows/brief-components-checks.yml";
const FILES = ["tests/integration/components.test.mjs", "tests/integration/cli.test.mjs", "tests/integration/brief-components.test.mjs"];
const hash = (data, algorithm = "sha256") => createHash(algorithm).update(data).digest("hex");
const requireThat = (value, code) => { if (!value) throw new Error(code); };
const codeOf = (error) => /^[a-z0-9_]+$/.test(error?.message ?? "") ? error.message : "controller_error";
const sourceCommit = process.argv[3];
requireThat(process.argv.length === 4 && process.argv[2] === "--source-commit" && /^[a-f0-9]{40}$/.test(sourceCommit ?? ""), "source_commit_required");
requireThat(process.env.GITHUB_ACTIONS === "true" && process.env.CI === "true" && process.env.GITHUB_REPOSITORY === "alvarovillalbaa/agentcn-ui"
  && process.env.GITHUB_REF === "refs/heads/main" && ["push", "workflow_dispatch"].includes(process.env.GITHUB_EVENT_NAME)
  && process.env.AGENTCN_PUBLIC_REPOSITORY === "true" && process.platform === "linux", "public_main_ci_required");
requireThat(process.version === "v24.21.0", "node_version_mismatch");
const repo = fs.realpathSync(process.cwd()), parent = fs.realpathSync(process.env.RUNNER_TEMP ?? "");
requireThat(path.isAbsolute(parent) && fs.statSync(parent).isDirectory(), "runner_temp_invalid");
const root = fs.mkdtempSync(path.join(parent, "agentcn-brief-checks-"));
const identity = fs.lstatSync(root), nonce = randomUUID();
fs.writeFileSync(path.join(root, "owner"), nonce, { flag: "wx", mode: 0o600 });
for (const name of ["home", "tools-temp", "fixtures", "npm-cache"]) fs.mkdirSync(path.join(root, name), { mode: 0o700 });
for (const name of ["npm-user", "npm-global"]) fs.writeFileSync(path.join(root, name), "", { flag: "wx", mode: 0o600 });
const env = {
  PATH: process.env.PATH, HOME: path.join(root, "home"), LANG: "C.UTF-8", TZ: "UTC", CI: "true",
  TMPDIR: path.join(root, "tools-temp"), TMP: path.join(root, "tools-temp"), TEMP: path.join(root, "tools-temp"),
  npm_config_userconfig: path.join(root, "npm-user"), npm_config_globalconfig: path.join(root, "npm-global"),
  npm_config_cache: path.join(root, "npm-cache"), npm_config_registry: "https://registry.npmjs.org/",
  npm_config_ignore_scripts: "true", npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false",
};
const report = { schemaVersion: "agentcn.brief-checks.v1", sourceCommit, status: "failed", startedAtUtc: new Date().toISOString(),
  runtime: { node: process.version, platform: process.platform, architecture: process.arch, executableSha256: hash(fs.readFileSync(process.execPath)) },
  scope: { expectedCases: 42, files: FILES }, commands: [], sourceGuards: [], errors: [],
  limits: { workSeconds: 390, cleanupSeconds: 45, jobMinutes: 8, streamBytes: 131072, termToKillSeconds: 3, postKillDrainSeconds: 3, reportBytes: 65536 },
  proofLimits: ["Fixture React/jsdom and disposable CLI checks only; no native browser/modal/touch/IME or accessibility acceptance.",
    "No package publication, live account, model/provider, database, Next website build or hosted acceptance.",
    "Direct child exit/close and original process-group absence are checked. Descendant PIDs or separate sessions are not independently inventoried.",
    "jsdom teardown is the authored test cleanup plus runner termination; windows are not independently instrumented."] };
const workEnd = Date.now() + 390000;
let cleanupEnd = null, interrupted = false, manifest = null;
const handlers = new Map();
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  const handler = () => { interrupted = true; }; handlers.set(signal, handler); process.on(signal, handler);
}
function owner() {
  const stat = fs.lstatSync(root), marker = path.join(root, "owner");
  requireThat(path.dirname(root) === parent && stat.isDirectory() && !stat.isSymbolicLink() && stat.dev === identity.dev && stat.ino === identity.ino
    && !fs.lstatSync(marker).isSymbolicLink() && fs.readFileSync(marker, "utf8") === nonce, "scratch_identity_changed");
}
function clean(value, limit = 2000) {
  let text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
  text = text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  for (const [from, to] of [[root, "[owned-scratch]"], [repo, "[repository]"], [process.env.HOME, "[runner-home]"]])
    if (from) text = text.split(from).join(to);
  return Buffer.from(text).subarray(0, limit).toString("utf8");
}
function groupAbsent(pid) {
  try { process.kill(-pid, 0); return false; } catch (error) { return error.code === "ESRCH" ? true : null; }
}
async function run(label, executable, args, seconds, { cleanup = false, quiet = false, fixture = false, allowFailure = false } = {}) {
  owner(); requireThat(cleanup || !interrupted, "interrupted_before_command");
  const remaining = (cleanup ? cleanupEnd : workEnd) - Date.now();
  requireThat(remaining > 0, "command_deadline_exhausted");
  const commandEnv = { ...env };
  if (fixture) for (const key of ["TMPDIR", "TMP", "TEMP"]) commandEnv[key] = path.join(root, "fixtures");
  const child = spawn(executable, args, { cwd: repo, env: commandEnv, detached: true, stdio: ["ignore", "pipe", "pipe"] });
  const chunks = [[], []], counts = [0, 0], captured = [0, 0], digests = [createHash("sha256"), createHash("sha256")];
  let stop = null, exitCode = null, exitSignal = null, exited = false, closed = false, term = false, killed = false;
  let killTimer, drainTimer, poll, stopNow, stoppedAt = null;
  await new Promise((resolve) => {
    stopNow = (reason) => {
      if (stop) return;
      stop = reason; term = true; stoppedAt = Date.now();
      try { process.kill(-child.pid, "SIGTERM"); } catch {}
      killTimer = setTimeout(() => { killed = true; try { process.kill(-child.pid, "SIGKILL"); } catch {} }, 3000);
      drainTimer = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); resolve(); }, 6000);
    };
    [child.stdout, child.stderr].forEach((stream, i) => stream.on("data", (chunk) => {
      counts[i] += chunk.length; digests[i].update(chunk);
      const part = chunk.subarray(0, Math.max(0, 131072 - captured[i])); chunks[i].push(part); captured[i] += part.length;
      if (counts[i] > 131072) stopNow("output_limit");
    }));
    child.once("error", () => { stop = "spawn_failed"; resolve(); });
    child.once("exit", (code, signal) => { exited = true; exitCode = code; exitSignal = signal; });
    child.once("close", () => { closed = true; resolve(); });
    const started = Date.now();
    poll = setInterval(() => { if (interrupted && !cleanup) stopNow("interrupted"); else if (Date.now() - started >= Math.min(seconds * 1000, remaining)) stopNow("timeout"); }, 25);
  });
  // A closed leader is not proof that its original process group is gone.
  if (child.pid && groupAbsent(child.pid) === false) {
    if (!stop) stopNow("process_group_remaining");
    while (groupAbsent(child.pid) === false && Date.now() < stoppedAt + 6000)
      await new Promise((resolve) => setTimeout(resolve, 25));
  }
  clearInterval(poll); clearTimeout(killTimer); clearTimeout(drainTimer);
  const output = chunks.map((parts) => Buffer.concat(parts));
  const row = { label, arguments: [executable === process.execPath ? "[node]" : executable, ...args.map((arg) => clean(arg, 1000))],
    exitCode, signal: exitSignal, stop, spawned: !!child.pid, exitObserved: exited, closeObserved: closed,
    originalProcessGroupAbsent: child.pid ? groupAbsent(child.pid) : true, termSent: term, killSent: killed,
    streams: output.map((data, i) => ({ stream: i ? "stderr" : "stdout", observedBytes: counts[i], capturedBytes: data.length,
      observedSha256: digests[i].digest("hex"), capturedSha256: hash(data), complete: closed && counts[i] === data.length,
      ...(quiet ? {} : { head: clean(data, 1200), tail: clean(data.subarray(Math.max(0, data.length - 2000)), 2000) }) })) };
  report.commands.push(row);
  const passed = exitCode === 0 && exitSignal === null && stop === null && exited && closed && row.originalProcessGroupAbsent === true;
  requireThat(allowFailure || passed, label + "_failed");
  return { output, row, passed };
}
async function guard(label, cleanup = false) {
  const result = { label, passed: false, changedPaths: [] }; report.sourceGuards.push(result);
  const options = { cleanup, quiet: true };
  const head = (await run(label + "_head", "git", ["rev-parse", "HEAD"], 10, options)).output[0];
  requireThat(head.toString().trim() === sourceCommit, "source_head_changed");
  requireThat(!fs.existsSync(path.join(repo, ACTIVE)), "active_workflow_in_preparation");
  const file = path.join(repo, SEAL), stat = fs.lstatSync(file);
  requireThat(stat.isFile() && !stat.isSymbolicLink() && stat.size <= 1048576, "seal_file_invalid");
  const raw = fs.readFileSync(file);
  const pinned = (await run(label + "_seal", "git", ["show", "HEAD:" + SEAL], 10, options)).output[0];
  requireThat(raw.equals(pinned) && (!report.sealSha256 || report.sealSha256 === hash(raw)), "seal_changed");
  manifest = JSON.parse(raw); report.sealSha256 = hash(raw);
  requireThat(manifest.kind === "agentcn-brief-components-check-source" && manifest.fileCount === 84
    && JSON.stringify(manifest.excludedPrefixes) === '["docs/results/"]' && manifest.files.length === 84, "seal_scope_invalid");
  requireThat(JSON.stringify(manifest.testFiles.map((file) => file.path)) === JSON.stringify(FILES)
    && JSON.stringify(manifest.testFiles.map((file) => file.caseNames.length)) === "[5,9,28]", "case_scope_invalid");
  const indexRaw = (await run(label + "_index", "git", ["ls-files", "--stage", "-z"], 10, options)).output[0];
  const treeRaw = (await run(label + "_tree", "git", ["ls-tree", "-r", "-z", "HEAD"], 10, options)).output[0];
  const allIndex = new Map(), allTree = new Map();
  for (const row of indexRaw.toString().split("\0").filter(Boolean)) {
    const [header, name] = row.split("\t"), [mode, blob, stage] = header.split(" ");
    requireThat(stage === "0", "unmerged_index");
    allIndex.set(name, { mode, blob });
  }
  for (const row of treeRaw.toString().split("\0").filter(Boolean)) {
    const [header, name] = row.split("\t"), [mode, type, blob] = header.split(" ");
    requireThat(type === "blob", "non_blob_source");
    allTree.set(name, { mode, blob });
  }
  result.indexedLeaves = allIndex.size;
  result.changedPaths = [...new Set([...allIndex.keys(), ...allTree.keys()])].filter((name) =>
    allIndex.get(name)?.mode !== allTree.get(name)?.mode || allIndex.get(name)?.blob !== allTree.get(name)?.blob);
  requireThat(allIndex.size === manifest.trackedFileCount && allTree.size === manifest.trackedFileCount && result.changedPaths.length === 0, "complete_index_changed");
  const statusRaw = (await run(label + "_status", "git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], 10, options)).output[0];
  result.statusEntries = statusRaw.toString().split("\0").filter(Boolean).slice(0, 16).map((entry) => clean(entry, 240));
  requireThat(statusRaw.length === 0, "working_tree_not_clean");
  await run(label + "_working", "git", ["-c", "core.filemode=true", "diff", "--no-ext-diff", "--no-textconv", "--exit-code", "HEAD", "--"], 10, options);
  result.fullIndexMatchesHead = true; result.fullWorkingTreeClean = true; result.historicalResultsUnchanged = true;
  const index = new Map([...allIndex].filter(([name]) => !name.startsWith("docs/results/")));
  const tree = new Map([...allTree].filter(([name]) => !name.startsWith("docs/results/")));
  const expected = new Map(manifest.files.map((row) => [row.path, row]));
  result.changedPaths = [...new Set([...expected.keys(), ...index.keys(), ...tree.keys()])]
    .filter((name) => !expected.has(name) || !index.has(name) || !tree.has(name));
  requireThat(expected.size === 84 && index.size === 84 && tree.size === 84 && [...index.keys()].every((name) => expected.has(name)), "source_path_set_changed");
  let total = 0;
  for (const [name, row] of expected) {
    requireThat(typeof name === "string" && name !== "" && !path.isAbsolute(name) && !name.split("/").some((part) => ["", ".", ".."].includes(part)), "source_path_invalid");
    let stat;
    try { stat = fs.lstatSync(path.join(repo, name)); }
    catch { result.changedPaths.push(name); continue; }
    requireThat(stat.isFile() && !stat.isSymbolicLink(), "source_type_changed");
    const mode = stat.mode & 0o111 ? "100755" : "100644", data = fs.readFileSync(path.join(repo, name));
    const blob = hash(Buffer.concat([Buffer.from("blob " + data.length + "\0"), data]), "sha1");
    if (mode !== row.mode || data.length !== row.bytes || hash(data) !== row.sha256 || blob !== row.gitBlob
      || index.get(name)?.mode !== row.mode || index.get(name)?.blob !== row.gitBlob
      || tree.get(name)?.mode !== row.mode || tree.get(name)?.blob !== row.gitBlob) result.changedPaths.push(name);
    total += data.length;
  }
  result.files = expected.size; result.totalBytes = total; result.sealSha256 = hash(raw);
  requireThat(result.changedPaths.length === 0 && total === manifest.totalBytes, "source_fingerprint_changed");
  result.passed = true;
}
function parseTap(data) {
  const compressed = gzipSync(data);
  report.tap = { raw: { encoding: "gzip-base64", bytes: data.length, sha256: hash(data), compressedBytes: compressed.length } };
  requireThat(compressed.length <= 16384, "tap_evidence_too_large");
  report.tap.raw.data = compressed.toString("base64");
  const text = new TextDecoder("utf-8", { fatal: true }).decode(data), cases = [];
  for (const line of text.split("\n")) {
    const match = /^(ok|not ok) ([1-9][0-9]*) - (.*)$/.exec(line);
    if (!match) continue;
    const directive = / # (SKIP|TODO)(?: .*|$)/i.exec(match[3]);
    cases.push({ number: Number(match[2]), name: directive ? match[3].slice(0, directive.index) : match[3], status: match[1], directive: directive?.[1]?.toUpperCase() ?? null });
  }
  const totals = {};
  for (const key of ["tests", "suites", "pass", "fail", "cancelled", "skipped", "todo"]) {
    const matches = [...text.matchAll(new RegExp("^# " + key + " ([0-9]+)$", "gm"))];
    totals[key] = matches.length === 1 ? Number(matches[0][1]) : null;
  }
  const expected = manifest.testFiles.flatMap((file) => file.caseNames), names = cases.map((row) => row.name);
  Object.assign(report.tap, { cases, totals, exactNameSet: cases.length === 42 && new Set(names).size === 42 && expected.length === 42 && new Set(expected).size === 42
    && names.every((name) => expected.includes(name)), orderingRequired: false });
  requireThat(report.tap.exactNameSet && cases.every((row) => row.status === "ok" && row.directive === null)
    && /^1\.\.42$/m.test(text) && JSON.stringify(totals) === '{"tests":42,"suites":0,"pass":42,"fail":0,"cancelled":0,"skipped":0,"todo":0}', "tap_acceptance_failed");
}
try {
  await guard("before");
  const npmCli = fs.realpathSync(path.join(path.dirname(process.execPath), "npm"));
  report.runtime.npmCliSha256 = hash(fs.readFileSync(npmCli));
  report.runtime.npm = (await run("npm_version", process.execPath, [npmCli, "--version"], 10)).output[0].toString().trim();
  const lock = JSON.parse(fs.readFileSync(path.join(repo, "package-lock.json"), "utf8"));
  requireThat(Object.values(lock.packages).every((entry) => !entry.resolved || entry.link || new URL(entry.resolved).origin === "https://registry.npmjs.org"), "lock_registry_unexpected");
  await run("install", process.execPath, [npmCli, "ci", "--ignore-scripts", "--no-audit", "--no-fund"], 180);
  await run("library_and_generator", process.execPath, [npmCli, "run", "build:library"], 90);
  await run("source_check", process.execPath, [npmCli, "run", "check:source"], 45);
  await guard("after_build");
  const tests = await run("tests", process.execPath, ["--test", "--test-reporter=tap", "--test-concurrency=1", "--test-timeout=10000", ...FILES], 120, { fixture: true, allowFailure: true });
  parseTap(tests.output[0]);
  requireThat(tests.passed, "tests_failed");
} catch (error) { report.errors.push(codeOf(error)); }
finally {
  cleanupEnd = Date.now() + 45000;
  try { await guard("after", true); } catch (error) { report.errors.push(codeOf(error)); }
  try {
    owner();
    const entries = fs.readdirSync(path.join(root, "fixtures"));
    report.fixtures = { remainingEntries: entries.slice(0, 16).map((name) => clean(name, 160)), remainingCount: entries.length, passed: entries.length === 0 };
    requireThat(entries.length === 0, "fixture_cleanup_incomplete");
  } catch (error) { report.errors.push(codeOf(error)); }
  try {
    owner();
    requireThat(report.commands.every((row) => !row.spawned || (row.exitObserved && row.closeObserved && row.originalProcessGroupAbsent === true)), "process_cleanup_unverified");
    let timer;
    try {
      await Promise.race([fs.promises.rm(root, { recursive: true, force: false, maxRetries: 0 }),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("scratch_cleanup_timeout")), Math.max(1, cleanupEnd - Date.now())); })]);
    } finally { clearTimeout(timer); }
    requireThat(!fs.existsSync(root), "scratch_still_present"); report.scratchCleanup = "passed";
  } catch (error) { report.scratchCleanup = "failed"; report.errors.push(codeOf(error)); }
  if (interrupted) report.errors.push("interrupted");
  for (const [signal, handler] of handlers) process.off(signal, handler);
}
report.completedAtUtc = new Date().toISOString(); report.interrupted = interrupted;
report.status = report.errors.length === 0 && report.tap?.exactNameSet && report.fixtures?.passed && report.scratchCleanup === "passed" ? "passed" : "failed";
let output = JSON.stringify(report);
if (Buffer.byteLength(output) > 65536) {
  report.errors.push("report_bound_exceeded"); report.status = "failed";
  for (const row of report.commands) for (const stream of row.streams) { delete stream.head; delete stream.tail; }
  output = JSON.stringify(report);
}
requireThat(Buffer.byteLength(output) <= 65536, "report_bound_exceeded");
process.stdout.write(output + "\n", () => process.exit(report.status === "passed" ? 0 : 1));
