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
 * props could not hold it: nothing would catch a caller that painted a state and
 * supplied no sentence for it, so the cell would render, axe would pass, the bar
 * would draw, and a reader would hear a glyph with no state. Bundling them makes
 * the pair what a caller passes.
 *
 * It does not make a wordless mark unrepresentable, and this comment used to say
 * that it did. `string` admits the empty one, `''` and `'   '` type-check, and no
 * type TypeScript has refuses them without a brand every caller would have to
 * construct through. So the invariant's own closing clause is what holds it:
 * `drawnMark` below decides, and a mark with no words is not drawn.
 */
export interface Mark {
  name: MarkName;
  /** What this mark means, in the game's own words: "correct", "off the board". */
  description: string;
}

/**
 * The mark a component will draw, or `null` for one it declines.
 *
 * `Marking.@invariant EveryMarkIsNamedInWords` closes with "a mark the game
 * supplied no words for is not a mark the platform will draw", and this is where
 * the platform declines. A blank sentence would otherwise paint the cell, draw
 * the bar and say nothing about either — a state carried by colour and shape
 * alone, which is the exact failure that invariant names. Trimmed, because
 * "supplied no words for" is what a run of spaces is.
 *
 * One function rather than the same conditional in each cell, for the reason
 * `Marker` is one component: two copies of a rule is how two copies of a figure
 * drifted apart. It is deliberately not exported from the package — what the
 * platform will draw is the platform's, the way the icon map and the marker bar
 * are.
 */
export function drawnMark(mark: Mark | null): Mark | null {
  return mark !== null && mark.description.trim() !== '' ? mark : null;
}
