import Link from "next/link";
import { CopilotWorkspace, ResearchWorkspace } from "@/components/blocks";
export const metadata = { title: "Workflow blocks" };
export default function BlocksPage() {
  return (
    <div className="page-shell interior-page">
      <div className="page-heading">
        <span className="overline">Composed, with purpose</span>
        <h1>
          A workspace.
          <br />A starting point.
        </h1>
        <p>
          Complete interface patterns composed from the library. Try the
          interactions, then connect your own agent runtime.
        </p>
      </div>
      <article className="block-card">
        <div className="block-header">
          <div>
            <h2>Agent copilot</h2>
            <p>
              A task, a visible execution plan, a draft, and a human decision.
            </p>
          </div>
          <Link
            className="button"
            href="/create?components=agent-run,prompt-composer,approval-request,artifact-panel"
          >
            Build this kit ↗
          </Link>
        </div>
        <div className="block-demo">
          <CopilotWorkspace />
        </div>
      </article>
      <article className="block-card">
        <div className="block-header">
          <div>
            <h2>Research assistant</h2>
            <p>
              Evidence, context pressure, and costs alongside the generated
              artifact.
            </p>
          </div>
          <Link
            className="button"
            href="/create?components=prompt-composer,source-stack,context-window,token-usage,artifact-panel,stream-status"
          >
            Build this kit ↗
          </Link>
        </div>
        <div className="block-demo">
          <ResearchWorkspace />
        </div>
      </article>
    </div>
  );
}
