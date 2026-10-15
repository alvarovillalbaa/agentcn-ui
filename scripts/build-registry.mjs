import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import ts from "typescript";
import { catalog, presets, palettes } from "../catalog.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const cli = path.join(root, "packages/cli/registry");
const web = path.join(root, "apps/www/public/r");
await mkdir(cli, { recursive: true });
await mkdir(web, { recursive: true });
for (const packageName of ["react", "cli"])
  await copyFile(
    path.join(root, "LICENSE"),
    path.join(root, `packages/${packageName}/LICENSE`),
  );
const shared = await readFile(
  path.join(root, "packages/react/src/_shared.tsx"),
  "utf8",
);
const css = await readFile(
  path.join(root, "packages/react/styles.css"),
  "utf8",
);
const entries = [];
const documentation = {};
const demoSource = ts.createSourceFile(
  "demos.tsx",
  await readFile(path.join(root, "apps/www/components/demos.tsx"), "utf8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
for (const item of catalog) {
  const original = await readFile(
    path.join(root, `packages/react/src/${item.name}.tsx`),
    "utf8",
  );
  const content = original.replaceAll('"./_shared.js"', '"./_shared"');
  const parsed = ts.createSourceFile(
    `${item.name}.tsx`,
    original,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const props = parsed.statements.find(
    (node) =>
      ts.isInterfaceDeclaration(node) &&
      node.name.text === `${item.component}Props`,
  );
  const demo = demoSource.statements.find(
    (node) =>
      ts.isFunctionDeclaration(node) &&
      node.name?.text === `${item.component}Demo`,
  );
  if (!props || !demo) throw new Error(`Missing API or demo for ${item.name}`);
  documentation[item.name] = {
    props: props.members.filter(ts.isPropertySignature).map((p) => ({
      name: p.name.getText(parsed),
      type: p.type?.getText(parsed) ?? "unknown",
      required: !p.questionToken,
    })),
    example: `"use client";\n\nimport { useState } from "react";\nimport { ${item.component} } from "@alvarovillalbaa/agentcn-ui";\n\n${demo.getText(demoSource).replace("export function", "export default function")}\n`,
    source: content,
  };
  const entry = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...item,
    type: "registry:component",
    files: [
      { path: `${item.name}.tsx`, type: "registry:component", content },
      { path: "_shared.tsx", type: "registry:component", content: shared },
      {
        path: "agentcn.css",
        type: "registry:file",
        target: "styles/agentcn.css",
        content: css,
      },
    ],
  };
  entries.push(entry);
  await writeFile(
    path.join(cli, `${item.name}.json`),
    JSON.stringify(entry, null, 2) + "\n",
  );
  await writeFile(
    path.join(web, `${item.name}.json`),
    JSON.stringify(entry, null, 2) + "\n",
  );
}
const index = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "agentcn-ui",
  homepage: "https://alvarovillalbaa.github.io/agentcn-ui/",
  items: entries,
};
await writeFile(
  path.join(web, "registry.json"),
  JSON.stringify(index, null, 2) + "\n",
);
await writeFile(
  path.join(cli, "catalog.json"),
  JSON.stringify({ catalog, presets, palettes }, null, 2) + "\n",
);
await copyFile(
  path.join(root, "catalog.mjs"),
  path.join(root, "apps/www/lib/catalog.mjs"),
);
await writeFile(
  path.join(root, "apps/www/lib/documentation.json"),
  JSON.stringify(documentation, null, 2) + "\n",
);
console.log(
  `Built ${entries.length} self-contained registry entries for the website and CLI.`,
);
