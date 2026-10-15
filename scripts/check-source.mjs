import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { catalog } from "../catalog.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
let count = 0;
const failures = [];
async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (["node_modules", "dist", ".next", "public"].includes(entry.name))
      continue;
    if (entry.isDirectory()) {
      await walk(filename);
      continue;
    }
    if (!/\.(tsx?|mjs)$/.test(entry.name) || entry.name.endsWith(".d.ts"))
      continue;
    const source = await readFile(filename, "utf8");
    if (/\.tsx?$/.test(entry.name)) {
      const result = ts.transpileModule(source, {
        fileName: filename,
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
        reportDiagnostics: true,
      });
      for (const d of result.diagnostics ?? [])
        if (d.category === ts.DiagnosticCategory.Error)
          failures.push(
            `${path.relative(root, filename)}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
          );
    }
    const parsed = ts.createSourceFile(
      filename,
      source,
      ts.ScriptTarget.Latest,
      true,
      filename.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    for (const node of parsed.statements)
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        const specifier = node.moduleSpecifier?.text;
        if (
          !specifier ||
          (!specifier.startsWith(".") && !specifier.startsWith("@/"))
        )
          continue;
        const base = specifier.startsWith("@/")
          ? path.join(root, "apps/www", specifier.slice(2))
          : path.resolve(path.dirname(filename), specifier);
        const candidates = [
          base,
          base.replace(/\.js$/, ".ts"),
          base.replace(/\.js$/, ".tsx"),
          `${base}.ts`,
          `${base}.tsx`,
          `${base}.mjs`,
          `${base}/index.ts`,
        ];
        if (!(await Promise.all(candidates.map(exists))).some(Boolean))
          failures.push(
            `Unresolved import in ${path.relative(root, filename)}: ${specifier}`,
          );
      }
    count++;
  }
}
await walk(path.join(root, "apps"));
await walk(path.join(root, "packages"));
await walk(path.join(root, "scripts"));
const docs = JSON.parse(
  await readFile(path.join(root, "apps/www/lib/documentation.json"), "utf8"),
);
for (const item of catalog) {
  if (!docs[item.name]?.example || !docs[item.name]?.props?.length)
    failures.push(`Missing docs: ${item.name}`);
  const entry = JSON.parse(
    await readFile(
      path.join(root, `packages/cli/registry/${item.name}.json`),
      "utf8",
    ),
  );
  if (
    !entry.files.some((f) => f.path === `${item.name}.tsx`) ||
    !entry.files.some((f) => f.path === "_shared.tsx") ||
    !entry.files.some((f) => f.path.endsWith(".css"))
  )
    failures.push(`Incomplete registry item: ${item.name}`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Syntax/import checks passed for ${count} source files; ${catalog.length} registry items have API documentation and examples. This is not a Next.js build or browser check.`,
  );
