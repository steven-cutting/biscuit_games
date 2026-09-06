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
  /** A platform modifier was held. The browser's own shortcuts stay the browser's. */
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
 * The key a browser activates a focused control with.
 *
 * A browser fact rather than a surface's choice, which is why it is named here
 * rather than passed in. Space is the other one and is absent deliberately:
 * nothing here ever claims it, so a focused control is activated by the browser
 * as it always was, and a surface that bound it would be taking the key back
 * from every control on the page.
 */
const ACTIVATES = 'Enter';

/** The 26 Latin letters, lowercased. A default, and only a default. */
export function latinLetters(key: string): string | null {
  return /^[a-z]$/iu.test(key) ? key.toLowerCase() : null;
}

/**
 * The value this press carries, or `null` for a press the surface leaves alone.
 *
 * `AClaimNeverReachesAFocusedControl` is the pair of guards in the middle, and
 * the second of them is narrower than it looks: only the activating key is
 * surrendered to a focused control. Taking the rest as well would silence the
 * surface for as long as anything held focus, which the clause grants
 * unconditionally on the surface's own state.
 */
export function claimKey(press: KeyPress, bindings: KeyBindings): string | null {
  if (press.modified || press.inTextEntry) {
    return null;
  }

  const action = bindings.actions[press.key];

  if (action !== undefined) {
    return press.inActivatable && press.key === ACTIVATES ? null : action;
  }

  return bindings.content(press.key);
}
