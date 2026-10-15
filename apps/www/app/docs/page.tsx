import Link from "next/link";
import { Command } from "@/components/command";
import { AgentRunDemo } from "@/components/demos";
export const metadata = { title: "Introduction" };
export default function DocsPage() {
  return (
    <article className="prose">
      <div className="doc-heading">
        <span className="overline">Documentation / Get started</span>
        <h1>
          Build the interface
          <br />
          around the intelligence.
        </h1>
        <p>
          agentcn/ui is an open-source React library for the parts of an AI app
          that deserve their own interface.
        </p>
      </div>
      <p>
        A capable agent does more than generate a message. It uses tools, holds
        context, remembers preferences, delegates work, asks permission, and
        produces artifacts. These components make that work understandable and
        controllable.
      </p>
      <div className="inline-demo">
        <AgentRunDemo />
      </div>
      <h2>Two ways to make it yours</h2>
      <div className="doc-cards">
        <Link href="/docs/installation">
          <h3>Import the package ↗</h3>
          <p>
            Use typed React exports and a shared stylesheet. Upgrade through
            your package manager.
          </p>
        </Link>
        <Link href="/docs/ownership">
          <h3>Own the source ↗</h3>
          <p>
            Copy individual components into your project with the CLI. Adapt
            every line.
          </p>
        </Link>
      </div>
      <h2>A small, focused contract</h2>
      <p>
        Each component receives data and emits callbacks. Your application owns
        the agent runtime, networking, authorization, persistence, and state
        transitions. The library makes no model calls and stores no user data.
      </p>
      <h2>Start with your first component</h2>
      <Command args="init" />
      <p>Then add an execution timeline:</p>
      <Command args="add agent-run" />
      <p>
        Import the generated stylesheet in your root layout and connect the
        component to your run state. The{" "}
        <Link href="/docs/installation">installation guide</Link> walks through
        both approaches.
      </p>
      <div className="callout">
        <strong>Release status</strong>
        <p>
          This repository is in initial development. npm publication and the
          hosted website must be verified before the <code>@latest</code>{" "}
          commands are available. To work locally, use the repository
          instructions.
        </p>
      </div>
      <div className="doc-next">
        <Link href="/docs/installation">Next: Installation →</Link>
      </div>
    </article>
  );
}
