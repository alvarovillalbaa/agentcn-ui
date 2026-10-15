"use client";

import { Surface, number, bounded } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface TokenUsageProps extends SurfaceProps {
  input: number;
  output: number;
  cached?: number;
  cost: number;
  budget?: number;
  currency?: string;
}
export function TokenUsage({
  input,
  output,
  cached = 0,
  cost,
  budget,
  currency = "USD",
  ...props
}: TokenUsageProps) {
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 4,
  });
  return (
    <Surface
      {...props}
      title="Usage & cost"
      eyebrow="Run telemetry"
      actions={
        <strong className="ac-mono">{money.format(Math.max(0, cost))}</strong>
      }
    >
      <dl className="ac-metrics">
        {[
          ["Input", input],
          ["Output", output],
          ["Cached input", cached],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{number(Math.max(0, Number(value)))}</dd>
          </div>
        ))}
      </dl>
      {budget !== undefined && budget > 0 && (
        <div className="ac-body">
          <label className="ac-row ac-muted">
            Budget <span>{money.format(budget)}</span>
          </label>
          <progress
            className="ac-progress"
            aria-label="Run budget spent"
            value={bounded(cost, budget)}
            max={budget}
          />
          {cost > budget && <p className="ac-error">Budget exceeded</p>}
        </div>
      )}
    </Surface>
  );
}
