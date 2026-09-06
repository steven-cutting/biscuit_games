/**
 * Values the specification declares in its `config` block.
 *
 * These are the only numbers in the implementation that a specification also
 * states, so they live in one place and are named after the spec parameter
 * they mirror. Changing one here without changing it in `docs/specs/` is drift.
 *
 * Nothing exports them from the package. A consumer reads the specification,
 * which the package ships. A game's own figures still belong to a file of its
 * own that mirrors its own specification — a word length, an attempt count, a
 * countdown. The touch target, the narrowest width and the separations between
 * the platform's own play states are no longer among them: they were a game's
 * while the platform stated no figure for a surface being operated or played
 * on, and `operation.allium` and `play-surfaces.allium` state them now.
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

/**
 * `operation.allium` — `config.minimum_touch_target`, in CSS pixels.
 *
 * Across a control, in both directions, for
 * `DirectManipulation.@invariant EveryControlIsAComfortableTarget`. A row of
 * many like controls sharing the full width is the one place this cannot be met
 * in both, which is why that invariant says what happens instead rather than
 * stating a size alone.
 */
export const MINIMUM_TOUCH_TARGET = 44;

/**
 * `operation.allium` — `config.narrowest_supported_width`, in CSS pixels.
 *
 * The narrowest viewport every promise that module makes survives without
 * scrolling sideways, and the width every target and spacing figure has to hold
 * at. `tests/operation.test.ts` pins both figures, because only the stories
 * consume this one and a story frames itself to whatever the constant says.
 */
export const NARROWEST_SUPPORTED_WIDTH = 320;

/**
 * `play-surfaces.allium` — `config.minimum_state_separation`.
 *
 * How far a cell nothing is known about sits from one that has been marked. No
 * standard supplies this figure, because standards ask a colour to stand off
 * its background rather than off another state, and a play surface's states sit
 * side by side.
 */
export const MINIMUM_STATE_SEPARATION = 3.0;

/**
 * `play-surfaces.allium` — `config.minimum_mark_separation`.
 *
 * How far absent sits from exact, and that pair only. Lower than the figure
 * above deliberately: four states three to one apart would need a range of 27
 * to one, which no palette has, and forcing it drives absent — the state most
 * of a played surface is in — to whichever extreme is left. The
 * specification's own reasoning is worth reading before either number is
 * touched.
 */
export const MINIMUM_MARK_SEPARATION = 2.0;
