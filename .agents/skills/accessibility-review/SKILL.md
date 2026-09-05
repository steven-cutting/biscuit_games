---
name: accessibility-review
description: Review a component, token, or specification change against the platform's stated accessibility guarantees.
---

# Review a change for accessibility

The `@guarantee` clauses in `docs/specs/appearance.allium` are the acceptance criteria, not aspirations, and every game inherits them. Each one names an obligation a change can break silently.

1. Read `AGENTS.md` and `docs/explanation/accessibility.md`, then read the guarantees on the `Appearance` surface.
2. Check the legibility floor in all four combinations of theme and high contrast, not the one the change was looked at in. Text on an operable control reaches `minimum_text_contrast` against what is behind it; a control that draws a boundary reaches `minimum_boundary_contrast` against the page; a control that draws none is identified by its own words.
3. Know what the gate measures. `tests/contrast.test.ts` recomputes every pair the stylesheet declares in all four combinations, so a pair a change introduces is a finding until it is in that test; a game's own state separations are measured in the game, and a figure quoted without a test behind it is a claim.
4. Check the colour obligation. Every state a component expresses carries a shape, a word, or both alongside the colour, and has an accessible name.
5. Check the unavailable case. A control the reader cannot operate is exempt from the figures and from nothing else: it still reports its state to the accessibility tree and keeps every non-colour indication its live form carried.
6. Check keyboard operation. Every control is reachable and invocable from the keyboard alone, with visible focus, and is a comfortable target at the narrowest supported width.
7. Check motion. Animation runs only when the setting allows it and the operating system expresses no reduced-motion preference; the operating system wins.
8. Remember what axe cannot see. The story run puts axe over each render at error level, but it does not read a ratio it cannot compute or a name it cannot reach; a silent gate is not a pass.
9. Report findings by severity with `file:line` references, then run `just frontend-static`, `just storybook-test` and `just check`.
