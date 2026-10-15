// Data tier T2: mock UI state in jsdom; no API or model calls.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ApprovalRequest,
  ArtifactPanel,
  SourceStack,
  ContextWindow,
  PlanReview,
} from "../../packages/react/dist/index.js";

test("approval waits for persistence, blocks duplicate clicks, and renders failure", async (t) => {
  const dom = new JSDOM("<div id='root'></div>", { url: "http://localhost" });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    act: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = dom.window.document.getElementById("root");
  const root = createRoot(container);
  t.after(async () => {
    await act(async () => root.unmount());
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
    dom.window.close();
  });
  let reject,
    calls = 0;
  await act(async () => {
    root.render(
      React.createElement(ApprovalRequest, {
        title: "Publish?",
        description: "Review action",
        scope: ["Publish document"],
        status: "pending",
        onDecision: () => {
          calls++;
          return new Promise((_, fail) => {
            reject = fail;
          });
        },
      }),
    );
  });
  const approve = container.querySelector("button");
  await act(async () => {
    approve.click();
    approve.click();
  });
  assert.equal(calls, 1);
  assert.equal(approve.disabled, true);
  assert.match(container.textContent, /Saving decision/);
  assert.doesNotMatch(container.textContent, /Request approved/);
  await act(async () => reject(new Error("Server rejected the decision")));
  assert.equal(approve.disabled, false);
  assert.equal(
    container.querySelector("[role='alert']").textContent,
    "Server rejected the decision",
  );
});

test("artifact text cannot inject HTML or execute code", () => {
  const html = renderToStaticMarkup(
    React.createElement(ArtifactPanel, {
      name: "unsafe.html",
      content: "<script>alert('unsafe')</script>",
    }),
  );
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;script&gt;/);
});
test("source links reject executable and relative URLs", () => {
  const html = renderToStaticMarkup(
    React.createElement(SourceStack, {
      sources: [
        { id: "1", title: "Unsafe", href: "javascript:alert(1)" },
        { id: "2", title: "Safe", href: "https://react.dev" },
        { id: "3", title: "Relative", href: "/private" },
      ],
    }),
  );
  assert.equal((html.match(/<a /g) ?? []).length, 1);
  assert.ok(!html.includes("javascript:"));
  assert.match(html, /noopener/);
});
test("context meter clamps display when over capacity", () => {
  const html = renderToStaticMarkup(
    React.createElement(ContextWindow, {
      capacity: 100,
      segments: [{ id: "1", label: "Input", tokens: 140 }],
    }),
  );
  assert.match(html, /aria-valuenow="100"/);
  assert.match(html, /Context exceeds/);
});
test("empty plan cannot be confirmed", () => {
  const html = renderToStaticMarkup(
    React.createElement(PlanReview, {
      title: "Empty",
      steps: [],
      onConfirm: () => {},
    }),
  );
  assert.match(html, /disabled=""/);
});
