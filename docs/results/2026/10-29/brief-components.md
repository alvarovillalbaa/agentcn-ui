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

Publication, hosted compile, served documentation/registry identity, native
drawer focus/touch and package consumer checks remain to be recorded. No npm
publication, local build, CI or browser check occurred. This does not complete
the full library or portfolio goal.
