// Data tier T2: authored consumer state and jsdom. No browser, billing, API or model calls.
// The dialog shim only supplies open/close events; it is not native modal/focus proof.
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import {
  MultiInput,
  MemberPicker,
  CreatableSelect,
  PricingTable,
} from "../../packages/react/dist/index.js";

function deferred() {
  let resolve, reject;
  const promise = new Promise((pass, fail) => {
    resolve = pass;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function button(container, name) {
  const found = [...container.querySelectorAll("button")].find(
    (node) =>
      (node.getAttribute("aria-label") ?? node.textContent).trim() === name,
  );
  assert.ok(found, `Expected button: ${name}`);
  return found;
}

function control(container, name) {
  const found = [...container.querySelectorAll("input,select,textarea")].find(
    (node) =>
      node.getAttribute("aria-label") === name ||
      [...(node.labels ?? [])].some(
        (label) => label.textContent.trim() === name,
      ),
  );
  assert.ok(found, `Expected control: ${name}`);
  return found;
}

async function mount(t, Component, initialProps) {
  const dom = new JSDOM("<!doctype html><div id='root'></div>", {
    url: "http://localhost",
    pretendToBeVisual: true,
  });
  const globals = {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    HTMLDialogElement: dom.window.HTMLDialogElement,
    Node: dom.window.Node,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const previous = new Map(
    Object.keys(globals).map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  for (const [key, value] of Object.entries(globals))
    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
    });
  let root;
  t.after(async () => {
    try {
      if (root) await act(async () => root.unmount());
    } finally {
      dom.window.close();
      for (const [key, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
      }
    }
  });
  Object.defineProperties(dom.window.HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value() {
        this.setAttribute("open", "");
      },
    },
    close: {
      configurable: true,
      value() {
        if (!this.open) return;
        this.removeAttribute("open");
        this.dispatchEvent(new dom.window.Event("close"));
      },
    },
  });
  // Import after DOM setup so React's input-event feature detection sees jsdom.
  const { createRoot } = await import("react-dom/client");
  const container = dom.window.document.getElementById("root");
  root = createRoot(container);
  let props = initialProps;
  const renderNow = (next = {}) => {
    props = { ...props, ...next };
    root.render(React.createElement(Component, props));
  };
  await act(async () => renderNow());
  return {
    container,
    window: dom.window,
    renderNow,
    render: (next = {}) => act(async () => renderNow(next)),
  };
}

async function controlled(t, Component, props, property, callback, initial) {
  let value = initial,
    ui;
  const changes = [];
  const onChange = (next) => {
    changes.push(next);
    value = next;
    ui.renderNow({ [property]: value });
  };
  ui = await mount(t, Component, {
    ...props,
    [property]: value,
    [callback]: onChange,
  });
  return {
    ...ui,
    changes,
    get value() {
      return value;
    },
    set: (next) => {
      value = next;
      return ui.render({ [property]: next });
    },
  };
}

async function type(ui, label, value) {
  const input = control(ui.container, label);
  const prototype =
    input.tagName === "SELECT"
      ? ui.window.HTMLSelectElement.prototype
      : ui.window.HTMLInputElement.prototype;
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(input, value);
    input.dispatchEvent(
      new ui.window.Event(input.tagName === "SELECT" ? "change" : "input", {
        bubbles: true,
      }),
    );
  });
  return input;
}

async function click(node) {
  await act(async () => node.click());
}
async function key(ui, node, key, extra = {}) {
  const event = new ui.window.KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...extra,
  });
  await act(async () => node.dispatchEvent(event));
  return event;
}
async function settle(work, outcome, value) {
  await act(async () => {
    work[outcome](value);
    await Promise.resolve();
  });
}

const members = [
  { id: "member-a", name: "Ada", description: "Design systems" },
  { id: "member-b", name: "Grace", description: "Runtime tools" },
  { id: "member-c", name: "Lin", description: "Research", disabled: true },
];
const options = [
  { id: "option-a", label: "Existing alpha" },
  { id: "option-b", label: "Existing beta", disabled: true },
];
const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    description: "Authored local option",
    features: ["One authored feature"],
    details: "Your app owns provisioning.",
  },
  {
    id: "team",
    name: "Team",
    price: "Contact us",
    description: "Authored shared option",
    features: ["Two authored features"],
    details: "Your app owns billing.",
  },
];

test("MultiInput adds a trimmed token through Enter and reflects controlled values", async (t) => {
  const ui = await controlled(
    t,
    MultiInput,
    {},
    "values",
    "onValuesChange",
    [],
  );
  const input = await type(ui, "New tag", "  authored tag  ");
  const event = await key(ui, input, "Enter");
  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(ui.changes, [["authored tag"]]);
  assert.equal(button(ui.container, "Remove authored tag").disabled, false);
  assert.equal(control(ui.container, "New tag").value, "");
});

test("MultiInput explicit changes preserve caller state and retain a failed draft", async (t) => {
  const initial = ["first"];
  const ui = await controlled(
    t,
    MultiInput,
    { addLabel: "Add label" },
    "values",
    "onValuesChange",
    initial,
  );
  await type(ui, "New tag", "second");
  await click(button(ui.container, "Add label"));
  await click(button(ui.container, "Remove first"));
  assert.deepEqual(ui.changes, [["first", "second"], ["second"]]);
  assert.deepEqual(initial, ["first"]);
  await type(ui, "New tag", "kept draft");
  await ui.set(["external"]);
  assert.equal(control(ui.container, "New tag").value, "kept draft");
  await ui.render({
    onValuesChange: () => {
      throw new Error("private callback details");
    },
  });
  await click(button(ui.container, "Add label"));
  assert.equal(control(ui.container, "New tag").value, "kept draft");
  assert.equal(
    ui.container.querySelector("[role='alert']").textContent,
    "The tag could not be added. Your draft was kept; try again.",
  );
  assert.doesNotMatch(ui.container.textContent, /private callback details/u);
});

test("MultiInput rejects blank and existing tokens without duplicate callbacks", async (t) => {
  const ui = await controlled(t, MultiInput, {}, "values", "onValuesChange", [
    "existing",
  ]);
  await type(ui, "New tag", "   ");
  await click(button(ui.container, "Add tag"));
  await type(ui, "New tag", " existing ");
  await key(ui, control(ui.container, "New tag"), "Enter");
  assert.deepEqual(ui.changes, []);
  assert.equal(
    ui.container.querySelectorAll("button[aria-label='Remove existing']")
      .length,
    1,
  );
});

test("MultiInput item limits prevent additions while permitting removal", async (t) => {
  const ui = await controlled(
    t,
    MultiInput,
    { maxItems: 1 },
    "values",
    "onValuesChange",
    ["full"],
  );
  await type(ui, "New tag", "next");
  await key(ui, control(ui.container, "New tag"), "Enter");
  assert.deepEqual(ui.changes, []);
  await click(button(ui.container, "Remove full"));
  await type(ui, "New tag", "next");
  await click(button(ui.container, "Add tag"));
  assert.deepEqual(ui.changes, [[], ["next"]]);
});

test("MultiInput enforces text bounds and consumes later external value changes", async (t) => {
  const ui = await controlled(
    t,
    MultiInput,
    { maxLength: 4 },
    "values",
    "onValuesChange",
    [],
  );
  await type(ui, "New tag", "longer");
  await key(ui, control(ui.container, "New tag"), "Enter");
  assert.deepEqual(ui.changes, []);
  await ui.set(["from parent"]);
  assert.ok(button(ui.container, "Remove from parent"));
  assert.equal(ui.changes.length, 0);
});

test("MultiInput disabled state prevents both addition and removal", async (t) => {
  const ui = await controlled(
    t,
    MultiInput,
    { disabled: true },
    "values",
    "onValuesChange",
    ["kept"],
  );
  assert.equal(control(ui.container, "New tag").matches(":disabled"), true);
  assert.equal(button(ui.container, "Add tag").disabled, true);
  assert.equal(button(ui.container, "Remove kept").matches(":disabled"), true);
  await click(button(ui.container, "Remove kept"));
  assert.deepEqual(ui.changes, []);
});

test("MultiInput IME composition and keyCode 229 do not prematurely add a token", async (t) => {
  const ui = await controlled(
    t,
    MultiInput,
    {},
    "values",
    "onValuesChange",
    [],
  );
  const input = await type(ui, "New tag", "日本語");
  await act(async () =>
    input.dispatchEvent(
      new ui.window.CompositionEvent("compositionstart", { bubbles: true }),
    ),
  );
  await key(ui, input, "Enter", { isComposing: true });
  await key(ui, input, "Enter");
  assert.deepEqual(ui.changes, []);
  await act(async () =>
    input.dispatchEvent(
      new ui.window.CompositionEvent("compositionend", {
        bubbles: true,
        data: "日本語",
      }),
    ),
  );
  await key(ui, input, "Enter", { keyCode: 229 });
  assert.deepEqual(ui.changes, []);
  await key(ui, input, "Enter");
  assert.deepEqual(ui.changes, [["日本語"]]);
});

test("MemberPicker filters existing names and descriptions without dropping hidden selections", async (t) => {
  const ui = await controlled(
    t,
    MemberPicker,
    { members },
    "value",
    "onValueChange",
    ["member-a"],
  );
  await type(ui, "Search members", "runtime");
  assert.equal(control(ui.container, "Grace").checked, false);
  assert.equal(ui.container.querySelector("input[aria-label='Ada']"), null);
  await click(control(ui.container, "Grace"));
  assert.deepEqual(ui.changes, [["member-a", "member-b"]]);
  await type(ui, "Search members", "");
  assert.equal(control(ui.container, "Ada").checked, true);
  assert.equal(control(ui.container, "Grace").checked, true);
});

test("MemberPicker toggles only supplied member IDs and preserves consumer-owned input", async (t) => {
  const initial = [];
  const ui = await controlled(
    t,
    MemberPicker,
    { members },
    "value",
    "onValueChange",
    initial,
  );
  await click(control(ui.container, "Ada"));
  await click(control(ui.container, "Ada"));
  assert.deepEqual(ui.changes, [["member-a"], []]);
  assert.deepEqual(initial, []);
  await ui.set(["member-b"]);
  assert.equal(control(ui.container, "Grace").checked, true);
  assert.equal(control(ui.container, "Ada").checked, false);
});

test("MemberPicker respects individual and whole-control disabled states", async (t) => {
  const ui = await controlled(
    t,
    MemberPicker,
    { members },
    "value",
    "onValueChange",
    [],
  );
  assert.equal(control(ui.container, "Lin").disabled, true);
  await click(control(ui.container, "Lin"));
  await ui.render({ disabled: true });
  assert.equal(
    control(ui.container, "Search members").matches(":disabled"),
    true,
  );
  assert.equal(control(ui.container, "Ada").matches(":disabled"), true);
  await click(control(ui.container, "Ada"));
  assert.deepEqual(ui.changes, []);
});

test("MemberPicker selection limits still allow deselecting a current member", async (t) => {
  const ui = await controlled(
    t,
    MemberPicker,
    { members, maxMembers: 1 },
    "value",
    "onValueChange",
    ["member-a"],
  );
  await click(control(ui.container, "Grace"));
  assert.deepEqual(ui.changes, []);
  await click(control(ui.container, "Ada"));
  await click(control(ui.container, "Grace"));
  assert.deepEqual(ui.changes, [[], ["member-b"]]);
});

test("MemberPicker empty and unmatched searches never offer invented members", async (t) => {
  const ui = await controlled(
    t,
    MemberPicker,
    { members: [] },
    "value",
    "onValueChange",
    [],
  );
  assert.equal(
    ui.container.querySelectorAll("input[type='checkbox']").length,
    0,
  );
  await ui.render({ members });
  await type(ui, "Search members", "nobody authored");
  assert.equal(
    ui.container.querySelectorAll("input[type='checkbox']").length,
    0,
  );
  assert.deepEqual(ui.changes, []);
  assert.doesNotMatch(ui.container.textContent, /Invite nobody|Create nobody/u);
});

test("CreatableSelect native selection preserves IDs and recovers from a caller failure", async (t) => {
  let ui,
    value = "",
    rejectSelection = false;
  const changes = [];
  const supplied = [...options, { id: "option-c", label: "Existing gamma" }];
  const onValueChange = (id) => {
    if (rejectSelection) throw new Error("private selection failure");
    changes.push(id);
    value = id;
    ui.renderNow({ value });
  };
  ui = await mount(t, CreatableSelect, {
    options: supplied,
    onCreate: () => {},
    value,
    onValueChange,
  });
  const select = control(ui.container, "Option");
  assert.equal(select.tagName, "SELECT");
  assert.equal(
    [...select.options].find((option) => option.value === "option-b").disabled,
    true,
  );
  await type(ui, "Option", "option-a");
  assert.deepEqual(changes, ["option-a"]);
  assert.equal(control(ui.container, "Option").value, "option-a");
  rejectSelection = true;
  await type(ui, "Option", "option-c");
  assert.equal(control(ui.container, "Option").value, "option-a");
  assert.equal(
    ui.container.querySelector("[role='alert']").textContent,
    "The option selection could not be changed. Try again.",
  );
  assert.doesNotMatch(ui.container.textContent, /private selection failure/u);
  assert.deepEqual(changes, ["option-a"]);
  rejectSelection = false;
  await type(ui, "Option", "option-c");
  assert.deepEqual(changes, ["option-a", "option-c"]);
  assert.equal(control(ui.container, "Option").value, "option-c");
  assert.equal(ui.container.querySelector("[role='alert']"), null);
});

test("CreatableSelect explicit creation emits a label without minting or selecting an ID", async (t) => {
  const created = [],
    selected = [];
  const ui = await mount(t, CreatableSelect, {
    options,
    value: "option-a",
    onValueChange: (id) => {
      selected.push(id);
    },
    onCreate: (label) => {
      created.push(label);
    },
  });
  await type(ui, "New option", "  Authored new  ");
  assert.deepEqual(created, []);
  await click(button(ui.container, "Add new"));
  assert.deepEqual(created, ["Authored new"]);
  assert.deepEqual(selected, []);
  assert.equal(control(ui.container, "Option").value, "option-a");
  assert.equal(
    [...control(ui.container, "Option").options].some(
      (option) => option.textContent === "Authored new",
    ),
    false,
  );
});

test("CreatableSelect does not create empty duplicate or over-limit labels", async (t) => {
  const created = [];
  const ui = await mount(t, CreatableSelect, {
    options,
    value: "",
    maxLength: 20,
    onValueChange: () => {},
    onCreate: (label) => {
      created.push(label);
    },
  });
  for (const value of ["   ", " Existing alpha ", "x".repeat(21)]) {
    await type(ui, "New option", value);
    await key(ui, control(ui.container, "New option"), "Enter");
  }
  assert.deepEqual(created, []);
});

test("CreatableSelect serializes pending creation and exposes failure with a retry", async (t) => {
  const first = deferred();
  const created = [];
  const ui = await mount(t, CreatableSelect, {
    options,
    value: "",
    onValueChange: () => {},
    onCreate: (label) => {
      created.push(label);
      return created.length === 1 ? first.promise : undefined;
    },
  });
  await type(ui, "New option", "Authored new");
  const add = button(ui.container, "Add new");
  await act(async () => {
    add.click();
    add.click();
  });
  assert.deepEqual(created, ["Authored new"]);
  assert.equal(button(ui.container, "Adding…").disabled, true);
  await settle(first, "reject", new Error("Authored failure"));
  assert.ok(ui.container.querySelector("[role='alert']"));
  assert.equal(control(ui.container, "New option").value, "Authored new");
  await click(button(ui.container, "Add new"));
  assert.deepEqual(created, ["Authored new", "Authored new"]);
  assert.equal(ui.container.querySelector("[role='alert']"), null);
});

test("CreatableSelect late success retains a newer unsent label", async (t) => {
  const first = deferred();
  const ui = await mount(t, CreatableSelect, {
    options,
    value: "",
    onValueChange: () => {},
    onCreate: () => first.promise,
  });
  await type(ui, "New option", "Submitted");
  await click(button(ui.container, "Add new"));
  assert.equal(control(ui.container, "New option").disabled, false);
  await type(ui, "New option", "Newer draft");
  await settle(first, "resolve");
  assert.equal(control(ui.container, "New option").value, "Newer draft");
  assert.equal(control(ui.container, "Option").value, "");
});

test("CreatableSelect late failure cannot attach an error to a newer label", async (t) => {
  const first = deferred();
  const ui = await mount(t, CreatableSelect, {
    options,
    value: "",
    onValueChange: () => {},
    onCreate: () => first.promise,
  });
  await type(ui, "New option", "Submitted");
  await click(button(ui.container, "Add new"));
  await type(ui, "New option", "Newer draft");
  await settle(first, "reject", new Error("Old request failed"));
  assert.equal(control(ui.container, "New option").value, "Newer draft");
  assert.equal(ui.container.querySelector("[role='alert']"), null);
});

test("CreatableSelect changed caller context fences an older creation acknowledgement", async (t) => {
  const first = deferred(),
    created = [];
  const ui = await mount(t, CreatableSelect, {
    options,
    value: "",
    onValueChange: () => {},
    onCreate: () => first.promise,
  });
  await type(ui, "New option", "Submitted");
  await click(button(ui.container, "Add new"));
  await ui.render({
    label: "Different option",
    options: [...options, { id: "parent-added", label: "Parent supplied" }],
    value: "parent-added",
    onCreate: (label) => {
      created.push(label);
    },
  });
  await settle(first, "reject", new Error("Old context failure"));
  assert.equal(control(ui.container, "Different option").value, "parent-added");
  assert.equal(ui.container.querySelector("[role='alert']"), null);
  assert.equal(control(ui.container, "New option").value, "Submitted");
  await click(button(ui.container, "Add new"));
  assert.deepEqual(created, ["Submitted"]);
});

test("CreatableSelect disabled and composing inputs cannot request creation", async (t) => {
  const created = [];
  const ui = await mount(t, CreatableSelect, {
    options,
    value: "",
    disabled: true,
    onValueChange: () => {},
    onCreate: (label) => {
      created.push(label);
    },
  });
  assert.equal(control(ui.container, "Option").disabled, true);
  assert.equal(control(ui.container, "New option").disabled, true);
  assert.equal(button(ui.container, "Add new").disabled, true);
  await ui.render({ disabled: false });
  const input = await type(ui, "New option", "日本語");
  await act(async () =>
    input.dispatchEvent(
      new ui.window.CompositionEvent("compositionstart", { bubbles: true }),
    ),
  );
  await key(ui, input, "Enter", { isComposing: true });
  assert.deepEqual(created, []);
  await act(async () =>
    input.dispatchEvent(
      new ui.window.CompositionEvent("compositionend", {
        bubbles: true,
        data: "日本語",
      }),
    ),
  );
  await key(ui, input, "Enter");
  assert.deepEqual(created, ["日本語"]);
});

test("PricingTable renders supplied terms without inventing a current plan or billing action", async (t) => {
  const chosen = [];
  const ui = await mount(t, PricingTable, {
    plans,
    onChoose: (id) => {
      chosen.push(id);
    },
  });
  assert.match(ui.container.textContent, /Free/u);
  assert.match(ui.container.textContent, /Contact us/u);
  assert.equal(
    [...ui.container.querySelectorAll("button")].some(
      (node) => node.textContent === "Current plan",
    ),
    false,
  );
  assert.deepEqual(chosen, []);
  assert.doesNotMatch(
    ui.container.textContent,
    /Payment received|Subscription active/u,
  );
  await ui.render({ value: "team" });
  assert.equal(button(ui.container, "Current plan").disabled, true);
  assert.ok(button(ui.container, "Choose Basic"));
});

test("PricingTable opens a labelled review with supplied details before choice intent", async (t) => {
  const chosen = [];
  const ui = await mount(t, PricingTable, {
    plans,
    onChoose: (id) => {
      chosen.push(id);
    },
  });
  await click(button(ui.container, "Choose Team"));
  const dialog = ui.container.querySelector("dialog[open]");
  assert.ok(dialog);
  assert.equal(
    ui.window.document.getElementById(dialog.getAttribute("aria-labelledby"))
      .textContent,
    "Review Team",
  );
  assert.match(dialog.textContent, /Contact us/u);
  assert.match(dialog.textContent, /Your app owns billing\./u);
  assert.deepEqual(chosen, []);
  await click(button(dialog, "Confirm Team"));
  assert.deepEqual(chosen, ["team"]);
  assert.equal(
    [...ui.container.querySelectorAll("button")].some(
      (node) => node.textContent === "Current plan",
    ),
    false,
  );
});

test("PricingTable close and native cancel return focus without choosing", async (t) => {
  const chosen = [];
  const ui = await mount(t, PricingTable, {
    plans,
    onChoose: (id) => {
      chosen.push(id);
    },
  });
  const opener = button(ui.container, "Choose Basic");
  opener.focus();
  await click(opener);
  await click(button(ui.container, "Close review"));
  assert.equal(ui.container.querySelector("dialog[open]"), null);
  assert.equal(ui.window.document.activeElement, opener);
  await click(opener);
  const dialog = ui.container.querySelector("dialog[open]");
  await act(async () => {
    const cancel = new ui.window.Event("cancel", { cancelable: true });
    if (dialog.dispatchEvent(cancel) && dialog.open) dialog.close();
  });
  assert.equal(ui.container.querySelector("dialog[open]"), null);
  assert.equal(ui.window.document.activeElement, opener);
  assert.deepEqual(chosen, []);
});

test("PricingTable pending choices serialize double clicks and failure stays retryable", async (t) => {
  const first = deferred(),
    chosen = [];
  const ui = await mount(t, PricingTable, {
    plans,
    onChoose: (id) => {
      chosen.push(id);
      return chosen.length === 1 ? first.promise : undefined;
    },
  });
  await click(button(ui.container, "Choose Team"));
  const confirm = button(ui.container, "Confirm Team");
  await act(async () => {
    confirm.click();
    confirm.click();
  });
  assert.deepEqual(chosen, ["team"]);
  assert.equal(button(ui.container, "Choosing…").disabled, true);
  assert.match(ui.container.textContent, /Waiting for confirmation/u);
  await settle(
    first,
    "reject",
    new Error("private upstream details must not render"),
  );
  assert.equal(
    ui.container.querySelector("[role='alert']").textContent,
    "Could not confirm this selection. Try again.",
  );
  assert.doesNotMatch(ui.container.textContent, /private upstream details/u);
  await click(button(ui.container, "Retry Team"));
  assert.deepEqual(chosen, ["team", "team"]);
  assert.equal(ui.container.querySelector("dialog[open]"), null);
});

test("PricingTable closing and reopening fences a late failed choice", async (t) => {
  const first = deferred();
  const ui = await mount(t, PricingTable, {
    plans,
    onChoose: () => first.promise,
  });
  await click(button(ui.container, "Choose Basic"));
  await click(button(ui.container, "Confirm Basic"));
  await click(button(ui.container, "Close review"));
  await click(button(ui.container, "Choose Team"));
  await settle(first, "reject", new Error("obsolete choice"));
  const dialog = ui.container.querySelector("dialog[open]");
  assert.ok(dialog);
  assert.match(dialog.textContent, /Review Team/u);
  assert.equal(dialog.querySelector("[role='alert']"), null);
  assert.ok(button(dialog, "Confirm Team"));
});

test("PricingTable committed plan or current-value changes invalidate an older review", async (t) => {
  const first = deferred(),
    chosen = [];
  const ui = await mount(t, PricingTable, {
    plans,
    onChoose: (id) => {
      chosen.push(id);
      return first.promise;
    },
  });
  await click(button(ui.container, "Choose Team"));
  await click(button(ui.container, "Confirm Team"));
  await ui.render({
    plans: plans.map((plan) =>
      plan.id === "team" ? { ...plan, price: "Revised supplied terms" } : plan,
    ),
    value: "team",
  });
  assert.equal(ui.container.querySelector("dialog[open]"), null);
  await settle(first, "reject", new Error("old terms failed"));
  assert.equal(button(ui.container, "Current plan").disabled, true);
  assert.equal(ui.container.querySelector("[role='alert']"), null);
  assert.deepEqual(chosen, ["team"]);
});

test("PricingTable replacing the choice handler fences old work from a newer review", async (t) => {
  const oldWork = deferred(),
    newWork = deferred(),
    oldCalls = [],
    newCalls = [];
  const previous = (id) => {
    oldCalls.push(id);
    return oldWork.promise;
  };
  const replacement = (id) => {
    newCalls.push(id);
    return newWork.promise;
  };
  const ui = await mount(t, PricingTable, { plans, onChoose: previous });
  await click(button(ui.container, "Choose Basic"));
  await click(button(ui.container, "Confirm Basic"));
  await ui.render({ onChoose: replacement });
  assert.equal(ui.container.querySelector("dialog[open]"), null);
  await click(button(ui.container, "Choose Team"));
  await click(button(ui.container, "Confirm Team"));
  await settle(oldWork, "reject", new Error("obsolete handler failed"));
  const dialog = ui.container.querySelector("dialog[open]");
  assert.ok(dialog);
  assert.match(dialog.textContent, /Review Team/u);
  assert.equal(button(dialog, "Choosing…").disabled, true);
  assert.equal(dialog.querySelector("[role='alert']"), null);
  assert.deepEqual(oldCalls, ["basic"]);
  assert.deepEqual(newCalls, ["team"]);
  await settle(newWork, "resolve");
  assert.equal(ui.container.querySelector("dialog[open]"), null);
});

test("PricingTable disabled choices and literal supplied content do not trigger billing", async (t) => {
  const chosen = [];
  const unsafe = "<img src=x onerror=alert(1)>";
  const ui = await mount(t, PricingTable, {
    plans: [{ ...plans[0], name: unsafe, disabled: true }],
    onChoose: (id) => {
      chosen.push(id);
    },
  });
  assert.equal(ui.container.querySelector("img"), null);
  assert.match(ui.container.textContent, /<img src=x onerror=alert\(1\)>/u);
  assert.equal(button(ui.container, `Choose ${unsafe}`).disabled, true);
  await click(button(ui.container, `Choose ${unsafe}`));
  await ui.render({ plans, disabled: true });
  assert.equal(button(ui.container, "Choose Basic").disabled, true);
  await click(button(ui.container, "Choose Basic"));
  assert.equal(ui.container.querySelector("dialog[open]"), null);
  assert.deepEqual(chosen, []);
});
