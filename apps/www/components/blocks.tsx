"use client";
import { useState } from "react";
import {
  AgentRun,
  ApprovalRequest,
  ArtifactPanel,
  ContextWindow,
  PromptComposer,
  SourceStack,
  TokenUsage,
  StreamStatus,
} from "@alvarovillalbaa/agentcn-ui";
export function CopilotWorkspace() {
  const [value, setValue] = useState("");
  const [task, setTask] = useState("Prepare the weekly product update");
  const [status, setStatus] = useState<
    "running" | "paused" | "completed" | "cancelled"
  >("running");
  const [decision, setDecision] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  return (
    <div>
      <div className="block-toolbar">
        <strong>Product copilot</strong>
        <span className="overline">Local demo · No external actions</span>
      </div>
      <div className="block-grid">
        <div className="block-column">
          <AgentRun
            title={task}
            status={status}
            steps={[
              {
                id: "read",
                label: "Read project updates",
                status: "completed",
                detail: "Reviewed 12 updates from 3 projects",
                duration: "1.4s",
              },
              {
                id: "draft",
                label: "Draft a weekly summary",
                status: "completed",
                detail: "Prepared a short update with source links",
                duration: "2.8s",
              },
              {
                id: "publish",
                label: "Review before publication",
                status: status === "completed" ? "completed" : "paused",
                detail: "Waiting for your decision",
              },
            ]}
            onPause={() => setStatus("paused")}
            onResume={() => setStatus("running")}
            onCancel={() => setStatus("cancelled")}
          />
          <PromptComposer
            value={value}
            onValueChange={setValue}
            onSubmit={(text) => {
              setTask(text);
              setStatus("running");
              setDecision("pending");
              setValue("");
            }}
            footer="Product copilot · Local simulation"
          />
        </div>
        <div className="block-column">
          <ApprovalRequest
            title="Publish to your team?"
            description="Review the proposed weekly update before the agent continues."
            status={decision}
            scope={[
              "Publish the weekly product summary",
              "Visible to your team only",
            ]}
            onDecision={(d) => {
              setDecision(d);
              setStatus(d === "approved" ? "completed" : "cancelled");
            }}
          />
          <ArtifactPanel
            name="weekly-update.md"
            language="markdown"
            content={`# ${task}\n\n## This week\n- Component system ready for review\n- Documentation and examples prepared\n\n## Next\n- Connect to the production runtime`}
          />
        </div>
      </div>
      <p className="block-demo-note">
        Decisions update this demo locally. Connect callbacks to your server for
        actual execution.
      </p>
    </div>
  );
}
export function ResearchWorkspace() {
  const [value, setValue] = useState("");
  const [topic, setTopic] = useState("Component architectures for AI apps");
  return (
    <div>
      <div className="block-toolbar">
        <strong>Research workspace</strong>
        <span className="overline">Example data</span>
      </div>
      <div className="block-grid">
        <div className="block-column">
          <PromptComposer
            value={value}
            onValueChange={setValue}
            placeholder="What would you like to research?"
            onSubmit={(text) => {
              setTopic(text);
              setValue("");
            }}
            footer="Research assistant · Example sources"
          />
          <ArtifactPanel
            name="research-notes.md"
            language="markdown"
            content={`# ${topic}\n\nBuild around clear ownership:\n1. Make execution visible.\n2. Keep decisions reviewable.\n3. Preserve evidence with conclusions.\n\nThis is an example artifact, not a live model response.`}
          />
          <StreamStatus status="complete" />
        </div>
        <div className="block-column">
          <SourceStack
            sources={[
              {
                id: "react",
                title: "Thinking in React",
                href: "https://react.dev/learn/thinking-in-react",
                relevance: "Example source",
              },
              {
                id: "registry",
                title: "shadcn/ui registry",
                href: "https://ui.shadcn.com/docs/registry",
                relevance: "Example source",
              },
            ]}
          />
          <ContextWindow
            capacity={128000}
            reserved={8000}
            segments={[
              { id: "topic", label: "Research instructions", tokens: 3200 },
              { id: "sources", label: "Retrieved documents", tokens: 22400 },
            ]}
          />
          <TokenUsage input={25600} output={2400} cost={0.08} budget={1} />
        </div>
      </div>
    </div>
  );
}
