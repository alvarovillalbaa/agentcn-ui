// Installed-archive checks only. This file is copied into each clean consumer.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as library from '@alvarovillalbaa/agentcn-ui';

const spec = JSON.parse(await readFile('consumer-spec.json', 'utf8'));
const receipt = { schemaVersion: 1, profile: spec.react, cases: [], passed: false };
const hash = (value) => createHash('sha256').update(value).digest('hex');
try {
  assert.equal(React.version, spec.react);
  const packageRoot = path.resolve('node_modules/@alvarovillalbaa/agentcn-ui');
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.version, spec.version);
  assert.deepEqual(Object.keys(library).sort(), spec.catalog.map((entry) => entry.component).sort());
  receipt.exports = [];
  for (const entry of spec.catalog) {
    assert.equal(typeof library[entry.component], 'function');
    const subpath = await import(`@alvarovillalbaa/agentcn-ui/${entry.name}`);
    assert.equal(subpath[entry.component], library[entry.component]);
    const declaration = await readFile(path.join(packageRoot, 'dist', `${entry.name}.d.ts`));
    assert.match(declaration.toString(), new RegExp(`\\bfunction ${entry.component}\\(`));
    const index = await readFile(path.join(packageRoot, 'dist/index.d.ts'), 'utf8');
    assert.match(index, new RegExp(`export \\{ ${entry.component} \\} from ["']\\./${entry.name}\\.js["']`));
    receipt.exports.push({ name: entry.name, component: entry.component, declarationBytes: declaration.length, declarationSha256: hash(declaration) });
  }
  const css = await readFile(new URL(import.meta.resolve('@alvarovillalbaa/agentcn-ui/styles.css')));
  for (const selector of ['.ac-surface', '.ac-token-list', '.ac-member-list', '.ac-creatable-fields', '.ac-pricing-grid']) assert.ok(css.includes(Buffer.from(selector)));
  receipt.css = { bytes: css.length, sha256: hash(css) };
  receipt.cases.push({ id: 'exports-types-css', status: 'passed', rootFunctions: 20, subpathFunctions: 20, declarationFiles: 20 });

  let callbacks = 0;
  const callback = () => { callbacks++; };
  const fixtures = [
    ['MultiInput', { values: ['Authored tag'], onValuesChange: callback }, ['Authored tag', 'Remove Authored tag', 'New tag']],
    ['MemberPicker', { members: [{ id: 'm1', name: 'Mira' }, { id: 'm2', name: 'Sol', disabled: true }], value: ['m1'], onValueChange: callback }, ['Mira', 'Sol', 'checked=""', 'disabled=""']],
    ['CreatableSelect', { options: [{ id: 'o1', label: 'Existing choice' }], value: 'o1', onValueChange: callback, onCreate: callback }, ['Existing choice', 'New option', 'Add new']],
    ['PricingTable', { plans: [{ id: 'free', name: 'Free', price: '$0', features: ['Local use'] }, { id: 'pro', name: 'Pro', price: '$9', features: ['Team use'] }], value: 'free', onChoose: callback }, ['Current plan', 'Choose Pro', '$9']],
  ];
  receipt.ssr = [];
  for (const [name, props, expected] of fixtures) {
    const html = renderToStaticMarkup(React.createElement(library[name], props));
    for (const text of expected) assert.ok(html.includes(text), `${name} SSR must contain ${text}`);
    assert.ok(!html.includes('<script') && !html.includes('<iframe'));
    receipt.ssr.push({ component: name, bytes: Buffer.byteLength(html), sha256: hash(html) });
  }
  assert.equal(callbacks, 0);
  receipt.cases.push({ id: 'new-four-ssr', status: 'passed', components: fixtures.map(([name]) => name), callbacks: 0 });
  receipt.passed = true;
} catch (error) { receipt.error = String(error?.stack ?? error).slice(0, 8000); }
console.log(`AGENTCN_CONSUMER_RESULT=${JSON.stringify(receipt)}`);
process.exitCode = receipt.passed ? 0 : 1;
