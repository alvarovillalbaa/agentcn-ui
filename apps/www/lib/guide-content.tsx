import Link from "next/link";
import type { ReactNode } from "react";
import { Command } from "@/components/command";
import { CopyButton } from "@/components/copy-button";
function Code({ children }: { children: string }) {
  return (
    <div className="code-block">
      <CopyButton value={children} />
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}
export const guideContent: Record<
  string,
  { title: string; description: string; content: ReactNode }
> = {
  installation: {
    title: "Start with one component.",
    description:
      "Use npm imports, or install editable source with npx and pnpm dlx.",
    content: (
      <>
        <h2>Requirements</h2>
        <p>
          React 18.2 or 19, TypeScript, and a modern browser. The CLI needs
          Node.js 22 or newer. The Next.js starter uses the App Router. Tailwind
          and an AI SDK are optional.
        </p>
        <h2>Option 1: npm package</h2>
        <Command
          args=""
          mode="install"
          packageName="@alvarovillalbaa/agentcn-ui"
        />
        <p>Import the stylesheet in your root layout or application entry:</p>
        <Code>{`import "@alvarovillalbaa/agentcn-ui/styles.css";`}</Code>
        <p>Then render a component:</p>
        <Code>{`import { ContextWindow } from "@alvarovillalbaa/agentcn-ui";

export default function Usage() {
  return <ContextWindow capacity={128000} segments={[
    { id: "conversation", label: "Conversation", tokens: 12000 }
  ]} />;
}`}</Code>
        <h2>Option 2: own the source</h2>
        <Command args="init" />
        <p>Choose your palette, radius, and density, then add components:</p>
        <Command args="add agent-run approval-request" />
        <p>
          The CLI creates <code>agentcn.json</code>, a stylesheet, the selected
          components, and a shared helper. It does not execute dependency
          installs. Review every planned change with <code>--dry-run</code>.
        </p>
        <Code>{`// app/layout.tsx
import "../styles/agentcn.css";

// In a client component:
import { AgentRun } from "@/components/agentcn/agent-run";`}</Code>
        <p>
          The <code>@/</code> alias in this example must be configured by your
          app. Relative imports work too.
        </p>
        <h2>Start a new Next.js app</h2>
        <Command args="create my-agent --preset copilot --palette forest --yes" />
        <Code>{`cd my-agent
npm install
npm run dev`}</Code>
        <p>
          The starter is a local demonstration. Connect its callbacks to a real
          agent API. You can also use <code>pnpm install</code> and{" "}
          <code>pnpm dev</code>.
        </p>
        <h2>Configure visually</h2>
        <p>
          The <Link href="/create">kit builder</Link> previews every design
          choice and generates matching install commands.
        </p>
        <div className="callout">
          <strong>Initial release</strong>
          <p>
            Registry publication is pending. Until npm packages are published,
            build the repository and run{" "}
            <code>node packages/cli/bin/agentcn.mjs</code> in place of{" "}
            <code>npx agentcn-ui@latest</code>. See the repository README for
            local setup.
          </p>
        </div>
      </>
    ),
  },
  ownership: {
    title: "Choose how you own it.",
    description: "One component system, two distribution models.",
    content: (
      <>
        <h2>Use the package</h2>
        <p>
          Package imports keep updates in your package manager. Named exports
          support tree shaking, and individual entry points let you import only
          what you need. Styles are explicit so your app controls where they
          load.
        </p>
        <Code>{`import { AgentRun } from "@alvarovillalbaa/agentcn-ui";
// Or use the individual entry point:
import { AgentRun } from "@alvarovillalbaa/agentcn-ui/agent-run";`}</Code>
        <h2>Copy the source</h2>
        <p>
          The CLI copies editable TypeScript and CSS into your repository. There
          is no remote registry dependency at install time: the component source
          is bundled with the CLI version. You can remove a prop, change markup,
          or replace styles without waiting for a release.
        </p>
        <h2>Updates are a review decision</h2>
        <p>
          Source installs never silently replace changed files. Run{" "}
          <code>add --dry-run</code> against the new CLI, compare the proposal,
          and use <code>--overwrite</code> only after reviewing the affected
          files. Shared helpers and CSS can affect every installed component.
        </p>
        <h2>Presentation and execution</h2>
        <p>
          Components describe state and capture intent. They do not own model
          credentials, authorize operations, or persist data. That boundary
          keeps them useful with AI SDK, custom WebSocket streams, local models,
          and server actions.
        </p>
      </>
    ),
  },
  configuration: {
    title: "A small configuration surface.",
    description: "Keep your design choices alongside your source.",
    content: (
      <>
        <p>
          <code>agentcn.json</code> is read by the source installer. Commit it
          with the components so future additions use the same design.
        </p>
        <Code>{`{
  "version": 1,
  "components": "components/agentcn",
  "css": "styles/agentcn.css",
  "palette": "forest",
  "radius": "rounded",
  "density": "comfortable"
}`}</Code>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Values / meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>version</td>
                <td>1</td>
              </tr>
              <tr>
                <td>components</td>
                <td>Relative project directory for component source</td>
              </tr>
              <tr>
                <td>css</td>
                <td>Relative path ending in .css</td>
              </tr>
              <tr>
                <td>palette</td>
                <td>forest, ink, indigo, ember</td>
              </tr>
              <tr>
                <td>radius</td>
                <td>sharp (4px), rounded (12px), soft (20px)</td>
              </tr>
              <tr>
                <td>density</td>
                <td>compact (14px), comfortable (20px)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h2>Changing a design</h2>
        <p>
          Edit the config and run the add command again. A changed stylesheet
          requires explicit <code>--overwrite</code>. Inspect the dry run first.
          Alternatively, update CSS variables directly.
        </p>
        <h2>Path handling</h2>
        <p>
          Paths are relative to your project root. Absolute paths, parent
          traversal, symlink destinations, and writes into Git metadata or
          node_modules are rejected. The CLI checks all destinations before
          beginning the write plan.
        </p>
        <h2>Share your kit</h2>
        <p>
          The <Link href="/create">configurator</Link> can export the same
          configuration and copy a URL containing your selected components and
          design settings. No account is required.
        </p>
      </>
    ),
  },
  theming: {
    title: "Fit your existing system.",
    description:
      "Scoped class names, CSS variables, and no required Tailwind setup.",
    content: (
      <>
        <h2>Design tokens</h2>
        <p>
          Load the stylesheet first, then override variables. Components use{" "}
          <code>ac-</code> class names to avoid collisions with your app.
        </p>
        <Code>{`:root {
  --ac-bg: #ffffff;
  --ac-subtle: #f7f8f9;
  --ac-fg: #1a1d21;
  --ac-muted: #636b76;
  --ac-border: #e5e7eb;
  --ac-accent: #28624e;
  --ac-accent-fg: #ffffff;
  --ac-danger: #bb302e;
  --ac-success: #24724f;
  --ac-radius: 12px;
  --ac-space: 20px;
  --ac-font: inherit;
}`}</Code>
        <h2>Dark mode</h2>
        <p>
          Apply <code>data-ac-theme="dark"</code> or the <code>dark</code> class
          to a containing element. The package does not change your application
          theme or write to local storage.
        </p>
        <Code>{`<div data-ac-theme="dark">
  <ContextWindow capacity={128000} segments={segments} />
</div>`}</Code>
        <h2>Density</h2>
        <p>
          Set <code>data-ac-density="compact"</code> on a container, or override{" "}
          <code>--ac-space</code>. You can scope a different design to a single
          workspace using the <code>ac-theme</code> class.
        </p>
        <h2>Using shadcn/ui</h2>
        <p>
          Both libraries can coexist. Map agentcn variables to your existing
          theme tokens if you want a shared visual language. Source components
          use native controls and bring no competing primitive framework.
        </p>
      </>
    ),
  },
  "runtime-integration": {
    title: "Your runtime stays yours.",
    description:
      "Connect typed props and callbacks to the state you already own.",
    content: (
      <>
        <h2>Stream state into props</h2>
        <p>
          Adapt server events to the component’s public types in your
          application. AgentRun expects a run status and stable step IDs.
          ToolCall accepts structured input and output values. These components
          do not require a particular stream protocol.
        </p>
        <h2>Save a decision</h2>
        <p>
          Keep an approval pending until the server accepts a decision. Throw an
          error when the request fails so the component can display it.
        </p>
        <Code>{`"use client";
import { useState } from "react";
import { ApprovalRequest } from "@alvarovillalbaa/agentcn-ui";

export default function PublishApproval({ requestId }: { requestId: string }) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  return <ApprovalRequest
    title="Publish this report?"
    description="This report will become visible to your team."
    scope={["Publish the reviewed report"]}
    status={status}
    onDecision={async decision => {
      const response = await fetch("/api/approvals/" + requestId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision })
      });
      if (!response.ok) throw new Error("The decision could not be saved.");
      setStatus(decision);
    }}
  />;
}`}</Code>
        <h2>Server responsibilities</h2>
        <p>
          The example endpoint belongs to your application. It must authenticate
          the user, authorize the specific action, validate request state and
          scope, and enforce idempotency. A disabled button is a user experience
          behavior, not a server security boundary.
        </p>
        <h2>Cancellation and errors</h2>
        <p>
          Wire onStop or onCancel to your runtime’s cancellation mechanism. If a
          stream disconnects, preserve the last known state and show a
          recoverable error. Do not label an action completed until your runtime
          confirms it.
        </p>
        <h2>Generated content</h2>
        <p>
          ArtifactPanel and ToolCall render text and structured data. They do
          not evaluate code or render untrusted HTML. If you add a rich preview,
          give it an appropriate sandbox in your application.
        </p>
      </>
    ),
  },
  accessibility: {
    title: "Make agent work usable.",
    description:
      "Native controls, meaningful labels, and motion that respects user preferences.",
    content: (
      <>
        <h2>Keyboard behavior</h2>
        <p>
          Buttons, links, checkboxes, radios, and disclosures use native HTML
          behavior. Use Tab to navigate. PromptComposer supports Command+Enter
          or Ctrl+Enter and avoids submitting during IME composition. Plain
          Enter creates a new line.
        </p>
        <h2>Status and feedback</h2>
        <p>
          Streaming state has a polite live region. Action failures use alerts.
          Context meters and progress elements carry accessible labels. Timeline
          status includes text so meaning does not depend on color alone.
        </p>
        <h2>Motion</h2>
        <p>
          Activity animations stop when the browser requests reduced motion.
          Loading text remains visible without animation.
        </p>
        <h2>Your app’s responsibilities</h2>
        <p>
          Use descriptive titles and action scopes. Keep focus stable as
          streamed content updates. Verify contrast after changing tokens, and
          test your complete workflow with a keyboard and screen reader.
          Components do not move focus when a server event arrives.
        </p>
        <h2>Verification limits</h2>
        <p>
          Native semantics are implemented in source. Browser, screen reader,
          and full WCAG conformance testing remain release acceptance work; this
          documentation does not certify conformance.
        </p>
      </>
    ),
  },
  cli: {
    title: "The CLI reference.",
    description:
      "Install only the source you need, with predictable local changes.",
    content: (
      <>
        <Code>{`npx agentcn-ui@latest <command>
pnpm dlx agentcn-ui@latest <command>`}</Code>
        <h2>init</h2>
        <p>
          Create an agentcn.json file and themed stylesheet in an existing app.
          Interactive terminals prompt for palette, radius, and density. Use
          --yes for defaults.
        </p>
        <Code>{`npx agentcn-ui@latest init --yes --palette forest --radius rounded --density comfortable`}</Code>
        <h2>add</h2>
        <p>
          Copy one or more named components, shared helpers, and CSS. Unknown
          names fail before any files are written. Identical files remain
          untouched.
        </p>
        <Code>{`npx agentcn-ui@latest add agent-run approval-request
npx agentcn-ui@latest add --all --dry-run`}</Code>
        <h2>create</h2>
        <p>
          Create a new Next.js app directory. Existing destinations are refused.
          Installs are left to you.
        </p>
        <Code>{`npx agentcn-ui@latest create my-agent --preset research --yes`}</Code>
        <p>
          Presets: copilot, research, operations. Generated apps include local
          component source, a root layout, a starter page, TypeScript
          configuration, and package scripts.
        </p>
        <h2>list</h2>
        <p>Print all components with categories and descriptions.</p>
        <h2>Options</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Flag</th>
                <th>Behavior</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["--cwd <directory>", "Project root"],
                ["--palette <name>", "forest, ink, indigo, ember"],
                ["--radius <name>", "sharp, rounded, soft"],
                ["--density <name>", "compact, comfortable"],
                [
                  "--components <path>",
                  "Component source directory (init/create)",
                ],
                ["--css <path>", "Stylesheet path (init/create)"],
                ["--preset <name>", "Starter preset (create)"],
                ["--yes", "Use defaults without prompts"],
                ["--dry-run", "Show the write plan without writing"],
                ["--overwrite", "Replace differing files after review"],
                ["--all", "Install every component (add)"],
                ["--help", "Print usage"],
                ["--version", "Print version"],
              ].map(([flag, behavior]) => (
                <tr key={flag}>
                  <td>
                    <code>{flag}</code>
                  </td>
                  <td>{behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Failures</h2>
        <p>
          Invalid configuration, unknown names, path traversal, symlink
          destinations, and conflicting files return a nonzero exit code. File
          writes are preflighted but are not a filesystem transaction; keep your
          project under version control.
        </p>
      </>
    ),
  },
};
