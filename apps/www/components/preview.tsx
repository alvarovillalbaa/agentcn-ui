"use client";
import { useState } from "react";
import { Demo } from "./demos";
import { CopyButton } from "./copy-button";
export function Preview({ name, code }: { name: string; code: string }) {
  const [tab, setTab] = useState("preview");
  return (
    <div className="preview-box">
      <div className="preview-toolbar">
        <div className="filter-tabs">
          <button
            aria-pressed={tab === "preview"}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
          <button aria-pressed={tab === "code"} onClick={() => setTab("code")}>
            Code
          </button>
        </div>
        {tab === "code" ? (
          <CopyButton value={code} />
        ) : (
          <span className="demo-label">Interactive demo</span>
        )}
      </div>
      {tab === "preview" ? (
        <div className="docs-preview">
          <Demo name={name} />
        </div>
      ) : (
        <pre className="source-code">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
