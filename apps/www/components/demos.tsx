"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  AgentRun,
  ToolCall,
  ApprovalRequest,
  ContextWindow,
  TokenUsage,
  SourceStack,
  MemoryPanel,
  ArtifactPanel,
  PlanReview,
  AgentHandoff,
  ModelRouter,
  PromptComposer,
  BranchPicker,
  EvalScorecard,
  Checkpoint,
  StreamStatus,
  MultiInput,
  MemberPicker,
  CreatableSelect,
  PricingTable,
} from "@alvarovillalbaa/agentcn-ui";

export function AgentRunDemo() {
  const [status, setStatus] = useState<"running" | "paused" | "cancelled">(
    "running",
  );
  return (
    <AgentRun
      title="Research competitor positioning"
      status={status}
      steps={[
        {
          id: "1",
          label: "Understand the brief",
          status: "completed",
          detail: "Mapped the market and selected 6 competitors",
          duration: "1.2s",
        },
        {
          id: "2",
          label: "Gather primary sources",
          status: status === "running" ? "running" : status,
          detail: "Reading product pages and public documentation",
          duration: "4.8s",
        },
        {
          id: "3",
          label: "Synthesize findings",
          status: "queued",
          detail: "Prepare an evidence-backed comparison",
        },
      ]}
      onPause={() => setStatus("paused")}
      onResume={() => setStatus("running")}
      onCancel={() => setStatus("cancelled")}
    />
  );
}

export function ToolCallDemo() {
  return (
    <ToolCall
      name="search_documents"
      status="completed"
      duration="238ms"
      input={{ query: "Q4 product strategy", limit: 5 }}
      output={{
        matches: 5,
        sources: ["strategy.md", "research.md"],
        confidence: 0.94,
      }}
    />
  );
}

export function ApprovalRequestDemo() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  return (
    <ApprovalRequest
      title="Publish the release notes?"
      description="The agent prepared this action. Review its scope before it continues."
      risk="medium"
      status={status}
      scope={[
        "Publish version 2.4 release notes",
        "Notify 3 project maintainers",
        "No customer data will be shared",
      ]}
      input={{ action: "publish", version: "2.4", audience: "maintainers" }}
      onDecision={(decision) => setStatus(decision)}
    />
  );
}

export function ContextWindowDemo() {
  return (
    <ContextWindow
      capacity={128000}
      reserved={8000}
      segments={[
        { id: "system", label: "System instructions", tokens: 4200 },
        { id: "conversation", label: "Conversation", tokens: 28600 },
        { id: "tools", label: "Tool results", tokens: 18700 },
        { id: "memory", label: "Retrieved memory", tokens: 6100 },
      ]}
    />
  );
}

export function TokenUsageDemo() {
  return (
    <TokenUsage
      input={24680}
      output={1820}
      cached={18400}
      cost={0.0824}
      budget={0.5}
    />
  );
}

export function SourceStackDemo() {
  return (
    <SourceStack
      sources={[
        {
          id: "1",
          title: "React: thinking in components",
          href: "https://react.dev/learn/thinking-in-react",
          excerpt:
            "Break the interface into a component hierarchy, then identify the minimal state.",
          relevance: "Primary source",
        },
        {
          id: "2",
          title: "shadcn/ui registry",
          href: "https://ui.shadcn.com/docs/registry",
          excerpt:
            "Distribute components as source code that developers own and customize.",
          relevance: "Reference architecture",
        },
      ]}
    />
  );
}

export function MemoryPanelDemo() {
  const [entries, setEntries] = useState([
    {
      id: "1",
      kind: "preference" as const,
      content: "Use concise summaries with links to primary sources.",
      source: "Explicit user preference",
      updatedAt: "Just now",
    },
    {
      id: "2",
      kind: "fact" as const,
      content: "The workspace uses React and TypeScript.",
      source: "Project configuration",
      updatedAt: "2 hours ago",
    },
  ]);
  return (
    <MemoryPanel
      entries={entries}
      onForget={(id) =>
        setEntries((current) => current.filter((e) => e.id !== id))
      }
    />
  );
}

export function ArtifactPanelDemo() {
  const content =
    "export async function research(topic: string) {\n  const sources = await gatherSources(topic);\n  return synthesize({ topic, sources });\n}";
  return (
    <ArtifactPanel
      name="research.ts"
      language="typescript"
      version="v3"
      content={content}
      onDownload={() => {
        const url = URL.createObjectURL(
          new Blob([content], { type: "text/plain" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "research.ts";
        link.click();
        URL.revokeObjectURL(url);
      }}
    />
  );
}

export function PlanReviewDemo() {
  const [confirmed, setConfirmed] = useState(false);
  const [steps, setSteps] = useState([
    {
      id: "1",
      title: "Inspect source material",
      description: "Read the brief and existing product documentation.",
      selected: true,
      required: true,
    },
    {
      id: "2",
      title: "Compare alternatives",
      description: "Evaluate three approaches against the requirements.",
      selected: true,
    },
    {
      id: "3",
      title: "Draft an implementation",
      description: "Prepare a proposal for your review.",
      selected: true,
    },
  ]);
  return (
    <PlanReview
      title="A plan before the first action"
      steps={steps}
      confirmed={confirmed}
      onStepChange={(id, selected) =>
        setSteps((current) =>
          current.map((s) => (s.id === id ? { ...s, selected } : s)),
        )
      }
      onConfirm={() => setConfirmed(true)}
    />
  );
}

export function AgentHandoffDemo() {
  const [status, setStatus] = useState<"proposed" | "accepted" | "declined">(
    "proposed",
  );
  return (
    <AgentHandoff
      from="Research agent"
      to="Writing agent"
      reason="Research is complete. The writing specialist can turn the findings into a draft."
      context={[
        "6 verified primary sources",
        "Product brief and audience",
        "Open questions and uncertainties",
      ]}
      status={status}
      onAccept={() => setStatus("accepted")}
      onDecline={() => setStatus("declined")}
    />
  );
}

export function ModelRouterDemo() {
  const [value, setValue] = useState("balanced");
  return (
    <ModelRouter
      value={value}
      onValueChange={setValue}
      models={[
        {
          id: "balanced",
          name: "Balanced",
          provider: "Your provider",
          description: "Everyday tasks and tool use",
          badge: "Default",
        },
        {
          id: "reasoning",
          name: "Deep reasoning",
          provider: "Your provider",
          description: "Complex planning and analysis",
        },
        {
          id: "fast",
          name: "Fast",
          provider: "Local model",
          description: "Low-latency classification",
          badge: "Local",
        },
      ]}
    />
  );
}

export function PromptComposerDemo() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState("");
  return (
    <div>
      <PromptComposer
        value={value}
        onValueChange={setValue}
        onSubmit={(text) => {
          setSubmitted(text);
          setValue("");
        }}
        footer="Research agent · Demo"
      />
      {submitted && (
        <p className="demo-result" role="status">
          Task prepared: {submitted}
        </p>
      )}
    </div>
  );
}

export function BranchPickerDemo() {
  const [value, setValue] = useState("a");
  return (
    <BranchPicker
      value={value}
      onValueChange={setValue}
      branches={[
        {
          id: "a",
          title: "Explore the technical approach",
          preview: "Start with a small, composable component system.",
          messages: 8,
        },
        {
          id: "b",
          title: "Reconsider the product direction",
          preview: "What if the agent worked alongside the user?",
          messages: 4,
        },
      ]}
    />
  );
}

export function EvalScorecardDemo() {
  return (
    <EvalScorecard
      title="Research agent · latest run"
      sampleSize={120}
      runId="eval_024"
      metrics={[
        {
          id: "accuracy",
          label: "Factual accuracy",
          score: 0.96,
          threshold: 0.9,
          detail: "Verified against source material",
        },
        {
          id: "grounding",
          label: "Citation coverage",
          score: 0.88,
          threshold: 0.85,
        },
        {
          id: "latency",
          label: "Latency target",
          score: 0.72,
          threshold: 0.8,
          detail: "Investigate long tool calls",
        },
      ]}
    />
  );
}

export function CheckpointDemo() {
  const [restored, setRestored] = useState(false);
  return (
    <Checkpoint
      title="Before the agent refactor"
      createdAt="2 minutes ago"
      files={[
        { path: "app/agent/page.tsx", additions: 42, deletions: 18 },
        { path: "lib/agent.ts", additions: 16, deletions: 4 },
      ]}
      restored={restored}
      onRestore={() => setRestored(true)}
    />
  );
}

export function StreamStatusDemo() {
  const [status, setStatus] = useState<
    "connecting" | "streaming" | "complete" | "error"
  >("streaming");
  return (
    <div>
      <StreamStatus status={status} tokensPerSecond={42} />
      <div className="demo-controls">
        {(["connecting", "streaming", "complete", "error"] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
            >
              {s}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export function MultiInputDemo() {
  const [values, setValues] = useState(["Research", "Documentation"]);
  return (
    <MultiInput
      label="Context tags"
      values={values}
      onValuesChange={setValues}
      maxItems={5}
      maxLength={40}
      placeholder="Add a context tag"
    />
  );
}

export function MemberPickerDemo() {
  const [value, setValue] = useState(["research"]);
  return (
    <MemberPicker
      label="Review members"
      value={value}
      onValueChange={setValue}
      members={[
        { id: "research", name: "Research team", description: "Source review" },
        { id: "design", name: "Design team", description: "Interface review" },
        {
          id: "operations",
          name: "Operations team",
          description: "Release review",
        },
      ]}
      maxMembers={2}
    />
  );
}

export function CreatableSelectDemo() {
  const [value, setValue] = useState("research");
  const [options, setOptions] = useState([
    { id: "research", label: "Research" },
    { id: "writing", label: "Writing" },
  ]);
  return (
    <CreatableSelect
      label="Workflow"
      value={value}
      options={options}
      onValueChange={setValue}
      onCreate={(label) => {
        const id = `workflow-${options.length + 1}`;
        setOptions((current) => [...current, { id, label }]);
        setValue(id);
      }}
    />
  );
}

export function PricingTableDemo() {
  const [value, setValue] = useState("starter");
  return (
    <div>
      <p className="ac-muted ac-small">
        Example plans. Choosing a plan changes only this preview.
      </p>
      <PricingTable
        label="Workspace plans"
        value={value}
        onChoose={setValue}
        plans={[
          {
            id: "starter",
            name: "Starter",
            price: "Free",
            description: "For a personal workspace.",
            features: ["One workspace", "Core components"],
            details: "A place to try your first workflow.",
          },
          {
            id: "team",
            name: "Team",
            price: "€12 / month",
            description: "For a shared review workflow.",
            features: [
              "Shared workspaces",
              "Review controls",
              "Team templates",
            ],
            details:
              "An illustrative monthly price. This demo never starts a subscription.",
          },
        ]}
      />
    </div>
  );
}

export const demos: Record<string, ComponentType> = {
  "agent-run": AgentRunDemo,
  "tool-call": ToolCallDemo,
  "approval-request": ApprovalRequestDemo,
  "context-window": ContextWindowDemo,
  "token-usage": TokenUsageDemo,
  "source-stack": SourceStackDemo,
  "memory-panel": MemoryPanelDemo,
  "artifact-panel": ArtifactPanelDemo,
  "plan-review": PlanReviewDemo,
  "agent-handoff": AgentHandoffDemo,
  "model-router": ModelRouterDemo,
  "prompt-composer": PromptComposerDemo,
  "branch-picker": BranchPickerDemo,
  "eval-scorecard": EvalScorecardDemo,
  checkpoint: CheckpointDemo,
  "stream-status": StreamStatusDemo,
  "multi-input": MultiInputDemo,
  "member-picker": MemberPickerDemo,
  "creatable-select": CreatableSelectDemo,
  "pricing-table": PricingTableDemo,
};

export function Demo({ name }: { name: string }) {
  const Component = demos[name];
  return Component ? <Component /> : null;
}
