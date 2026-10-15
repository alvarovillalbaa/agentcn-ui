"use client";

import { Surface, bounded, number } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface ContextSegment {
  id: string;
  label: string;
  tokens: number;
}
export interface ContextWindowProps extends SurfaceProps {
  segments: ContextSegment[];
  capacity: number;
  reserved?: number;
}
export function ContextWindow({
  segments,
  capacity,
  reserved = 0,
  ...props
}: ContextWindowProps) {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.tokens), 0);
  const limit = Number.isFinite(capacity) && capacity > 0 ? capacity : 1;
  const percent = bounded((total / limit) * 100, 100);
  return (
    <Surface
      {...props}
      title="Context window"
      eyebrow="Model input"
      actions={
        <span className="ac-mono ac-muted">{number(percent)}% used</span>
      }
    >
      <div
        className="ac-context-meter"
        role="meter"
        aria-label="Context tokens used"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={bounded(total, limit)}
        aria-valuetext={`${number(total)} of ${number(limit)} tokens`}
      >
        {segments.map((s, i) => (
          <span
            key={s.id}
            className="ac-segment"
            style={{
              width: `${(Math.max(0, s.tokens) / Math.max(limit, total)) * 100}%`,
              opacity: 1 - (i % 5) * 0.15,
            }}
          />
        ))}
      </div>
      <ul className="ac-list">
        {segments.map((s) => (
          <li className="ac-row" key={s.id}>
            <span>{s.label}</span>
            <span className="ac-mono ac-muted">
              {number(Math.max(0, s.tokens))}
            </span>
          </li>
        ))}
      </ul>
      <footer className="ac-footer ac-muted">
        {number(total)} / {number(limit)} tokens ·{" "}
        {number(Math.max(0, limit - total - reserved))} available
        {reserved > 0 && ` · ${number(reserved)} reserved`}
      </footer>
      {total + reserved > limit && (
        <p className="ac-error" role="status">
          Context exceeds the available budget. Remove or summarize inputs.
        </p>
      )}
    </Surface>
  );
}
