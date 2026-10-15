"use client";

import { Surface, useAction } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface AgentHandoffProps extends SurfaceProps {
  from: string;
  to: string;
  reason: string;
  context: string[];
  status: "proposed" | "accepted" | "declined";
  onAccept?: () => void | Promise<void>;
  onDecline?: () => void | Promise<void>;
}
export function AgentHandoff({
  from,
  to,
  reason,
  context,
  status,
  onAccept,
  onDecline,
  ...props
}: AgentHandoffProps) {
  const action = useAction();
  return (
    <Surface
      {...props}
      title="Agent handoff"
      eyebrow="Delegation"
      actions={<span className="ac-tag">{status}</span>}
    >
      <div className="ac-handoff">
        <span>{from}</span>
        <span aria-label="hands off to">→</span>
        <span>{to}</span>
      </div>
      <p className="ac-body ac-muted">{reason}</p>
      <details className="ac-disclosure">
        <summary>Context to transfer · {context.length} items</summary>
        <ul className="ac-scope">
          {context.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </details>
      {status === "proposed" && (
        <footer className="ac-footer">
          {onAccept && (
            <button
              className="ac-button ac-primary"
              disabled={action.pending}
              onClick={() => void action.run(onAccept)}
            >
              Accept handoff
            </button>
          )}
          {onDecline && (
            <button
              className="ac-button"
              disabled={action.pending}
              onClick={() => void action.run(onDecline)}
            >
              Decline
            </button>
          )}
        </footer>
      )}
      {action.error && (
        <p className="ac-error" role="alert">
          {action.error}
        </p>
      )}
    </Surface>
  );
}
