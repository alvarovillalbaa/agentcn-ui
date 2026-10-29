"use client";

import { useId, useState } from "react";
import { Surface } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";

export interface MemberOption {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
}

export interface MemberPickerProps extends SurfaceProps {
  members: MemberOption[];
  value: string[];
  onValueChange: (ids: string[]) => void;
  label?: string;
  disabled?: boolean;
  maxMembers?: number;
}

export function MemberPicker({
  members,
  value,
  onValueChange,
  label = "Members",
  disabled = false,
  maxMembers = 20,
  ...props
}: MemberPickerProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string>();
  const limit = Math.max(
    0,
    Math.floor(Number.isFinite(maxMembers) ? maxMembers : 20),
  );
  const search = query.trim().toLocaleLowerCase();
  const visible = members.filter((member) =>
    `${member.name}\n${member.description ?? ""}`
      .toLocaleLowerCase()
      .includes(search),
  );
  const unavailable = value.filter(
    (selected) => !members.some((member) => member.id === selected),
  ).length;

  return (
    <Surface {...props} title={label} eyebrow="Existing members">
      <fieldset className="ac-fieldset" disabled={disabled}>
        <legend className="ac-field-label">Add members</legend>
        <p className="ac-field-help">Choose members from the list.</p>
        <label className="ac-field-label" htmlFor={id}>
          Search members
        </label>
        <input
          id={id}
          className="ac-input-control"
          type="search"
          value={query}
          placeholder="Search by name or description"
          aria-describedby={`${id}-summary`}
          onChange={(event) => {
            if (!disabled) setQuery(event.currentTarget.value);
          }}
        />
        <p id={`${id}-summary`} className="ac-selection-summary" role="status">
          {value.length} / {limit} selected.{" "}
          {value.length >= limit && "Remove a selection before adding another."}
          {unavailable > 0 &&
            ` ${unavailable} selected member${unavailable === 1 ? " is" : "s are"} unavailable in the current options; those selections are kept.`}
        </p>
        {visible.length === 0 ? (
          <p className="ac-empty">
            {members.length === 0
              ? "No members available."
              : "No members match your search."}
          </p>
        ) : (
          <ul className="ac-member-list" aria-label="Available members">
            {visible.map((member, index) => {
              const selected = value.includes(member.id);
              return (
                <li key={member.id}>
                  <label className="ac-member-option" data-selected={selected}>
                    <input
                      type="checkbox"
                      checked={selected}
                      aria-label={member.name}
                      aria-describedby={
                        member.description ? `${id}-member-${index}` : undefined
                      }
                      disabled={
                        member.disabled || (!selected && value.length >= limit)
                      }
                      onChange={(event) => {
                        if (disabled || member.disabled) return;
                        const checked = event.currentTarget.checked;
                        if (checked && !selected && value.length >= limit) {
                          setError(`Choose at most ${limit} members.`);
                          return;
                        }
                        try {
                          onValueChange(
                            checked
                              ? selected
                                ? value
                                : [...value, member.id]
                              : value.filter(
                                  (current) => current !== member.id,
                                ),
                          );
                          setError(undefined);
                        } catch {
                          setError(
                            "The member selection could not be changed. Try again.",
                          );
                        }
                      }}
                    />
                    <span className="ac-member-copy">
                      <strong>{member.name}</strong>
                      {member.description && (
                        <span
                          id={`${id}-member-${index}`}
                          className="ac-muted ac-small"
                        >
                          {member.description}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>
      {error && (
        <p className="ac-error" role="alert">
          {error}
        </p>
      )}
    </Surface>
  );
}
