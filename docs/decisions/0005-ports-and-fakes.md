---
title: "Decision 0005: Side effects behind ports"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_ports_and_fakes]
requires: []
---

# Decision 0005: Side effects behind ports

*Ported from Poodl's decision 0002 at `c26cc4642afa6b1349db70a0f497203db3986599`, and restated for the platform. Poodl's own record stands where it is.*

## Context

This repository has no side effect. `src/lib/ports/` does not exist, and nothing here
reads storage, asks for the time, draws a random number or touches the clipboard. That is
the honest state of a skeleton — [Decision 0011](0011-skeleton-not-a-second-application.md)
records why — rather than an omission waiting to be filled in.

The first one is already named, though. `docs/specs/appearance.allium` opens with a
`given` block declaring three preferences the reader expressed to their operating system
and not to Biscuit Games: `prefers_dark_colour_scheme`, `prefers_reduced_motion` and
`prefers_more_contrast`. The platform reads them and never writes them. Whatever
implements the `Appearance` surface has to go and ask the device for all three, and asking
the device is a side effect however small the answer is.

So this record is a standing rule for the port that arrives, not a description of code
that exists. It is written now, while there is nothing to correct, because the alternative
is writing it after the first `matchMedia` call has already been made inline in a
component and every test that touches that component has learned to stub a global.

## Decision

Every side effect sits behind a port in `src/lib/ports/`. Each port is one file exporting
three things: an interface in the application's vocabulary, a real adapter, and an
in-memory fake. Real adapters take their platform object as a defaulted argument rather
than reading a global.

Tests inject fakes. Stubbing a global is banned.

The directory is created by the first port and not before.

## Consequences

The domain and the components stay testable without a browser, and time, randomness and
the device's preferences become ordinary values a test controls.

The defaulted-argument rule is load-bearing rather than stylistic, and the evidence for
that came with the toolchain. Under Node 26 with jsdom there is no `localStorage` — Node's
own experimental global shadows jsdom's and stays undefined — and no `navigator.clipboard`
at all. Code that read either global directly would be untestable here. Because the
adapters take theirs as arguments, both real code paths still run under test. jsdom's
`window` arrives without `matchMedia` in the same way, so the appearance port will meet
the same wall on the day it is written; a defaulted argument is what lets its real adapter
be exercised rather than skipped.

There is a cost, and it is proportionally larger here than it was in Poodl. Poodl spread
the ceremony across several boundaries. A hub site may only ever have one, and an
interface, an adapter and a fake for a single call to `matchMedia` will look like
over-engineering to whoever writes it. It is accepted anyway, because the shape is what
the games inherit and a convention that was skipped once for being small is not a
convention.

No tool checks any of this. The rule is enforced by review, by the `component-change` and
`code-review` skills, and indirectly by the 90% coverage floor over `src/lib/**`, which
turns hard to test into a failing run.

The record has to be read as an instruction rather than an inventory. A contributor
looking for `src/lib/ports/` will not find it, and should not conclude that the rule was
dropped. [Layering and dependency direction](../explanation/layering.md) says the same
thing from the other side.

## What would reopen this

Nothing foreseeable. The alternative — reaching for globals and stubbing them in tests —
was already unavailable in this environment before it was rejected on principle.

The nearest thing to a challenge is the port count staying at one for the life of the
repository, which would make this an argument about ceremony rather than about
correctness. It is not enough. The first port is the one every game reads its appearance
through, and getting its shape right matters more than the ratio of files to behaviour.

## Related pages

- [Layering and dependency direction](../explanation/layering.md)
- [Testing](../reference/testing.md)
- [Specifications](../explanation/specifications.md)
- [Decision 0004: Specifications decide behaviour](0004-specs-are-the-source-of-truth.md)
- [Decision 0011: A skeleton, not a second application](0011-skeleton-not-a-second-application.md)
