// T1 installed archives + T2 authored jsdom consumers. Remote owned CI only.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { catalog } from '../../catalog.mjs';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const archives = process.env.AGENTCN_RELEASE_ARCHIVES;
const output = process.env.AGENTCN_RELEASE_OUTPUT;
const work = process.env.AGENTCN_RELEASE_WORK ?? path.join(process.env.TMPDIR ?? '', 'agentcn-release-consumers');
const pnpmBin = process.env.AGENTCN_RELEASE_PNPM_BIN;
const started = Date.now(), deadline = started + 445000;
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const profiles = [
  { key: 'react18', react: '18.2.0', reactTypes: '18.3.27', reactDomTypes: '18.3.7' },
  { key: 'react19', react: '19.3.1', reactTypes: '19.2.14', reactDomTypes: '19.2.3' },
];
const profileIds = ['exports-types-css', 'new-four-ssr', 'multi-input', 'member-picker', 'creatable-select', 'pricing-table', 'typescript'];
const ids = profiles.flatMap((profile) => profileIds.map((id) => `${profile.key}-${id}`)).concat(['cli-npm-exec-all20', 'cli-npx-all20', 'cli-pnpm-dlx-all20']);
const report = { schemaVersion: 1, sourceCommit: process.env.SOURCE_COMMIT ?? null, version: null, startedAt: new Date(started).toISOString(),
  cases: ids.map((id) => ({ id, status: 'unrun' })), archives: [], profiles: [], cli: [], commands: [], passed: false,
  cleanup: { directChildrenReaped: false, allCommandCapturesComplete: false, childSignalsAbsent: false, workRemoval: 'owned-by-supervisor' },
  proofLimits: ['Local npm-generated archive installs are not public registry package-name installs or a published 0.2.0 release.', 'Only the four new components receive SSR and controlled jsdom interactions; all twenty receive root/subpath/declaration/type/source checks.', 'The jsdom dialog shim does not prove native browser modality, focus, touch, IME or accessibility. The closed 42-case and eight-browser packets are not invoked.', 'Child stdout/stderr and consumer lock/tree originals are retained; the outer supervisor owns process-group and final scratch-removal verification.'] };
let currentCase;
let retainedOriginalCharacters = 0;
const environment = {};
for (const key of ['PATH', 'HOME', 'USER', 'LOGNAME', 'LANG', 'LC_ALL', 'TZ', 'TMPDIR', 'TMP', 'TEMP', 'CI', 'XDG_CONFIG_HOME', 'XDG_CACHE_HOME', 'XDG_DATA_HOME', 'XDG_STATE_HOME', 'PNPM_HOME', 'AGENTCN_RELEASE_ROOT', 'AGENTCN_RELEASE_NONCE']) if (process.env[key] !== undefined) environment[key] = process.env[key];
for (const key of ['userconfig', 'globalconfig', 'cache']) {
  const value = process.env[`npm_config_${key}`] ?? process.env[`NPM_CONFIG_${key.toUpperCase()}`];
  if (value !== undefined) environment[`npm_config_${key}`] = value;
}
Object.assign(environment, { npm_config_registry: 'https://registry.npmjs.org/', npm_config_ignore_scripts: 'true', npm_config_fetch_retries: '0', npm_config_fetch_timeout: '15000', npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false', npm_config_progress: 'false' });

function packed(bytes, complete = true) {
  const data = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes ?? '');
  const zipped = gzipSync(data, { level: 9, mtime: 0 });
  const dataBase64 = zipped.toString('base64'); retainedOriginalCharacters += dataBase64.length;
  return { bytes: data.length, sha256: sha(data), gzipBytes: zipped.length, dataBase64, complete };
}
// Check after attachment so the final receipt preserves the original that crossed the cap.
function captureBudget() { assert.ok(retainedOriginalCharacters <= 1024 * 1024, 'Consumer original-capture budget reached'); }
function run(label, executable, args, cwd, limit = 45000) {
  const remaining = deadline - Date.now(); assert.ok(remaining > 1000, 'Consumer work deadline reached');
  const timeout = Math.min(limit, remaining);
  const began = Date.now();
  const result = spawnSync(executable, args, { cwd, env: environment, input: undefined, stdio: ['ignore', 'pipe', 'pipe'], timeout, maxBuffer: 128 * 1024, killSignal: 'SIGTERM' });
  const complete = !result.error && result.status !== null && result.signal === null;
  const row = { label, executable, args, startedAt: new Date(began).toISOString(), finishedAt: new Date().toISOString(), timeoutMs: timeout,
    status: result.status, signal: result.signal, errorCode: result.error?.code ?? null, reaped: result.status !== null || result.signal !== null, complete,
    stdout: packed(result.stdout, complete), stderr: packed(result.stderr, complete) };
  report.commands.push(row);
  captureBudget();
  return { row, stdout: result.stdout ?? Buffer.alloc(0), stderr: result.stderr ?? Buffer.alloc(0) };
}
function zero(result) { assert.ok(result.row.complete && result.row.reaped && result.row.status === 0 && result.row.signal === null, `${result.row.label} failed (${result.row.status ?? result.row.errorCode ?? result.row.signal})`); }
function mark(id, status) { const row = report.cases.find((entry) => entry.id === id); assert.ok(row); row.status = status; }
function parseConsumer(result) {
  const lines = result.stdout.toString('utf8').split(/\r?\n/).filter((line) => line.startsWith('AGENTCN_CONSUMER_RESULT='));
  assert.equal(lines.length, 1, 'Exactly one installed-consumer JSON result is required');
  return JSON.parse(lines[0].slice('AGENTCN_CONSUMER_RESULT='.length));
}
async function directory(name, create = false) {
  assert.ok(name && path.isAbsolute(name));
  if (create) await mkdir(name, { mode: 0o700 }).catch((error) => { if (error.code !== 'EEXIST') throw error; });
  const stat = await lstat(name); assert.ok(stat.isDirectory() && !stat.isSymbolicLink() && stat.uid === process.getuid());
  assert.equal(await realpath(name), name);
}
function contained(root, target) { const relative = path.relative(root, target); assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative)); }
async function jsonFile(name, value) { await writeFile(name, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx', mode: 0o600 }); }
async function original(name) { const bytes = await readFile(name); assert.ok(bytes.length <= 512 * 1024, 'Consumer metadata original exceeds its bound'); return packed(bytes); }

async function verifyCli(project, installedCli, mode) {
  const config = JSON.parse(await readFile(path.join(project, 'agentcn.json'), 'utf8'));
  assert.equal(config.version, 1); assert.equal(config.palette, 'forest');
  assert.equal(config.radius, 'rounded'); assert.equal(config.density, 'comfortable');
  assert.equal(config.components, 'components/agentcn'); assert.equal(config.css, 'styles/agentcn.css');
  const { palettes } = JSON.parse(await readFile(path.join(installedCli, 'registry/catalog.json'), 'utf8'));
  const palette = palettes.forest;
  const suffix = `\n/* agentcn-ui configuration */\n:root, .ac-theme { --ac-accent: ${palette.accent}; --ac-accent-fg: ${palette.foreground}; --ac-radius: 12px; --ac-space: 20px; }\n.dark, [data-ac-theme="dark"] { --ac-accent: ${palette.dark}; --ac-accent-fg: ${palette.darkForeground}; }\n`;
  const targets = []; let css;
  for (const item of catalog) {
    const entry = JSON.parse(await readFile(path.join(installedCli, 'registry', `${item.name}.json`), 'utf8'));
    assert.equal(entry.name, item.name);
    const files = [];
    for (const source of entry.files) {
      assert.ok(typeof source.path === 'string' && !path.isAbsolute(source.path) && !source.path.split('/').some((part) => part === '' || part === '.' || part === '..') && !source.path.includes('\\'));
      const relative = source.path.endsWith('.css') ? config.css : `${config.components}/${source.path}`;
      const target = path.resolve(project, relative); contained(project, target);
      const bytes = await readFile(target);
      if (source.path.endsWith('.css')) { assert.deepEqual(bytes, Buffer.from(source.content + suffix)); css = { path: relative, bytes: bytes.length, sha256: sha(bytes) }; }
      else assert.equal(bytes.toString(), source.content, `Actual ${mode} source ${relative} must equal the packaged registry`);
      files.push({ path: relative, bytes: bytes.length, sha256: sha(bytes) });
    }
    assert.ok(files.some((file) => file.path.endsWith(`/${item.name}.tsx`)));
    targets.push({ name: item.name, files });
  }
  assert.equal(targets.length, 20); assert.ok(css);
  return { mode, archiveInvocation: true, publicPackageNameInstall: false, targets, css, config: await original(path.join(project, 'agentcn.json')) };
}

try {
  assert.equal(process.version, 'v24.22.2');
  assert.match(report.sourceCommit ?? '', /^[a-f0-9]{40}$/);
  await directory(archives); await directory(output); await directory(work, true);
  assert.equal((await readdir(work)).length, 0, 'Consumer scratch must start empty');
  for (const key of ['npm_config_userconfig', 'npm_config_globalconfig', 'npm_config_cache', 'TMPDIR']) {
    assert.ok(environment[key] && path.isAbsolute(environment[key]), `Explicit owned ${key} is required`);
    contained(path.dirname(work), environment[key]);
  }
  assert.ok(environment.HOME, 'Original HOME must remain available');
  assert.ok(pnpmBin && path.isAbsolute(pnpmBin)); contained(path.dirname(work), pnpmBin);
  const libraryManifest = JSON.parse(await readFile(path.join(repository, 'packages/react/package.json'), 'utf8'));
  const cliManifest = JSON.parse(await readFile(path.join(repository, 'packages/cli/package.json'), 'utf8'));
  assert.equal(libraryManifest.version, cliManifest.version); assert.equal(libraryManifest.version, '0.2.0'); report.version = libraryManifest.version;
  assert.equal(catalog.length, 20); assert.equal(new Set(catalog.map((item) => item.name)).size, 20);
  const archiveName = (manifest) => `${manifest.name.replace(/^@/, '').replaceAll('/', '-')}-${manifest.version}.tgz`;
  const libraryArchive = path.join(archives, archiveName(libraryManifest)); const cliArchive = path.join(archives, archiveName(cliManifest));
  for (const name of [libraryArchive, cliArchive]) {
    const stat = await lstat(name); assert.ok(stat.isFile() && !stat.isSymbolicLink() && stat.uid === process.getuid() && stat.size <= 8 * 1024 * 1024);
    const bytes = await readFile(name); report.archives.push({ name: path.basename(name), bytes: bytes.length, sha256: sha(bytes), integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}` });
  }
  zero(run('npm-version', 'npm', ['--version'], work));
  const pnpm = run('pnpm-version', process.execPath, [pnpmBin, '--version'], work); zero(pnpm); assert.equal(pnpm.stdout.toString().trim(), '10.18.3');
  for (const profile of profiles) {
    const consumer = path.join(work, profile.key); await mkdir(consumer, { mode: 0o700 });
    const row = { ...profile, status: 'running' }; report.profiles.push(row);
    await jsonFile(path.join(consumer, 'package.json'), { name: `agentcn-${profile.key}-archive-consumer`, private: true, type: 'module', dependencies: {
      [libraryManifest.name]: `file:${libraryArchive}`, [cliManifest.name]: `file:${cliArchive}`, react: profile.react, 'react-dom': profile.react, jsdom: '27.4.0', typescript: '5.9.3', '@types/react': profile.reactTypes, '@types/react-dom': profile.reactDomTypes } });
    zero(run(`${profile.key}-install`, 'npm', ['install', '--ignore-scripts', '--omit=optional', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org/'], consumer, 90000));
    row.lockOriginal = await original(path.join(consumer, 'package-lock.json'));
    captureBudget();
    const lock = JSON.parse((await readFile(path.join(consumer, 'package-lock.json'))).toString());
    for (const [name, archive] of [[libraryManifest.name, libraryArchive], [cliManifest.name, cliArchive]]) {
      const installed = JSON.parse(await readFile(path.join(consumer, 'node_modules', name, 'package.json'), 'utf8'));
      const entry = lock.packages[`node_modules/${name}`]; assert.equal(installed.version, report.version); assert.equal(entry.version, report.version);
      assert.equal(entry.integrity, report.archives.find((item) => item.name === path.basename(archive)).integrity);
      assert.ok(entry.resolved.startsWith('file:')); assert.equal(await realpath(path.resolve(consumer, entry.resolved.slice(5))), archive);
    }
    const tree = run(`${profile.key}-installed-tree`, 'npm', ['ls', '--all', '--json'], consumer); zero(tree); row.installedTreeOriginal = packed(tree.stdout); captureBudget(); JSON.parse(tree.stdout.toString());
    await jsonFile(path.join(consumer, 'consumer-spec.json'), { version: report.version, react: profile.react, catalog: catalog.map(({ name, component }) => ({ name, component })) });
    for (const name of ['consumer-exports.mjs', 'consumer-dom.mjs', 'consumer-types.tsx']) await copyFile(path.join(repository, 'tests/smoke', name), path.join(consumer, name));
    const exported = run(`${profile.key}-exports-ssr`, process.execPath, ['consumer-exports.mjs'], consumer, 30000); row.exportsAndSsr = parseConsumer(exported); zero(exported); assert.equal(row.exportsAndSsr.passed, true);
    assert.deepEqual(row.exportsAndSsr.cases.map((entry) => entry.id), ['exports-types-css', 'new-four-ssr']);
    for (const item of row.exportsAndSsr.cases) { assert.equal(item.status, 'passed'); mark(`${profile.key}-${item.id}`, 'passed'); }
    const interacted = run(`${profile.key}-dom`, process.execPath, ['consumer-dom.mjs'], consumer, 30000); row.dom = parseConsumer(interacted); zero(interacted); assert.equal(row.dom.passed, true);
    assert.deepEqual(row.dom.cases.map((entry) => entry.id), ['installed-multi-input', 'installed-member-picker', 'installed-creatable-select', 'installed-pricing-table']);
    for (const item of row.dom.cases) { assert.equal(item.status, 'passed'); mark(`${profile.key}-${item.id.replace('installed-', '')}`, 'passed'); }
    await jsonFile(path.join(consumer, 'tsconfig.json'), { compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'NodeNext', moduleResolution: 'NodeNext', jsx: 'react-jsx', strict: true, skipLibCheck: false, noEmit: true, types: ['react', 'react-dom'] }, files: ['consumer-types.tsx'] });
    currentCase = `${profile.key}-typescript`;
    zero(run(`${profile.key}-typescript`, process.execPath, [path.join(consumer, 'node_modules/typescript/bin/tsc'), '--project', 'tsconfig.json'], consumer, 30000));
    row.typecheck = { commandLabel: `${profile.key}-typescript`, typescript: '5.9.3', reactTypes: profile.reactTypes, reactDomTypes: profile.reactDomTypes, skipLibCheck: false, rootReferences: 20, subpathReferences: 20, newComponentJsx: 4 };
    mark(currentCase, 'passed'); currentCase = undefined; row.status = 'passed';
  }
  const installedCli = path.join(work, 'react18/node_modules/agentcn-ui');
  const cliModes = [
    ['npm-exec', 'npm', ['exec', '--yes', `--package=${cliArchive}`, '--', 'agentcn-ui']],
    ['npx', 'npx', ['--yes', `--package=${cliArchive}`, 'agentcn-ui']],
    ['pnpm-dlx', process.execPath, [pnpmBin, `--config.store-dir=${path.join(work, 'pnpm-store')}`, 'dlx', cliArchive]],
  ];
  for (const [mode, executable, prefix] of cliModes) {
    currentCase = `cli-${mode}-all20`;
    const project = path.join(work, `cli-${mode}`); await mkdir(project, { mode: 0o700 });
    const unrelated = Buffer.from('Authored unrelated project file.\n');
    await writeFile(path.join(project, 'unrelated.txt'), unrelated, { flag: 'wx', mode: 0o600 });
    let discovery;
    if (mode === 'npm-exec') {
      const help = run(`${mode}-help`, executable, [...prefix, '--help'], project); zero(help);
      for (const word of ['init', 'add', 'create', 'list', '--overwrite', '--dry-run']) assert.ok(help.stdout.toString().includes(word));
      const listed = run(`${mode}-list`, executable, [...prefix, 'list'], project); zero(listed);
      const names = listed.stdout.toString().trim().split(/\r?\n/).map((line) => line.trim().split(/\s+/)[0]);
      assert.deepEqual(names, catalog.map((item) => item.name));
      discovery = { helpCommandLabel: `${mode}-help`, listCommandLabel: `${mode}-list`, names };
    }
    zero(run(`${mode}-init`, executable, [...prefix, 'init', '--yes'], project, 45000));
    zero(run(`${mode}-all20`, executable, [...prefix, 'add', '--all'], project, 45000));
    const version = run(`${mode}-version`, executable, [...prefix, '--version'], project, 45000); zero(version); assert.equal(version.stdout.toString().trim(), report.version);
    assert.deepEqual(await readFile(path.join(project, 'unrelated.txt')), unrelated);
    const checked = await verifyCli(project, installedCli, mode);
    checked.unrelatedFile = { bytes: unrelated.length, sha256: sha(unrelated), preserved: true };
    if (discovery) checked.discovery = discovery;
    report.cli.push(checked); captureBudget(); mark(currentCase, 'passed'); currentCase = undefined;
  }
  for (const item of report.archives) { const bytes = await readFile(path.join(archives, item.name)); assert.equal(bytes.length, item.bytes); assert.equal(sha(bytes), item.sha256); item.unchanged = true; }
  report.cleanup.directChildrenReaped = report.commands.every((row) => row.reaped);
  report.cleanup.allCommandCapturesComplete = report.commands.every((row) => row.complete);
  report.cleanup.childSignalsAbsent = report.commands.every((row) => row.signal === null);
  report.passed = report.cases.length === 17 && report.cases.every((row) => row.status === 'passed') && report.cleanup.directChildrenReaped && report.cleanup.allCommandCapturesComplete && report.cleanup.childSignalsAbsent;
} catch (error) {
  if (currentCase) mark(currentCase, 'failed');
  report.error = String(error?.stack ?? error).slice(0, 10000);
} finally {
  report.finishedAt = new Date().toISOString();
  const bytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`); assert.ok(bytes.length <= 2 * 1024 * 1024, 'Smoke receipt exceeds its bound');
  await writeFile(path.join(output, 'smoke.json'), bytes, { flag: 'wx', mode: 0o600 });
  console.log(`AGENTCN_RELEASE_SMOKE_RESULT=${JSON.stringify({ schemaVersion: report.schemaVersion, sourceCommit: report.sourceCommit, version: report.version, passed: report.passed, cases: report.cases, receiptBytes: bytes.length, receiptSha256: sha(bytes) })}`);
  process.exitCode = report.passed ? 0 : 1;
}
