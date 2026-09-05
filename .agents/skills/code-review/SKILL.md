---
name: code-review
description: Review a change in this repository against its invariants, specifications, tests, and documentation contract.
---

# Review a change

1. Read `AGENTS.md` and the specification module the change touches. Review the whole diff, not the summary of it.
2. Check the invariants in `AGENTS.md` one at a time. Specifications decide shared behaviour, runes only, side effects behind a port, exact version pins outside `peerDependencies`, no assumed server, colour never alone, the coverage floor intact, and one owner per fact.
3. Check the change against the specification it implements. A rule, guard or threshold decided in code rather than in `docs/specs/` is a finding even when the behaviour looks right.
4. Check the test evidence. A test that only asserts a function was called is not evidence; a component test that queries by class or test id rather than by accessible role is not evidence either.
5. Check the boundaries. Nothing outside `src/lib/ports/` may touch a browser global, and no test may stub one. `Modal`'s read of `document.activeElement` is the recorded exception — focus on the component's own document — and decision 0014 says why.
6. Check documentation ownership. A durable fact belongs on the page that owns its topic in `docs/manifest.yml`, added there rather than restated.
7. Check scope. Unrelated refactors, new dependencies and speculative abstractions are findings in themselves.
8. Check the boundary. A fact about one game does not belong in this repository, and a fact every game shares belongs here once — if the change adds either in the wrong place, that is a finding. Where it touches something a game already copies, run the `consumer-impact` skill.
9. Report findings by severity with `file:line`, what breaks, and the smallest fix. Run `just check` before concluding.
