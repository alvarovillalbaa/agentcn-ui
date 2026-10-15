"use client";

import { Surface, JsonView, useAction } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface ApprovalRequestProps extends SurfaceProps {
  title: string;
  description: string;
  scope: string[];
  input?: unknown;
  risk?: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "expired";
  onDecision: (decision: "approved" | "rejected") => void | Promise<void>;
}
/** A review surface. The application must authorize and execute decisions on its server. */
export function ApprovalRequest({
  title,
  description,
  scope,
  input,
  risk = "medium",
  status,
  onDecision,
  ...props
}: ApprovalRequestProps) {
  const { run, pending, error } = useAction();
  return (
    <Surface
      {...props}
      title={title}
      eyebrow="Human approval"
      actions={
        <span className="ac-risk" data-risk={risk}>
          {risk} risk
        </span>
      }
    >
      <p className="ac-body">{description}</p>
      <ul className="ac-scope">
        {scope.map((item, i) => (
          <li key={i}>
            <span aria-hidden="true">↗</span>
            {item}
          </li>
        ))}
      </ul>
      {input !== undefined && (
        <details className="ac-disclosure">
          <summary>Review exact payload</summary>
          <JsonView value={input} label="Approval payload" />
        </details>
      )}
      <footer className="ac-footer">
        {status === "pending" ? (
          <>
            <button
              className="ac-button ac-primary"
              disabled={pending}
              onClick={() => void run(() => onDecision("approved"))}
            >
              {pending ? "Saving decision…" : "Approve action"}
            </button>
            <button
              className="ac-button"
              disabled={pending}
              onClick={() => void run(() => onDecision("rejected"))}
            >
              Reject
            </button>
          </>
        ) : (
          <span role="status" className="ac-medium">
            Request {status}
          </span>
        )}
      </footer>
      {error && (
        <p className="ac-error" role="alert">
          {error}
        </p>
      )}
    </Surface>
  );
}
