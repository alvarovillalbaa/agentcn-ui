# Working on agentcn-ui

Last updated: 2026-10-15

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
