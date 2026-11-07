// Owned package preparation, not npm publication or a replay of component/browser QA.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';

const ACTIVE = '.github/workflows/package-release-checks.yml';
const COMPONENTS = ['agent-run', 'tool-call', 'approval-request', 'context-window', 'token-usage', 'source-stack', 'memory-panel', 'artifact-panel', 'plan-review', 'agent-handoff', 'model-router', 'prompt-composer', 'branch-picker', 'eval-scorecard', 'checkpoint', 'stream-status', 'multi-input', 'member-picker', 'creatable-select', 'pricing-table'];
const PACKAGE_NAMES = ['@alvarovillalbaa/agentcn-ui', 'agentcn-ui'];
const STREAM = 262144, PROOF = 4194304;
const sha = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const need = (condition, code) => { if (!condition) throw new Error(code); };
const finite = error => /^[a-z0-9_]+$/.test(error?.message ?? '') ? error.message : 'controller_error';
const sourceCommit = process.argv[3];
need(process.argv.length === 4 && process.argv[2] === '--source-commit' && /^[a-f0-9]{40}$/.test(sourceCommit ?? ''), 'source_pin_required');
need(process.platform === 'linux' && process.version === 'v24.22.2' && process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true'
  && process.env.GITHUB_REPOSITORY === 'alvarovillalbaa/agentcn-ui' && process.env.GITHUB_REF === 'refs/heads/main'
  && process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' && process.env.AGENTCN_PUBLIC_REPOSITORY === 'true', 'approved_public_main_ci_required');
const jobStart = Number(process.env.AGENTCN_RELEASE_JOB_STARTED_MS);
need(Number.isSafeInteger(jobStart) && jobStart <= Date.now() && jobStart > Date.now() - 300000, 'job_start_invalid');
const workEnd = Math.min(Date.now() + 1020000, jobStart + 1200000 - 90000 - 30000);
const repo = fs.realpathSync(process.cwd()), parent = fs.realpathSync(process.env.RUNNER_TEMP ?? '');
const root = fs.mkdtempSync(path.join(parent, 'agentcn-package-')); fs.chmodSync(root, 0o700);
const rootIdentity = fs.lstatSync(root), nonce = randomBytes(16).toString('hex');
fs.writeFileSync(path.join(root, '.owner'), nonce, { flag: 'wx', mode: 0o600 });
for (const dir of ['source', 'archives', 'output', 'consumers', 'tools', 'tmp', 'cache', 'config', 'data', 'state']) fs.mkdirSync(path.join(root, dir), { mode: 0o700 });
for (const name of ['npm-user', 'npm-global']) fs.writeFileSync(path.join(root, name), '', { flag: 'wx', mode: 0o600 });
const source = path.join(root, 'source'), archives = path.join(root, 'archives'), output = path.join(root, 'output');
const env = { PATH: `${path.dirname(process.execPath)}:/usr/bin:/bin`, HOME: process.env.HOME, LANG: 'C.UTF-8', TZ: 'UTC', CI: 'true', NO_COLOR: '1',
  TMPDIR: path.join(root, 'tmp'), TMP: path.join(root, 'tmp'), TEMP: path.join(root, 'tmp'),
  XDG_CACHE_HOME: path.join(root, 'cache'), XDG_CONFIG_HOME: path.join(root, 'config'), XDG_DATA_HOME: path.join(root, 'data'), XDG_STATE_HOME: path.join(root, 'state'),
  npm_config_cache: path.join(root, 'cache', 'npm'), npm_config_userconfig: path.join(root, 'npm-user'), npm_config_globalconfig: path.join(root, 'npm-global'),
  npm_config_registry: 'https://registry.npmjs.org/', npm_config_ignore_scripts: 'true', npm_config_audit: 'false', npm_config_fund: 'false',
  npm_config_fetch_retries: '0', npm_config_fetch_timeout: '15000', npm_config_update_notifier: 'false',
  GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0',
  AGENTCN_RELEASE_ROOT: root, AGENTCN_RELEASE_NONCE: nonce, AGENTCN_RELEASE_ARCHIVES: archives,
  AGENTCN_RELEASE_OUTPUT: output, AGENTCN_RELEASE_WORK: path.join(root, 'consumers'), SOURCE_COMMIT: sourceCommit };
const report = { schemaVersion: 'agentcn.package-preparation.v1', sourceCommit, status: 'failed', startedAt: new Date().toISOString(),
  runtime: { node: process.version, executableSha256: sha(fs.readFileSync(process.execPath)), platform: process.platform, architecture: process.arch },
  limits: { jobSeconds: 1200, workMaximumSeconds: 1020, cleanupSeconds: 90, marginSeconds: 30, streamBytes: STREAM, emittedGzipBytes: PROOF, termGraceSeconds: 5, killDrainSeconds: 5 },
  timing: { jobStartedMs: jobStart, admittedAtMs: Date.now(), workEndMs: workEnd }, commands: [], sourceGuards: [], archives: [], registry: [], errors: [],
  cleanup: { passed: false, rootRemoved: false, ownedProcessesRemaining: null, uncertain: false, processes: [] },
  proofLimits: ['Candidate archives and authored disposable React consumers only; no publication, authentication, model/provider, website build or hosted/browser QA.',
    'The old 42 cases and eight hosted browser cases are not repeated. Archive-path npm/npx/pnpm consumers do not prove installation of a public 0.2.0 version.',
    'Only the active temporary workflow is omitted from an exact tracked-source export. Dependencies and generated ignored outputs live only in owned scratch.',
    'Public npm metadata observes names/version availability; it is not npm ownership, authentication or publication authority.',
    'Process evidence covers direct children/groups plus same-UID processes carrying the unique owned-root/nonce environment. This is not a host-wide network or process sandbox.'] };
const commands = new Set(), evidence = [], observed = new Map();
let baseline, cleanupEnd, interrupted = false, evidenceBytes = 0;
function owner() {
  const s = fs.lstatSync(root), marker = fs.lstatSync(path.join(root, '.owner'));
  need(s.isDirectory() && !s.isSymbolicLink() && s.dev === rootIdentity.dev && s.ino === rootIdentity.ino && s.uid === process.getuid() && (s.mode & 0o777) === 0o700
    && marker.isFile() && !marker.isSymbolicLink() && marker.uid === process.getuid() && (marker.mode & 0o777) === 0o600
    && fs.readFileSync(path.join(root, '.owner'), 'utf8') === nonce, 'owned_root_changed');
}
function read(file, cap = 16777216) {
  const a = fs.lstatSync(file); need(a.isFile() && !a.isSymbolicLink() && a.size <= cap, 'file_type_or_bound');
  const b = fs.readFileSync(file), c = fs.lstatSync(file);
  need(a.dev === c.dev && a.ino === c.ino && a.size === c.size && a.mtimeMs === c.mtimeMs && a.ctimeMs === c.ctimeMs && b.length === a.size, 'file_changed'); return b;
}
function retain(name, bytes) {
  need(/^[a-z0-9][a-z0-9._-]{0,150}$/.test(name) && bytes.length <= 2097152, 'evidence_file_bound');
  const packed = gzipSync(bytes, { level: 9, mtime: 0 }); evidenceBytes += packed.length;
  need(evidenceBytes <= PROOF, 'evidence_total_bound');
  evidence.push({ name, bytes: bytes.length, sha256: sha(bytes), gzipBytes: packed.length, packed });
}
function groupAbsent(pgid) { try { process.kill(-pgid, 0); return false; } catch (e) { return e.code === 'ESRCH' ? true : null; } }
function proc(pid) {
  const base = `/proc/${pid}`, s = fs.statSync(base); if (s.uid !== process.getuid()) return null;
  const a = fs.readFileSync(path.join(base, 'stat'), 'utf8'), f = a.slice(a.lastIndexOf(')') + 2).trim().split(/\s+/);
  need(f.length >= 20 && /^\d+$/.test(f[19]), 'proc_shape');
  return { pid, uid: s.uid, ppid: Number(f[1]), pgid: Number(f[2]), starttime: f[19], state: f[0] };
}
function same(a, b) { return a && b && a.pid === b.pid && a.uid === b.uid && a.pgid === b.pgid && a.starttime === b.starttime; }
function scan() {
  const names = fs.readdirSync('/proc').filter(x => /^\d+$/.test(x)); need(names.length <= 16384, 'proc_scan_bound'); const rows = [];
  for (const name of names) {
    const pid = Number(name); if (pid === process.pid) continue;
    let info;
    try {
      info = proc(pid); if (!info) continue;
      const key = `${pid}:${info.starttime}`;
      if (!observed.has(key)) {
        const raw = fs.readFileSync(`/proc/${pid}/environ`); need(raw.length <= 1048576, 'process_environment_bound');
        const fields = raw.toString().split('\0');
        if (!fields.includes(`AGENTCN_RELEASE_ROOT=${root}`) || !fields.includes(`AGENTCN_RELEASE_NONCE=${nonce}`)) continue;
      }
      const after = proc(pid); if (!same(info, after)) continue;
      if (!observed.has(key)) { observed.set(key, info); report.cleanup.processes.push(info); }
      rows.push(info);
    } catch (e) {
      let after; try { after = proc(pid); } catch (again) { if (again.code === 'ENOENT' || again.code === 'ESRCH') continue; }
      if (!after || (info && !same(info, after))) continue;
      // Pre-existing system processes do not inherit the unique nonce. Unreadable new processes remain uncertain.
      if (baselineProcesses.has(`${pid}:${after.starttime}`)) continue;
      report.cleanup.uncertain = true; report.errors.push('owned_process_scan_uncertain');
    }
  }
  return rows;
}
const baselineProcesses = new Set();
for (const name of fs.readdirSync('/proc').filter(x => /^\d+$/.test(x))) {
  try { const item = proc(Number(name)); if (item) baselineProcesses.add(`${item.pid}:${item.starttime}`); } catch (e) { if (!['ENOENT', 'ESRCH'].includes(e.code)) throw e; }
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run(label, executable, args, seconds, { cwd = source, allowFailure = false, cleanup = false } = {}) {
  owner(); need(cleanup || !interrupted, 'interrupted'); const deadline = Math.min(Date.now() + seconds * 1000, cleanup ? cleanupEnd : workEnd);
  need(deadline > Date.now() + 1000, 'command_budget_exhausted');
  const row = { label, executable, arguments: args.map(arg => String(arg).replaceAll(root, '[owned-root]')),
    cwd: cwd.replaceAll(root, '[owned-root]'), startedAt: new Date().toISOString(), deadlineMs: deadline, terminalClosedMs: null, pid: null, identity: null, code: null, signal: null, error: null,
    exitObserved: false, closeObserved: false, groupAbsent: null, signals: [], streams: [] };
  report.commands.push(row);
  const child = spawn(executable, args, { cwd, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const terminal = {}, data = [[], []], counts = [0, 0], hashes = [createHash('sha256'), createHash('sha256')];
  commands.add(child); let closedResolve, timer, stopAt = null;
  const closed = new Promise(resolve => { closedResolve = resolve; });
  child.once('error', () => { row.error ??= 'spawn_error'; });
  child.once('exit', (code, signal) => { row.code = code; row.signal = signal; row.exitObserved = true; });
  child.once('close', () => { row.closeObserved = true; row.terminalClosedMs = Date.now(); commands.delete(child); closedResolve(); });
  for (const [i, stream] of [child.stdout, child.stderr].entries()) {
    terminal[i] = { end: false, close: false };
    stream.on('data', chunk => { counts[i] += chunk.length; hashes[i].update(chunk); const keep = Math.min(chunk.length, Math.max(0, STREAM - (counts[i] - chunk.length))); if (keep) data[i].push(chunk.subarray(0, keep)); if (counts[i] > STREAM) stop('stream_bound'); });
    stream.on('end', () => { terminal[i].end = true; }); stream.on('close', () => { terminal[i].close = true; });
    stream.on('error', () => stop('pipe_error'));
  }
  function signal(value) {
    if (!child.pid) return;
    try {
      let current; try { current = proc(child.pid); } catch (e) { if (!['ENOENT', 'ESRCH'].includes(e.code)) throw e; }
      const members = scan();
      need(same(current, row.identity) || members.some(x => x.pgid === child.pid), 'signal_identity_unproved');
      process.kill(-child.pid, value); row.signals.push(value);
    } catch (e) { if (e.code !== 'ESRCH' && e.code !== 'ENOENT') row.error ??= 'signal_identity_unproved'; }
  }
  function stop(code) { if (stopAt !== null) return; row.error ??= code; stopAt = Date.now(); signal('SIGTERM'); }
  child.releaseStop = stop;
  try {
    if (child.pid) { row.pid = child.pid; try { row.identity = proc(child.pid); } catch (e) { if (!['ENOENT', 'ESRCH'].includes(e.code)) throw e; } }
    timer = setInterval(() => {
      if (interrupted && !cleanup) stop('interrupted'); else if (Date.now() >= deadline) stop('command_deadline');
      if (stopAt !== null && Date.now() >= stopAt + 5000 && !row.signals.includes('SIGKILL') && groupAbsent(child.pid) !== true) signal('SIGKILL');
    }, 50);
    let done = false; closed.then(() => { done = true; });
    while (!done && Date.now() < deadline + 10000 && !(stopAt !== null && Date.now() >= stopAt + 10000)) { scan(); await pause(100); }
    if (!done) { stop('pipe_close_deadline'); child.stdout.destroy(); child.stderr.destroy(); }
    while (child.pid && groupAbsent(child.pid) !== true && Date.now() < (stopAt ?? deadline) + 10000) { stop('process_group_remaining'); scan(); await pause(50); }
    row.groupAbsent = child.pid ? groupAbsent(child.pid) : true;
  } catch (e) {
    row.error ??= finite(e); stop(row.error);
    const until = Math.min(deadline + 10000, Date.now() + 10000);
    while (!row.closeObserved && Date.now() < until) {
      if (stopAt !== null && Date.now() >= stopAt + 5000 && !row.signals.includes('SIGKILL')) signal('SIGKILL');
      await pause(50);
    }
    row.groupAbsent = child.pid ? groupAbsent(child.pid) : true;
  }
  finally {
    clearInterval(timer);
    if (!row.closeObserved) {
      row.error ??= 'pipe_close_deadline';
      for (const stream of [child.stdout, child.stderr]) { stream.removeAllListeners('data'); stream.destroy(); }
    }
    const bytes = data.map(parts => Buffer.concat(parts));
    row.streams = bytes.map((b, i) => ({ name: i ? 'stderr' : 'stdout', bytes: b.length, sha256: sha(b), observedBytes: counts[i], observedSha256: hashes[i].digest('hex'),
      eof: terminal[i].end, descriptorClosed: terminal[i].close, complete: row.closeObserved && terminal[i].end && terminal[i].close && counts[i] === b.length }));
    bytes.forEach((b, i) => retain(`${label}.${i ? 'stderr' : 'stdout'}.txt`, b)); row.finishedAt = new Date().toISOString();
  }
  if (row.terminalClosedMs !== null && row.terminalClosedMs >= deadline) row.error ??= 'command_deadline';
  row.passed = row.code === 0 && row.signal === null && row.error === null && row.signals.length === 0 && row.exitObserved && row.closeObserved && row.groupAbsent === true && row.streams.every(s => s.complete);
  need(allowFailure || row.passed, `${label.replaceAll('-', '_')}_failed`); return { row, bytes: data.map(parts => Buffer.concat(parts)) };
}
const signals = new Map();
for (const name of ['SIGINT', 'SIGTERM', 'SIGHUP']) { const fn = () => { interrupted = true; for (const child of commands) child.releaseStop?.('interrupted'); }; signals.set(name, fn); process.on(name, fn); }
async function guard(label, cleanup = false) {
  const row = { label, passed: false, files: [] }; report.sourceGuards.push(row);
  const get = async args => (await run(`guard-${label}-${row.calls = (row.calls ?? 0) + 1}`, '/usr/bin/git', args, 10, { cwd: repo, cleanup })).bytes[0];
  need((await get(['rev-parse', 'HEAD'])).toString().trim() === sourceCommit, 'source_head_changed');
  const tree = new Map(); for (const entry of (await get(['ls-tree', '-r', '-z', 'HEAD'])).toString().split('\0').filter(Boolean)) {
    const [head, name] = entry.split('\t'), [mode, type, blob] = head.split(' '); need(type === 'blob' && ['100644', '100755'].includes(mode), 'source_type_invalid'); tree.set(name, { mode, blob });
  }
  need(tree.size <= 1000, 'source_count_bound');
  need((await get(['status', '--porcelain=v1', '-z', '--untracked-files=all'])).length === 0, 'source_status_dirty');
  await get(['-c', 'core.filemode=true', 'diff', '--no-ext-diff', '--no-textconv', '--exit-code', 'HEAD', '--']);
  for (const [name, item] of tree) {
    need(!path.isAbsolute(name) && !name.split('/').some(x => ['', '.', '..'].includes(x)), 'source_path_invalid');
    const file = path.join(repo, name), s = fs.lstatSync(file), b = read(file);
    const blob = sha(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b]), 'sha1');
    need(item.mode === (s.mode & 0o111 ? '100755' : '100644') && item.blob === blob, 'source_bytes_changed');
    row.files.push({ path: name, mode: item.mode, bytes: b.length, sha256: sha(b), gitBlob: blob, device: s.dev, inode: s.ino, mtimeMs: s.mtimeMs, ctimeMs: s.ctimeMs });
  }
  if (baseline) need(JSON.stringify(row.files) === JSON.stringify(baseline), 'source_identity_changed'); else baseline = row.files;
  row.passed = true;
}
function exportSource() {
  let total = 0;
  for (const entry of baseline) {
    if (entry.path === ACTIVE) continue;
    need(!/(?:^|\/)(?:\.git|node_modules|\.npmrc|\.env(?!\.example$)[^/]*|id_rsa|id_ed25519|[^/]*\.(?:pem|key))(?:\/|$)/.test(entry.path), 'source_secret_or_dependency_path');
    const target = path.join(source, entry.path); fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
    const b = read(path.join(repo, entry.path)); total += b.length; need(total <= 67108864, 'export_total_bound');
    fs.writeFileSync(target, b, { flag: 'wx', mode: entry.mode === '100755' ? 0o700 : 0o600 });
  }
  report.export = { files: baseline.length - 1, bytes: total, excludedExactPath: ACTIVE, originalModesRecorded: true, copiedPermissions: 'owner-only' };
}
function guardExport(label) {
  const row = { label, passed: false }; report.exportGuards ??= []; report.exportGuards.push(row);
  const tracked = new Set(baseline.map(entry => entry.path));
  function walk(directory, relative = '') {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const name = relative ? `${relative}/${item.name}` : item.name;
      if (item.name === 'node_modules') continue;
      const file = path.join(directory, item.name);
      if (item.isDirectory()) walk(file, name);
      else {
        need(!item.isSymbolicLink() && item.isFile(), 'export_unexpected_type');
        if (!tracked.has(name)) need(/^(?:packages\/react\/(?:LICENSE|dist\/[a-z0-9_-]+\.(?:js|d\.ts))|packages\/cli\/(?:LICENSE|registry\/[a-z0-9_-]+\.json)|apps\/www\/public\/r\/[a-z0-9_-]+\.json|apps\/www\/lib\/(?:catalog\.mjs|documentation\.json))$/.test(name), 'export_unexpected_file');
      }
    }
  }
  walk(source);
  for (const entry of baseline) if (entry.path !== ACTIVE) need(sha(read(path.join(source, entry.path))) === entry.sha256, 'export_source_changed');
  need(!fs.existsSync(path.join(source, ACTIVE)), 'export_active_workflow_present'); row.passed = true;
}
function tarEntries(gz) {
  need(gz.length <= 2097152, 'archive_gzip_bound'); const raw = gunzipSync(gz, { maxOutputLength: 16777216 });
  const entries = new Map(); let offset = 0, ended = false;
  const string = bytes => { const i = bytes.indexOf(0); return bytes.subarray(0, i < 0 ? bytes.length : i).toString('utf8'); };
  const octal = bytes => { const value = string(bytes).trim(); need(/^[0-7]+$/.test(value), 'tar_octal_invalid'); const n = Number.parseInt(value, 8); need(Number.isSafeInteger(n), 'tar_integer_invalid'); return n; };
  while (offset + 512 <= raw.length) {
    const h = raw.subarray(offset, offset + 512); if (h.every(x => x === 0)) { need(raw.subarray(offset).every(x => x === 0), 'tar_trailing_data'); ended = true; break; }
    const stored = octal(h.subarray(148, 156)), checksum = [...h].reduce((sum, n, i) => sum + (i >= 148 && i < 156 ? 32 : n), 0); need(stored === checksum, 'tar_checksum_invalid');
    const prefix = string(h.subarray(345, 500)), base = string(h.subarray(0, 100)), name = prefix ? `${prefix}/${base}` : base;
    need(name.startsWith('package/') && !name.includes('\\') && !name.split('/').some(x => ['.', '..', ''].includes(x)) && !entries.has(name), 'tar_path_invalid');
    const kind = h[156], size = octal(h.subarray(124, 136)), mode = octal(h.subarray(100, 108));
    need(kind === 0 || kind === 48, 'tar_nonregular_member'); need((mode & 0o022) === 0 && (mode & 0o7000) === 0, 'tar_mode_invalid');
    need(size <= 4194304 && offset + 512 + size <= raw.length, 'tar_member_bound');
    const bytes = raw.subarray(offset + 512, offset + 512 + size); entries.set(name, { name, mode, bytes: size, sha256: sha(bytes), data: bytes });
    need(entries.size <= 250, 'tar_member_count'); offset += 512 + Math.ceil(size / 512) * 512;
  }
  need(ended, 'tar_missing_terminator'); return entries;
}
function inspectArchives(packRows) {
  for (let index = 0; index < PACKAGE_NAMES.length; index++) {
    const p = packRows[index]; need(p.name === PACKAGE_NAMES[index] && p.version === '0.2.0' && /^[a-z0-9.-]+\.tgz$/.test(p.filename), 'packed_identity_invalid');
    const archive = read(path.join(archives, p.filename), 2097152); need(sha(archive, 'sha1') === p.shasum && `sha512-${createHash('sha512').update(archive).digest('base64')}` === p.integrity, 'packed_integrity_mismatch');
    const entries = tarEntries(archive), pkg = JSON.parse(entries.get('package/package.json')?.data.toString() ?? 'null'); need(pkg?.name === p.name && pkg.version === '0.2.0', 'archive_manifest_identity');
    const row = { name: p.name, version: p.version, filename: p.filename, bytes: archive.length, sha256: sha(archive), integrity: p.integrity, members: [...entries.values()].map(({ data, ...entry }) => entry), checkedComponents: [] };
    report.archives.push(row);
    const expectedMembers = index === 0
      ? ['package.json', 'README.md', 'LICENSE', 'styles.css', 'src/index.ts', 'src/_shared.tsx',
        ...COMPONENTS.map(name => `src/${name}.tsx`), ...['index', '_shared', ...COMPONENTS].flatMap(name => [`dist/${name}.js`, `dist/${name}.d.ts`])]
      : ['package.json', 'README.md', 'LICENSE', 'bin/agentcn.mjs', 'lib/config.mjs', 'lib/install.mjs', 'registry/catalog.json', ...COMPONENTS.map(name => `registry/${name}.json`)];
    need(JSON.stringify([...entries.keys()].sort()) === JSON.stringify(expectedMembers.map(name => `package/${name}`).sort()), 'archive_exact_member_set');
    for (const member of entries.keys()) need(!/(?:^|\/)(?:node_modules|\.git|\.env[^/]*|\.npmrc|.*\.pem|.*\.key)(?:\/|$)/i.test(member), 'archive_forbidden_content');
    const prefix = index === 0 ? 'packages/react' : 'packages/cli';
    for (const [name, item] of entries) {
      const rel = name.slice('package/'.length); need(sha(read(path.join(source, prefix, rel))) === item.sha256, 'archive_source_mismatch');
      need((index === 0 ? /^(?:package\.json|README\.md|LICENSE|styles\.css|(?:src|dist)\/[a-z0-9_-]+\.(?:tsx?|js|d\.ts))$/ : /^(?:package\.json|README\.md|LICENSE|(?:bin|lib)\/[a-z0-9_-]+\.mjs|registry\/[a-z0-9_-]+\.json)$/).test(rel), 'archive_unexpected_member');
    }
    for (const name of COMPONENTS) {
      if (index === 0) {
        for (const rel of [`src/${name}.tsx`, `dist/${name}.js`, `dist/${name}.d.ts`]) need(entries.has(`package/${rel}`), 'library_component_missing');
        const rootJS = entries.get('package/dist/index.js')?.data.toString() ?? '', rootTypes = entries.get('package/dist/index.d.ts')?.data.toString() ?? '';
        need(rootJS.includes(`./${name}.js`) && rootTypes.includes(`./${name}.js`), 'library_root_export_missing');
        need(pkg.exports['./*'].import === './dist/*.js' && pkg.exports['./*'].types === './dist/*.d.ts' && pkg.exports['./styles.css'] === './styles.css', 'library_exports_invalid');
        need(entries.get('package/styles.css')?.data.includes(Buffer.from('.ac-surface')), 'library_css_missing');
      } else {
        const item = JSON.parse(entries.get(`package/registry/${name}.json`)?.data.toString() ?? 'null');
        need(item?.name === name && item.files.length === 3, 'registry_component_invalid');
        const files = new Map(item.files.map(f => [f.path, f.content])); need(files.size === 3, 'registry_duplicate_files');
        const tsx = read(path.join(source, `packages/react/src/${name}.tsx`)).toString().replaceAll('"./_shared.js"', '"./_shared"');
        need(files.get(`${name}.tsx`) === tsx && files.get('_shared.tsx') === read(path.join(source, 'packages/react/src/_shared.tsx')).toString()
          && files.get('agentcn.css') === read(path.join(source, 'packages/react/styles.css')).toString(), 'registry_source_binding');
      }
      row.checkedComponents.push(name);
    }
    if (index === 1) { const catalog = JSON.parse(entries.get('package/registry/catalog.json')?.data.toString() ?? 'null'); need(catalog?.catalog.length === 20 && COMPONENTS.every(name => catalog.catalog.some(x => x.name === name)) && pkg.bin['agentcn-ui'] === './bin/agentcn.mjs', 'cli_catalog_or_bin_invalid'); }
    retain(p.filename, archive);
  }
}
function validateSmoke(receipt, original, parentStdout) {
  const exact = (actual, expected, code) => need(JSON.stringify(actual) === JSON.stringify(expected), code);
  const set = (actual, expected, code) => { need(Array.isArray(actual) && new Set(actual).size === actual.length, code); exact([...actual].sort(), [...expected].sort(), code); };
  const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
  const decode = (value, cap = 524288) => {
    need(value?.complete === true && Number.isSafeInteger(value.bytes) && value.bytes >= 0 && value.bytes <= cap && digest(value.sha256)
      && Number.isSafeInteger(value.gzipBytes) && value.gzipBytes > 0 && value.gzipBytes <= cap + 1024 && typeof value.dataBase64 === 'string', 'smoke_original_shape');
    const zip = Buffer.from(value.dataBase64, 'base64'); need(zip.toString('base64') === value.dataBase64 && zip.length === value.gzipBytes, 'smoke_original_encoding');
    const bytes = gunzipSync(zip, { maxOutputLength: cap }); need(bytes.length === value.bytes && sha(bytes) === value.sha256, 'smoke_original_binding'); return bytes;
  };
  const phases = ['exports-types-css', 'new-four-ssr', 'multi-input', 'member-picker', 'creatable-select', 'pricing-table', 'typescript'];
  const ids = ['react18', 'react19'].flatMap(key => phases.map(phase => `${key}-${phase}`)).concat(['cli-npm-exec-all20', 'cli-npx-all20', 'cli-pnpm-dlx-all20']);
  need(receipt?.schemaVersion === 1 && receipt.sourceCommit === sourceCommit && receipt.version === '0.2.0' && receipt.passed === true && !receipt.error, 'smoke_identity_failed');
  exact(receipt.cases.map(row => row.id), ids, 'smoke_case_set'); need(receipt.cases.every(row => row.status === 'passed'), 'smoke_case_status');
  const marker = parentStdout.toString().split(/\r?\n/).filter(line => line.startsWith('AGENTCN_RELEASE_SMOKE_RESULT=')); need(marker.length === 1, 'smoke_result_marker_count');
  const summary = JSON.parse(marker[0].slice('AGENTCN_RELEASE_SMOKE_RESULT='.length));
  need(summary.schemaVersion === 1 && summary.sourceCommit === sourceCommit && summary.version === '0.2.0' && summary.passed === true
    && summary.receiptBytes === original.length && summary.receiptSha256 === sha(original), 'smoke_result_original_parity'); exact(summary.cases, receipt.cases, 'smoke_summary_cases');
  const expectedCommands = ['npm-version', 'pnpm-version', ...['react18', 'react19'].flatMap(key => ['install', 'installed-tree', 'exports-ssr', 'dom', 'typescript'].map(step => `${key}-${step}`)),
    'npm-exec-help', 'npm-exec-list', ...['npm-exec', 'npx', 'pnpm-dlx'].flatMap(mode => ['init', 'all20', 'version'].map(step => `${mode}-${step}`))];
  set(receipt.commands.map(row => row.label), expectedCommands, 'smoke_command_set'); const childRows = new Map();
  for (const row of receipt.commands) {
    need(row.status === 0 && row.signal === null && row.errorCode === null && row.reaped === true && row.complete === true && row.timeoutMs > 0 && row.timeoutMs <= 90000, 'smoke_command_terminal');
    const stdout = decode(row.stdout, 131072), stderr = decode(row.stderr, 131072); childRows.set(row.label, { row, stdout, stderr });
  }
  exact(receipt.cleanup, { directChildrenReaped: true, allCommandCapturesComplete: true, childSignalsAbsent: true, workRemoval: 'owned-by-supervisor' }, 'smoke_cleanup');
  need(receipt.archives.length === 2, 'smoke_archive_count');
  for (const archive of report.archives) {
    const row = receipt.archives.find(item => item.name === archive.filename); need(row?.unchanged === true && row.bytes === archive.bytes && row.sha256 === archive.sha256 && row.integrity === archive.integrity, 'smoke_archive_binding');
    need(sha(read(path.join(archives, archive.filename))) === archive.sha256, 'archive_changed_after_smoke');
  }
  const catalog = JSON.parse(read(path.join(source, 'packages/cli/registry/catalog.json'))); const byName = new Map(catalog.catalog.map(row => [row.name, row.component]));
  set([...byName.keys()], COMPONENTS, 'smoke_catalog_names'); const fresh = COMPONENTS.slice(-4), newComponents = fresh.map(name => byName.get(name));
  const css = read(path.join(source, 'packages/react/styles.css'));
  need(receipt.profiles.length === 2, 'smoke_profile_count');
  for (const [key, react, reactTypes, reactDomTypes] of [['react18', '18.2.0', '18.3.27', '18.3.7'], ['react19', '19.3.1', '19.2.14', '19.2.3']]) {
    const profile = receipt.profiles.find(row => row.key === key); need(profile?.status === 'passed' && profile.react === react && profile.reactTypes === reactTypes && profile.reactDomTypes === reactDomTypes, 'smoke_react_profile');
    const lock = JSON.parse(decode(profile.lockOriginal)), tree = JSON.parse(decode(profile.installedTreeOriginal));
    for (const [name, version] of [['react', react], ['react-dom', react], ['typescript', '5.9.3'], ['@types/react', reactTypes], ['@types/react-dom', reactDomTypes], ['jsdom', '27.4.0']]) {
      need(lock.packages[`node_modules/${name}`]?.version === version && tree.dependencies?.[name]?.version === version, 'smoke_installed_dependency_version');
    }
    for (const archive of report.archives) {
      const row = lock.packages[`node_modules/${archive.name}`]; need(row?.version === '0.2.0' && row.integrity === archive.integrity && row.resolved.startsWith('file:'), 'smoke_installed_archive_lock');
      need(path.resolve(root, 'consumers', key, row.resolved.slice(5)) === path.join(archives, archive.filename), 'smoke_installed_archive_path');
    }
    const installed = profile.exportsAndSsr, dom = profile.dom;
    for (const [stage, value] of [['exports-ssr', installed], ['dom', dom]]) {
      const lines = childRows.get(`${key}-${stage}`).stdout.toString().split(/\r?\n/).filter(line => line.startsWith('AGENTCN_CONSUMER_RESULT='));
      need(lines.length === 1, 'smoke_consumer_marker'); exact(JSON.parse(lines[0].slice('AGENTCN_CONSUMER_RESULT='.length)), value, 'smoke_consumer_original_parity');
      need(value.schemaVersion === 1 && value.profile === react && value.passed === true && !value.error, 'smoke_consumer_identity');
    }
    exact(installed.cases.map(row => [row.id, row.status]), [['exports-types-css', 'passed'], ['new-four-ssr', 'passed']], 'smoke_export_cases');
    need(installed.cases[0].rootFunctions === 20 && installed.cases[0].subpathFunctions === 20 && installed.cases[0].declarationFiles === 20 && installed.cases[1].callbacks === 0, 'smoke_export_counts');
    set(installed.exports.map(row => row.name), COMPONENTS, 'smoke_export_names');
    for (const row of installed.exports) { const bytes = read(path.join(source, `packages/react/dist/${row.name}.d.ts`)); need(row.component === byName.get(row.name) && row.declarationBytes === bytes.length && row.declarationSha256 === sha(bytes), 'smoke_declaration_binding'); }
    need(installed.css.bytes === css.length && installed.css.sha256 === sha(css), 'smoke_css_binding');
    set(installed.ssr.map(row => row.component), newComponents, 'smoke_ssr_components'); need(installed.ssr.every(row => Number.isSafeInteger(row.bytes) && row.bytes > 0 && digest(row.sha256)), 'smoke_ssr_evidence');
    exact(dom.cases.map(row => [row.id, row.status]), fresh.map(name => [`installed-${name}`, 'passed']), 'smoke_dom_cases'); need(dom.mounts === 4 && dom.unmounts === 4, 'smoke_dom_cleanup');
    exact(dom.cases.map(row => row.observation), [
      { acknowledgedAddsAndRemovals: 2, emptyRejected: true, limitAndDisabledObserved: true },
      { controlledMemberIDs: ['b'], hiddenSelectionPreserved: true, disabledAndLimitObserved: true },
      { creationCallbacks: 2, rejectionKeptDraft: true, onlyConsumerSuppliedIDSelected: 'created' },
      { reviewedID: 'pro', callbacks: 2, failureAndRetryObserved: true, currentPlanRemainedConsumerControlled: 'free' }], 'smoke_dom_observations');
    exact(profile.typecheck, { commandLabel: `${key}-typescript`, typescript: '5.9.3', reactTypes, reactDomTypes, skipLibCheck: false, rootReferences: 20, subpathReferences: 20, newComponentJsx: 4 }, 'smoke_strict_typecheck');
  }
  set(receipt.cli.map(row => row.mode), ['npm-exec', 'npx', 'pnpm-dlx'], 'smoke_cli_modes');
  for (const row of receipt.cli) {
    need(row.archiveInvocation === true && row.publicPackageNameInstall === false, 'smoke_cli_scope');
    const config = JSON.parse(decode(row.config)); need(config.version === 1 && config.components === 'components/agentcn' && config.css === 'styles/agentcn.css' && config.palette === 'forest' && config.radius === 'rounded' && config.density === 'comfortable', 'smoke_cli_config');
    set(row.targets.map(target => target.name), COMPONENTS, 'smoke_cli_target_set');
    const p = catalog.palettes.forest;
    const expectedCss = Buffer.from(`${css.toString()}\n/* agentcn-ui configuration */\n:root, .ac-theme { --ac-accent: ${p.accent}; --ac-accent-fg: ${p.foreground}; --ac-radius: 12px; --ac-space: 20px; }\n.dark, [data-ac-theme="dark"] { --ac-accent: ${p.dark}; --ac-accent-fg: ${p.darkForeground}; }\n`);
    const project = path.join(root, 'consumers', `cli-${row.mode}`);
    for (const target of row.targets) {
      const item = JSON.parse(read(path.join(source, `packages/cli/registry/${target.name}.json`)));
      set(target.files.map(file => file.path), item.files.map(file => file.path.endsWith('.css') ? config.css : `${config.components}/${file.path}`), 'smoke_cli_file_set');
      for (const file of target.files) {
        const registryFile = item.files.find(entry => (entry.path.endsWith('.css') ? config.css : `${config.components}/${entry.path}`) === file.path);
        const bytes = registryFile.path.endsWith('.css') ? expectedCss : Buffer.from(registryFile.content);
        need(file.bytes === bytes.length && file.sha256 === sha(bytes) && read(path.join(project, file.path)).equals(bytes), 'smoke_cli_source_binding');
      }
    }
    need(row.css.path === config.css && row.css.bytes === expectedCss.length && row.css.sha256 === sha(expectedCss), 'smoke_cli_css_binding');
    const unrelated = Buffer.from('Authored unrelated project file.\n'); need(row.unrelatedFile.preserved === true && row.unrelatedFile.bytes === unrelated.length && row.unrelatedFile.sha256 === sha(unrelated) && read(path.join(project, 'unrelated.txt')).equals(unrelated), 'smoke_unrelated_file_preserved');
    const archive = path.join(archives, report.archives[1].filename);
    for (const step of ['init', 'all20', 'version']) {
      const cmd = childRows.get(`${row.mode}-${step}`).row;
      need(cmd.args.includes(row.mode === 'pnpm-dlx' ? archive : `--package=${archive}`), 'smoke_cli_actual_archive_arguments');
      if (row.mode === 'pnpm-dlx') need(cmd.executable === process.execPath && cmd.args[0] === env.AGENTCN_RELEASE_PNPM_BIN && cmd.args.includes('dlx'), 'smoke_pnpm_actual_binary');
    }
    if (row.mode === 'npm-exec') { need(row.discovery.helpCommandLabel === 'npm-exec-help' && row.discovery.listCommandLabel === 'npm-exec-list', 'smoke_cli_discovery_labels'); exact(row.discovery.names, catalog.catalog.map(item => item.name), 'smoke_cli_discovery_names'); }
  }
  report.smokeValidation = { passed: true, exactCases: 17, originalCommandStreams: receipt.commands.length * 2, reactProfiles: 2, rootExportsPerProfile: 20, subpathsPerProfile: 20, declarationsPerProfile: 20, strictTypechecks: 2, newComponentSsr: 8, authoredDomCases: 8, cliArchiveModes: 3, copiedComponentTargetsPerMode: 20, receiptSha256: sha(original) };
}
let npmCli;
try {
  await guard('before'); exportSource(); guardExport('before');
  npmCli = fs.realpathSync(path.join(path.dirname(process.execPath), 'npm'));
  report.runtime.npmCliSha256 = sha(read(npmCli));
  const npm = (label, args, seconds, options) => run(label, process.execPath, [npmCli, ...args], seconds, options);
  report.runtime.npm = (await npm('npm-version', ['--version'], 10)).bytes[0].toString().trim();
  const lock = JSON.parse(read(path.join(source, 'package-lock.json'))); need(Object.values(lock.packages).every(p => !p.resolved || p.link || new URL(p.resolved).origin === 'https://registry.npmjs.org'), 'dependency_registry_invalid');
  for (const [i, name] of PACKAGE_NAMES.entries()) {
    const metadata = await npm(`registry-${i}`, ['view', name, 'name', 'version', 'versions', 'dist-tags', 'maintainers.name', '--json'], 30, { allowFailure: true });
    const row = { name, commandPassed: metadata.row.passed, metadata: null, version020Published: null }; report.registry.push(row);
    if (metadata.row.passed) { row.metadata = JSON.parse(metadata.bytes[0]); need(Array.isArray(row.metadata.versions) && row.metadata.versions.every(v => typeof v === 'string'), 'registry_versions_invalid'); row.version020Published = row.metadata.versions.includes('0.2.0'); }
    else report.errors.push('anonymous_registry_observation_failed');
  }
  await npm('npm-ci', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], 240);
  await npm('build-library', ['run', 'build:library'], 120);
  await npm('check-source', ['run', 'check:source'], 60);
  guardExport('after-build'); await guard('after-build');
  const packRows = [];
  for (let i = 0; i < PACKAGE_NAMES.length; i++) {
    const packed = await npm(`pack-${i}`, ['pack', '--workspace', PACKAGE_NAMES[i], '--json', '--ignore-scripts', '--pack-destination', archives], 45);
    const parsed = JSON.parse(packed.bytes[0]); need(Array.isArray(parsed) && parsed.length === 1, 'pack_result_invalid'); packRows.push(parsed[0]);
  }
  inspectArchives(packRows); guardExport('after-pack');
  // The exact public pnpm package is confined to owned tools; lifecycle scripts stay disabled.
  const tools = path.join(root, 'tools'); fs.writeFileSync(path.join(tools, 'package.json'), JSON.stringify({ name: 'agentcn-owned-release-tools', private: true, dependencies: { pnpm: '10.18.3' } }), { flag: 'wx', mode: 0o600 });
  const pnpmMetadata = JSON.parse((await npm('pnpm-metadata', ['view', 'pnpm@10.18.3', 'name', 'version', 'dist', '--json'], 30)).bytes[0]);
  need(pnpmMetadata.name === 'pnpm' && pnpmMetadata.version === '10.18.3' && pnpmMetadata.dist.tarball === 'https://registry.npmjs.org/pnpm/-/pnpm-10.18.3.tgz' && /^sha512-[A-Za-z0-9+/]+=*$/.test(pnpmMetadata.dist.integrity), 'pnpm_metadata_invalid');
  await npm('pnpm-install', ['install', '--prefix', tools, '--ignore-scripts', '--no-audit', '--no-fund', '--omit=optional'], 90, { cwd: tools });
  const toolLockBytes = read(path.join(tools, 'package-lock.json')), toolLock = JSON.parse(toolLockBytes), pnpmPackage = toolLock.packages['node_modules/pnpm'];
  need(pnpmPackage.version === '10.18.3' && pnpmPackage.resolved === pnpmMetadata.dist.tarball && pnpmPackage.integrity === pnpmMetadata.dist.integrity, 'pnpm_lock_mismatch');
  retain('tools-lock.json', toolLockBytes); report.runtime.pnpm = { version: '10.18.3', resolved: pnpmPackage.resolved, integrity: pnpmPackage.integrity };
  env.AGENTCN_RELEASE_PNPM_BIN = path.join(tools, 'node_modules/pnpm/bin/pnpm.cjs');
  report.runtime.pnpm.executableSha256 = sha(read(env.AGENTCN_RELEASE_PNPM_BIN));
  need(JSON.parse(read(path.join(tools, 'node_modules/pnpm/package.json'))).version === '10.18.3', 'pnpm_installed_version');
  need((await run('pnpm-version', process.execPath, [env.AGENTCN_RELEASE_PNPM_BIN, '--version'], 10)).bytes[0].toString().trim() === '10.18.3', 'pnpm_runtime_version');
  need(workEnd - Date.now() >= 460000, 'smoke_budget_not_reserved');
  const smoke = await run('package-smoke', process.execPath, [path.join(source, 'tests/smoke/packages.mjs')], 450, { allowFailure: true });
  for (const name of fs.readdirSync(output)) { need(/^[a-z0-9][a-z0-9._-]{0,100}$/.test(name), 'smoke_output_name'); retain(`smoke-${name}`, read(path.join(output, name), 2097152)); }
  need(smoke.row.passed, 'package_smoke_failed');
  const original = read(path.join(output, 'smoke.json'), 2097152), receipt = JSON.parse(original); report.smoke = receipt;
  validateSmoke(receipt, original, smoke.bytes[0]);
  guardExport('after-smoke'); await guard('after-smoke');
} catch (error) { report.errors.push(finite(error)); }
finally {
  cleanupEnd = Math.min(Date.now() + 90000, jobStart + 1200000 - 15000);
  try { await guard('after', true); if (baseline) guardExport('after'); } catch (e) { report.errors.push(finite(e)); }
  try {
    owner(); for (const child of commands) child.releaseStop?.('cleanup_active_child');
    let rows = scan();
    for (const signal of ['SIGTERM', 'SIGKILL']) {
      for (const item of rows) { const fresh = proc(item.pid); need(same(item, fresh), 'cleanup_pid_changed'); process.kill(item.pid, signal); report.errors.push('cleanup_signal_required'); }
      const until = Math.min(cleanupEnd, Date.now() + 5000); do { await pause(100); rows = scan(); } while (rows.length && Date.now() < until);
    }
    report.cleanup.ownedProcessesRemaining = rows.length;
    need(!rows.length && !report.cleanup.uncertain && report.commands.every(c => !c.pid || (c.exitObserved && c.closeObserved && c.groupAbsent === true && c.streams.every(s => s.complete))), 'closure_unproved');
    owner(); fs.rmSync(root, { recursive: true, force: false, maxRetries: 0 }); report.cleanup.rootRemoved = !fs.existsSync(root); need(report.cleanup.rootRemoved, 'scratch_not_removed'); report.cleanup.passed = true;
  } catch (e) { report.errors.push(finite(e)); }
  for (const [name, fn] of signals) process.off(name, fn);
  if (interrupted) report.errors.push('interrupted');
  report.completedAt = new Date().toISOString();
  report.status = !report.errors.length && report.smoke?.passed === true && report.cleanup.passed && report.archives.length === 2 ? 'passed' : 'failed';
  try { retain('receipt.json', Buffer.from(`${JSON.stringify(report, null, 2)}\n`)); }
  catch (e) { report.status = 'failed'; report.errors.push(finite(e)); }
  for (const item of evidence) {
    const encoded = item.packed.toString('base64'); console.log(`AGENTCN_PACKAGE_RELEASE_FILE ${JSON.stringify({ name: item.name, bytes: item.bytes, sha256: item.sha256, gzipBytes: item.gzipBytes, chunks: Math.ceil(encoded.length / 3000) })}`);
    for (let index = 0; index * 3000 < encoded.length; index++) console.log(`AGENTCN_PACKAGE_RELEASE_CHUNK ${JSON.stringify({ name: item.name, index, data: encoded.slice(index * 3000, (index + 1) * 3000) })}`);
  }
  console.log(`AGENTCN_PACKAGE_RELEASE_RESULT=${JSON.stringify({ status: report.status, sourceCommit, errors: report.errors, archives: report.archives.map(a => ({ filename: a.filename, sha256: a.sha256 })) })}`);
  process.exitCode = report.status === 'passed' ? 0 : 1;
}
