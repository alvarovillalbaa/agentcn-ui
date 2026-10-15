"use client";

import { cx } from "./_shared.js";
export interface StreamStatusProps {
  status: "connecting" | "streaming" | "complete" | "error";
  label?: string;
  tokensPerSecond?: number;
  className?: string;
}
export function StreamStatus({
  status,
  label,
  tokensPerSecond,
  className,
}: StreamStatusProps) {
  const labels = {
    connecting: "Connecting to model",
    streaming: "Generating response",
    complete: "Response complete",
    error: "Connection interrupted",
  };
  return (
    <div
      className={cx("ac-stream", className)}
      role="status"
      aria-live="polite"
      data-status={status}
    >
      <span className="ac-stream-indicator" aria-hidden="true">
        {status === "complete" ? "✓" : status === "error" ? "!" : "✳"}
      </span>
      <span>{label ?? labels[status]}</span>
      {tokensPerSecond !== undefined && status === "streaming" && (
        <span className="ac-muted ac-mono">
          {Math.max(0, tokensPerSecond)} tok/s
        </span>
      )}
    </div>
  );
}
