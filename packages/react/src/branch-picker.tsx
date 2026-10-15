"use client";

import { Surface } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface ConversationBranch {
  id: string;
  title: string;
  preview: string;
  messages: number;
}
export interface BranchPickerProps extends SurfaceProps {
  branches: ConversationBranch[];
  value: string;
  onValueChange: (id: string) => void;
}
export function BranchPicker({
  branches,
  value,
  onValueChange,
  ...props
}: BranchPickerProps) {
  return (
    <Surface
      {...props}
      title="Conversation branches"
      eyebrow="Explore alternatives"
    >
      {branches.length === 0 ? (
        <p className="ac-empty">No conversation branches yet.</p>
      ) : (
        <ul className="ac-list">
          {branches.map((b) => (
            <li key={b.id}>
              <button
                className="ac-branch"
                aria-pressed={b.id === value}
                onClick={() => onValueChange(b.id)}
              >
                <span className="ac-row">
                  <strong>⑂ {b.title}</strong>
                  <span className="ac-muted ac-small">
                    {b.messages} messages
                  </span>
                </span>
                <span className="ac-muted ac-block">{b.preview}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Surface>
  );
}
