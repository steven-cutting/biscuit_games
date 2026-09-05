/**
 * Figures the stories measure against and no specification here states.
 *
 * `src/lib/config.ts` mirrors `appearance.allium`'s `config` block and nothing
 * else, because a number the code carries and no specification names is drift
 * waiting to happen. These two are the other kind: rules every game's surface
 * is held to, which Poodl's `game.allium` states as `minimum_touch_target` and
 * `narrowest_supported_width` and the platform has not yet lifted into a
 * specification of its own. `docs/explanation/accessibility.md` names that
 * gap. Until it closes they live here, as fixtures for the plays that measure
 * a rendered control, and nothing under `src/lib/` reads them.
 */

/** The comfortable touch target, in CSS pixels, across a control both ways. */
export const MINIMUM_TOUCH_TARGET = 44;

/** The narrowest viewport a surface has to lay out on without sideways scroll. */
export const NARROWEST_SUPPORTED_WIDTH = 320;
