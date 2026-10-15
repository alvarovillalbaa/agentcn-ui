"use client";

import { useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

export type RunStatus =
  "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
export type SurfaceProps = HTMLAttributes<HTMLElement>;
export const cx = (...values: (string | undefined | false)[]) =>
  values.filter(Boolean).join(" ");
export const number = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
export const bounded = (value: number, max: number) =>
  Math.max(0, Math.min(Number.isFinite(value) ? value : 0, max));
export function safeHref(href: string) {
  try {
    const url = new URL(href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function Status({ value }: { value: RunStatus }) {
  return (
    <span className="ac-status" data-status={value}>
      <span aria-hidden="true" className="ac-dot" />
      {value}
    </span>
  );
}
export function Surface({
  title,
  eyebrow,
  actions,
  children,
  className,
  ...props
}: SurfaceProps & { title: string; eyebrow?: string; actions?: ReactNode }) {
  return (
    <section
      {...props}
      className={cx("ac-surface", className)}
      aria-label={props["aria-label"] ?? title}
    >
      <header className="ac-header">
        <div>
          {eyebrow && <span className="ac-eyebrow">{eyebrow}</span>}
          <h3 className="ac-title">{title}</h3>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
export function JsonView({ value, label }: { value: unknown; label: string }) {
  let content: string;
  try {
    content = JSON.stringify(value, null, 2) ?? "No value";
  } catch {
    content = "Value cannot be serialized";
  }
  return (
    <pre className="ac-code" aria-label={label}>
      <code>{content}</code>
    </pre>
  );
}
/** Serializes actions immediately, including before React has rendered a pending state. */
export function useAction() {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const run = async (action: () => void | Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setPending(true);
    setError(undefined);
    try {
      await action();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      lock.current = false;
      setPending(false);
    }
  };
  return { pending, error, run };
}
