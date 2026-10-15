"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { cx, useAction } from "./_shared.js";
export interface PromptComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void | Promise<void>;
  onStop?: () => void | Promise<void>;
  status?: "idle" | "streaming" | "disabled";
  placeholder?: string;
  label?: string;
  footer?: ReactNode;
  className?: string;
  maxLength?: number;
}
export function PromptComposer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  status = "idle",
  placeholder = "Give your agent a task…",
  label = "Message your agent",
  footer,
  className,
  maxLength,
}: PromptComposerProps) {
  const id = useId();
  const action = useAction();
  const disabled = status !== "idle" || action.pending;
  const submit = () => {
    if (!disabled && value.trim())
      void action.run(() => onSubmit(value.trim()));
  };
  return (
    <form
      className={cx("ac-composer", className)}
      aria-label={label}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="ac-sr-only" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        disabled={status === "disabled" || action.pending}
        maxLength={maxLength}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            (e.metaKey || e.ctrlKey) &&
            !e.nativeEvent.isComposing
          ) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="ac-composer-footer">
        <div className="ac-muted ac-small">
          {footer ?? "⌘ / Ctrl + Enter to send"}
        </div>
        {status === "streaming" ? (
          <button
            type="button"
            className="ac-button"
            disabled={!onStop || action.pending}
            onClick={() => onStop && void action.run(onStop)}
          >
            Stop generation
          </button>
        ) : (
          <button
            type="submit"
            className="ac-button ac-primary"
            disabled={disabled || !value.trim()}
          >
            {action.pending ? "Sending…" : "Run agent ↗"}
          </button>
        )}
      </div>
      {action.error && (
        <p role="alert" className="ac-error">
          {action.error}
        </p>
      )}
    </form>
  );
}
