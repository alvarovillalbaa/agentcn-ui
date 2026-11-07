// Installed React 18/19 + authored jsdom state; no browser, account or backend.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const spec = JSON.parse(await readFile('consumer-spec.json', 'utf8'));
const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://consumer.invalid', pretendToBeVisual: true });
const globals = { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, HTMLDialogElement: dom.window.HTMLDialogElement, Node: dom.window.Node, IS_REACT_ACT_ENVIRONMENT: true };
const previous = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
// jsdom supplies no native modal/focus implementation; this is an explicit shim.
Object.defineProperties(dom.window.HTMLDialogElement.prototype, {
  showModal: { configurable: true, value() { this.setAttribute('open', ''); } },
  close: { configurable: true, value() { if (this.open) { this.removeAttribute('open'); this.dispatchEvent(new dom.window.Event('close')); } } },
});
const React = await import('react');
const act = React.act ?? (await import('react-dom/test-utils')).act;
const { createRoot } = await import('react-dom/client');
const { MultiInput, MemberPicker, CreatableSelect, PricingTable } = await import('@alvarovillalbaa/agentcn-ui');
const receipt = { schemaVersion: 1, profile: spec.react, dialog: 'authored jsdom open/close shim; no native modality claim', cases: [], mounts: 0, unmounts: 0, passed: false };
const container = dom.window.document.getElementById('root');
let root;
const button = (name) => {
  const found = [...container.querySelectorAll('button')].filter((element) => (element.getAttribute('aria-label') ?? element.textContent).trim() === name);
  assert.equal(found.length, 1, `Unique button ${name}`); return found[0];
};
const control = (name) => {
  const found = [...container.querySelectorAll('input,select')].filter((element) => element.getAttribute('aria-label') === name || [...(element.labels ?? [])].some((label) => label.textContent.trim() === name));
  assert.equal(found.length, 1, `Unique control ${name}`); return found[0];
};
async function type(name, value) {
  const element = control(name);
  const prototype = element.tagName === 'SELECT' ? dom.window.HTMLSelectElement.prototype : dom.window.HTMLInputElement.prototype;
  await act(async () => { Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value); element.dispatchEvent(new dom.window.Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); });
}
async function click(name) { await act(async () => button(name).click()); }
async function mount(Component, props) {
  root = createRoot(container); receipt.mounts++;
  let current = props;
  const renderNow = (next = {}) => { current = { ...current, ...next }; root.render(React.createElement(Component, current)); };
  await act(async () => renderNow());
  return { renderNow, render: (next) => act(async () => renderNow(next)) };
}
async function unmount() { if (root) { await act(async () => root.unmount()); receipt.unmounts++; root = undefined; } }
async function run(id, action) {
  const row = { id, status: 'running' }; receipt.cases.push(row);
  try { row.observation = await action(); row.status = 'passed'; }
  catch (error) { row.status = 'failed'; row.error = String(error?.stack ?? error).slice(0, 8000); throw error; }
  finally { await unmount(); }
}
try {
  assert.equal(React.version, spec.react);
  await run('installed-multi-input', async () => {
    let values = [], calls = 0, ui;
    const onValuesChange = (next) => { calls++; values = next; ui.renderNow({ values }); };
    ui = await mount(MultiInput, { values, onValuesChange, maxItems: 1 });
    await type('New tag', 'Alpha'); await click('Add tag');
    assert.deepEqual(values, ['Alpha']); assert.equal(control('New tag').value, ''); assert.equal(button('Add tag').disabled, true);
    await click('Remove Alpha'); assert.deepEqual(values, []); assert.equal(calls, 2);
    await type('New tag', ''); await click('Add tag'); assert.equal(calls, 2); assert.match(container.querySelector('[role=alert]').textContent, /Enter a tag/);
    await ui.render({ disabled: true }); assert.equal(control('New tag').closest('fieldset').disabled, true);
    return { acknowledgedAddsAndRemovals: 2, emptyRejected: true, limitAndDisabledObserved: true };
  });
  await run('installed-member-picker', async () => {
    let value = [], calls = 0, ui;
    const onValueChange = (next) => { calls++; value = next; ui.renderNow({ value }); };
    ui = await mount(MemberPicker, { members: [{ id: 'a', name: 'Mira' }, { id: 'b', name: 'Sol' }, { id: 'c', name: 'Disabled member', disabled: true }], value, onValueChange, maxMembers: 1 });
    await act(async () => control('Mira').click()); assert.deepEqual(value, ['a']); assert.equal(control('Sol').disabled, true); assert.equal(control('Disabled member').disabled, true);
    await type('Search members', 'Sol'); assert.equal(container.querySelectorAll('input[type=checkbox]').length, 1); assert.deepEqual(value, ['a']);
    await type('Search members', ''); await act(async () => control('Mira').click()); await act(async () => control('Sol').click());
    assert.deepEqual(value, ['b']); assert.equal(calls, 3);
    return { controlledMemberIDs: value, hiddenSelectionPreserved: true, disabledAndLimitObserved: true };
  });
  await run('installed-creatable-select', async () => {
    let options = [{ id: 'old', label: 'Existing' }], value = 'old', calls = 0, resolve, reject, ui;
    const onValueChange = (next) => { value = next; ui.renderNow({ value }); };
    const onCreate = () => { calls++; return new Promise((pass, fail) => { resolve = pass; reject = fail; }); };
    ui = await mount(CreatableSelect, { options, value, onValueChange, onCreate });
    await type('New option', 'Created label'); await click('Add new');
    assert.equal(calls, 1); assert.equal(button('Adding…').disabled, true); assert.match(container.querySelector('[role=status]').textContent, /Creating/); assert.equal(control('Option').value, 'old');
    await act(async () => reject(new Error('Authored consumer refusal'))); assert.equal(control('New option').value, 'Created label'); assert.match(container.querySelector('[role=alert]').textContent, /could not be created/);
    await click('Add new'); assert.equal(calls, 2);
    await act(async () => { options = [...options, { id: 'created', label: 'Created label' }]; value = 'created'; ui.renderNow({ options, value }); resolve(); });
    assert.equal(control('Option').value, 'created'); assert.equal(control('Option').selectedOptions[0].textContent, 'Created label');
    return { creationCallbacks: calls, rejectionKeptDraft: true, onlyConsumerSuppliedIDSelected: value };
  });
  await run('installed-pricing-table', async () => {
    let calls = 0, resolve, reject;
    const onChoose = (id) => { assert.equal(id, 'pro'); calls++; return new Promise((pass, fail) => { resolve = pass; reject = fail; }); };
    await mount(PricingTable, { plans: [{ id: 'free', name: 'Free', price: '$0', features: ['Local'] }, { id: 'pro', name: 'Pro', price: '$9', features: ['Team'] }], value: 'free', onChoose });
    await click('Choose Pro'); assert.equal(calls, 0); assert.equal(container.querySelector('dialog').open, true); assert.match(container.querySelector('dialog').textContent, /Review Pro/);
    await click('Confirm Pro'); assert.equal(calls, 1); assert.equal(button('Choosing…').disabled, true);
    await act(async () => reject(new Error('Authored selection refusal'))); assert.match(container.querySelector('[role=alert]').textContent, /Could not confirm/);
    await click('Retry Pro'); assert.equal(calls, 2); await act(async () => resolve()); assert.equal(container.querySelector('dialog'), null);
    assert.equal(container.querySelector('[data-current=true] h4').textContent, 'Free');
    return { reviewedID: 'pro', callbacks: calls, failureAndRetryObserved: true, currentPlanRemainedConsumerControlled: 'free' };
  });
  receipt.passed = receipt.cases.length === 4 && receipt.cases.every((row) => row.status === 'passed');
} catch (error) { receipt.error = String(error?.message ?? error).slice(0, 2000); }
finally {
  try { await unmount(); } finally { dom.window.close(); for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } }
  receipt.passed &&= receipt.mounts === 4 && receipt.unmounts === 4;
  console.log(`AGENTCN_CONSUMER_RESULT=${JSON.stringify(receipt)}`);
  process.exitCode = receipt.passed ? 0 : 1;
}
