"use client";

import { useId, useRef, useState } from "react";
import { Surface } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";

export interface MultiInputProps extends SurfaceProps {
  values: string[];
  onValuesChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  addLabel?: string;
  disabled?: boolean;
  maxItems?: number;
  maxLength?: number;
}

export function MultiInput({
  values,
  onValuesChange,
  label = "Tags",
  placeholder = "Enter a tag",
  addLabel = "Add tag",
  disabled = false,
  maxItems = 20,
  maxLength = 100,
  ...props
}: MultiInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();
  const draftRef = useRef("");
  const revision = useRef(0);
  const composing = useRef(false);
  const itemLimit = Math.max(
    0,
    Math.floor(Number.isFinite(maxItems) ? maxItems : 20),
  );
  const lengthLimit = Math.max(
    0,
    Math.floor(Number.isFinite(maxLength) ? maxLength : 100),
  );
  const atLimit = values.length >= itemLimit;

  const add = () => {
    if (disabled || composing.current) return;
    const value = draftRef.current.trim();
    if (!value) {
      setError("Enter a tag before adding it.");
      return;
    }
    if (value.length > lengthLimit) {
      setError(`Use at most ${lengthLimit} characters per tag.`);
      return;
    }
    if (values.includes(value)) {
      setError("This exact tag is already selected.");
      return;
    }
    if (atLimit) {
      setError(
        `Choose at most ${itemLimit} tags. Remove one before adding another.`,
      );
      return;
    }
    const expected = revision.current;
    try {
      onValuesChange([...values, value]);
      if (revision.current === expected) {
        draftRef.current = "";
        setDraft("");
      }
      setError(undefined);
    } catch {
      setError("The tag could not be added. Your draft was kept; try again.");
    }
  };

  return (
    <Surface {...props} title={label} eyebrow="Structured input">
      <fieldset className="ac-fieldset" disabled={disabled}>
        <legend className="ac-sr-only">{label}</legend>
        {values.length === 0 ? (
          <p className="ac-empty">No tags added yet.</p>
        ) : (
          <ul className="ac-token-list" aria-label="Selected tags">
            {values.map((value, index) => (
              <li className="ac-token" key={`${index}:${value}`}>
                <span>{value}</span>
                <button
                  type="button"
                  className="ac-token-remove"
                  aria-label={`Remove ${value}`}
                  onClick={() => {
                    if (disabled) return;
                    try {
                      onValuesChange(
                        values.filter((_, current) => current !== index),
                      );
                      setError(undefined);
                    } catch {
                      setError("The tag could not be removed. Try again.");
                    }
                  }}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="ac-field-label" htmlFor={id}>
          New tag
        </label>
        <div className="ac-field-row">
          <input
            id={id}
            className="ac-input-control"
            type="text"
            value={draft}
            maxLength={lengthLimit}
            placeholder={placeholder}
            aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              if (disabled) return;
              draftRef.current = event.currentTarget.value;
              revision.current++;
              setDraft(event.currentTarget.value);
              setError(undefined);
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
                add();
              }
            }}
          />
          <button
            type="button"
            className="ac-button"
            disabled={disabled || atLimit || lengthLimit === 0}
            onClick={add}
          >
            {addLabel}
          </button>
        </div>
        <p id={`${id}-help`} className="ac-field-help">
          {values.length} / {itemLimit} tags.{" "}
          {atLimit
            ? "Remove a tag to add another."
            : `Up to ${lengthLimit} characters each. Exact duplicates are not added.`}
        </p>
      </fieldset>
      {error && (
        <p id={`${id}-error`} className="ac-error" role="alert">
          {error}
        </p>
      )}
    </Surface>
  );
}
