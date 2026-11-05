# Hosted requested-component browser acceptance

5 November 2026. **Accepted: eight cases passed once.** See the
[actual receipt](../results/2026/11-05/hosted-browser-checks.md).
This packet implements the original
[four desktop/four narrow workflows](brief-components-checks.md#focused-live-browser-scope).
The owner's later “I approve everything / Keep going / Do all the work”
instructions authorize the bounded temporary public browser CI needed to finish
them, superseding the historical connected-Chrome-only executor limitation.
The 42 passing React/jsdom/CLI cases stay closed and are not rerun.

The connected brief re-read on 5 November returned its 15 October
11:26:30.089 UTC snapshot, verification unverified, for
[agentcn-ui](https://app.notion.com/p/3c6a1ee8bd0680739da8f7df94fd906e).
It still requests the four input/pricing features and the broader React
library/site/distribution project. A cached brief and this focused packet do
not establish full-library completion or a new package release.

## Eight real browser cases

Use [the inactive spec](hosted-browser.spec.mjs.example) and
[controller](../../scripts/run-hosted-browser.mjs). Run the four exact title
identities once in desktop Chromium (1440 × 1000) and once in plain narrow
Chromium (390 × 844): eight cases, one worker, retry zero, no skipped/flaky or
global errors, actual CLI exit zero. Narrow width is not physical touch or
IME acceptance. Use fresh private browser contexts and authored demo values.

| Demo | Required workflow |
| --- | --- |
| MultiInput | Actual pointer/keyboard add and removal, empty/duplicate/max-five limits, forty-character input and readable long tags |
| MemberPicker | Search retains hidden selections, max-two limit, native checkbox keyboard use, and an explicitly disabled demo member |
| CreatableSelect | Existing selection, explicit label creation, consuming demo acknowledgment/selection and duplicate prevention |
| PricingTable | Actual native dialog drawer, open/close/Escape/Tab/focus return, narrow layout and successful local-demo plan selection |

The only planned product change adds one visibly disabled MemberPicker example
to the existing members array. That exercises an already implemented public
prop; it changes no library API, package version, lock, dependency, membership
or authorization. The normal Vercel build regenerates registry/API output.
Never hand-edit generated files or install/build locally under the failed
Storage Guard. A fixture-only update does not reopen all 42 closed cases.

The repository's full source checker was attempted once with existing Node
26.8.2 and stopped with exit 1/ENOENT at
`packages/cli/registry/multi-input.json`: the older generated registry is partial.
Do not relabel that invocation as a source-check pass or regenerate the owner’s
existing output below Storage Guard's reserve. Targeted preparation uses the
existing compatible TypeScript parser for the changed demo, Node syntax parsing
for the new MJS files, structure/link checks and diff checks. Record the real
Vercel compilation/generation outcome separately.

At 05:08:45 UTC, the local checkout also held 13,114 pre-existing ignored paths,
including dependencies, older generated output and two 0.1.0 archives. Their
ordered path-set hash was
`9ac1c464dafe3142ea7d1f205ab8a0cface8c6bd7b9b5be49a1cba0223296702`.
Preserve them. That observation is not an earlier task-start byte inventory or
proof that every ignored file’s content was compared. Public CI uses a clean
Git checkout and still requires zero ignored/untracked outputs; later native
publication must separately qualify the preserved local ignored path set.

Keep source-only installation notices visible: published npm 0.1.0 archives
omit these four components. No driver private globals, synthetic dialog/IME
completion or native-API monkeypatch may replace user interactions. Pricing
confirmation changes only the preview; it is not a subscription/payment.
Reload/context teardown removes only authored component-local fixture state.

## Served pages and registry identity

The canonical origin is `https://agentcn-ui.vercel.app`. Next static export
uses trailing slashes and its actual HTML contains no deployment marker.
Do not invent one or inject application code solely to expose an ID.

Root first publishes the reviewed preparation, waits for exact-source
production READY and checks the public alias. It reads the four actual
`/docs/components/{multi-input,member-picker,creatable-select,pricing-table}/`
HTML bodies and supplies `AGENTCN_EXPECTED_PAGES`: exactly four route/byte/SHA256
records in the QA-only workflow environment. These are observed compiled HTML
identities, not Git-tracked source-file hashes. Keep production unchanged during
the run and verify alias metadata afterward.

The controller makes bounded anonymous page GETs against that manifest. Every
case also verifies its actual navigation response path/status/body bytes/hash.
Normal own-origin Next static assets and enumerated documentation prefetch
reads remain real; they do not imply that every prefetched page was tested.

Four anonymous registry GETs must be JSON for the matching component,
`sourceOnly: true`, with exactly three source files. Compare their content hashes
to checked source: component text under the generator's single `./_shared.js`
to `./_shared` replacement, raw `_shared.tsx`, and raw package CSS. This is
served editable-source identity; it does not install or publish npm packages.
Do not import product modules or execute the registry generator in this packet.

The spec owns a pre-navigation network guard. Permit only enumerated own static
documentation GET/HEAD reads and the controller's four public registry reads.
API requests, mutations, credentials, cross-origin traffic, WebSockets and
unexpected reads fail. No account, invitation, subscription, model/provider,
analytics, server write or third-party website is used. Retain bounded page
error names/messages/fingerprints; every page error still fails. No raw stack,
private URL, screenshot, trace, video or HTML artifact upload is included.
Failure-only Markdown diagnostics retain contained file metadata only.

## Immutable temporary runner

[The inactive workflow](hosted-browser.workflow.yml.example) is activated only
on `qa/agentcn-hosted-20261105` in public `alvarovillalbaa/agentcn-ui`, never
on main. Pin a 40-hex preparation SHA, the separately observed READY deployment
ID and four public HTML identities. Contents permissions are read-only and
checkout credentials are not persisted. Cap the job at 15 minutes.

Use exact Node 24.21.0 and Playwright 1.61.1 on Ubuntu 24.04. Install only the
browser tool under a fresh owned external runner root, with scripts, lock
creation, audit and funding disabled. Chromium stays under that root; Linux
libraries are installed only on the disposable runner and rely on runner
teardown. No application dependencies, local environment, build, dev server,
database, package publication, artifact upload or cache publication is included.

The frontend E2E skill's optional `browserbase-ui-test` helper is unavailable
in this session. Its documented fallback command is
`python3 scripts/install-external-skills.py --skill browserbase-ui-test --agent codex`;
it was not run. No Browserbase account or repeated Chrome-transport recovery
is needed for this authorized CI executor.

Full HEAD/index/tree/mode/blob/working-byte guards protect every tracked input,
including binary assets and historical evidence; no untracked or ignored output
is exempt. Preserve HOME and keep tools/config/cache/browsers/TMPDIR/spec/report/
downloads inside positively owned external scratch. Generate the plain MJS spec
byte-exact without product imports. Capture bounded lossless stdout/stderr and
raw Playwright JSON before parsing acceptance, with byte/SHA/gzip evidence.

Bound work to 12 minutes, cleanup to 90 seconds and final stdout to two seconds.
Each owned command must exit/close, drain both pipes and leave its original
process group absent. Attribute detached Chromium only by same UID, unique
owned-root paths and revalidated kernel PID starttime; no global kill is allowed.
Uncertain process/pipe state fails and retains scratch. Delete only owned
scratch after verified empty scans and complete cleanup. Preserve each failure
before any same-feature repair and changed-candidate replay; retire the
temporary workflow after terminal evidence is retained.

Storage Guard earlier reported 20.8 GiB free versus 34 GiB required. This packet
creates no local environment. Source-only syntax/structure/link/whitespace
checks are preparation, not browser execution. React 18/public npm consumers,
a new release, arbitrary consuming-app behavior, providers/Auth, physical
IME/touch/assistive technology and full-library/portfolio completion stay open.
