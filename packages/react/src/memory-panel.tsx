"use client";

import { Surface, useAction } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface MemoryEntry {
  id: string;
  content: string;
  source: string;
  updatedAt?: string;
  kind: "preference" | "fact" | "instruction";
}
export interface MemoryPanelProps extends SurfaceProps {
  entries: MemoryEntry[];
  onForget?: (id: string) => void | Promise<void>;
}
export function MemoryPanel({ entries, onForget, ...props }: MemoryPanelProps) {
  const action = useAction();
  return (
    <Surface
      {...props}
      title="Agent memory"
      eyebrow="Persistent context"
      actions={
        <span className="ac-muted ac-mono">{entries.length} memories</span>
      }
    >
      {entries.length === 0 ? (
        <p className="ac-empty">
          No saved memories. New memories will appear here.
        </p>
      ) : (
        <ul className="ac-list">
          {entries.map((e) => (
            <li className="ac-memory" key={e.id}>
              <div className="ac-row">
                <span className="ac-tag">{e.kind}</span>
                {onForget && (
                  <button
                    className="ac-button ac-ghost ac-small"
                    disabled={action.pending}
                    aria-label={`Forget memory: ${e.content}`}
                    onClick={() => void action.run(() => onForget(e.id))}
                  >
                    Forget
                  </button>
                )}
              </div>
              <p>{e.content}</p>
              <span className="ac-muted ac-small">
                {e.source}
                {e.updatedAt && ` · ${e.updatedAt}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      {action.error && (
        <p className="ac-error" role="alert">
          {action.error}
        </p>
      )}
    </Surface>
  );
}
