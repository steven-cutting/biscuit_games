/**
 * Values the specification declares in its `config` block.
 *
 * These are the only numbers in the implementation that a specification also
 * states, so they live in one place and are named after the spec parameter
 * they mirror. Changing one here without changing it in `docs/specs/` is drift.
 *
 * Nothing exports them from the package. A consumer reads the specification,
 * which the package ships, and a game's own figures — its touch target, its
 * narrowest width, the separations between its own states — belong to a file
 * of its own that mirrors its own specification.
 */

/**
 * `appearance.allium` — `config.minimum_text_contrast` and
 * `config.minimum_boundary_contrast`, as WCAG 2.2 computes a ratio.
 *
 * The two AA bars: text against what is behind it, and anything that is not
 * text — a control's boundary, a state indicator — against what is adjacent to
 * it. `EveryCombinationMeetsTheLegibilityFloor` names both, and
 * `tests/contrast.test.ts` measures every pair the stylesheet declares against
 * them in all four combinations of theme and high contrast.
 */
export const MINIMUM_TEXT_CONTRAST = 4.5;
export const MINIMUM_BOUNDARY_CONTRAST = 3.0;
