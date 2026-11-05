# Working on agentcn-ui

Last updated: 2026-11-05

- Read README.md and git status before changing anything. Preserve unrelated work.
- Components live in packages/react/src; catalog.mjs owns names, presets, and palettes.
- Components are provider-neutral presentation. Keep runtime calls, credentials, persistence, and authorization in the consuming app.
- Source styles use ac- prefixes. Support dark mode, keyboard controls, empty/error/pending states, and reduced motion.
- Do not execute model-generated code or HTML. Approval callbacks capture intent; server authorization remains required.
- Edit source, then run npm run build:library to regenerate registry entries and API documentation. Do not hand-edit generated files.
- Use focused checks: npm run check:source, npm test, and git diff --check. Run full Next.js builds or browser QA only when explicitly requested.
- CLI changes must preserve overwrite guards, path containment, dry runs, and source ownership. Add focused tests when these contracts change.
- Generated output, node_modules, secrets, local paths, and package archives do not belong in Git.
- Keep release claims tied to current npm, deployment, and verification evidence. See docs/runbooks/release.md.

## Approved hosted browser scope — 5 November 2026

The owner's later “I approve everything / Keep going / Do all the work”
instructions cover the original four demos at desktop and narrow widths:
eight browser cases in `docs/proposals/hosted-browser-checks.md`, one temporary
public Ubuntu job per changed candidate, capped at 15 minutes. Pinned browser
tools/Chromium use owned external runner storage; no local install/build/server
or application dependency change is included. Keep the 42 passed React/CLI
cases closed. A small explicitly disabled MemberPicker demo entry exposes the
already implemented disabled-member behavior; component/library APIs, versions,
locks and generated files remain unchanged.

Use only the public documentation demos and anonymous registry reads. Preserve
source-only npm notices, page/registry identities, all tracked source/mode/byte
guards, request boundaries and owned process/pipe/scratch cleanup. Pin the
preparation SHA, fresh production READY metadata and four actually served HTML
hashes; static export has no deployment ID in HTML. The QA-only workflow is
retired after terminal evidence. No account, invitation, subscription, payment,
provider/model, Auth/configuration change or package release is part of this
scope. Normal Vercel deployment regenerates library/registry/docs; do not
regenerate or hand-edit ignored output locally below Storage Guard's reserve.

All eight hosted cases passed once at `af06c2ed908646eafb66fba2588eda0577228062`;
see `docs/results/2026/11-05/hosted-browser-checks.md`. Do not rerun closed scopes
merely because an earlier approval note is stale. Preserve the separately
failed local source-check/legacy ignored-output observation; clean CI guards
must remain strict. New npm/React 18 consumers and full-library proof stay open.
