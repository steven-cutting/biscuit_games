---
name: token-change
description: Change a design token in the shared stylesheet and prove every palette still clears its floor.
---

# Change a design token

1. Read `AGENTS.md` and `docs/design/tokens.md`. A token is the platform's vocabulary: changing one changes every game that copied it, and this repository is where that change is decided.
2. Read `docs/specs/appearance.allium`. `EveryCombinationMeetsTheLegibilityFloor` is the acceptance criterion, and it holds in all four combinations of theme and high contrast — not in the one you happened to look at.
3. Change the value in `src/app.css`, in the semantic layer where possible. A raw palette entry is a wider change than a semantic alias and needs a stated reason.
4. Redeclare it in every palette block that declares its neighbours. The four blocks stay correct by declaring identical token sets; a token added to one and not the others leaks the wrong palette into a reader who asked for high contrast on a dark device.
5. Know what is not checked. `tests/contrast.test.ts` has not been ported, so no gate in this repository recomputes a ratio. Until it lands, compute the figure by hand and record it beside the token, and treat `src/app.css` as frozen for anything larger than this.
6. Check the specimen story renders the change, and request `/chromatic` on the pull request: a token change is a visual change, and that review is the design review.
7. Run the `consumer-impact` skill. A renamed token leaves a game's stylesheet resolving to nothing, and no gate here can say so.
8. Run `just frontend-unit` and `just storybook-test`, then `just check` before handoff.
