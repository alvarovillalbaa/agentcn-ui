"use client";

import { Surface, useAction } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface PlanStep {
  id: string;
  title: string;
  description?: string;
  selected: boolean;
  required?: boolean;
}
export interface PlanReviewProps extends SurfaceProps {
  title: string;
  steps: PlanStep[];
  onStepChange?: (id: string, selected: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  confirmed?: boolean;
}
export function PlanReview({
  title,
  steps,
  onStepChange,
  onConfirm,
  confirmed = false,
  ...props
}: PlanReviewProps) {
  const action = useAction();
  return (
    <Surface
      {...props}
      title={title}
      eyebrow="Execution plan"
      actions={
        <span className="ac-tag">
          {steps.filter((s) => s.selected).length} / {steps.length} steps
        </span>
      }
    >
      <ol className="ac-list">
        {steps.map((s, i) => (
          <li key={s.id} className="ac-plan-step">
            <label>
              <input
                type="checkbox"
                checked={s.selected}
                disabled={
                  !onStepChange || s.required || confirmed || action.pending
                }
                onChange={(e) => onStepChange?.(s.id, e.target.checked)}
              />
              <span>
                <strong>
                  {i + 1}. {s.title}
                </strong>
                {s.description && (
                  <span className="ac-muted ac-block">{s.description}</span>
                )}
                {s.required && (
                  <span className="ac-muted ac-small">Required</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ol>
      {onConfirm && (
        <footer className="ac-footer">
          <button
            className="ac-button ac-primary"
            disabled={
              confirmed || action.pending || !steps.some((s) => s.selected)
            }
            onClick={() => void action.run(onConfirm)}
          >
            {confirmed
              ? "Plan confirmed"
              : action.pending
                ? "Confirming…"
                : "Confirm plan"}
          </button>
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
