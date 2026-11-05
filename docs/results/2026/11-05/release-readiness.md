# New-package release readiness

5 November 2026. Read-only follow-up after the eight browser cases passed.
No version, lock, catalog, release workflow, archive or package was changed.

At **05:24:53 UTC**, one standard
`npm whoami --registry=https://registry.npmjs.org --fetch-retries=0 --fetch-timeout=15000`
lookup exited 1 with `getaddrinfo ENOTFOUND registry.npmjs.org`. At **05:25:33 UTC**,
one independent `npm view <package> name version dist-tags maintainers.name --json`
lookup for each of `@alvarovillalbaa/agentcn-ui` and `agentcn-ui` also failed
ENOTFOUND. No unchanged lookup was retried, no login/configuration/credential
file was inspected and both task-owned temporary caches were removed.

These transport failures leave current account identity, maintainers, publish
access and version availability **unverified**. They do not establish missing
authentication or package absence. The October release record's browser account
is historical identity evidence, not a current permission check.

Both public manifests and CLI version literals remain 0.1.0; the four added
components remain `sourceOnly`. An additive 0.2.0 release is a candidate only,
with availability unverified. The source prerequisites for a concrete release:

- Align the two public manifests, CLI help/version literals, workspace lock
  metadata and website library dependency. Preserve schema `config.version: 1`
  and unrelated starter private-app versions.
- Replace old archive/version assumptions in `tests/smoke/packages.mjs`, which
  currently covers older components rather than all twenty exports/new four.
- Build reviewed twenty-entry tarballs and inspect exports, declarations, CSS,
  package contents and CLI bin. Keep existing 0.1.0 archives/evidence immutable.
- Verify clean installed React 18/19 consumers and actual packaged CLI flows,
  including source installation of all twenty components. Record the actual
  npm/npx/pnpm boundaries exercised rather than infer one from another.
- Verify current identity/access and exact-version availability, publish those
  reviewed archives, then verify public integrity and installed consumers.
  Only afterward remove the four source-only notices and regenerate the site.

The [release runbook](../../../runbooks/release.md) still describes the original
sixteen-component release; it needs a version-scoped update when the new release
is concretely prepared. No build/install/pack/test/publication ran in this
readiness pass. Browser acceptance is recorded separately in
[the eight-case receipt](hosted-browser-checks.md); full-library release remains open.
