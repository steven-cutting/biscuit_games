/**
 * What the reader asked their operating system for.
 *
 * `appearance.allium` states three givens — `prefers_dark_colour_scheme`,
 * `prefers_reduced_motion` and `prefers_more_contrast` — as preferences the
 * reader expressed to their operating system rather than to Biscuit Games,
 * which reads them and never writes them. `SystemFollowsTheDeviceAsItChanges`
 * adds that the platform "keeps matching it as it changes", so this port
 * watches as well as reads.
 *
 * The first port, and the shape every later one takes: an interface, a real
 * adapter that takes its platform object as a defaulted argument, and an
 * in-memory fake a test injects. That is invariant 3 in `AGENTS.md`, and
 * `docs/explanation/layering.md` says why.
 */
export interface PreferencesPort {
  prefersDark(): boolean;
  prefersReducedMotion(): boolean;
  /**
   * `prefers_more_contrast`. A separate question from the colour scheme, as
   * the spec says outright: a device can ask for more contrast in either one.
   */
  prefersMoreContrast(): boolean;
  /** Call on any change. The returned function stops listening. */
  subscribe(listener: () => void): () => void;
}

/**
 * The part of `MediaQueryList` this port uses.
 *
 * Named rather than taken from `lib.dom` because the adapter has to accept a
 * stand-in: jsdom under Node 26 has no `matchMedia` at all, and a test supplies
 * one as an ordinary argument rather than stubbing the environment.
 */
export interface MediaQueryListLike {
  readonly matches: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

export type MatchMedia = (query: string) => MediaQueryListLike;

const DARK = '(prefers-color-scheme: dark)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
/*
 * `more` and not `custom`. The media feature has both, and they answer
 * different questions: `more` is the reader asking for more contrast, while
 * `custom` merely reports that some palette has been forced on the page —
 * Windows high contrast being the usual one, which substitutes its own colours
 * and would be answered by `forced-colors`, not by swapping in the platform's
 * second palette on top.
 */
const MORE_CONTRAST = '(prefers-contrast: more)';

/**
 * The device, through media queries.
 *
 * The argument is the host — the object `matchMedia` hangs off — rather than
 * `matchMedia` itself, and it defaults to `globalThis`. Its `matchMedia` is
 * optional because that is honest: prerendering in Node leaves it absent, and
 * so does jsdom, which supplies a `window` without one. A device the platform
 * cannot ask is a device that asked for nothing, which is the same answer as a
 * device with no preference — so this never throws and never needs a caller to
 * know which environment it is in.
 *
 * Taking the host rather than the function is what lets a test reach the
 * absent arm by passing `{}`, with no global stubbed; decision 0014 records
 * the difference from the adapter this was ported from. The queries are made
 * as method calls on the host, because a browser's `matchMedia` refuses to run
 * detached from its window.
 */
export function createMediaPreferences(
  host: { matchMedia?: MatchMedia } = globalThis
): PreferencesPort {
  if (host.matchMedia === undefined) {
    return {
      prefersDark: () => false,
      prefersReducedMotion: () => false,
      prefersMoreContrast: () => false,
      subscribe: () => () => undefined
    };
  }

  const dark = host.matchMedia(DARK);
  const motion = host.matchMedia(REDUCED_MOTION);
  const contrast = host.matchMedia(MORE_CONTRAST);

  return {
    prefersDark: () => dark.matches,
    prefersReducedMotion: () => motion.matches,
    prefersMoreContrast: () => contrast.matches,
    subscribe(listener) {
      dark.addEventListener('change', listener);
      motion.addEventListener('change', listener);
      contrast.addEventListener('change', listener);

      return () => {
        dark.removeEventListener('change', listener);
        motion.removeEventListener('change', listener);
        contrast.removeEventListener('change', listener);
      };
    }
  };
}

/** What a device can be asked, which is also what a test can set. */
export interface DeviceAnswers {
  prefersDark?: boolean;
  prefersReducedMotion?: boolean;
  prefersMoreContrast?: boolean;
}

export interface FakePreferences extends PreferencesPort {
  set(next: DeviceAnswers): void;
}

/** A device a test can change its mind on. */
export function createFakePreferences(initial: DeviceAnswers = {}): FakePreferences {
  let dark = initial.prefersDark ?? false;
  let reduced = initial.prefersReducedMotion ?? false;
  let contrast = initial.prefersMoreContrast ?? false;
  const listeners = new Set<() => void>();

  return {
    prefersDark: () => dark,
    prefersReducedMotion: () => reduced,
    prefersMoreContrast: () => contrast,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(next) {
      dark = next.prefersDark ?? dark;
      reduced = next.prefersReducedMotion ?? reduced;
      contrast = next.prefersMoreContrast ?? contrast;
      for (const listener of listeners) {
        listener();
      }
    }
  };
}
