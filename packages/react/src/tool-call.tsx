"use client";

import { JsonView, Status, Surface, useAction } from "./_shared.js";
import type { RunStatus, SurfaceProps } from "./_shared.js";
export interface ToolCallProps extends SurfaceProps {
  name: string;
  status: RunStatus;
  input: unknown;
  output?: unknown;
  error?: string;
  duration?: string;
  onRetry?: () => void | Promise<void>;
}
export function ToolCall({
  name,
  status,
  input,
  output,
  error,
  duration,
  onRetry,
  ...props
}: ToolCallProps) {
  const action = useAction();
  return (
    <Surface
      {...props}
      title={name}
      eyebrow="Tool invocation"
      actions={<Status value={status} />}
    >
      <details className="ac-disclosure" open>
        <summary>
          Input <span className="ac-muted ac-mono">{duration}</span>
        </summary>
        <JsonView value={input} label="Tool input" />
      </details>
      {output !== undefined && (
        <details className="ac-disclosure">
          <summary>Output</summary>
          <JsonView value={output} label="Tool output" />
        </details>
      )}
      {error && (
        <p className="ac-error" role="alert">
          {error}
        </p>
      )}
      {status === "failed" && onRetry && (
        <footer className="ac-footer">
          <button
            className="ac-button"
            disabled={action.pending}
            onClick={() => void action.run(onRetry)}
          >
            {action.pending ? "Retrying…" : "Retry tool"}
          </button>
        </footer>
      )}
      {action.error && (
        <p role="alert" className="ac-error">
          {action.error}
        </p>
      )}
    </Surface>
  );
}
