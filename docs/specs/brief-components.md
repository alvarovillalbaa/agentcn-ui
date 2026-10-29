# Requested input and pricing components

29 October 2026. Owning intent: the complete returned
[agentcn-ui brief](https://app.notion.com/p/3c6a1ee8bd0680739da8f7df94fd906e),
snapshot and last edit 15 October 2026, verification unverified. Its 1,498
returned characters were read in full. The source catalog at
`8517d6043b0b4bd8b4add43de31ad65e49861fc3` contains sixteen components but
none of the four features listed before its general execution brief:

- “'Add' tag vs 'Add' members”.
- “Multi-input field”.
- “Selector with writing into 'Add new'”.
- “Pricing tables with Drawer”.

This implementation makes those features reusable React components in the
existing library, with working local demos, catalog/search/configurator entries,
generated source registries and API documentation. It introduces no backend,
dependency, provider, authentication or billing policy. It does not redefine
the broader library or portfolio goal as this component delivery.

## Public behavior

`MultiInput` captures multiple controlled text values. New entries are trimmed;
empty, duplicate and over-limit additions are refused. Users can remove a
specific value, and Enter adds only outside IME composition. A draft remains
separate from the acknowledged values. The default add action is “Add tag”.

`MemberPicker` selects existing supplied member IDs through native checkboxes.
Search does not discard selected members hidden by its filter. Disabled members
and the configured selection limit are respected. There is no freeform person
creation or implicit invitation. This is deliberately separate from text tags.

`CreatableSelect` exposes both a native existing-option selector and an explicit
new-label field. A creation callback reports intent and may await the consuming
application. Pending work is serialized; failure preserves a retryable draft.
The component never invents an ID or adds/selects an unacknowledged option.
Newer draft/context changes and unmount invalidate old response feedback.

`PricingTable` displays supplied plan prices, descriptions and features. Choosing
a plan opens a review drawer; continuing emits the reviewed plan ID. The current
plan remains controlled by the application. Pending, failure, retry and dismissal
states do not claim a subscription, payment, membership or authorization change.
Closing a review does not cancel an already dispatched consuming-app operation.
Native dialog behavior, keyboard/focus return and narrow layouts need browser
acceptance independently of authored DOM checks.

All four components accept existing scoped styles and section attributes. They
use the current palette, dark mode and density tokens; do not execute HTML or
model output; and keep runtime calls in the consumer. Examples are explicitly
local demonstrations. Package installation instructions for these four must not
claim availability in the already published 0.1.0 archives.

## Delivery and acceptance

Source exports, catalog entries, demos and generated documentation must agree.
The existing generator owns registry/API output; never hand-edit ignored output.
The source-only marker on the four entries keeps npm commands honest until a
separately verified new package release exists. No version or lockfile changes
are necessary for source/website delivery.

Required evidence: source/static checks, exact GitHub publication, existing
Vercel build and served registry/documentation identities. Focused React/DOM and
source-install regression cases remain separate from real browser behavior and
React 18/19 public package-consumer acceptance. The existing release does not
automatically verify these new components. Storage Guard currently blocks local
installation/build work; no cleanup or alternate environment may bypass it.
