"use client";

import { Surface, safeHref } from "./_shared.js";
import type { SurfaceProps } from "./_shared.js";
export interface Source {
  id: string;
  title: string;
  href: string;
  excerpt?: string;
  relevance?: string;
}
export interface SourceStackProps extends SurfaceProps {
  sources: Source[];
  title?: string;
}
export function SourceStack({
  sources,
  title = "Sources & evidence",
  ...props
}: SourceStackProps) {
  return (
    <Surface
      {...props}
      title={title}
      eyebrow="Grounding"
      actions={
        <span className="ac-muted ac-mono">{sources.length} sources</span>
      }
    >
      {sources.length === 0 ? (
        <p className="ac-empty">No sources attached yet.</p>
      ) : (
        <ol className="ac-source-list">
          {sources.map((s, i) => (
            <li key={s.id}>
              <span className="ac-source-index">{i + 1}</span>
              <div>
                {safeHref(s.href) ? (
                  <a
                    className="ac-source-title"
                    href={safeHref(s.href)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {s.title} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <strong>{s.title}</strong>
                )}
                {s.excerpt && <p className="ac-muted">{s.excerpt}</p>}
                {s.relevance && <span className="ac-tag">{s.relevance}</span>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Surface>
  );
}
