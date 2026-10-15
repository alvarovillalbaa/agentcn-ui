# Release agentcn-ui

Last updated: 2026-10-15

Current release version: 0.1.0. Both packages are public; the website is hosted on Vercel, Clous Team (Pro). See [public release evidence](../results/2026/10-15/public-release.md) for checks and limits. This procedure describes release work, not proof that each step was performed.

1. Use a clean checkout and Node.js 22+. Run `npm ci` against the committed lockfile. Keep registry dependencies and workspace links portable. Never commit node_modules or external local paths.
2. Run `npm run build:library`, `npm run check:source`, `npm test`, and `git diff --check`. With explicit authorization, run `npm run build:website` and browser acceptance at desktop and mobile widths.
3. Check all 16 component docs, both workflow blocks, navigation, search, dark mode, copy buttons, configuration URL reload, and JSON download. Test keyboard operation and reduced motion. No full accessibility conformance claim is established yet.
4. Run `npm run pack:release`. Inspect both archives. Install each in a clean consumer and verify imports, CSS loading, `npx` execution, `npm exec`, and `pnpm dlx`. Confirm React 18 and 19 behavior. Source code installs and local React 19 checks alone do not prove that matrix.
5. Confirm npm ownership and availability of `agentcn-ui` and `@alvarovillalbaa/agentcn-ui`. The npm browser account was verified as alvarovillalbaa during initial setup. Recheck CLI identity and registry publish access for every release.
6. Publish the reviewed archives with `npm publish <library-archive.tgz> --access public`, then `npm publish <cli-archive.tgz> --access public`. Complete any required npm authentication directly. Verify registry metadata and integrity against the reviewed archives, then install the exact public versions in a new consumer before claiming public installation works. An already published version cannot be overwritten; release changed package contents under a new version.
7. Vercel connects to `main` with Root Directory `apps/www`. `apps/www/vercel.json` installs and builds from the workspace root and serves the Next.js static export in `out`. Leave `NEXT_PUBLIC_BASE_PATH` unset for `/`. When authorized, push reviewed source; verify the exact Vercel commit, READY state, production alias, HTTP responses, and `npm run check:export` against a root-path export. Do not publish the old `gh-pages` branch. See [deployment evidence](../deployment.md).
8. Verify the live home, gallery, docs, blocks, `/create`, and every `/r/<component>.json` endpoint. If claiming shadcn CLI interoperability, additionally validate against its current schemas and test a real shadcn install. The project has its own installer; registry JSON shape alone is not proof of third-party CLI compatibility.
9. Replace release-pending notices only after npm and the site have been verified. Add the deployed homepage to package metadata and the repository About section. Tag the reviewed commit and create release notes after the release is confirmed.

The initial deployment was explicitly approved by the user. No custom CI workflow, paid host, or custom domain was configured. Public npm publication and a GitHub source upload are separate from the hosted site; record each independently.
