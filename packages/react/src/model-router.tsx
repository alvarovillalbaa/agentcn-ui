"use client";

import { useId } from "react";
import { Surface } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}
export interface ModelRouterProps extends SurfaceProps {
  models: ModelOption[];
  value: string;
  onValueChange: (id: string) => void;
  disabled?: boolean;
}
export function ModelRouter({
  models,
  value,
  onValueChange,
  disabled,
  ...props
}: ModelRouterProps) {
  const id = useId();
  return (
    <Surface {...props} title="Model routing" eyebrow="Intelligence layer">
      <fieldset className="ac-fieldset" disabled={disabled}>
        <legend className="ac-sr-only">Choose a model</legend>
        {models.length === 0 && (
          <p className="ac-empty">No models available.</p>
        )}
        {models.map((m) => (
          <label className="ac-model" key={m.id} data-selected={m.id === value}>
            <input
              type="radio"
              name={id}
              value={m.id}
              checked={m.id === value}
              disabled={m.disabled}
              onChange={() => onValueChange(m.id)}
            />
            <div className="ac-grow">
              <div className="ac-row">
                <strong>{m.name}</strong>
                {m.badge && <span className="ac-tag">{m.badge}</span>}
              </div>
              <span className="ac-muted ac-small">
                {m.provider} · {m.description}
              </span>
            </div>
          </label>
        ))}
      </fieldset>
    </Surface>
  );
}
