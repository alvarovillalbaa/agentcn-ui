"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Surface } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";

export interface CreatableOption {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface CreatableSelectProps extends SurfaceProps {
  options: CreatableOption[];
  value: string;
  onValueChange: (id: string) => void;
  onCreate: (label: string) => void | Promise<void>;
  label?: string;
  disabled?: boolean;
  maxLength?: number;
}

type CreationContext = {
  options: CreatableOption[];
  value: string;
  onValueChange: CreatableSelectProps["onValueChange"];
  onCreate: CreatableSelectProps["onCreate"];
  label: string;
  disabled: boolean;
  maxLength: number;
};
type CreationRequest = {
  context: CreationContext;
  generation: number;
  revision: number;
};
type Feedback = {
  context: CreationContext;
  request: CreationRequest | null;
  pending: boolean;
  error?: string;
};

/** Creation emits an intent; the application owns the new option and selection. */
export function CreatableSelect({
  options,
  value,
  onValueChange,
  onCreate,
  label = "Option",
  disabled = false,
  maxLength = 100,
  ...props
}: CreatableSelectProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const revision = useRef(0);
  const generation = useRef(0);
  const committed = useRef<CreationContext | null>(null);
  const active = useRef<CreationRequest | null>(null);
  const lengthLimit = Math.max(
    0,
    Math.floor(Number.isFinite(maxLength) ? maxLength : 100),
  );
  const context = useMemo(
    () => ({
      options,
      value,
      onValueChange,
      onCreate,
      label,
      disabled,
      maxLength: lengthLimit,
    }),
    [options, value, onValueChange, onCreate, label, disabled, lengthLimit],
  );
  const [feedback, setFeedback] = useState<Feedback>({
    context,
    request: null,
    pending: false,
  });
  const pending = feedback.context === context && feedback.pending;
  const error = feedback.context === context ? feedback.error : undefined;

  useLayoutEffect(() => {
    committed.current = context;
    generation.current++;
    active.current = null;
    return () => {
      committed.current = null;
      generation.current++;
      active.current = null;
    };
  }, [context]);

  const ownsContext = (request: CreationRequest) =>
    committed.current === request.context &&
    generation.current === request.generation;
  const validationError = (message: string) =>
    setFeedback({ context, request: null, pending: false, error: message });
  const create = async () => {
    if (
      disabled ||
      composing.current ||
      committed.current !== context ||
      active.current
    )
      return;
    const text = (input.current?.value ?? draft).trim();
    if (!text) {
      validationError("Enter an option name.");
      return;
    }
    if (text.length > lengthLimit) {
      validationError(`Use at most ${lengthLimit} characters for an option.`);
      return;
    }
    if (options.some((option) => option.label === text)) {
      validationError("An option with this exact label already exists.");
      return;
    }
    const request = {
      context,
      generation: generation.current,
      revision: revision.current,
    };
    active.current = request;
    setFeedback({ context, request, pending: true });
    try {
      await onCreate(text);
      if (
        active.current === request &&
        ownsContext(request) &&
        revision.current === request.revision
      ) {
        setDraft((current) =>
          ownsContext(request) && revision.current === request.revision
            ? ""
            : current,
        );
      }
    } catch {
      if (
        active.current === request &&
        ownsContext(request) &&
        revision.current === request.revision
      ) {
        setFeedback((current) =>
          current.request === request &&
          ownsContext(request) &&
          revision.current === request.revision
            ? {
                ...current,
                error:
                  "The option could not be created. Your draft was kept; try again.",
              }
            : current,
        );
      }
    } finally {
      if (active.current === request) {
        active.current = null;
        setFeedback((current) =>
          current.request === request && ownsContext(request)
            ? { ...current, pending: false }
            : current,
        );
      }
    }
  };

  return (
    <Surface {...props} title={label} eyebrow="Select or create">
      <div className="ac-creatable-fields">
        <label className="ac-field-label" htmlFor={id}>
          {label}
        </label>
        <select
          id={id}
          className="ac-input-control"
          value={value}
          disabled={disabled || options.length === 0}
          onChange={(event) => {
            const next = event.currentTarget.value;
            if (
              disabled ||
              !options.some((option) => option.id === next && !option.disabled)
            )
              return;
            try {
              onValueChange(next);
              setFeedback((current) =>
                current.context === context
                  ? { ...current, error: undefined }
                  : { context, request: null, pending: false },
              );
            } catch {
              setFeedback((current) =>
                current.context === context
                  ? {
                      ...current,
                      error:
                        "The option selection could not be changed. Try again.",
                    }
                  : {
                      context,
                      request: null,
                      pending: false,
                      error:
                        "The option selection could not be changed. Try again.",
                    },
              );
            }
          }}
        >
          <option value="" disabled>
            Select an option
          </option>
          {value && !options.some((option) => option.id === value) && (
            <option value={value} disabled>
              Selected option unavailable
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.id}
              value={option.id}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {options.length === 0 && (
          <p className="ac-empty">No options available.</p>
        )}
        <label className="ac-field-label" htmlFor={`${id}-new`}>
          New option
        </label>
        <div className="ac-field-row">
          <input
            ref={input}
            id={`${id}-new`}
            type="text"
            className="ac-input-control"
            value={draft}
            disabled={disabled}
            maxLength={lengthLimit}
            aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              if (disabled) return;
              revision.current++;
              setDraft(event.currentTarget.value);
              setFeedback((current) =>
                current.context === context
                  ? { ...current, error: undefined }
                  : { context, request: null, pending: false },
              );
            }}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.nativeEvent.isComposing &&
                event.keyCode !== 229 &&
                !composing.current
              ) {
                event.preventDefault();
                void create();
              }
            }}
          />
          <button
            type="button"
            className="ac-button"
            disabled={disabled || pending || lengthLimit === 0}
            onClick={() => void create()}
          >
            {pending ? "Adding…" : "Add new"}
          </button>
        </div>
        <p id={`${id}-help`} className="ac-field-help">
          Choose an existing option above, or enter a name to add a new one.
        </p>
        {pending && (
          <p className="ac-field-help" role="status">
            Creating option…
          </p>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="ac-error" role="alert">
          {error}
        </p>
      )}
    </Surface>
  );
}
