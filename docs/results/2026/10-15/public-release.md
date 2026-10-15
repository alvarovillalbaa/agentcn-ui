# Public release 0.1.0

Verified: 2026-10-15

Both packages are public with `latest` pointing to 0.1.0:

- [agentcn-ui](https://www.npmjs.com/package/agentcn-ui), the source-copy CLI. npm records publication at 2026-10-15T12:30:18.274Z.
- [@alvarovillalbaa/agentcn-ui](https://www.npmjs.com/package/@alvarovillalbaa/agentcn-ui), the React library. npm records publication at 2026-10-15T12:41:06.906Z.

The user completed npm browser authentication and published the two frozen archives. The earlier E403 preceded that login. The subsequent CLI E409 was a duplicate publication attempt. No account security settings or credentials were changed by the agent.

## Package verification

Registry integrity and clean-consumer lockfile integrity match the reviewed archives byte for byte. Archive SHA-256 values are in [package-artifacts.json](package-artifacts.json).

Machine-readable consumer results are in [public-consumers.json](public-consumers.json).

| Package       | Registry integrity                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------- |
| React library | `sha512-eDdfTHcMSiW5/clPM2IUgVaAlzYHpd1AGoUslfgTyGbfSXpODKnQZZFAMn9itGaGR1koHGl/NReb6GFO39Bz5w==` |
| CLI           | `sha512-CFIcYNt0g+Zf2oH5cJbuW+7VMOFuxIew0E6ulgMK6ozCtazQoiPctgC65bFzYLHLh1kHANoP0aEjD0ZZ3HOuFg==` |

- Clean temporary consumers with an empty npm user configuration installed the exact public library by name with React 18.2.0 and 19.3.1. Both passed all 16 runtime exports, the agent-run subpath, stylesheet resolution/content, and ContextWindow server rendering.
- A clean consumer installed the public CLI by name. `npx` and `npm exec` then ran that installed dependency with network access disabled, initialized indigo / soft / compact configuration, and installed all 16 component sources plus the shared helper. CSS readback matched the selected palette.
- pnpm 10.24.0 `exec` ran the publicly installed CLI and reported 0.1.0. Earlier pnpm `dlx` tests executed the reviewed archive, whose integrity matches the public package.
- Direct npm installs and registry metadata reads succeeded. Fresh remote npx/pnpm dlx resolution returned DNS ENOTFOUND in this execution environment; those exact download paths are not claimed as verified. Cached/installed-dependency execution and archive execution are distinguished above.

The [initial implementation record](initial-implementation.md) contains the production builds, 14 focused tests, three starter builds, source upload, desktop/mobile browser checks, configurator download/readback, and screenshots. The package archives were not modified during publication.

## Website and source

The [live site](https://alvarovillalbaa.github.io/agentcn-ui/) and [GitHub repository](https://github.com/alvarovillalbaa/agentcn-ui) provide the documentation, interactive components, workflow blocks, visual configurator, and maintained source. Obsolete publication-pending notices were removed after registry and public-consumer verification.

- The final Next.js production build passed. Export verification passed for all 31 HTML pages, local navigation/assets, and 16 registry endpoints with base path `/agentcn-ui`.
- Source checks passed for 48 files and all 16 component docs/examples. Formatting and `git diff --check` passed. Package implementations and the frozen archives were unchanged; the focused 14-test suite had already passed before publication.
- GitHub Pages reported `built` for `gh-pages` commit `bf0199e4304181835d4fae4b753c446a34ba9434` at 2026-10-15T12:46:00Z, with no build error.
- Browser readback confirmed the live installation guide and introduction contain the public install commands and no obsolete publication-pending callouts. No console errors were observed on these pages. Screenshot: [public-installation.jpg](public-installation.jpg).

The source release is [v0.1.0](https://github.com/alvarovillalbaa/agentcn-ui/releases/tag/v0.1.0). Its attached archives are the same reviewed artifacts verified against npm above.

Comprehensive WCAG certification, every possible component interaction, third-party shadcn CLI interoperability, and a production agent backend are outside the verified scope. The components expose callbacks; consuming applications own runtime execution and authorization.
