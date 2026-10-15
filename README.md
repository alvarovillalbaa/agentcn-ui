# agentcn/ui

Last updated: 2026-10-15

**Interfaces for apps that think.** An MIT-licensed React component library for AI-native apps: agent execution, human approvals, context, memory, artifacts, and evaluation.

Use a typed npm package, or copy editable source with a CLI. A Next.js website includes live demos, per-component API documentation, workflow blocks, and a visual installation configurator.

**Status:** the documentation site is live at [alvarovillalbaa.github.io/agentcn-ui](https://alvarovillalbaa.github.io/agentcn-ui/). Production builds, focused tests, desktop/mobile browser checks, and local package archive installs pass. Public npm publication is pending; `@latest` commands become available after publication. Use the local CLI or package archives today.

## Components

| Area               | Components                                    |
| ------------------ | --------------------------------------------- |
| Orchestration      | AgentRun, ToolCall, AgentHandoff, ModelRouter |
| Human control      | ApprovalRequest, PlanReview, Checkpoint       |
| Context and memory | ContextWindow, MemoryPanel, SourceStack       |
| Conversation       | PromptComposer, BranchPicker                  |
| Generation         | ArtifactPanel, StreamStatus                   |
| Observability      | TokenUsage, EvalScorecard                     |

Components receive data and emit callbacks. Your application owns runtime execution, model calls, authorization, persistence, and state transitions. No API keys, AI SDK, Tailwind setup, or runtime service are required.

## Package installation (after publication)

```sh
npm install @alvarovillalbaa/agentcn-ui
# or
pnpm add @alvarovillalbaa/agentcn-ui
```

```tsx
import "@alvarovillalbaa/agentcn-ui/styles.css";
import { ContextWindow } from "@alvarovillalbaa/agentcn-ui";

export default function Usage() {
  return (
    <ContextWindow
      capacity={128000}
      segments={[{ id: "conversation", label: "Conversation", tokens: 12000 }]}
    />
  );
}
```

Import styles once in the root layout. React 18.2 and 19 are supported. Individual entry points such as `@alvarovillalbaa/agentcn-ui/agent-run` are also exported.

## Own the source (after publication)

```sh
npx agentcn-ui@latest init
npx agentcn-ui@latest add agent-run approval-request
# or
pnpm dlx agentcn-ui@latest init
pnpm dlx agentcn-ui@latest add agent-run approval-request
```

The CLI copies TypeScript and scoped CSS into your app. Configure palette, radius, density, component directory, and CSS path in `agentcn.json`. It bundles the registry and makes no network calls. Existing changed files require `--overwrite`; use `--dry-run` to inspect the write plan.

```sh
npx agentcn-ui@latest create my-agent --preset research --palette forest --yes
cd my-agent
npm install
npm run dev
```

Presets: `copilot`, `research`, `operations`. New projects use Next.js App Router. Generated examples are local demonstrations; connect callbacks to your backend.

## Develop locally

Requires Node.js 22+ and npm 10+.

```sh
npm install
npm run build:library
npm run dev
```

The default Next.js dev URL is `http://localhost:3000`. Visit `/components`, `/docs`, `/blocks`, and `/create`.

Run the local source installer without publishing:

```sh
node packages/cli/bin/agentcn.mjs init --cwd /path/to/your-app --yes
node packages/cli/bin/agentcn.mjs add agent-run --cwd /path/to/your-app
```

Prepare archives for local package installation:

```sh
npm run pack:release
# npm install /path/to/alvarovillalbaa-agentcn-ui-0.1.0.tgz
# npx /path/to/agentcn-ui-0.1.0.tgz --help
```

## Verification

```sh
npm run build:library  # Compile the React package and generate registries/API docs
npm run check:source   # Syntax, local imports, registry/doc coverage
npm test               # Disposable CLI installs and focused React interactions
npm run build:website  # Full production build; run when explicitly authorized
```

Source checks are not a Next.js build, browser QA, or accessibility certification. See [current evidence](docs/results/2026/10-15/initial-implementation.md) and [release procedure](docs/runbooks/release.md).

## Workspace

- `packages/react` — component source, declarations, ESM exports, scoped styles
- `packages/cli` — dependency-free Node CLI and bundled component registry
- `apps/www` — Next.js site, component gallery, demos, docs, blocks, kit builder
- `catalog.mjs` — canonical catalog, presets, and palettes
- `scripts/build-registry.mjs` — generate source registries and docs from TypeScript
- `tests/integration` — local filesystem and mock UI behavior checks

Generated registries and component API docs come from the source. Rebuild them after component changes. Do not edit generated artifacts by hand.

## Inspiration and provenance

The source-ownership distribution model is informed by [shadcn/ui](https://github.com/shadcn-ui/ui), its [registry format](https://ui.shadcn.com/docs/registry/registry-json), and its [project creator](https://ui.shadcn.com/create). [Vercel AI Elements](https://elements.ai-sdk.dev/) informed the AI-interface focus. This implementation is original and does not vendor their component code. Package versions for the Next.js starter were checked against the npm registry on 2026-10-15.

## License

[MIT](LICENSE). Copyright 2026 Alvaro Villalba Perez.
