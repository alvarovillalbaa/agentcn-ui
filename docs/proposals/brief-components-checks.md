# Requested component checks

29 October 2026. This is a proposal, not execution approval. Source:
[brief and contract](../specs/brief-components.md). The four new components
are not covered by the earlier 0.1.0 installation/browser evidence.

## One temporary CI job

Activate the adjacent [inactive workflow](brief-components.workflow.yml) only
after explicit approval under the supplied AGENTS.md §14. One public Ubuntu
runner, at most eight minutes, manual dispatch on
`qa/agentcn-brief-components` only. It uses Node 24.21.0 and the existing
committed lockfile. No dependency/version/lockfile update is proposed.

The job installs that exact lock with scripts disabled, compiles only the React
library and runs the existing registry/API generator. It then runs source/import
checks and exactly these three authored files, serially:

- `tests/integration/components.test.mjs`: five existing React/DOM regressions.
- `tests/integration/cli.test.mjs`: nine existing disposable source-install cases.
- `tests/integration/brief-components.test.mjs`: the new focused input/member/
  creation/drawer cases listed in the source preparation record: 28 cases.

Total: **42 cases**, including all fourteen existing UI/source-install checks.

Fixtures consist of local React/jsdom state, controlled callback promises and
disposable CLI directories. A local dialog shim, if used, establishes authored
DOM lifecycle behavior only. It is not proof of native modal focus, inertness,
touch, IME delivery or browser accessibility. Teardown unmounts every root,
closes each jsdom window and removes only fixture-owned directories.

The runner uploads the exact source revision, test source hashes, TAP output
and exit status, and the generator/source-check output. Artifact retention is
one day. Product test failure fails the job; no disabling or silent rerun.
The temporary workflow is removed after result collection. No new production
workflow, Next.js build, browser installation, npm publication or hosting
configuration is part of this CI scope.

## Focused live browser scope

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

The supplied AGENTS.md §7 requires explicit browser approval; §14 requires
temporary CI approval. Existing backend, La Porra and other project approvals
do not cover this new scope. No server/database, account, provider/model call,
secret, payment, new plan or production configuration is proposed.
