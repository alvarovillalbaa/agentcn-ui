# Requested component checks

Prepared 29 October 2026; guard preparation updated 4 November and browser
status updated 5 November 2026. Source:
[brief and contract](../specs/brief-components.md). The four new components
are not covered by the earlier 0.1.0 installation/browser evidence.
The owner's repeated “approve everything / keep going / do all the work”
instructions authorize this focused free verification scope and its temporary
CI wiring. No further approval question is pending for this packet. The 42-case
CI packet **passed on its first job**. The separate
[eight hosted browser cases](../results/2026/11-05/hosted-browser-checks.md)
subsequently passed once on 5 November.
The [result](../results/2026/11-04/brief-components-checks.md) and
[raw machine evidence](../results/2026/11-04/brief-components-checks.json) own the
actual execution proof. Source preparation itself ran no product code.

Checked preparation `6a3513353958fc02cc8f8dc08997e4a5f33d5ec7` was exercised by
separate activation `6c0be2f6f8be1e7b37d61c134d278d58c9e13285`,
[run 41836906424](https://github.com/alvarovillalbaa/agentcn-ui/actions/runs/41836906424),
job `126598062647`, on 4 November 2026, 13:18:35–13:18:56 UTC. Actual Node
24.21.0/npm 11.19.0 on Linux x64 installed the locked React 19/jsdom profile,
compiled the library, generated 20 entries and passed the source checker plus
all 42 exact unique case names/statuses. All 23 child exits/group checks, three
84-input/97-identity guards and owned fixture/scratch cleanup passed. The pinned
actions emitted GitHub's Node20-runtime deprecation/forced-Node24 warning; all
five main-phase stderr streams were empty. No retry or action-pin change occurred.

## One temporary CI job

The adjacent [inactive workflow](brief-components.workflow.yml) stays outside
`.github`. Root first publishes the immutable preparation, then copies the
example to `.github/workflows/brief-components-checks.yml` with `SOURCE_COMMIT`
set to that exact SHA. Only that workflow's own path on `main` triggers its push
job; optional manual dispatch also stays on main. No new branch is needed.
Checkout uses `env.SOURCE_COMMIT`, not an empty manual input or activation HEAD.
Repository/public/main predicates and `contents: read` constrain the one public
`ubuntu-24.04` runner, with an independent eight-minute job cap and pinned actions.
Node is exactly 24.21.0; no dependency/version/lockfile update is proposed.

The stdlib-only [controller](../../scripts/run-brief-components-checks.mjs) refuses
local/nonmatching CI execution before creating its scratch root. It records the
actual Node/platform/architecture/executable hash and npm version/CLI hash, then
installs the unchanged lock with `npm ci --ignore-scripts --no-audit --no-fund`.
Only public npm-registry lock destinations or local workspace links are admitted.
Child HOME, npm config/cache and temporary directories are owned and empty at
creation; account credentials, custom npm configuration, proxies and Node options
are not inherited. Dependency download is not account/provider acceptance.

It runs exactly `npm run build:library` (React TypeScript plus existing registry/
API generator), then `npm run check:source`, then these authored files serially:

- `tests/integration/components.test.mjs`: five existing React/DOM regressions.
- `tests/integration/cli.test.mjs`: nine existing disposable source-install cases.
- `tests/integration/brief-components.test.mjs`: the new focused input/member/
  creation/drawer cases listed in the source preparation record: 28 cases.

Total: **42 cases**, including all fourteen existing UI/source-install checks.
CLI's nine cases comprise six literal cases and the three existing preset
expansions (`copilot`, `research`, `operations`). The fourteen retained cases are
current-source regressions. Earlier installed-archive, React18 and browser
release checks are not rerun or substituted for new component acceptance.

Exact test arguments are `--test --test-reporter=tap --test-concurrency=1
--test-timeout=10000` followed by those three files. Acceptance requires the
exact 42 unique prepared name/status SET, all `ok`, test totals 42/pass42 with
zero fail/cancel/skip/TODO, and actual child exit zero without signal/stop.
Reporter/file order is not an acceptance condition. Preparation performed no
test/import/build/install execution; the recorded CI job subsequently performed
this exact scope. It is not native browser or new package-release proof.

This later documentation edition changes only `README.md` and this proposal
among the 84 checked inputs, leaving 82 unchanged, including all product/test/
dependency/generator inputs. The raw JSON, original 72-input preparation seal,
84-input CI seal and older release receipts remain unchanged. Reproduce the
checked immutable source; the later documentation is not a replacement seal.

## Full source and process guards

The [new source/case inventory](../results/2026/11-04/brief-components-checks-source.json)
records all **84 non-results paths**: all 83 current paths plus the controller,
with path/mode/Git blob/bytes/SHA-256 and all 42 explicit case names. Only
`docs/results/` is excluded. The active workflow must be absent from the pinned
preparation; its presence is an error, not a broad workflow-prefix exception.
The manifest itself must equal `git show HEAD` and keep the same hash throughout.
The complete tracked index must equal HEAD before any results filtering; all
97 tracked paths (including historical results and the new seal) also require
clean working bytes/modes and no nonignored untracked files. The 84 manifest
vectors independently match actual source bytes/modes/blobs before install,
after build/source-check, and after test/failure. Missing/extra/changed
tracked paths fail, with changed-path evidence; no tracked generator output is
excluded or silently resealed. The existing 72-input seal remains immutable.

The generator's output locations are ignored and have no tracked overlap:
React `dist`, CLI registry, website public registry, two package LICENSE copies,
and website catalog/documentation. The CI checkout is fresh. Existing ignored
local node_modules/dist/registry are preserved; the historical failed local
Storage Guard does not authorize a local install/build workaround.

Controller work has a 390-second absolute cap plus a 45-second cleanup reserve
inside the eight-minute job. Individual maxima are npm metadata 10 s, install
180 s, library/generator 90 s, source-check 45 s and tests 120 s; remaining time can
shorten each. Each command owns an isolated process group, captures at most
128 KiB per stream and records actual exits/signals/output hashes. Deadline,
interruption or output overflow sends TERM, then KILL after three seconds and
ends pipe drain after another three. A closed leader cannot cancel escalation
while its original group survives. Captured interruption always fails, including
during cleanup. Direct exit/close and original group absence are required;
no separately-sessioned descendant inventory is claimed.

Fixtures consist of local React/jsdom state, controlled callback promises and
disposable CLI directories. A local dialog shim, if used, establishes authored
DOM lifecycle behavior only. It is not proof of native modal focus, inertness,
touch, IME delivery or browser accessibility. Teardown unmounts every root,
closes each jsdom window and removes only fixture-owned directories.

Tests use a dedicated owned fixture temp directory. Its emptiness is checked
before removing the nonce/device/inode-verified scratch/cache root. CLI fixture
cleanup is observed on disk; jsdom unmount/window-close remains the authored
teardown plus successful runner exit, not independent window instrumentation.
All spawned commands need observed exit/close and original-group absence before
scratch cleanup can pass. Cleanup failure cannot become accepted output.

One stdout JSON line (at most 64 KiB) retains source-guard results, actual runtime,
each install/build/generator/source-check/test command and bounded sanitized
output excerpts/hashes. Actual TAP is retained losslessly as gzip/base64, capped
at 16 KiB compressed, with uncompressed size/hash and parsed actual names/statuses.
Malformed/oversized/incomplete evidence or a failed product check fails the job;
no disabled assertion, silent retry or pass-only filtering is permitted. No
artifact download job is needed. Root retires the temporary active workflow with
the terminal result handoff; the inactive example remains. No production workflow,
Next.js website build, browser installation, npm publication or hosting change
is included.

## Focused live browser scope

The [5 November executable packet](hosted-browser-checks.md) retains these eight
workflows under the owner's later standing authorization and uses one bounded
temporary public Chromium CI job. It supersedes the connected-Chrome-only
executor instruction below. The [actual eight-case result](../results/2026/11-05/hosted-browser-checks.md)
passed once; the closed 42-case CI profile was not rerun.

These four desktop/four narrow scenarios passed in the 5 November executable
packet. The original connected-Chrome executor below remains history; the
actual public Chromium CI receipt owns the new browser proof.
Using the existing public documentation deployment, check the four actual demos
at desktop and narrow width through the connected Chrome profile:

1. Multi Input: add/remove by pointer and keyboard, duplicate/empty/limit states,
   readable long tags and responsive controls.
2. Member Picker: search, preserve selected hidden members, selection limit,
   disabled entries and native checkbox keyboard interaction.
3. Creatable Select: choose an existing option, explicitly create a label,
   ensure the controlled demo acknowledges/selects it and duplicate prevention
   leaves the existing option intact.
4. Pricing Table: open/close the native drawer, Escape, Tab/focus return,
   narrow layout and successful local-demo plan selection. Dismissal does not
   represent cancellation of a real consuming-app operation.

Use authored disposable values in those component-local demos. Reload or navigate
away to remove fixture state. No user/account data, storage persistence, real
invitation, subscription or paid action is involved. If native IME/touch input
or another browser capability is unavailable, record the limit rather than
simulating unsupported acceptance. Do not claim React 18 public-consumer or
new npm release compatibility from these checks.

This source/check scope is already authorized by the owner's current instruction.
No server/database, real account, provider/model call, secret, payment, new plan,
package release or production configuration is proposed. Preserve every failure
and source pin before any separately reviewed same-scope repair/rerun. A pass
of the earlier 42-case packet establishes its React19/jsdom/CLI fixture profile
only. The new browser packet supplies separate native Chromium evidence only
after an actual terminal receipt; neither profile establishes React18 public
package consumers or completion of the full library.
