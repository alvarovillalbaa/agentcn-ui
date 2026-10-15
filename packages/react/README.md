# @alvarovillalbaa/agentcn-ui

Last updated: 2026-10-15

React components for AI-native apps. Import components from `@alvarovillalbaa/agentcn-ui` and load `@alvarovillalbaa/agentcn-ui/styles.css` once in the application root.

```tsx
import { ContextWindow } from "@alvarovillalbaa/agentcn-ui";

<ContextWindow
  capacity={128000}
  segments={[{ id: "input", label: "Input", tokens: 8000 }]}
/>;
```

React 18.2 and 19 are peer dependencies. Components use typed controlled props and callbacks. Your application owns state updates, server authorization, data persistence, and agent execution. Async action failures render inline and do not imply success.

Override `--ac-*` CSS variables to theme your installation. Apply `.dark` or `data-ac-theme="dark"` on a parent for dark mode. The source-copy CLI is `agentcn-ui`.

See the [documentation](https://agentcn-ui.vercel.app/docs/) for live examples and API reference, and the [repository](https://github.com/alvarovillalbaa/agentcn-ui) for source and release evidence. MIT licensed.
