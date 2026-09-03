---
name: component-change
description: Add or change a shared Biscuit Games component with its test, story, and accessibility evidence.
---

# Change a shared component

1. Read `AGENTS.md` and `docs/how-to/port-a-design-system-component.md`. Every component here is a shared component: the hub has one route, so a component exists because more than one consumer wants the same shape, not because a page needed it.
2. Read `docs/specs/appearance.allium` for the obligations any rendered surface carries, and `docs/design/tokens.md` for the vocabulary. Inspect the existing components and tests before editing.
3. Use Svelte 5 runes: `$props` for inputs, `$state` for local state, `$derived` for computed values. Pass callbacks as props rather than dispatching events, and take no `...rest` spread.
4. Map tokens, never hex. Every colour, size, and duration names something `src/app.css` already decides. A live control's boundary owes `minimum_boundary_contrast` against the page; a decorative rule does not pay it.
5. Preserve semantic HTML, labels bound to controls, keyboard operation, visible focus, and a non-colour indication for every state the component expresses.
6. Add Testing Library evidence in `tests/`, asserting through accessible roles and names. Nothing lands under `src/lib/` without a test: an untested file inside the coverage glob is reported at zero and sinks the floor.
7. Add a story in `stories/` covering each state, and pin dark and high contrast where the look inverts. A story is a fixture, not an assertion; where a guarantee is about interaction, prove it with a play function.
8. Run the `consumer-impact` skill if the component or a token it uses already has a copy in a game repository.
9. Run `just frontend-static`, `just frontend-unit` and `just storybook-test`, then `just check` before handoff.
