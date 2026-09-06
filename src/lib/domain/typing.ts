/**
 * What a bare key press means to a surface that has claimed one.
 *
 * Every guard lives here, as a function over a value type, because a guard is a
 * rule rather than a side effect — `docs/specs/operation.allium`'s `TypedInput`
 * states them and nothing about a listener. The DOM questions, which is the
 * reader typing somewhere and does the focused control activate on this key, are
 * read off a real event by `src/lib/ports/keys.ts` and arrive here as booleans.
 */

/** One key press, with the DOM already read off it. */
export interface KeyPress {
  /** The key's own name, as the platform reports it. */
  key: string;
  /**
   * A shortcut modifier was held — Control, Meta or Alt, and not Shift. The
   * browser's own shortcuts stay the browser's, and a shifted letter is still
   * the reader typing a letter. `AModifiedKeyIsNeverClaimed` names the three.
   */
  modified: boolean;
  /** It began somewhere the reader is typing. */
  inTextEntry: boolean;
  /** It began on something the browser activates with this key. */
  inActivatable: boolean;
}

/** What a surface claims, and what it calls each claim. */
export interface KeyBindings {
  /** Keys carrying a named action, by the key's own name. */
  actions: Readonly<Record<string, string>>;
  /**
   * What value a key carries as content, or `null` for one this surface does not
   * claim. The one open-ended channel, and the one place a surface says what its
   * alphabet is.
   */
  content: (key: string) => string | null;
}

/**
 * The keys a browser activates a focused control with.
 *
 * A browser fact rather than a surface's choice, which is why they are named
 * here rather than passed in. Both of them, and Space was once left out on the
 * argument that nothing here claims it — which is true of `QWERTY_BINDINGS` and
 * is not a guarantee, because `claimKey` and `KeyBindings` are public and a game
 * supplies its own. A crossword binding Space to change direction would have
 * taken it from every focused button and summary on the page, and a browser
 * activates on the keyup only when the keydown was not cancelled, so the control
 * would have gone quiet rather than fired late.
 */
const ACTIVATES = new Set([' ', 'Enter']);

/**
 * The 26 Latin letters, lowercased. A default, and only a default.
 *
 * Both cases are written out rather than folded with the `i` flag. Under Unicode
 * case folding `/[a-z]/iu` also matches U+017F, the long s, and U+212A, the
 * Kelvin sign — so the default alphabet claimed two keys it does not name, and
 * handed the long s straight back unchanged because it lowercases to itself. The
 * `u` flag stays; the folding is what was wrong.
 */
export function latinLetters(key: string): string | null {
  return /^[a-zA-Z]$/u.test(key) ? key.toLowerCase() : null;
}

/**
 * The value this press carries, or `null` for a press the surface leaves alone.
 *
 * `AClaimNeverReachesAFocusedControl` is the pair of guards in the middle, and
 * the second of them is narrower than it looks: only an activating key is
 * surrendered to a focused control. Taking the rest as well would silence the
 * surface for as long as anything held focus, which the clause grants
 * unconditionally on the surface's own state.
 *
 * The surrender is asked once, before either channel, and it used to be asked
 * inside the action branch alone. A surface whose alphabet answered to Enter or
 * Space — a phrase game spelling a space, a binding written as content rather
 * than as an action — reached the open channel below and took the key from the
 * focused control, which is the same defect the guard exists to prevent
 * arriving by the other door.
 *
 * The action is read as an own entry rather than by a bare index. `actions` is a
 * plain object a game writes, so an index answers for everything
 * `Object.prototype` carries as well: `constructor`, `toString`, `valueOf` and
 * the rest each came back as a function, `??` had nothing to refuse, and the
 * caller was handed something the declared `string | null` says cannot arrive.
 * A word game reaches those keys by spelling them, so this is a press a real
 * surface takes rather than one only a test could make.
 */
export function claimKey(press: KeyPress, bindings: KeyBindings): string | null {
  if (press.modified || press.inTextEntry) {
    return null;
  }

  if (press.inActivatable && ACTIVATES.has(press.key)) {
    return null;
  }

  const bound = Object.hasOwn(bindings.actions, press.key)
    ? bindings.actions[press.key]
    : undefined;

  return bound ?? bindings.content(press.key);
}
