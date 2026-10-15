# Vercel hosting

Configured on 15 October 2026 at the owner's request.

- Production: https://agentcn-ui.vercel.app/
- Team: Clous Team (Pro), `my-team-4f230354`.
- Project: `agentcn-ui`, `prj_ST0sdZyDIHRbGULu3uobbfRwLh0w`.
- Source: `alvarovillalbaa/agentcn-ui`, production branch `main`; Root Directory **`apps/www`**.
- Preset **Other** (`framework: null`) serves the existing Next.js static export. `apps/www/vercel.json` installs and builds from the workspace root, then serves `out/` relative to the app directory.
- Leave `NEXT_PUBLIC_BASE_PATH` unset for `/`. No runtime functions or required environment variables are introduced.

An initial Next.js-preset deployment failed with `NEXT_NO_ROUTES_MANIFEST` because the explicit `out` override was interpreted as Next.js internal build output. Switching to Other preserved the static-export architecture; deployment `dpl_4eX5ZQj75rCJb67QczYfnykUB5QN` reached READY from `cc2113a89edb53f601b042411a314358e5d0a5ab`.

The verified cutover to Vercel is recorded below. Published npm version 0.1.0 is unchanged; source homepage updates apply to a future package release.

## Verified cutover

- **Target / status:** production / READY, Git-triggered deployment from `080ae376bdb5d7a546a549d9b34d65552bf428ce`.
- **Deployment:** [dpl_5GNksH5EQJxi47JmzUwg5bcfp4PE](https://vercel.com/my-team-4f230354/agentcn-ui/5GNksH5EQJxi47JmzUwg5bcfp4PE); framework Other (Next.js static export); build duration 18.1s.
- **HTTP:** 65 production URL checks matched expectations, including one expected 404. The generated registry index points to the Vercel domain. See [machine-readable results](deployment-verification.json).
- **GitHub:** `main` push triggered the deployment automatically; the repository homepage now points to Vercel. Pages is disabled (`has_pages: false`), and the former Pages URL returns HTTP 404. No old-URL redirect is configured.
- **Checks:** `npm run build:library`, `npm run check:source` (48 files / 16 entries), and all 14 focused tests passed. Vercel completed the production Next.js build. `git diff --check` passed.
- **Observability:** the last-hour Vercel runtime-error scan returned no errors. Drains inventory returned HTTP 404, so drains/continuous monitoring are unverified. Static delivery and HTTP checks do not prove browser interactions or physical audio output.

The migration adds no dependencies or required environment variables. Browser interaction QA was not rerun against these Vercel sites; earlier browser evidence remains scoped to its original deployment. The following evidence-only commit may trigger a fresh build; the source commit above identifies the fully checked migration build.
