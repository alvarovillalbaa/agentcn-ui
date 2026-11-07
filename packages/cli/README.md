# agentcn-ui

Last updated: 2026-11-07

Copy editable React components for AI-native apps into your project. Requires Node.js 22+.

Version 0.2.0 bundles twenty component targets, including `multi-input`,
`member-picker`, `creatable-select` and `pricing-table`. Version 0.1.0 bundles
the original sixteen. The repository's release evidence records public
availability separately from archive preparation.

```sh
npx agentcn-ui@latest init
npx agentcn-ui@latest add agent-run approval-request
pnpm dlx agentcn-ui@latest create my-agent --preset research --yes
```

Commands: `init`, `add`, `create`, `list`. Run `--help` for all flags. Source and CSS are bundled; no network calls or dependency installs are performed by the CLI. React must already be present in an existing app.

The installer uses agentcn.json for component and CSS paths, palette, radius, and density. Review conflicts before using `--overwrite`; use `--dry-run` for a write preview. Existing destination directories are refused by create. Paths escaping the project, symlinks, Git metadata, and node_modules are rejected.

For local development, build the repository, then run `node packages/cli/bin/agentcn.mjs --help`. See the [documentation](https://agentcn-ui.vercel.app/docs/) and [GitHub](https://github.com/alvarovillalbaa/agentcn-ui). MIT licensed.
