# Agentcn 0.2.0 archive consumers — accepted

7 November 2026. [Run 42416199167](https://github.com/alvarovillalbaa/agentcn-ui/actions/runs/42416199167),
job `128534721346`, checked source
[`b7f8cc08b5d78b2e2635024959b4d6553b14bad7`](https://github.com/alvarovillalbaa/agentcn-ui/commit/b7f8cc08b5d78b2e2635024959b4d6553b14bad7).
The controller ran 21:30:55.413–21:31:32.456 UTC on Linux x64 with Node
24.22.2, npm 11.19.1 and pinned pnpm 10.18.3.

**All seventeen archive-consumer cases passed**, with twenty-three normal
zero-exit inner commands. Seven cases ran independently for each React profile:
all-twenty exports/types/CSS, new-four SSR, MultiInput, MemberPicker,
CreatableSelect, PricingTable and strict TypeScript. The remaining three cases
installed all twenty sources through actual archive-path `npm exec`, `npx` and
pnpm `dlx`. This is archive acceptance, not public npm publication.

## Installed-consumer proof

- React/ReactDOM 18.2.0 and 19.3.1 each resolved all twenty root function exports
  and corresponding subpaths, twenty component declarations and the stylesheet.
- TypeScript 5.9.3 compiled both clean consumers with `skipLibCheck: false`,
  twenty root and twenty subpath references and the four new JSX prop shapes.
  React/ReactDOM types were 18.3.27/18.3.7 and 19.2.14/19.2.3 respectively.
- Only MultiInput, MemberPicker, CreatableSelect and PricingTable received SSR
  and controlled jsdom interaction checks: eight SSR records and eight DOM cases
  across the two profiles. Actual callbacks covered add/remove and invalid input,
  member IDs/search/limits, rejected creation followed by consumer-supplied IDs,
  and plan review/rejection/retry while current-plan state stayed consumer-owned.
  Both profiles mounted and unmounted all four components.
- Each CLI entry initialized a fresh project and copied all twenty components.
  Every copied source/shared file and complete themed CSS matched its packaged
  registry. Version checks passed in all three modes; npm exec also returned
  help and the exact twenty-name list. An unrelated authored file survived each
  installation. No public package-name invocation was substituted.

## Reviewed archives and originals

| npm-generated archive | Bytes | Regular members | SHA-256 |
| --- | ---: | ---: | --- |
| `alvarovillalbaa-agentcn-ui-0.2.0.tgz` | 33,597 | 70 | `81829d3bfc376339e1f48fc123ded93b471e7bd7c654e5c2afba1a17bf1c226d` |
| `agentcn-ui-0.2.0.tgz` | 37,492 | 27 | `fcfee32999e0df538c265fbd199297d89da9f049b5ffd45720f78812f44c5491` |

Both archives are byte-identical to attempts 1 and 2. Full member byte counts,
hashes, modes and archive SHA-512 integrities are recorded in the
[verbatim receipt](package-release/attempt-3/receipt.json). The
[consumer original](package-release/attempt-3/smoke-smoke.json) is 125,738 bytes,
SHA-256 `1e765c05b7c156e58cc8934a02780e3e4569ee446a7f3b6df7f908687803b8dc`;
its four helper JSON outputs match their retained original stdout markers.
All 53 nested gzip originals verified (46 command streams, two consumer locks,
two installed-tree copies and three CLI configurations): 127,454 decoded bytes
and 29,742 compressed bytes. The [original-file index](package-release/attempt-3/index.json)
binds the retained non-archive originals. Package archives remain outside Git.

## Source and closure

Four equal source guards covered 228 tracked paths/2,224,950 bytes. The owned
export contained 227 paths, omitting only the active check workflow. All
twenty-eight outer commands exited zero with original streams closed, direct
children reaped, groups absent and no cleanup signals. The scanner recorded one
PID 2877 `ENOENT` identity read and `ENOENT` recheck, classified as vanished;
there were no stable unknown reads, no remaining owned processes and no
uncertainty. Cleanup passed with `rootRemoved: true`. This is owned-process and
scratch proof within the recorded observation protocol, not a host-wide census.

## Preserved failures and remaining gates

[Attempt 1](package-release-attempt-1.md) remains failed at sixteen of seventeen
cases, with pnpm argument rejection and unproved cleanup.
[Attempt 2](package-release-attempt-2.md) remains failed despite seventeen
consumer passes because cleanup was unproved. Neither result is rewritten.

Anonymous metadata in this run listed latest 0.1.0 and no 0.2.0 for both package
names. No current authenticated npm access, publication, public package-name
installation or later availability is proved. The reviewed archives were
[published as GitHub prerelease v0.2.0-candidate.1](https://github.com/alvarovillalbaa/agentcn-ui/releases/tag/v0.2.0-candidate.1)
at 21:37:59 UTC; asset sizes and GitHub SHA-256 digests equal the reviewed
archives, and the tag points to the checked source. This provider metadata is
recorded separately in [the publication receipt](package-release-publication.json).
The temporary workflow is disabled and removed; no further packet was run.
The four source-only notices remain. The closed 42-case and
eight-browser packets were not rerun; no new website/browser, native dialog,
touch/IME, full-library behavioral, account, model or accessibility-conformance
claim follows from this packet. See the [release runbook](../../../runbooks/release.md)
for the remaining public-registry gates.
