# Agentcn UI requested-component checks — 42 passed

4 November 2026. [Run 41836906424](https://github.com/alvarovillalbaa/agentcn-ui/actions/runs/41836906424), job `126598062647`, passed on its first invocation. The job ran **13:18:35–13:18:56 UTC**. The [JSON receipt](brief-components-checks.json) preserves the full controller report, actual case names/statuses, source guards and lossless TAP.

Checked source was `6a3513353958fc02cc8f8dc08997e4a5f33d5ec7`; activation `6c0be2f6f8be1e7b37d61c134d278d58c9e13285` was separate. Actual runtime was **Node 24.21.0 / npm 11.19.0 / Linux x64**. The committed-lock React 19.3.1/jsdom 27.4.0/TypeScript 5.9.3 profile was installed with scripts disabled; no separate module-version probe is claimed.

All **42 exact unique prepared names** were `ok`: 5 existing React checks, 9 disposable CLI cases and 28 new-component cases (MultiInput 7, MemberPicker 5, CreatableSelect 8, PricingTable 8). TAP totals were **42 passed / 0 failed / 0 cancelled / 0 skipped / 0 TODO**. Acceptance used the name/status set, without a reporter-order requirement. No assertion changed and no retry occurred.

Install output reported 76 packages added in 5 seconds; this is not coverage. React TypeScript compilation and the existing generator produced 20 registry entries. The source checker reported 53 source files and 20 documented registry items. All five main-phase stderr streams were empty. GitHub emitted one platform warning: the pinned actions target Node 20 and were forced to run on Node 24. The job passed; no action pin was changed. TAP's 2,013.381307 ms is fixture timing, not a benchmark.

The original controller JSON line was **32,630 bytes**, SHA-256 `cd86f3de0b502456e96c33c3bde2f05ab557495f67e8bf6ac8e63bbf64678ff7`. Its lossless gzip/base64 TAP decodes to **8,771 bytes**, SHA-256 `dbd03b1cbd00edbce90cf33fec126124c883d2e17a128684beb30f4f341dca33`; all 42 actual rows were independently verified.

All **23 child commands** exited 0 with observed exit/close and original process-group absence. Before, after-build and final guards passed **84 inputs / 386,624 bytes**, all **97 tracked identities**, clean working state and historical results. The dedicated fixture directory was empty; nonce/device/inode-checked scratch cleanup passed. No timeout, output overflow or interruption occurred. Individual descendant PIDs, separate sessions and jsdom windows were not independently instrumented; successful completion does not exercise timeout/escalation branches.

The [original release](../10-15/public-release.md) covers its earlier 16 components. The four new components remain source-only relative to npm 0.1.0: this run is neither a package release nor new React 18/public-consumer acceptance. All eight [desktop/narrow browser scenarios](../../../proposals/brief-components-checks.md#focused-live-browser-scope) remain unrun, including native drawer focus/inertness, touch and IME. No full-library, hosted, account, model/provider, database or distribution completion is claimed. No local install/build/test occurred while collecting this receipt.

## Later status-document edition

The subsequent result edition changes only `README.md` and
`docs/proposals/brief-components-checks.md` among the 84 checked inputs. The other
82 remain unchanged, including all product, test, dependency, generator and
controller inputs. The raw JSON and historical 72/84 seals/receipts are immutable.
The generic brief specification remains valid and unchanged. Reproduce checked
`6a3513353958fc02cc8f8dc08997e4a5f33d5ec7`; this later status text is not a new
execution or a claim that the current documentation matches the old seal.
