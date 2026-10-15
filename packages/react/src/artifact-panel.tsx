"use client";

import { Surface, useAction } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface ArtifactPanelProps extends SurfaceProps {
  name: string;
  language?: string;
  content: string;
  version?: string;
  status?: "streaming" | "ready" | "error";
  error?: string;
  onDownload?: () => void | Promise<void>;
}
/** Text-only by design: model-generated HTML and code are never executed. */
export function ArtifactPanel({
  name,
  language = "text",
  content,
  version,
  status = "ready",
  error,
  onDownload,
  ...props
}: ArtifactPanelProps) {
  const action = useAction();
  return (
    <Surface
      {...props}
      title={name}
      eyebrow="Generated artifact"
      actions={<span className="ac-tag">{version ?? language}</span>}
    >
      <pre
        className="ac-code ac-artifact"
        aria-label={`${name} content`}
        aria-busy={status === "streaming"}
      >
        <code>{content || "Waiting for content…"}</code>
      </pre>
      <footer className="ac-footer">
        <span className="ac-muted" role="status">
          {status === "streaming"
            ? "Generating…"
            : status === "error"
              ? "Generation failed"
              : "Ready to use"}
        </span>
        {onDownload && (
          <button
            className="ac-button ac-small"
            disabled={action.pending || status !== "ready"}
            onClick={() => void action.run(onDownload)}
          >
            Download
          </button>
        )}
      </footer>
      {(error || action.error) && (
        <p className="ac-error" role="alert">
          {error ?? action.error}
        </p>
      )}
    </Surface>
  );
}
