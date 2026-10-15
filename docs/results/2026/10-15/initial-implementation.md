# Initial implementation evidence

Last updated: 2026-10-15

This records the initial implementation and handoff, including the publication blockers at that time. [Public release evidence](public-release.md) supersedes the remaining publication status below.

The requested project is agentcn-ui, a reusable React/Next.js component system for AI-native apps with an installable package, source-copy CLI, website, configurable installation, and source uploaded under alvarovillalbaa on GitHub.

## Implemented

- Sixteen original React components with TypeScript exports and scoped CSS. Components cover orchestration, human decisions, context, memory, conversation branching, artifacts, streaming, and evaluation.
- ESM library build and declarations, package subpath exports, explicit CSS import, React 18.2/19 peer range.
- Node CLI with init, add, list, and Next.js create; three presets; four palettes; radius/density configuration; custom directories; dry-run and overwrite protection; project path and symlink guards.
- Next.js website source: landing page, searchable/filterable component gallery, component docs, API tables generated from source, live examples, two composed workflow blocks, installation/concept/configuration/theming/runtime/accessibility/CLI guides, light/dark themes, responsive styles, loading/error/not-found states.
- Visual configurator with component selection, palette/radius/density preview, npm/npx and pnpm commands, JSON download, and URL sharing.

## Verified locally

- `npm run build:library`: passed. Compiled React ESM and declarations and generated 16 registry entries, source-derived API docs, and examples.
- `npm run check:source`: passed for 48 source files; all 16 registry items have API documentation and examples.
- `npm test`: 14 passed. CLI file guards, idempotency, all presets, mock approval pending/error behavior, safe artifact escaping/source links, context overflow, and empty plan behavior.
- Full source uploaded to https://github.com/alvarovillalbaa/agentcn-ui at e31b57619710793ac40d25442116d7835d152ea1. The remote main ref and the scoped React package manifest were read back through GitHub after upload.
- Clean online dependency install succeeded after removing the temporary bootstrap links. package-lock.json contains registry resolutions and local workspace links, with no links to unrelated projects.
- `npm ci --ignore-scripts --no-audit --no-fund` passed against the committed lockfile (76 packages). Formatting and authored-source whitespace checks passed; a staged scan found no unrelated local project paths or recognizable npm/GitHub token formats.
- Next.js 16.4.1 / React 19.3.1 production build and static export passed. Export verification checked 31 HTML pages, local asset/navigation targets, and 16 registry JSON endpoints with base path /agentcn-ui.
- Both package archives were built with licenses, source, ESM, declarations, and bundled registry content. Clean npm archive consumers passed public imports, individual entry points, CSS presence, and server rendering with React 18.2.0 and 19.3.1. Packaged CLI installs via npm exec and npx passed. These are archive tests, not public registry tests.
- pnpm 10.24.0 dlx executed the packaged CLI archive and reported version 0.1.0. Its cache/store were placed in writable temporary directories. Public-registry pnpm execution still requires publication.
- All three presets were generated from the packaged CLI using npm exec, then installed in clean disposable projects and built with Next.js 16.4.1: copilot, research, and operations passed compilation, TypeScript, and page generation.
- The configurator's downloaded JSON was used by the packaged CLI to install all five selected research components. Readback confirmed accent #4f46b8, radius 20px, spacing 14px, and the corresponding dark palette.
- Frozen archive filenames, sizes, and SHA-256 hashes are recorded in package-artifacts.json. These are the reviewed 0.1.0 artifacts handed to the user for publication; do not silently replace them while publication is pending.

## Hosted website and browser checks

- User explicitly authorized production builds, browser QA, and GitHub Pages deployment during this session.
- GitHub Pages reports built for deployment commit 35010d50c678ce6df1a5c4a76f41e978fd1b1cfb, with source gh-pages at /. Live URL: https://alvarovillalbaa.github.io/agentcn-ui/. The repository homepage metadata points there.
- Live desktop browser checks confirmed homepage rendering, run pause state, approval decisions, dark/light themes, gallery search, documentation navigation, generated API tables, and copying example source.
- Configurator checks confirmed palette/radius/density changes, preset component selection, pnpm command output, sharing, and design/component restoration after URL reload. The downloaded agentcn.json was read back and matched indigo / soft / compact. The browser download event observer timed out, but the actual file existed and was verified.
- At a 390px viewport, the configurator and workflow blocks fit without horizontal overflow (document width 375px). Mobile navigation, Ctrl+Enter prompt submission, and approval-driven shared state updates passed.
- Browser console observations showed extension-origin warnings, with no application-origin errors observed in the inspected flows. This is bounded browser QA, not comprehensive accessibility certification.
- Screenshot evidence: homepage.jpg, configurator.jpg, and mobile-workflow.jpg in this folder. The viewport override was reset after mobile checks.
- A share-state defect found during QA was corrected and deployed: preset and package-manager choices are included in shared URLs; selected presets expose aria-pressed. Live readback confirmed research selected, pnpm commands, indigo, soft corners, compact density, and five selected components after hydration. No application-origin console errors were observed in this check.
- Run resume and memory removal were also exercised on the live homepage. The approval-driven mobile block changed run state and artifact content together after Ctrl+Enter submission.

## Limits and remaining work

- Initial shell GitHub connectivity recovered; later npm identity and npm exec requests failed with DNS ENOTFOUND. Clean dependency installs through direct npm install commands succeeded. Do not conflate these differing observations.
- The local listener was denied with EPERM at 127.0.0.1:3317. No local server is running; browser QA used the approved hosted deployment.
- The user completed npm login. The authenticated npm browser profile is alvarovillalbaa; the library was moved from the unowned proposed scope to @alvarovillalbaa/agentcn-ui. CLI publication remains agentcn-ui. CLI identity and publish access still require a successful registry check.
- Public package publication, real public npm/npx/pnpm consumer installs, full component interaction coverage, and shadcn CLI compatibility remain unverified.
- The reviewed React archive publish request failed with ENOTFOUND resolving registry.npmjs.org. No successful publication is claimed. Subsequent public metadata reads returned E404 for both package names. The authenticated npm browser's staged packages page contained no versions awaiting review and offered no upload route.
- The user was given the two exact relative archive publish commands to run from their terminal. Public package verification must follow their completion; no credentials or account security settings were changed by the agent.
- Starter Next.js 16.4.1 and React 19.3.1 version choices were checked against official npm metadata: https://registry.npmjs.org/next/latest and https://registry.npmjs.org/react/latest on 2026-10-15. Cached local React 19.2.3 was used only for initial verification.
- No custom CI workflow, secrets, external model runtime, paid resources, or custom domain were created. The approved deployment uses GitHub's standard Pages mechanism.

## Completion audit

| User requirement                                 | Evidence                                                                                                          | State                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| AI-native reusable React components              | 16 source implementations, ESM/declarations, docs/gallery, React 18/19 archive smoke checks                       | Implemented and checked within the recorded scope      |
| React/Next.js website                            | Production export and live desktop/mobile browser checks                                                          | Live                                                   |
| Configurable installation like a project creator | Live kit builder, URL restoration, downloaded JSON installed through packaged CLI, three generated starter builds | Implemented and checked                                |
| Easy npm/npx/pnpm installation                   | All archive paths checked; public registry packages still return E404                                             | Incomplete until publication and clean public installs |
| Upload under alvarovillalbaa on GitHub           | Remote main ref and package manifest read back; Pages branch deployed                                             | Uploaded                                               |

At this initial handoff, completion was not established. The subsequent [public release record](public-release.md) documents publication and clean public consumer installs. shadcn CLI interoperability and comprehensive accessibility certification remain unclaimed, separate checks.
