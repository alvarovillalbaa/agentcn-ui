"use client";

import { Surface, useAction } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface CheckpointFile {
  path: string;
  additions: number;
  deletions: number;
}
export interface CheckpointProps extends SurfaceProps {
  title: string;
  createdAt: string;
  files: CheckpointFile[];
  onRestore?: () => void | Promise<void>;
  restored?: boolean;
}
export function Checkpoint({
  title,
  createdAt,
  files,
  onRestore,
  restored,
  ...props
}: CheckpointProps) {
  const action = useAction();
  return (
    <Surface
      {...props}
      title={title}
      eyebrow="Run checkpoint"
      actions={<span className="ac-muted ac-small">{createdAt}</span>}
    >
      <ul className="ac-list">
        {files.length === 0 && (
          <li className="ac-empty">No file changes in this checkpoint.</li>
        )}
        {files.map((f) => (
          <li key={f.path} className="ac-row ac-file">
            <code>{f.path}</code>
            <span className="ac-mono">
              <span className="ac-add">+{f.additions}</span>{" "}
              <span className="ac-remove">−{f.deletions}</span>
            </span>
          </li>
        ))}
      </ul>
      {onRestore && (
        <footer className="ac-footer">
          <button
            className="ac-button"
            disabled={action.pending || restored}
            onClick={() => void action.run(onRestore)}
          >
            {restored
              ? "Checkpoint restored"
              : action.pending
                ? "Restoring…"
                : "Restore checkpoint"}
          </button>
          <span className="ac-muted ac-small">
            Review changes before restoring.
          </span>
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
