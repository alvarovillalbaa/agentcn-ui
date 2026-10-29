# Requested component delivery

29 October 2026. Source prepared; publication and hosted checks are recorded
below when observed. This is not a completed interaction or package-release claim.

The complete returned [brief](https://app.notion.com/p/3c6a1ee8bd0680739da8f7df94fd906e)
was inspected against clean personal main
`8517d6043b0b4bd8b4add43de31ad65e49861fc3`. Its four explicit input/pricing
requirements were absent from the sixteen-component catalog. The owning
[scope](../../../specs/brief-components.md) retains those requirements and the
actual presentation/callback boundaries.

Implementation adds reusable MultiInput, MemberPicker, CreatableSelect and
PricingTable source plus catalog entries, controlled demos and generated-doc
integration. Tag creation and existing-member selection are distinct actions.
New options and current plans remain controlled by the consuming application;
callbacks imply no invitation, access grant, subscription or payment.

The current npm packages remain at 0.1.0. Source-only notices distinguish the
four new components from those published archives. No package version,
dependency, lockfile, Auth, provider setting, CI or production configuration
was changed.

Storage Guard preflight (`--need-gib 4`) returned exit 2: 25.0 GiB free versus
34.0 GiB required including the 30 GiB reserve. No local installation or build
was attempted. Existing TypeScript/React/jsdom environments were found; their
presence is not permission to bypass the failed build preflight. Static source
parsing and reads may use the existing environment without emitting build files.

Source-only checks used existing Node 24.21.0 and TypeScript 5.9.3: 56 source
modules parsed, 115 source imports resolved and all twenty catalog entries
matched public prop interfaces plus demos. Parsing/transpilation emitted no
files and imported no product module. Existing PostCSS parsed scoped CSS.
Ruby/Psych parsed the inactive workflow; its four shell bodies and one inline
Node program passed syntax checks without execution. Targeted formatting and
`git diff --check` passed. The ordinary source checker also requires generated
registries; those remain the existing generator's job in an authorized build.
The [source preparation record](brief-components-source.json) seals 72 inputs
and all 28 new case names. Readback matched every hash, resolved local document
links and confirmed ten protected dependency/generator/shared/regression inputs
remain byte-identical to the inspected base commit. This fingerprint describes
source preparation; dated delivery receipts are excluded from its input list.

Peer review found and repaired two concrete callback boundaries before freezing:
native selection failures now remain inline/retryable, and changing a pricing
handler invalidates the old review and its pending feedback. Creation guards
also preserve newer input and avoid applying old feedback after context changes.
All package/dependency inputs and existing runtime/test files outside this scope
are preserved.

The new authored test file contains 28 distinct cases: seven MultiInput, five
MemberPicker, eight CreatableSelect and eight PricingTable. Together with five
existing UI and nine existing source-installer regressions, the
[focused proposal](../../../proposals/brief-components-checks.md) covers exactly
42 cases plus four desktop/four narrow live-demo scenarios. Every new case is
unexecuted. The workflow is an inactive document outside `.github` and has not
been dispatched. The proposal seeks the supplied AGENTS.md §§7/14 approval;
earlier project scopes do not authorize it.

## Published source and hosted output

Published source
[`18a612d220fc22f88059f7b5edc1a419aebdb948`](https://github.com/alvarovillalbaa/agentcn-ui/commit/18a612d220fc22f88059f7b5edc1a419aebdb948)
matched all 94 remote file paths, modes, types and blob SHAs without truncation;
the checkout was clean. The existing Git-connected production deployment
[`dpl_FYL3onFBx2z7Fzr5XciATkZ4dJvx`](https://vercel.com/my-team-4f230354/agentcn-ui/FYL3onFBx2z7Fzr5XciATkZ4dJvx)
reached READY at that exact source and owns the canonical
[documentation site](https://agentcn-ui.vercel.app).

Build job `bld_egu3psmt7` completed the React-library TypeScript compile, produced
twenty self-contained registry entries, then passed Next.js 16.4.1 compilation
and website TypeScript checks. Its static export generated 35/35 pages and
completed in the existing Vercel build path. No build or provider configuration
was changed. This hosted build is distinct from the blocked local build and
the proposed unexecuted focused test job.

Connected Vercel HTTP readback returned 200 for eleven selected URLs: the full
registry, four new registry items, four component docs, `/create` and
`/components`. The index contains twenty entries with four source-only markers.
Every new registry's component, shared helper and stylesheet content matched
the published source exactly after the generator's documented relative-import
normalization: twelve file identities. All four docs expose their source-only
npm 0.1.0 notice and generated API reference; the configurator HTML exposes four
source markers. Its dynamic command behavior still needs browser acceptance.

The initial direct unauthenticated local fetch failed before a response with
`getaddrinfo ENOTFOUND agentcn-ui.vercel.app`. It was not retried with changed
permissions. The connected fetch succeeded and may use a temporary share link;
it does not prove independent anonymous browser access. The
[hosted machine record](brief-components-hosted.json) preserves deployment,
build, HTTP identity and transport limitations.

The separate 42-case/eight-scenario approval was requested against the immutable
published proposal. No CI job or browser check has run under that request, and
the proposed workflow remains inactive. Native drawer focus/touch, runtime
interaction, source installation and new package-consumer acceptance remain
unverified. No npm publication or local build occurred. This does not complete
the full library or portfolio goal.
