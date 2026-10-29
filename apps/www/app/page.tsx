import Link from "next/link";
import {
  AgentRunDemo,
  ApprovalRequestDemo,
  ContextWindowDemo,
  ToolCallDemo,
  ArtifactPanelDemo,
  MemoryPanelDemo,
  EvalScorecardDemo,
} from "@/components/demos";
import { Command } from "@/components/command";
import { catalog } from "@/lib/catalog.mjs";
export default function HomePage() {
  return (
    <>
      <section className="hero page-shell">
        <div className="hero-copy">
          <Link href="/components" className="release-pill">
            <span />
            {catalog.length} components for the agent era <span>→</span>
          </Link>
          <h1>
            Interfaces for
            <br />
            apps that <em>think.</em>
          </h1>
          <p className="hero-description">
            The missing interface layer between people and agents. Composable
            React components for everything that happens beyond the chat bubble.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark button-large" href="/create">
              Create your kit <span>↗</span>
            </Link>
            <Link className="button button-large" href="/components">
              Explore components
            </Link>
          </div>
          <div className="hero-command">
            <Command args="init" />
          </div>
          <p className="hero-footnote">
            <span>React + Next.js</span>
            <span>Open source</span>
            <span>Your code, your rules</span>
          </p>
        </div>
        <div className="hero-stage">
          <div className="stage-label">
            <span className="stage-dot" />A workspace with agency
            <span className="stage-right">LIVE PREVIEW</span>
          </div>
          <div className="hero-run">
            <AgentRunDemo />
          </div>
          <div className="hero-approval">
            <ApprovalRequestDemo />
          </div>
          <div className="stage-bottom">
            <span>Human in the loop. By design.</span>
            <span>↗</span>
          </div>
        </div>
      </section>
      <div className="principle-strip">
        <div className="page-shell">
          <span>LESS GLUE CODE.</span>
          <p>More capable agents deserve more capable interfaces.</p>
          <span>MORE HUMAN CONTROL.</span>
        </div>
      </div>
      <section className="page-shell home-catalog">
        <div className="section-heading">
          <div>
            <span className="overline">A new set of primitives</span>
            <h2>Beyond input. Beyond output.</h2>
          </div>
          <p>
            Make the invisible work visible.
            <br />
            And the consequential work reviewable.
          </p>
        </div>
        <div className="home-preview-grid">
          <article>
            <div className="home-preview">
              <ContextWindowDemo />
            </div>
            <span className="overline">01 / Context</span>
            <h3>Know what your agent knows.</h3>
            <p>
              Token budgets, sources, and memory. A window into the information
              behind every answer.
            </p>
            <Link className="text-link" href="/docs/components/context-window">
              Explore context →
            </Link>
          </article>
          <article>
            <div className="home-preview">
              <ToolCallDemo />
            </div>
            <span className="overline">02 / Execution</span>
            <h3>Follow every meaningful action.</h3>
            <p>
              Inspect tool calls and follow a run from its first step to its
              final artifact.
            </p>
            <Link className="text-link" href="/docs/components/tool-call">
              Explore execution →
            </Link>
          </article>
          <article>
            <div className="home-preview">
              <MemoryPanelDemo />
            </div>
            <span className="overline">03 / Memory</span>
            <h3>Remember, with permission.</h3>
            <p>
              Let people inspect, understand, and remove what an agent remembers
              about them.
            </p>
            <Link className="text-link" href="/docs/components/memory-panel">
              Explore memory →
            </Link>
          </article>
          <article>
            <div className="home-preview">
              <EvalScorecardDemo />
            </div>
            <span className="overline">04 / Evaluation</span>
            <h3>Put quality in the interface.</h3>
            <p>
              Keep evaluation scores, thresholds, and provenance close to the
              work itself.
            </p>
            <Link className="text-link" href="/docs/components/eval-scorecard">
              Explore evaluation →
            </Link>
          </article>
        </div>
      </section>
      <section className="ownership-section">
        <div className="page-shell ownership-inner">
          <div>
            <span className="overline">
              Install it. Inspect it. Make it yours.
            </span>
            <h2>
              A component library.
              <br />
              <em>Your</em> component library.
            </h2>
            <p>
              Use the npm package when you want managed updates. Copy the source
              when you want full control. No runtime service, provider lock-in,
              or required AI SDK.
            </p>
            <Link className="button button-dark" href="/docs/installation">
              Find your way in →
            </Link>
          </div>
          <div className="ownership-code">
            <div className="code-file">
              <span>your-app / components / agentcn</span>
              <span>↓</span>
            </div>
            <pre>
              <code>
                <span className="code-comment">
                  // Your runtime. Our interface.
                </span>
                {"\n"}
                <span className="code-keyword">import</span>
                {
                  ' { ApprovalRequest }\n  from "@alvarovillalbaa/agentcn-ui";\n\n<ApprovalRequest\n  title="Ready to publish?"\n  description="Review the proposed action."\n  scope={["Publish release notes"]}\n  status={approval.status}\n  onDecision={saveDecision}\n/>'
                }
              </code>
            </pre>
            <div className="ownership-note">
              <span>Typed props</span>
              <span>Scoped CSS</span>
              <span>React 18 + 19</span>
            </div>
          </div>
        </div>
      </section>
      <section className="page-shell home-artifact">
        <div>
          <span className="overline">Built to work together</span>
          <h2>From a prompt to a finished thing.</h2>
          <p>
            Combine focused elements into complete agent workspaces. Preview the
            blocks, then connect them to your runtime.
          </p>
          <Link className="text-link" href="/blocks">
            Explore workflow blocks →
          </Link>
        </div>
        <ArtifactPanelDemo />
      </section>
      <section className="final-cta page-shell">
        <span className="overline">The next interface is yours.</span>
        <h2>
          Give your agents
          <br />a place to work.
        </h2>
        <Link className="button button-dark button-large" href="/create">
          Start building ↗
        </Link>
      </section>
    </>
  );
}
