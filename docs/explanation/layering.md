---
title: "Layering and dependency direction"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [dependency_boundaries]
requires: []
---

# Layering and dependency direction

Four layers — two live, two reserved — and imports only ever run downwards.

| Layer | State | May import | Must not |
| --- | --- | --- | --- |
| `src/routes/` | Live | components, and domain and ports once either exists | be imported by anything below it |
| `src/lib/components/` | Live | other components, and domain types once they exist | import a port adapter, or reach for a browser global |
| `src/lib/domain/` | Reserved | domain and its own types | import a component, a route, a port, or anything with a side effect |
| `src/lib/ports/` | Reserved | types and configuration | import a component or a route |

The live half fits in a paragraph. `src/routes/` is three files: `+layout.svelte`, which
imports the stylesheet and renders its children; `+layout.ts`, which prerenders the tree;
and `+page.svelte`, the front door. `src/lib/components/` is one component,
`Wordmark.svelte`, which takes no props, holds no state and touches no global. The two
reserved rows describe nothing that exists — they are the rule the first occupant will be
held to, which is the whole point of writing them down before there is anything to enforce
them against. See [Decision 0011](../decisions/0011-skeleton-not-a-second-application.md).

`src/app.css` is not a layer. It is the token vocabulary, imported once at the root layout
so that every route sits in the same palette, and nothing below the layout imports it; a
component names a token rather than shipping its own copy of the value.
[Design tokens](../design/tokens.md) is the page that owns those names. `src/lib/assets/`
is the committed fonts and their licence texts — data with a directory, not code with a
position.

There is no `src/lib/config.ts` and no `src/lib/domain/types.ts` here. Poodl has both
because it has values a specification declares and a state shape to name. If such a file
arrives, it sits below everything and imports nothing.

## `src/lib/app/` is deliberately absent

Poodl's middle layer is `src/lib/app/`: the rules as one pure reducer over one state
value, plus the single rune-bearing shell that wires the ports to it. That shape belongs
to Poodl, not to the platform, and its reasoning stays in Poodl's handbook rather than
being restated here.

The hub has no rules to reduce. One prerendered page, one component, and no state that
outlives a render leaves a reducer with nothing to be pure about, so there is no
`src/lib/app/` and no store. A change that introduces one is not adding a layer; it is
turning this repository into a second application, which is exactly what
[Decision 0011](../decisions/0011-skeleton-not-a-second-application.md) refuses.

## Why the direction matters

The rule is not tidiness. It is what makes the claims below true, and each of them is
load-bearing:

**A component is testable without the platform.** A component that read `localStorage`
directly could only be tested where `localStorage` exists. Under Node 26 and jsdom it does
not — Node's own experimental global shadows jsdom's and stays undefined — and there is no
`navigator.clipboard` at all. Because an adapter takes its platform object as a defaulted
argument, that costs nothing: the test passes an object in, and the real code path still
runs. A component that reaches for the global instead is untestable in this environment
before it is ever untidy.

**Ported material arrives at a known depth.** The design system is what this repository
exists to own, so components arrive here from Poodl rather than being invented. The layer
a component lands in decides what may travel with it: anything that reads a global, knows
a rule, or remembers a fact between renders is not component code and stays behind. The
procedure is
[Port a design system component](../how-to/port-a-design-system-component.md).

**The reserved layers stay cheap.** Because nothing above them assumes their absence,
adding `src/lib/domain/` or `src/lib/ports/` later is an addition rather than a
rearrangement. That is the return on writing two rows of a table for directories that do
not exist.

## Where a side effect goes

There are no ports here. `src/lib/ports/` does not exist, because nothing in this
repository reads storage, asks for the time, draws a random number or touches the
clipboard. That is the honest state of a skeleton, not an omission.

The rule still stands for the first side effect that arrives. A port is three things in
one file:

1. An interface naming what the application needs, in the application's vocabulary.
2. A real adapter, with the platform object as a defaulted argument rather than a global
   read.
3. An in-memory fake with the same interface.

The likeliest first one is the device's preferences. `docs/specs/appearance.allium` names
the reduced-motion, dark-scheme and more-contrast signals the platform reports, and jsdom
supplies a `window` without `matchMedia`, so whatever implements that surface will have to
answer for the absence itself rather than be stubbed around.

The rule that follows: **tests inject fakes, they never stub globals.** A stubbed global
leaks between tests and hides the fact that the code reached outside its layer. The
reasoning is in [Decision 0005](../decisions/0005-ports-and-fakes.md).

## Enforcement

There is no import-boundary checker here — the template this repository draws from uses
one for its Python layers, and a two-directory frontend does not earn the machinery. The
direction is enforced by review, by the `component-change` and `code-review` skills, and
by the shape of the tests: code in the wrong layer is usually code that is hard to test,
and the 90% coverage floor over `src/lib/**` turns hard to test into a failing run.

## Related pages

- [Architecture](architecture.md)
- [Testing](../reference/testing.md)
- [Port a design system component](../how-to/port-a-design-system-component.md)
- [Decision 0005](../decisions/0005-ports-and-fakes.md)
- [Decision 0011](../decisions/0011-skeleton-not-a-second-application.md)
