# Agentcn 0.2.0 archive and installed-consumer checks

Last updated: 2026-11-07

Status: prepared, unrun. This is an additive candidate for the two public
packages, not a published release. The [readiness observation](../results/2026/11-05/release-readiness.md)
leaves current npm identity, publish access and exact-version availability
unverified. The [release runbook](../runbooks/release.md) owns later publication.

## Scope and ownership

Prepare `@alvarovillalbaa/agentcn-ui@0.2.0` and `agentcn-ui@0.2.0` from one
reviewed immutable source. Align their manifests, the website's workspace
library dependency, only corresponding lock metadata, and the CLI help/version
literals. Private workspace/website/starter versions and `agentcn.json`
schema version 1 are separate contracts and remain unchanged.

The source inventory has twenty components: agent-run, tool-call,
approval-request, plan-review, checkpoint, context-window, memory-panel,
source-stack, agent-handoff, model-router, prompt-composer, branch-picker,
artifact-panel, stream-status, token-usage, eval-scorecard, multi-input,
member-picker, creatable-select and pricing-table. The last four remain marked
`sourceOnly`; candidate archives do not establish public availability.
Keep all source-only notices and the original 0.1.0 release evidence intact.

The existing 42 React/CLI cases and eight hosted-browser cases stay closed.
This packet adds archive and clean installed-consumer evidence; it does not
rerun those suites, build the website or exercise a browser, model or account.

## One bounded public CI job

Use a manual, exact-repository, public-main-only workflow with a read-only token
and an immutable checked source. The job is capped at twenty minutes on public
Ubuntu, Node 24.22.2. Record the actual bundled npm version and executable hash;
do not infer it from an older Node/npm receipt. Work is bounded to 1,020 seconds
and clipped against the earliest job clock, preserving 90 seconds for cleanup
and 30 seconds of margin. The smoke subprocess has a 450-second cap including
its child closure. The reviewed runner must enforce these limits before work.

Keep original HOME. Use private nonce-bound external runner storage for caches,
temporary configuration, source export, archives and consumers. Do not inspect
credential files or pass registry credentials to child commands. No local
installation/build/test is part of preparation. The operational owners are
`scripts/run-package-release-checks.mjs`, the inactive workflow example and
`tests/smoke/packages.mjs`; their exact source hashes and case identities must
be frozen and independently reviewed before activation.

1. Bind all tracked source bytes, Git blobs and executable modes before work.
   Copy only verified source into the owned export; exclude only the active
   check workflow. Install the committed lock with lifecycle scripts disabled,
   then compile the React library and run its existing registry generator in
   that export. Do not hand-edit ignored/generated output or the canonical
   checkout. Preserve every original command result before acceptance checks.
2. Pack both 0.2.0 candidates into the owned archive directory. Independently
   inspect the tar inventories, package identities, declared exports/types,
   twenty root exports and component subpaths, stylesheet and actual CLI bin.
   Verify all twenty bundled registry payloads, including the four additions,
   against generated source. Reject unsafe paths, links, duplicate members,
   missing targets or unintended package content. Retain both original archives,
   byte counts, digests/integrities and bounded original pack output.
3. Install those exact archives into separate clean React 18.2.0 and React
   19.3.1 consumers. Verify all twenty installed root/subpath exports,
   declarations and actual CSS. Compile each consumer with its own installed
   TypeScript 5.9.3 and `skipLibCheck: false`: all twenty root/subpath import
   references and authored new-four JSX props. Use React/ReactDOM type packages
   18.3.27/18.3.7 for React 18 and 19.2.14/19.2.3 for React 19. Exercise SSR and
   real controlled-jsdom interactions for MultiInput, MemberPicker,
   CreatableSelect and PricingTable only; the all-twenty export/type inventory
   is separate from this four-component behavior scope. Compare identities to
   the reviewed archives; no workspace/source import may silently substitute
   for an installed package. This establishes the selected consumer profiles,
   not every supported framework/runtime.
4. Install and invoke the actual packaged CLI launcher. Require help/version
   0.2.0, the exact twenty-name list, `init` with schema version 1 and `add --all`
   producing the expected editable source/styles. Independently compare every
   installed file to its bundled registry payload and preserve unrelated files.
   Record npm archive install, packaged launcher, `npm exec` and `npx` separately
   in separate fresh consumers. Exercise the reviewed archive through actual
   pinned pnpm 10.18.3 `dlx` as the third entry path. Each entry path must perform
   fresh `init` and `add --all` with all twenty copied sources independently
   bound to the packaged registry. These archive invocations do not establish
   public-package installation through npm, npx or pnpm.
5. Make only the reviewed bounded anonymous npm metadata queries for both names
   and the exact 0.2.0 candidates. Record versions/tags/maintainers and the actual
   status or finite transport error. A metadata response is neither authenticated
   publish access nor permission to overwrite a version; a transport failure is
   not evidence of package absence. Never run `whoami`, login or publication in
   this packet. No unchanged retry or registry substitution is allowed.
6. Require the exact authored consumer identity set, no skipped/retried cases,
   zero accepted-command exits, complete original streams, reaped children,
   absent owned groups and verified owned cleanup. Always recheck native source
   bytes/index/modes, including failures. Preserve failed or partial originals;
   a report or archive found after failure does not imply acceptance.

## Evidence and limits

The smoke interface uses `AGENTCN_RELEASE_ARCHIVES`, `AGENTCN_RELEASE_OUTPUT`
and `AGENTCN_RELEASE_WORK`. The runner retains bounded original
`AGENTCN_PACKAGE_RELEASE_FILE`/`CHUNK` records, both archives and
`AGENTCN_PACKAGE_RELEASE_RESULT=`. The total emitted-original budget is 4 MiB;
overflow fails rather than dropping required proof. Record source/tool/lock
identities, exact commands and exits, archive inventory, consumer identities,
stdout/stderr hashes and terminal/cleanup observations. Private absolute runner
paths are operational evidence, never package content or a public source input.

Archive/SSR/CLI acceptance is separate from public npm publication, current
ownership/access, registry integrity after publication, fresh public consumers,
hosted website/browser acceptance and full accessibility conformance. No account,
paid service, provider configuration or model call is required here. Only after
reviewed archives are actually published and public integrity/consumers verified
may the four source-only notices be removed and the website regenerated.
