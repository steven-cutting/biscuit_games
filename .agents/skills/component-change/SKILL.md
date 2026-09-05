---
name: component-change
description: Add or change a shared Biscuit Games component with its test, story, and accessibility evidence.
---

# Change a shared component

1. Read `AGENTS.md` and `docs/how-to/port-a-design-system-component.md`. Every component here is a shared component: a platform-shaped component is built here first, whether or not a second consumer exists yet, and a game-shaped one stays in its game — `docs/project/what-the-hub-owns.md` is the test, and decision 0014 the rule.
2. Read `docs/specs/appearance.allium` for the obligations any rendered surface carries, and `docs/design/tokens.md` for the vocabulary. Inspect the existing components and tests before editing.
3. Use Svelte 5 runes: `$props` for inputs, `$state` for local state, `$derived` for computed values. Pass callbacks as props rather than dispatching events, and take no `...rest` spread.
4. Map tokens, never hex. Every colour, size, and duration names something `src/app.css` already decides, except a figure that coincides with a token by value rather than by meaning — a control height is not a spacing step — which stays a literal with a comment saying so. A live control's boundary owes `minimum_boundary_contrast` against the page; a decorative rule does not pay it.
5. Preserve semantic HTML, labels bound to controls, keyboard operation, visible focus, and a non-colour indication for every state the component expresses.
6. Add Testing Library evidence in `tests/`, asserting through accessible roles and names. Nothing lands under `src/lib/` without a test: an untested file inside the coverage glob is reported at zero and sinks the floor.
7. Add a story in `stories/` covering each state, and pin dark and high contrast where the look inverts. A story is a fixture, not an assertion; where a guarantee is about interaction, prove it with a play function.
8. Run the `consumer-impact` skill. Poodl carries a copy of every platform component until it consumes the package, so a contract change here is a handover item in `docs/operations/poodl-handover.md`, and any port is a Minor version with a `CHANGELOG.md` entry.
9. Run `just frontend-static`, `just frontend-unit` and `just storybook-test`, then `just check` before handoff.
