# Vercel hosting

Configured on 15 October 2026 at the owner's request.

- Production: https://agentcn-ui.vercel.app/
- Team: Clous Team (Pro), `my-team-4f230354`.
- Project: `agentcn-ui`, `prj_ST0sdZyDIHRbGULu3uobbfRwLh0w`.
- Source: `alvarovillalbaa/agentcn-ui`, production branch `main`; Root Directory **`apps/www`**.
- Preset **Other** (`framework: null`) serves the existing Next.js static export. `apps/www/vercel.json` installs and builds from the workspace root, then serves `out/` relative to the app directory.
- Leave `NEXT_PUBLIC_BASE_PATH` unset for `/`. No runtime functions or required environment variables are introduced.

An initial Next.js-preset deployment failed with `NEXT_NO_ROUTES_MANIFEST` because the explicit `out` override was interpreted as Next.js internal build output. Switching to Other preserved the static-export architecture; deployment `dpl_4eX5ZQj75rCJb67QczYfnykUB5QN` reached READY from `cc2113a89edb53f601b042411a314358e5d0a5ab`.

GitHub Pages cutover and verification of the migrated source are recorded below after publication. Published npm version 0.1.0 is unchanged; source homepage updates apply to a future package release.
