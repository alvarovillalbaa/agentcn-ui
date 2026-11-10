// T2 public-carrier consumers. Execute only in the approved isolated public CI job.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { catalog } from '../catalog.mjs';
const need = (value, message) => { if (!value) throw new Error(message); };
const hash = (body, algorithm = 'sha256', encoding = 'hex') => createHash(algorithm).update(body).digest(encoding);
const sourceCommit = process.argv[3], workflowCommit = process.env.GITHUB_SHA;
need(process.argv.length === 4 && process.argv[2] === '--source-commit' && sourceCommit === process.env.SOURCE_COMMIT
  && /^[a-f0-9]{40}$/.test(sourceCommit ?? '') && /^[a-f0-9]{40}$/.test(workflowCommit ?? '') && sourceCommit !== workflowCommit, 'source_pin_required');
need(process.platform === 'linux' && process.version === 'v24.22.2' && process.env.CI === 'true'
  && process.env.GITHUB_REPOSITORY === 'alvarovillalbaa/agentcn-ui' && process.env.GITHUB_REF === 'refs/heads/main'
  && process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' && process.env.AGENTCN_PUBLIC_REPOSITORY === 'true', 'approved_public_ci_required');
need(catalog.length === 20 && new Set(catalog.map(item => item.name)).size === 20, 'catalog_identity');
const repo = fs.realpathSync(process.cwd()), parent = fs.realpathSync(process.env.RUNNER_TEMP);
const root = fs.mkdtempSync(path.join(parent, 'agentcn-public-archives-')); fs.chmodSync(root, 0o700);
const identity = fs.lstatSync(root), nonce = randomBytes(16).toString('hex');
fs.writeFileSync(path.join(root, '.owner'), nonce, { flag: 'wx', mode: 0o600 });
for (const name of ['source', 'output', 'archives', 'consumers', 'tools', 'tmp', 'cache', 'config', 'data', 'state']) fs.mkdirSync(path.join(root, name), { mode: 0o700 });
for (const name of ['npm-user', 'npm-global']) fs.writeFileSync(path.join(root, name), '', { flag: 'wx', mode: 0o600 });
const source = path.join(root, 'source'), output = path.join(root, 'output'), archives = path.join(root, 'archives');
const packet = path.join(parent, `agentcn-public-archive-packet-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`);
fs.mkdirSync(packet, { mode: 0o700 }); fs.appendFileSync(process.env.GITHUB_ENV, `AGENTCN_PUBLIC_ARCHIVE_PACKET=${packet}\n`);
const env = { PATH: `${path.dirname(process.execPath)}:/usr/bin:/bin`, HOME: process.env.HOME, LANG: 'C.UTF-8', TZ: 'UTC', CI: 'true', NO_COLOR: '1',
  TMPDIR: path.join(root, 'tmp'), TMP: path.join(root, 'tmp'), TEMP: path.join(root, 'tmp'),
  XDG_CACHE_HOME: path.join(root, 'cache'), XDG_CONFIG_HOME: path.join(root, 'config'), XDG_DATA_HOME: path.join(root, 'data'), XDG_STATE_HOME: path.join(root, 'state'),
  npm_config_userconfig: path.join(root, 'npm-user'), npm_config_globalconfig: path.join(root, 'npm-global'), npm_config_cache: path.join(root, 'cache/npm'),
  npm_config_registry: 'https://registry.npmjs.org/', npm_config_ignore_scripts: 'true', npm_config_audit: 'false', npm_config_fund: 'false',
  npm_config_fetch_retries: '0', npm_config_fetch_timeout: '15000', npm_config_update_notifier: 'false',
  AGENTCN_PUBLIC_ARCHIVE_ROOT: root, AGENTCN_PUBLIC_ARCHIVE_NONCE: nonce };
const report = { schemaVersion: 'agentcn.public-archives.v1', sourceCommit, workflowCommit, status: 'failed', startedAt: new Date().toISOString(),
  commands: [], guards: [], downloads: [], cases: [], errors: [], cleanup: {},
  proofLimits: ['Public GitHub archive carrier and five authored consumer cases only; no npm publication/package-name, browser, host or full-library acceptance.',
    'No rebuild, generated adoption, credentials, account, paid plan, production data or model/provider call. Earlier closed cohorts are not executed.'] };
const deadline = Date.now() + 1020000, active = new Set(); let baseline, seed, interrupted = false;
const write = (base, name, value) => fs.writeFileSync(path.join(base, name), typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
function owner() {
  const now = fs.lstatSync(root);
  need(now.isDirectory() && !now.isSymbolicLink() && now.dev === identity.dev && now.ino === identity.ino && now.uid === process.getuid()
    && fs.readFileSync(path.join(root, '.owner'), 'utf8') === nonce, 'owned_root_changed');
}
function proc(pid) {
  try { const raw = fs.readFileSync(`/proc/${pid}/stat`, 'utf8'), fields = raw.slice(raw.lastIndexOf(')') + 2).split(' ');
    return { pid, uid: fs.statSync(`/proc/${pid}`).uid, pgid: Number(fields[2]), sid: Number(fields[3]), start: fields[19] };
  } catch (error) { if (['ENOENT', 'ESRCH'].includes(error.code)) return null; throw error; }
}
function absent(pid) { try { process.kill(-pid, 0); return false; } catch (error) { return error.code === 'ESRCH'; } }
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, () => { interrupted = true; for (const child of active) child.stop('SIGTERM'); });
async function run(label, command, args, cwd = root, seconds = 120) {
  owner(); need(!interrupted && Date.now() + 15000 < deadline, 'deadline_or_interruption');
  const row = { label, command, args, signals: [], streams: [], startedAt: new Date().toISOString() }; report.commands.push(row);
  const child = spawn(command, args, { cwd, env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const bound = child.pid ? proc(child.pid) : null; row.pid = child.pid; row.identity = bound;
  const pieces = [[], []], sizes = [0, 0], ended = [false, false]; let timer, killTimer;
  const stop = signal => {
    const now = child.pid && proc(child.pid);
    if (now && bound && now.uid === bound.uid && now.start === bound.start && now.pgid === child.pid && now.sid === child.pid) {
      process.kill(-child.pid, signal); row.signals.push(signal);
    } else if (child.pid && !absent(child.pid)) row.uncertainOwnership = true;
  };
  const handle = { stop }; active.add(handle);
  return await new Promise((resolve, reject) => {
    child.once('error', error => { row.spawnError = error.code ?? 'spawn_error'; });
    [child.stdout, child.stderr].forEach((stream, index) => {
      stream.on('data', body => { sizes[index] += body.length;
        if (sizes[index] <= 512 * 1024) pieces[index].push(body); else { row.overflow = true; stop('SIGTERM'); } });
      stream.once('end', () => { ended[index] = true; });
    });
    child.once('close', async (code, signal) => {
      clearTimeout(timer); clearTimeout(killTimer); active.delete(handle);
      row.exitCode = code; row.signal = signal; row.closeObserved = true; row.completedAt = new Date().toISOString();
      for (let n = 0; child.pid && !absent(child.pid) && n < 20; n++) await new Promise(done => setTimeout(done, 50));
      row.originalGroupAbsent = !child.pid || absent(child.pid);
      for (let n = 0; n < 2; n++) { const body = Buffer.concat(pieces[n]), name = label + (n ? '.stderr.txt' : '.stdout.txt');
        write(output, name, body); row.streams.push({ name, bytes: body.length, sha256: hash(body), complete: ended[n] && !row.overflow }); }
      if (code !== 0 || signal !== null || row.spawnError || row.overflow || row.timedOut || !row.originalGroupAbsent || !ended.every(Boolean)) reject(new Error(label + '_failed'));
      else resolve(Buffer.concat(pieces[0]));
    });
    timer = setTimeout(() => { row.timedOut = true; stop('SIGTERM'); killTimer = setTimeout(() => stop('SIGKILL'), 5000); },
      Math.min(seconds * 1000, Math.max(1000, deadline - Date.now() - 10000)));
  });
}
const git = (...args) => execFileSync('git', args, { cwd: repo, env: { ...env, GIT_NO_LAZY_FETCH: '1', GIT_OPTIONAL_LOCKS: '0' }, maxBuffer: 2 * 1024 * 1024, timeout: 30000 });
const names = git('ls-files', '-z').toString().split('\0').filter(Boolean).sort(); need(names.length <= 450, 'source_file_count');
const exported = names.filter(name => !['docs/results/', '.github/', '.agents/', '.codex/'].some(prefix => name.startsWith(prefix)));
function snapshot(base, paths) {
  let total = 0;
  return paths.map(name => { const file = path.join(base, name), stat = fs.lstatSync(file);
    need(stat.isFile() && !stat.isSymbolicLink() && stat.size <= 2 * 1024 * 1024, 'source_file_bound'); total += stat.size;
    need(total <= 16 * 1024 * 1024, 'source_total_bound'); return { path: name, bytes: stat.size, mode: stat.mode & 0o777, sha256: hash(fs.readFileSync(file)) }; });
}
function guard(label) {
  owner(); const now = snapshot(repo, names), current = snapshot(source, exported);
  need(JSON.stringify(now) === JSON.stringify(baseline) && JSON.stringify(current) === JSON.stringify(seed), 'complete_source_changed');
  report.guards.push({ label, canonicalFiles: now.length, canonicalVectorSha256: hash(JSON.stringify(now)), protectedFiles: current.length, protectedVectorSha256: hash(JSON.stringify(current)) });
}
const assets = [
  { name: '@alvarovillalbaa/agentcn-ui', file: 'alvarovillalbaa-agentcn-ui-0.2.0.tgz', bytes: 33597, sha256: '81829d3bfc376339e1f48fc123ded93b471e7bd7c654e5c2afba1a17bf1c226d', members: 70 },
  { name: 'agentcn-ui', file: 'agentcn-ui-0.2.0.tgz', bytes: 37492, sha256: 'fcfee32999e0df538c265fbd199297d89da9f049b5ffd45720f78812f44c5491', members: 27 },
].map(item => ({ ...item, url: 'https://github.com/alvarovillalbaa/agentcn-ui/releases/download/v0.2.0-candidate.1/' + item.file }));
try {
  need(git('rev-parse', 'HEAD').toString().trim() === sourceCommit && git('status', '--porcelain').length === 0
    && git('rev-parse', 'HEAD^').toString().trim() === '87540af619dcab1c69cc34b0c72f40da2dce0a60', 'exact_clean_candidate');
  baseline = snapshot(repo, names); let bytes = 0;
  for (const name of exported) {
    need(!path.isAbsolute(name) && !name.split('/').some(part => ['..', '.git'].includes(part)), 'export_path');
    bytes += fs.lstatSync(path.join(repo, name)).size; need(bytes <= 4 * 1024 * 1024, 'export_bound');
    const to = path.join(source, name); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(repo, name), to, fs.constants.COPYFILE_EXCL);
  }
  seed = snapshot(source, exported); report.export = { files: exported.length, bytes }; guard('before-tools');
  await run('tools-install', 'npm', ['install', '--prefix', path.join(root, 'tools'), '--ignore-scripts', '--no-audit', '--no-fund', 'pnpm@10.18.3']);
  const pnpm = path.join(root, 'tools/node_modules/pnpm/bin/pnpm.cjs');
  need((await run('pnpm-version', process.execPath, [pnpm, '--version'])).toString().trim() === '10.18.3', 'pnpm_version'); guard('after-tools');
  for (const [index, asset] of assets.entries()) {
    const file = path.join(archives, asset.file);
    const transfer = JSON.parse((await run('download-' + index, 'curl', ['-q', '-L', '-sS', '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10', '--max-time', '45', '--max-redirs', '3', '--max-filesize', '1048576', '--output', file,
      '--write-out', '{"httpCode":%{http_code},"redirects":%{num_redirects},"tlsVerifyResult":%{ssl_verify_result},"bytes":%{size_download}}', asset.url], root, 60)).toString());
    const body = fs.readFileSync(file);
    need(transfer.httpCode === 200 && transfer.tlsVerifyResult === 0 && transfer.redirects <= 3 && transfer.bytes === asset.bytes
      && body.length === asset.bytes && hash(body) === asset.sha256, 'public_archive_integrity');
    const listing = (await run('list-' + index, 'tar', ['-tvzf', file], root, 30)).toString().trim().split('\n'); let total = 0;
    for (const line of listing) { const columns = line.trim().split(/\s+/), name = columns.at(-1), size = Number(columns[2]);
      need(['-', 'd'].includes(line[0]) && /^package\/[A-Za-z0-9_.@/-]+\/?$/.test(name) && !name.split('/').includes('..')
        && Number.isSafeInteger(size) && size >= 0 && size <= 2 * 1024 * 1024 && listing.length <= 200, 'safe_archive_member');
      total += size; need(total <= 8 * 1024 * 1024, 'archive_raw_bound'); }
    const folder = path.join(archives, 'extracted-' + index); fs.mkdirSync(folder);
    await run('extract-' + index, 'tar', ['-xzf', file, '-C', folder], root, 30);
    const base = path.join(folder, 'package'), files = [];
    function walk(folder, prefix = '') { for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      need(!entry.isSymbolicLink(), 'extracted_symlink'); const target = path.join(folder, entry.name), name = prefix + entry.name;
      if (entry.isDirectory()) walk(target, name + '/'); else { need(entry.isFile(), 'extracted_file_type'); const raw = fs.readFileSync(target); files.push({ path: name, bytes: raw.length, sha256: hash(raw) }); }
    } }
    walk(base); need(files.length === asset.members, 'exact_archive_members');
    const metadata = JSON.parse(fs.readFileSync(path.join(base, 'package.json'))); need(metadata.name === asset.name && metadata.version === '0.2.0', 'package_identity');
    write(output, asset.file, body); report.downloads.push({ ...asset, transfer, files, integrity: 'sha512-' + hash(body, 'sha512', 'base64'), rawRedirectHeadersCollected: false });
  }
  write(output, 'public-archives.json', report.downloads); guard('after-downloads');
  for (const profile of [{ id: 'react18', react: '18.2.0', types: '18.3.27', domTypes: '18.3.7' }, { id: 'react19', react: '19.3.1', types: '19.2.14', domTypes: '19.2.3' }]) {
    const cwd = path.join(root, 'consumers', profile.id); fs.mkdirSync(cwd); env.npm_config_cache = path.join(root, 'cache', profile.id);
    const initial = { name: 'agentcn-public-' + profile.id, private: true, type: 'module', ownerNote: 'Retain this authored manifest field.', dependencies: { react: profile.react, 'react-dom': profile.react,
      typescript: '5.9.3', '@types/react': profile.types, '@types/react-dom': profile.domTypes, ...Object.fromEntries(assets.map(item => [item.name, item.url])) } };
    write(cwd, 'package.json', initial); write(cwd, 'owner-note.txt', 'Retain this authored file.\n');
    await run(profile.id + '-install', 'npm', ['install', '--ignore-scripts', '--omit=optional', '--no-audit', '--no-fund'], cwd, 150);
    const lock = JSON.parse(fs.readFileSync(path.join(cwd, 'package-lock.json'))); let members = 0;
    for (const asset of report.downloads) {
      const base = path.join(cwd, 'node_modules', asset.name), item = lock.packages['node_modules/' + asset.name];
      need(item.version === '0.2.0' && item.resolved === asset.url && item.integrity === asset.integrity, 'actual_public_url_lock');
      for (const member of asset.files) { const body = fs.readFileSync(path.join(base, member.path)); need(body.length === member.bytes && hash(body) === member.sha256, 'installed_member_parity'); members++; }
    }
    write(cwd, 'consumer-spec.json', { catalog });
    write(cwd, 'exports.mjs', `import fs from 'node:fs';\nimport * as root from '@alvarovillalbaa/agentcn-ui';\nconst {catalog}=JSON.parse(fs.readFileSync('consumer-spec.json'));\nfor(const item of catalog){const sub=await import('@alvarovillalbaa/agentcn-ui/'+item.name);if(typeof root[item.component]!=='function'||root[item.component]!==sub[item.component])throw new Error('export mismatch');if(!fs.existsSync('node_modules/@alvarovillalbaa/agentcn-ui/dist/'+item.name+'.d.ts'))throw new Error('declaration missing');}\nif(fs.statSync('node_modules/@alvarovillalbaa/agentcn-ui/styles.css').size<100)throw new Error('styles missing');\nconsole.log(JSON.stringify({exports:catalog.length,subpaths:catalog.length,declarations:catalog.length}));\n`);
    const exports = JSON.parse((await run(profile.id + '-exports', process.execPath, ['exports.mjs'], cwd, 30)).toString());
    need(exports.exports === 20 && exports.subpaths === 20 && exports.declarations === 20, 'twenty_installed_exports');
    fs.copyFileSync(path.join(source, 'tests/smoke/consumer-types.tsx'), path.join(cwd, 'consumer-types.tsx'));
    write(cwd, 'tsconfig.json', { compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'NodeNext', moduleResolution: 'NodeNext', jsx: 'react-jsx', strict: true, skipLibCheck: false, noEmit: true, types: ['react', 'react-dom'] }, files: ['consumer-types.tsx'] });
    await run(profile.id + '-strict', process.execPath, [path.join(cwd, 'node_modules/typescript/bin/tsc'), '--project', 'tsconfig.json'], cwd, 90);
    need(JSON.stringify(JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')))) === JSON.stringify(initial) && fs.readFileSync(path.join(cwd, 'owner-note.txt'), 'utf8') === 'Retain this authored file.\n', 'authored_app_changed');
    for (const name of ['package.json', 'package-lock.json']) write(output, profile.id + '-' + name, fs.readFileSync(path.join(cwd, name)));
    report.cases.push({ ...profile, passed: true, installedMembers: members, rootExports: 20, subpaths: 20, declarations: 20, strictNodeNext: true, skipLibCheck: false });
  }
  guard('after-react-consumers');
  const installedCli = path.join(root, 'consumers/react18/node_modules/agentcn-ui');
  for (const mode of ['npm-exec', 'npx', 'pnpm-dlx']) {
    const cwd = path.join(root, 'consumers', mode); fs.mkdirSync(cwd); env.npm_config_cache = path.join(root, 'cache', mode);
    write(cwd, 'package.json', { name: 'agentcn-public-' + mode, private: true, type: 'module' }); write(cwd, 'owner-note.txt', 'Retain this authored file.\n');
    const command = mode === 'pnpm-dlx' ? process.execPath : mode === 'npm-exec' ? 'npm' : 'npx';
    const prefix = mode === 'pnpm-dlx' ? [pnpm, '--config.store-dir=' + path.join(root, 'cache', mode, 'store'), 'dlx', assets[1].url]
      : mode === 'npm-exec' ? ['exec', '--yes', '--package=' + assets[1].url, '--', 'agentcn-ui'] : ['--yes', '--package=' + assets[1].url, 'agentcn-ui'];
    await run(mode + '-init', command, [...prefix, 'init', '--yes'], cwd, 120);
    await run(mode + '-all20', command, [...prefix, 'add', '--all'], cwd, 120);
    need((await run(mode + '-version', command, [...prefix, '--version'], cwd, 90)).toString().trim() === '0.2.0', 'actual_cli_version');
    const config = JSON.parse(fs.readFileSync(path.join(cwd, 'agentcn.json'))), metadata = JSON.parse(fs.readFileSync(path.join(installedCli, 'registry/catalog.json'))), palette = metadata.palettes.forest;
    need(config.version === 1 && config.palette === 'forest' && config.radius === 'rounded' && config.density === 'comfortable'
      && config.components === 'components/agentcn' && config.css === 'styles/agentcn.css', 'exact_cli_config');
    const suffix = `\n/* agentcn-ui configuration */\n:root, .ac-theme { --ac-accent: ${palette.accent}; --ac-accent-fg: ${palette.foreground}; --ac-radius: 12px; --ac-space: 20px; }\n.dark, [data-ac-theme="dark"] { --ac-accent: ${palette.dark}; --ac-accent-fg: ${palette.darkForeground}; }\n`;
    const files = new Map();
    for (const item of catalog) {
      const entry = JSON.parse(fs.readFileSync(path.join(installedCli, 'registry', item.name + '.json')));
      for (const file of entry.files) {
        need(/^[a-z0-9_.-]+\.(tsx|css)$/.test(file.path), 'registry_file_path');
        const relative = file.path.endsWith('.css') ? config.css : config.components + '/' + file.path, body = fs.readFileSync(path.join(cwd, relative));
        need(body.toString() === file.content + (file.path.endsWith('.css') ? suffix : ''), 'exact_public_cli_source');
        files.set(relative, { path: relative, bytes: body.length, sha256: hash(body) });
      }
    }
    need(files.size === 22 && fs.readFileSync(path.join(cwd, 'owner-note.txt'), 'utf8') === 'Retain this authored file.\n', 'cli_union_or_authored_file');
    write(output, mode + '-config.json', config); report.cases.push({ id: mode, passed: true, publicUrlInvocation: true, components: 20, config, files: [...files.values()], unrelatedFilePreserved: true });
  }
  guard('after-public-cli'); need(report.cases.length === 5 && report.cases.every(row => row.passed), 'five_public_cases'); report.status = 'passed';
} catch (error) {
  report.errors.push(/^[a-zA-Z0-9_-]+$/.test(error.message ?? '') ? error.message : 'controller_error');
  const body = Buffer.from(String(error.stack ?? error)); if (body.length <= 512 * 1024) write(output, 'controller-error.txt', body);
} finally {
  for (const child of active) child.stop('SIGTERM');
  if (baseline && seed && !active.size) { try { guard('terminal-source-check'); } catch { report.status = 'failed'; report.errors.push('terminal_guard_failed'); } }
  if (report.status === 'passed' && (report.commands.length !== 23 || report.guards.length !== 6)) { report.status = 'failed'; report.errors.push('pipeline_profile'); }
  const live = report.commands.filter(row => row.pid && !absent(row.pid));
  report.cleanup = { activeChildren: active.size, remainingOriginalGroups: live.map(row => row.label), allStreamsComplete: report.commands.every(row => row.closeObserved && row.streams.length === 2 && row.streams.every(stream => stream.complete)), rootRemoved: false };
  if (active.size || live.length || !report.cleanup.allStreamsComplete) { report.status = 'failed'; report.errors.push('cleanup_not_proven'); }
  try {
    owner(); let total = 0;
    for (const name of fs.readdirSync(output)) { const file = path.join(output, name), stat = fs.lstatSync(file); total += stat.size;
      need(stat.isFile() && !stat.isSymbolicLink() && total <= 8 * 1024 * 1024, 'packet_bound'); fs.copyFileSync(file, path.join(packet, name), fs.constants.COPYFILE_EXCL); }
    if (!active.size && !live.length) { fs.rmSync(root, { recursive: true }); report.cleanup.rootRemoved = !fs.existsSync(root); }
  } catch { report.status = 'failed'; report.errors.push('owned_cleanup_failed'); }
  report.completedAt = new Date().toISOString(); write(packet, 'receipt.json', report);
  const files = fs.readdirSync(packet).sort().map(name => { const body = fs.readFileSync(path.join(packet, name)); return { name, bytes: body.length, sha256: hash(body) }; });
  write(packet, 'packet-manifest.json', { sourceCommit, workflowCommit, files });
}
console.log(JSON.stringify({ status: report.status, cases: report.cases.length, commands: report.commands.length, errors: report.errors, cleanup: report.cleanup }));
if (report.status !== 'passed') process.exitCode = 1;
