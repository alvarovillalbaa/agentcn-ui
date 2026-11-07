# Package candidate attempt 2 — consumer pass, cleanup unproved

Source `5a61839cf66be45658d2c5c6c5ac603eb752e48a`;
[run 42415723475](https://github.com/alvarovillalbaa/agentcn-ui/actions/runs/42415723475),
job `128533258302`, 7 November 2026, 21:24:43–21:25:08 UTC.
The original overall result remains **failed**.

All seventeen consumer cases and twenty-three inner commands passed, including
React 18/19 exports, strict TypeScript, new-four SSR/controlled interactions and
all-twenty npm exec/npx/pnpm source installations. The corrected pnpm 10.18.3
owned `--config.store-dir` argument ran. The independent receipt validator
passed all seventeen identities and original command-stream bindings.

Both inspected archives are byte-identical to attempt 1: React 33,597 bytes,
SHA-256 `81829d3bfc376339e1f48fc123ded93b471e7bd7c654e5c2afba1a17bf1c226d`;
CLI 37,492 bytes,
SHA-256 `fcfee32999e0df538c265fbd199297d89da9f049b5ffd45720f78812f44c5491`.
All four canonical source guards passed for 167 tracked files.

The scanner recorded four `EACCES` environment reads. Each exact PID/UID/PGID/
start-time tuple matches a direct command launch: PIDs 2237 (`guard-before-1`),
2353 (`guard-after-build-1`), 2832 (`guard-after-smoke-1`) and 2836
(`guard-after-1`). Each command subsequently exited zero, closed both original
streams and was reaped with its original group absent. The first recorded state
is `Z` for PID 2237 and `R` for the others; this does not establish a general
cause for permission errors or explain attempt 1's opaque observations.

Zero owned processes remained, but four stable unreadable observations left
`uncertain: true`, `rootRemoved: false` and `closure_unproved`. The correction
binds actual launch identities before attempting environment-based discovery;
unidentified processes keep the existing strict failure rules. A fresh result
must establish cleanup; these seventeen passes do not rewrite the failed packet.

[Verbatim receipt](package-release/attempt-2/receipt.json),
[consumer original](package-release/attempt-2/smoke-smoke.json) and
[original-file index](package-release/attempt-2/index.json) preserve all 61 decoded
original identities. Canonical base64, full gzip consumption, lengths and SHA-256
passed for 779,867 original bytes. The 59 non-archive originals are retained
here; archives/full job log remain outside Git and in the linked provider log.
No npm publication, authentication or website/browser acceptance ran.
