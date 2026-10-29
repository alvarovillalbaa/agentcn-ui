/** Canonical catalog consumed by the CLI registry generator and website. */
export const catalog = [
  {
    name: "agent-run",
    title: "Agent Run",
    category: "Orchestration",
    description:
      "A live execution timeline with pause, resume, cancellation, and step telemetry.",
    component: "AgentRun",
    tags: ["agent", "timeline", "execution"],
  },
  {
    name: "tool-call",
    title: "Tool Call",
    category: "Orchestration",
    description:
      "Inspectable inputs and outputs, execution states, and recoverable tool errors.",
    component: "ToolCall",
    tags: ["tool", "mcp", "function"],
  },
  {
    name: "approval-request",
    title: "Approval Request",
    category: "Human control",
    description:
      "Review exact action scope, risk, and payload before approving agent actions.",
    component: "ApprovalRequest",
    tags: ["hitl", "approval", "permissions"],
  },
  {
    name: "plan-review",
    title: "Plan Review",
    category: "Human control",
    description:
      "Select execution steps and confirm a plan before your agent starts work.",
    component: "PlanReview",
    tags: ["plan", "steps", "review"],
  },
  {
    name: "checkpoint",
    title: "Checkpoint",
    category: "Human control",
    description:
      "Inspect file changes and restore a named point in an agent run.",
    component: "Checkpoint",
    tags: ["restore", "diff", "files"],
  },
  {
    name: "context-window",
    title: "Context Window",
    category: "Context & memory",
    description:
      "Understand token allocation, reserved output, and context pressure at a glance.",
    component: "ContextWindow",
    tags: ["tokens", "context", "budget"],
  },
  {
    name: "memory-panel",
    title: "Memory Panel",
    category: "Context & memory",
    description:
      "Make persistent agent memory visible, attributable, and removable.",
    component: "MemoryPanel",
    tags: ["memory", "preferences", "context"],
  },
  {
    name: "source-stack",
    title: "Source Stack",
    category: "Context & memory",
    description:
      "Attach evidence to generated answers with excerpts and source relevance.",
    component: "SourceStack",
    tags: ["rag", "citations", "sources"],
  },
  {
    name: "agent-handoff",
    title: "Agent Handoff",
    category: "Orchestration",
    description:
      "Review delegation between agents and the context crossing that boundary.",
    component: "AgentHandoff",
    tags: ["multi-agent", "delegation", "transfer"],
  },
  {
    name: "model-router",
    title: "Model Router",
    category: "Orchestration",
    description: "Choose a model by capability, provider, and availability.",
    component: "ModelRouter",
    tags: ["model", "provider", "routing"],
  },
  {
    name: "prompt-composer",
    title: "Prompt Composer",
    category: "Conversation",
    description:
      "A controlled task composer with async submission, shortcuts, and stream cancellation.",
    component: "PromptComposer",
    tags: ["prompt", "input", "chat"],
  },
  {
    name: "branch-picker",
    title: "Branch Picker",
    category: "Conversation",
    description:
      "Explore alternative paths through a conversation without losing your place.",
    component: "BranchPicker",
    tags: ["branch", "conversation", "history"],
  },
  {
    name: "artifact-panel",
    title: "Artifact Panel",
    category: "Generation",
    description:
      "Present streamed artifacts with version labels and explicit download actions.",
    component: "ArtifactPanel",
    tags: ["artifact", "code", "generation"],
  },
  {
    name: "stream-status",
    title: "Stream Status",
    category: "Generation",
    description:
      "Connection, generation, completion, and interruption states with token throughput.",
    component: "StreamStatus",
    tags: ["stream", "loading", "status"],
  },
  {
    name: "token-usage",
    title: "Token Usage",
    category: "Observability",
    description:
      "Track input, output, cached tokens, and costs against a run budget.",
    component: "TokenUsage",
    tags: ["cost", "tokens", "usage"],
  },
  {
    name: "eval-scorecard",
    title: "Eval Scorecard",
    category: "Observability",
    description:
      "Show evaluation scores against thresholds with sample and run provenance.",
    component: "EvalScorecard",
    tags: ["eval", "quality", "metrics"],
  },
  {
    name: "multi-input",
    title: "Multi Input",
    category: "Inputs",
    description:
      "Collect editable tags or short values with explicit additions, removal, and limits.",
    component: "MultiInput",
    tags: ["tags", "input", "multiple"],
    sourceOnly: true,
  },
  {
    name: "member-picker",
    title: "Member Picker",
    category: "Inputs",
    description:
      "Search and select existing members without treating people as freeform tags.",
    component: "MemberPicker",
    tags: ["members", "selection", "people"],
    sourceOnly: true,
  },
  {
    name: "creatable-select",
    title: "Creatable Select",
    category: "Inputs",
    description:
      "Choose an existing option or explicitly submit a new label for your app to create.",
    component: "CreatableSelect",
    tags: ["select", "create", "options"],
    sourceOnly: true,
  },
  {
    name: "pricing-table",
    title: "Pricing Table",
    category: "Plans",
    description:
      "Compare plans and review one in a drawer before continuing with your selection.",
    component: "PricingTable",
    tags: ["pricing", "plans", "drawer"],
    sourceOnly: true,
  },
];

export const presets = {
  copilot: [
    "prompt-composer",
    "agent-run",
    "tool-call",
    "approval-request",
    "artifact-panel",
    "stream-status",
  ],
  research: [
    "prompt-composer",
    "agent-run",
    "source-stack",
    "context-window",
    "token-usage",
  ],
  operations: [
    "plan-review",
    "approval-request",
    "agent-handoff",
    "checkpoint",
    "eval-scorecard",
    "memory-panel",
  ],
};

export const palettes = {
  forest: {
    accent: "#28624e",
    foreground: "#ffffff",
    dark: "#93d6b8",
    darkForeground: "#102b20",
  },
  ink: {
    accent: "#24282e",
    foreground: "#ffffff",
    dark: "#e6e9ed",
    darkForeground: "#171b1e",
  },
  indigo: {
    accent: "#4f46b8",
    foreground: "#ffffff",
    dark: "#b6b0ff",
    darkForeground: "#211a55",
  },
  ember: {
    accent: "#a34424",
    foreground: "#ffffff",
    dark: "#ffb697",
    darkForeground: "#3d1c0e",
  },
};
