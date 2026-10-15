"use client";

import { Surface, bounded, number } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface EvalMetric {
  id: string;
  label: string;
  score: number;
  threshold: number;
  detail?: string;
}
export interface EvalScorecardProps extends SurfaceProps {
  title: string;
  metrics: EvalMetric[];
  sampleSize: number;
  runId?: string;
}
export function EvalScorecard({
  title,
  metrics,
  sampleSize,
  runId,
  ...props
}: EvalScorecardProps) {
  const passed = metrics.filter((m) => m.score >= m.threshold).length;
  return (
    <Surface
      {...props}
      title={title}
      eyebrow="Evaluation"
      actions={
        <span className="ac-tag">
          {passed} / {metrics.length} passed
        </span>
      }
    >
      {metrics.length === 0 ? (
        <p className="ac-empty">No evaluation results yet.</p>
      ) : (
        <ul className="ac-list">
          {metrics.map((m) => (
            <li key={m.id} className="ac-eval">
              <div className="ac-row">
                <strong>{m.label}</strong>
                <span className="ac-mono" data-passed={m.score >= m.threshold}>
                  {number(m.score * 100)}% ·{" "}
                  {m.score >= m.threshold ? "Pass" : "Fail"}
                </span>
              </div>
              <progress
                className="ac-progress"
                aria-label={`${m.label} score`}
                value={bounded(m.score, 1)}
                max={1}
              />
              <span className="ac-muted ac-small">
                Threshold {number(m.threshold * 100)}%
                {m.detail && ` · ${m.detail}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      <footer className="ac-footer ac-muted ac-small">
        {number(sampleSize)} samples{runId && ` · ${runId}`}
      </footer>
    </Surface>
  );
}
