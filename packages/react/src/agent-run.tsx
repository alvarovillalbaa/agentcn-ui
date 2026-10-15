"use client";

import { Surface, Status, cx, useAction } from "./_shared.js";
import type { RunStatus, SurfaceProps } from "./_shared.js";

export interface RunStep {
  id: string;
  label: string;
  status: RunStatus;
  detail?: string;
  duration?: string;
}
export interface AgentRunProps extends SurfaceProps {
  title: string;
  status: RunStatus;
  steps: RunStep[];
  onPause?: () => void | Promise<void>;
  onResume?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}
export function AgentRun({
  title,
  status,
  steps,
  onPause,
  onResume,
  onCancel,
  ...props
}: AgentRunProps) {
  const { pending, error, run } = useAction();
  const terminal = ["completed", "failed", "cancelled"].includes(status);
  return (
    <Surface
      {...props}
      title={title}
      eyebrow="Agent run"
      actions={<Status value={status} />}
    >
      <ol className="ac-timeline">
        {steps.map((step, i) => (
          <li
            key={step.id}
            className={cx(
              "ac-step",
              step.status === "running" && "ac-step-active",
            )}
          >
            <span className="ac-step-index" aria-hidden="true">
              {step.status === "completed" ? "✓" : i + 1}
            </span>
            <div className="ac-grow">
              <div className="ac-row">
                <span className="ac-medium">{step.label}</span>
                <span className="ac-muted ac-mono">{step.duration}</span>
              </div>
              {step.detail && <p className="ac-muted">{step.detail}</p>}
              <span className="ac-sr-only">{step.status}</span>
            </div>
          </li>
        ))}
      </ol>
      {!terminal && (
        <footer className="ac-footer">
          {status === "running" && onPause && (
            <button
              className="ac-button"
              disabled={pending}
              onClick={() => void run(onPause)}
            >
              Pause run
            </button>
          )}
          {status === "paused" && onResume && (
            <button
              className="ac-button ac-primary"
              disabled={pending}
              onClick={() => void run(onResume)}
            >
              Resume run
            </button>
          )}
          {onCancel && (
            <button
              className="ac-button ac-ghost"
              disabled={pending}
              onClick={() => void run(onCancel)}
            >
              Cancel run
            </button>
          )}
          {pending && <span role="status">Updating…</span>}
        </footer>
      )}
      {error && (
        <p className="ac-error" role="alert">
          {error}
        </p>
      )}
    </Surface>
  );
}
