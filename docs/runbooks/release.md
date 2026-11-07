# Release agentcn-ui

Last updated: 2026-11-07

Recorded public release: 0.1.0, covering the original sixteen components. See
[public release evidence](../results/2026/10-15/public-release.md) for its checks
and limits. The website is hosted on Vercel, Clous Team (Pro). The prepared
additive **0.2.0 candidate** includes all twenty source components and has
[accepted archive/installed-consumer evidence](../results/2026/11-07/package-release-checks.md).
It is not published to npm merely because those checks passed. Current npm
identity, access and exact-version availability remain unverified in the
[readiness observation](../results/2026/11-05/release-readiness.md).

The [0.2.0 archive/consumer proposal](../proposals/package-release-checks.md)
records the completed bounded CI packet. Preparation changed only the two public
versions, matching workspace lock metadata, website library dependency and CLI
help/version literals. Preserve private app versions and configuration schema
version 1. Keep MultiInput, MemberPicker, CreatableSelect and PricingTable marked
source-only until actual public publication, integrity and consumers pass.
The accepted archive packet does not complete the later authenticated npm,
public-registry consumer or website publication steps below.

1. Use a clean checkout and Node.js 22+. Run `npm ci` against the committed lockfile. Keep registry dependencies and workspace links portable. Never commit node_modules or external local paths.
2. For the 0.2.0 packet, follow the scoped proposal: build/generate only in the owned CI export and run the new archive/consumer fixture and static source guards. Do not run the closed `npm test` 42-case suite or eight-browser scope as part of version alignment. A website build or new browser acceptance requires its own scope; retain `git diff --check` for source edits.
3. For 0.2.0, inspect all twenty component docs and both workflow blocks. Preserve the completed 42-case and eight-browser receipts; do not rerun closed scopes merely for version alignment. New website/browser work requires its own scope. Navigation, search, dark mode, copy buttons, configuration URL reload, JSON download, keyboard operation and reduced motion remain distinct claims; no full accessibility conformance is established.
4. In the owned CI export, prepare `alvarovillalbaa-agentcn-ui-0.2.0.tgz` and `agentcn-ui-0.2.0.tgz` using the existing `npm run pack:release` path. Inspect original archives, all twenty root/subpath exports, declarations, CSS and CLI registry/bin. Verify clean React 18.2.0/19.3.1 archive consumers, installed TypeScript compilation with `skipLibCheck: false`, the authored SSR/new-four interaction fixture and actual packaged CLI installation of all twenty components. Exercise the pinned pnpm 10.18.3 archive `dlx` seam separately. Record `npm exec`, `npx` and `pnpm dlx` only if each actually runs; a local tarball invocation does not establish public registry installation. Do not replace or overwrite the 0.1.0 archives/evidence.
5. Separately confirm current npm ownership/access and exact 0.2.0 availability for `agentcn-ui` and `@alvarovillalbaa/agentcn-ui` before publication. Historical browser identity and anonymous metadata do not establish current authenticated publish access. Do not interpret ENOTFOUND or another transport error as missing authentication/package absence. Authentication and publication are outside the archive/consumer packet.
6. Publish the reviewed archives with `npm publish <library-archive.tgz> --access public`, then `npm publish <cli-archive.tgz> --access public`. Complete any required npm authentication directly. Verify registry metadata and integrity against the reviewed archives, then install the exact public versions in a new consumer before claiming public installation works. An already published version cannot be overwritten; release changed package contents under a new version.
7. Vercel connects to `main` with Root Directory `apps/www`. `apps/www/vercel.json` installs and builds from the workspace root and serves the Next.js static export in `out`. Leave `NEXT_PUBLIC_BASE_PATH` unset for `/`. When authorized, push reviewed source; verify the exact Vercel commit, READY state, production alias, HTTP responses, and `npm run check:export` against a root-path export. Do not publish the old `gh-pages` branch. See [deployment evidence](../deployment.md).
8. Verify the live home, gallery, docs, blocks, `/create`, and every `/r/<component>.json` endpoint. If claiming shadcn CLI interoperability, additionally validate against its current schemas and test a real shadcn install. The project has its own installer; registry JSON shape alone is not proof of third-party CLI compatibility.
9. Replace release-pending notices only after npm and the site have been verified. Add the deployed homepage to package metadata and the repository About section. Tag the reviewed commit and create release notes after the release is confirmed.

## Exact reviewed 0.2.0 archives

GitHub candidate publication is separate from npm publication. The
[`v0.2.0-candidate.1` prerelease](https://github.com/alvarovillalbaa/agentcn-ui/releases/tag/v0.2.0-candidate.1)
is public; use a fresh directory to download the two reviewed assets. Verify
both hashes before using an existing authenticated npm session with the required
package permissions. These commands have not published npm 0.2.0:

```sh
set -eu
curl --fail --location --proto '=https' --proto-redir '=https' --output alvarovillalbaa-agentcn-ui-0.2.0.tgz https://github.com/alvarovillalbaa/agentcn-ui/releases/download/v0.2.0-candidate.1/alvarovillalbaa-agentcn-ui-0.2.0.tgz
curl --fail --location --proto '=https' --proto-redir '=https' --output agentcn-ui-0.2.0.tgz https://github.com/alvarovillalbaa/agentcn-ui/releases/download/v0.2.0-candidate.1/agentcn-ui-0.2.0.tgz
shasum -a 256 -c <<'SHA256'
81829d3bfc376339e1f48fc123ded93b471e7bd7c654e5c2afba1a17bf1c226d  alvarovillalbaa-agentcn-ui-0.2.0.tgz
fcfee32999e0df538c265fbd199297d89da9f049b5ffd45720f78812f44c5491  agentcn-ui-0.2.0.tgz
SHA256
npm publish ./alvarovillalbaa-agentcn-ui-0.2.0.tgz --access public
npm publish ./agentcn-ui-0.2.0.tgz --access public
```

Stop if either hash differs, authenticated access is unavailable or either exact
version already exists. Never overwrite or rebuild these reviewed archives for
publication. After publication, compare public registry integrity and perform
fresh exact-version public consumers before removing source-only notices.

The initial deployment was explicitly approved by the user. That initial
release configured no custom CI workflow or custom domain; later focused
packets use separately scoped temporary manual workflows. No new paid service
is part of the 0.2.0 packet. Public npm publication and a GitHub source upload
are separate from the hosted site; record each independently.
