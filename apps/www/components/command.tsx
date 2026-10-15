"use client";
import { useState } from "react";
import { CopyButton } from "./copy-button";
export function Command({
  args,
  packageName = "agentcn-ui@latest",
  mode = "exec",
}: {
  args: string;
  packageName?: string;
  mode?: "exec" | "install";
}) {
  const [manager, setManager] = useState("npm");
  const command =
    mode === "install"
      ? `${manager} ${manager === "npm" ? "install" : "add"} ${packageName}${args ? " " + args : ""}`
      : `${manager === "npm" ? "npx" : "pnpm dlx"} ${packageName} ${args}`;
  return (
    <div className="command-box">
      <div className="command-toolbar">
        <div className="manager-switch" aria-label="Package manager">
          {["npm", "pnpm"].map((m) => (
            <button
              key={m}
              aria-pressed={m === manager}
              onClick={() => setManager(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <CopyButton value={command} />
      </div>
      <pre>
        <code>
          <span className="code-dollar">$ </span>
          {command}
        </code>
      </pre>
    </div>
  );
}
