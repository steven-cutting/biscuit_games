/** Domain vocabulary the platform shares with every game. */

/** `appearance.allium` — the `ThemeChoice` enumeration. */
export type ThemeChoice = 'system' | 'light' | 'dark';

/**
 * `play-surfaces.allium` — the `PlayMark` enumeration, less `unmarked`.
 *
 * Named after the tokens that paint them — `--result-exact`, `--result-present`,
 * `--result-absent` — and not after any game's word for them. The stylesheet
 * chose these names before any component did, and it deliberately did not say
 * `correct`: that is one game's word for one game's rule. `present` says only
 * that what the cell carries counts for something and not for this; `absent`
 * says only that it counts for nothing.
 *
 * `unmarked` has no member here. A cell nothing is known about is one with no
 * mark at all, which a component says by not being given one — a fourth member
 * would be a branch every caller had to remember to pass.
 */
export type MarkName = 'exact' | 'present' | 'absent';

/**
 * A mark and the words the game says for it, which cannot be separated.
 *
 * `Marking.@invariant EveryMarkIsNamedInWords` asks for both, and two optional
 * props could not hold it: nothing in the type system or in a test would catch a
 * caller that painted a state and supplied no sentence for it, so the cell would
 * render, axe would pass, the bar would draw, and a reader would hear a glyph
 * with no state. Bundling them makes that unrepresentable rather than merely
 * discouraged.
 */
export interface Mark {
  name: MarkName;
  /** What this mark means, in the game's own words: "correct", "off the board". */
  description: string;
}
