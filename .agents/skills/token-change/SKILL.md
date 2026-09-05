---
name: token-change
description: Change a design token in the shared stylesheet and prove every palette still clears its floor.
---

# Change a design token

1. Read `AGENTS.md` and `docs/design/tokens.md`. A token is the platform's vocabulary: changing one changes every game that copied it, and this repository is where that change is decided.
2. Read `docs/specs/appearance.allium`. `EveryCombinationMeetsTheLegibilityFloor` is the acceptance criterion, and it holds in all four combinations of theme and high contrast — not in the one you happened to look at.
3. Change the value in `src/app.css`, in the semantic layer where possible. A raw palette entry is a wider change than a semantic alias and needs a stated reason.
4. Redeclare it in every palette block that declares its neighbours. The five override blocks stay correct by declaring identical token sets — twenty-four names each — and a token added to some and not the rest leaks the wrong palette into a reader who asked for high contrast on a dark device. `tests/contrast.test.ts` holds the two dark blocks equal and the two high-contrast sets equal; `docs/design/tokens.md` explains why parity has to be total.
5. Run `just frontend-coverage`. `tests/contrast.test.ts` measures the new value against `appearance.allium`'s floors in all four combinations; a pair it does not yet hold is added to it in the same change, and the figure in the comment beside the token is updated as provenance rather than evidence.
6. Look at the change in the workshop, driving theme, high contrast, animations and simulated reduced motion from the toolbar — `stories/Foundations.stories.svelte` is the token sheet, pinned dark and dark high-contrast, and the component stories are where a token is seen in use. Then request `/chromatic` on the pull request: a token change is a visual change, and that review is the design review.
7. Run the `consumer-impact` skill. A renamed token leaves a game's stylesheet resolving to nothing, and no gate here can say so.
8. Run `just frontend-unit` and `just storybook-test`, then `just check` before handoff.
