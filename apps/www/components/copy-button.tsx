"use client";
import { useState } from "react";
export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  return (
    <button
      type="button"
      className="copy-button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setState("copied");
          setTimeout(() => setState("idle"), 1800);
        } catch {
          setState("error");
        }
      }}
      aria-label={`${label} to clipboard`}
    >
      <span aria-hidden="true">{state === "copied" ? "✓" : "⧉"}</span>{" "}
      {state === "copied"
        ? "Copied"
        : state === "error"
          ? "Select text to copy"
          : label}
    </button>
  );
}
