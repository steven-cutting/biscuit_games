---
title: "Layering and dependency direction"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [dependency_boundaries]
requires: []
---

# Layering and dependency direction

Four layers, and imports only ever run downwards.

| Layer | May import | Must not |
| --- | --- | --- |
| `src/routes/` | components, domain and ports | be imported by anything below it |
| `src/lib/components/` | other components and domain types | import a port adapter, or reach for a browser global |
| `src/lib/domain/` | domain and its own types | import a component, a route, a port, or anything with a side effect |
| `src/lib/ports/` | types and configuration | import a component or a route |

`src/routes/` is three files: `+layout.svelte`, which imports the stylesheet and renders
its children; `+layout.ts`, which prerenders the tree; and `+page.svelte`, the front door.
`src/lib/components/` is the platform primitives — `Wordmark`, `Icon`, `IconButton`,
`Button`, `HeaderBar`, `Modal`, `Notice` and `Announcer` — which take callbacks as props,
hold no application state and touch no browser global; `Modal` reads
`document.activeElement`, and
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md) says why focus on the
component's own document is not a global in the sense this table means. `src/lib/domain/`
is `appearance.ts`, the three derivations the `Appearance` surface states, and `types.ts`,
the `ThemeChoice` enumeration. `src/lib/ports/` is `preferences.ts`, the first port. Nothing
above the components calls the domain or the port yet: the hub's front door writes its
appearance flat, and a game is the consumer of both.

`src/app.css` is not a layer. It is the token vocabulary, imported once at the root layout
so that every route sits in the same palette, and nothing below the layout imports it; a
component names a token rather than shipping its own copy of the value.
[Design tokens](../design/tokens.md) is the page that owns those names. `src/lib/assets/`
is the committed fonts and the icon set, each with its licence text — data with a
directory, not code with a position; `icons.ts` in the components layer is what reaches the
icons, and nothing else does.

`src/lib/config.ts` mirrors the two floors `appearance.allium` declares and is read by the
contrast test; `src/lib/domain/types.ts` names `ThemeChoice`. Both sit below everything and
import nothing.

## `src/lib/app/` is deliberately absent

Poodl's middle layer is `src/lib/app/`: the rules as one pure reducer over one state
value, plus the single rune-bearing shell that wires the ports to it. That shape belongs
to Poodl, not to the platform, and its reasoning stays in Poodl's handbook rather than
being restated here.

The hub has no rules to reduce. One prerendered page and no state that outlives a render
leaves a reducer with nothing to be pure about, so there is no `src/lib/app/` and no store.
A change that introduces one is not adding a layer; it is turning this repository into a
second application, which
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md) did not do and
[decision 0011](../decisions/0011-skeleton-not-a-second-application.md)'s reasoning still
warns against.

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

**The lower layers arrived as additions.** Nothing above them had assumed their absence,
so `src/lib/domain/` and `src/lib/ports/` landed without a rearrangement. That was the
return on writing two rows of a table for directories that did not yet exist.

## Where a side effect goes

One port. `src/lib/ports/preferences.ts` reads the device's colour-scheme, reduced-motion
and more-contrast preferences through `matchMedia`, and watches them, which is what
`SystemFollowsTheDeviceAsItChanges` asks. It is three things in one file:

1. An interface naming what the application needs, in the application's vocabulary.
2. A real adapter, with the platform object as a defaulted argument rather than a global
   read.
3. An in-memory fake with the same interface.

The adapter takes its host — the object `matchMedia` hangs off — as the defaulted argument,
so a test passes a fake, an empty object or nothing, and every arm is reached with no global
stubbed. jsdom supplies a `window` without `matchMedia`, and the adapter answers for the
absence itself: a device the platform cannot ask is a device that asked for nothing. Nothing
in this repository reads storage, asks for the time, draws a random number or touches the
clipboard, so there is no second port.

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
