import type { IconName } from './icons.js';
import { latinLetters } from '../domain/typing.js';
import type { KeyBindings } from '../domain/typing.js';

/**
 * One key of a laid-out keyboard.
 *
 * A layout is a constant a game declares once; what a turn has made of each key
 * is separate, and reaches `Keyboard` as `marks`. Folding the two together would
 * make a game rebuild its whole layout to colour one key, and would let a shared
 * constant carry state it can never have.
 */
export interface KeyDefinition {
  /** What `onpress` is given when this key is pressed. Unique within the layout. */
  value: string;
  /** What the key shows. Defaults to `value`. */
  content?: string;
  /**
   * The accessible name, before any mark's words. Defaults to `content`, then to
   * `value`, so a key is never nameless — but a key drawn as a glyph has nothing
   * worth falling back to and should say its own word here.
   */
  label?: string;
  /** Drawn instead of `content`, for a key whose meaning is a glyph. */
  icon?: IconName;
  /**
   * Whether this key ends a turn rather than building one. Decides how much of
   * its row it takes, under `operation.allium`'s
   * `EveryControlIsAComfortableTarget`, and it is a fact about the surface
   * rather than a game's vocabulary — a rack's "play word" and a crossword's
   * "check" are both actions.
   */
  kind?: 'content' | 'action';
}

export type KeyboardRow = readonly KeyDefinition[];
export type KeyboardLayout = readonly KeyboardRow[];

/*
 * Written out rather than spread from a string. Splitting a string into
 * characters is right for these twenty-six and wrong in general — it decomposes
 * what a reader thinks of as one character in several languages — and a constant
 * this file writes itself is the one place the distinction can be settled by not
 * needing it.
 */
const TOP = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'] as const;
const HOME = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'] as const;
const BOTTOM = ['z', 'x', 'c', 'v', 'b', 'n', 'm'] as const;

function letters(row: readonly string[]): KeyboardRow {
  return row.map((letter) => ({ value: letter, content: letter.toUpperCase() }));
}

/**
 * The Latin QWERTY letters with a key opening the last row and one closing it.
 *
 * `Keyboard`'s default, so a caller that supplies no layout still gets a
 * keyboard — and data rather than a constant inside the component, so a game
 * that wants a different arrangement starts from this one rather than working
 * around it. A specification does not choose a layout, and neither does a
 * component: `ALayoutIsSuppliedRatherThanFixed` says the arrangement belongs to
 * whoever mounts it.
 */
export const QWERTY: KeyboardLayout = [
  letters(TOP),
  letters(HOME),
  [
    { value: 'submit', label: 'Enter', icon: 'corner-down-left', kind: 'action' },
    ...letters(BOTTOM),
    { value: 'delete', label: 'Delete', icon: 'delete', kind: 'action' }
  ]
];

/**
 * What the physical keys mean to a surface drawing `QWERTY`.
 *
 * Beside the layout rather than inside `PhysicalKeyboard`, so the on-screen keys
 * and the typed ones agree by naming the same values — `submit`, `delete` and
 * the letters — rather than because either component knows about the other.
 * `TypedKeysAnswerTheSameOperationsAsTheKeysOnScreen` is the clause, and
 * `tests/package-surface.test.ts` holds the two lists equal.
 */
export const QWERTY_BINDINGS: KeyBindings = {
  actions: { Enter: 'submit', Backspace: 'delete' },
  content: latinLetters
};
