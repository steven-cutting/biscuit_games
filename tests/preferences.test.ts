import { describe, expect, it } from 'vitest';

import { createFakePreferences, createMediaPreferences } from '../src/lib/ports/preferences';
import type { MediaQueryListLike } from '../src/lib/ports/preferences';

/*
 * appearance.allium reads three preferences the reader expressed to their
 * operating system rather than to Biscuit Games. `Appearance` keeps matching
 * the colour scheme as it changes, so this port watches as well as reads.
 *
 * The adapter takes its host as an argument, so every arm below is reached by
 * passing one — a fake, an empty object, nothing — and no global is stubbed.
 * That is the shape invariant 3 asks of every port.
 */
describe('the preferences port', () => {
  /** A `matchMedia` a test controls, standing in for the one jsdom lacks. */
  function fakeMatchMedia(state: Record<string, boolean>) {
    const listeners = new Map<string, Set<() => void>>();

    const change = (query: string, matches: boolean): void => {
      state[query] = matches;
      for (const listener of listeners.get(query) ?? []) {
        listener();
      }
    };

    const matchMedia = (query: string): MediaQueryListLike => ({
      get matches(): boolean {
        return state[query] ?? false;
      },
      addEventListener: (_type: 'change', listener: () => void) => {
        const registered = listeners.get(query) ?? new Set();
        registered.add(listener);
        listeners.set(query, registered);
      },
      removeEventListener: (_type: 'change', listener: () => void) => {
        listeners.get(query)?.delete(listener);
      }
    });

    return { matchMedia, change };
  }

  it('reads all three device preferences', () => {
    const media = fakeMatchMedia({
      '(prefers-color-scheme: dark)': true,
      '(prefers-reduced-motion: reduce)': false,
      '(prefers-contrast: more)': true
    });
    const preferences = createMediaPreferences({ matchMedia: media.matchMedia });

    expect(preferences.prefersDark()).toBe(true);
    expect(preferences.prefersReducedMotion()).toBe(false);
    expect(preferences.prefersMoreContrast()).toBe(true);
  });

  /*
   * Contrast and colour scheme are separate questions, as the spec says
   * outright: a device can ask for more contrast in either one. A port that
   * read one query for both would pass every test above and still turn the
   * high-contrast palette on for anybody in dark mode.
   */
  it('asks about contrast separately from the colour scheme', () => {
    const media = fakeMatchMedia({
      '(prefers-color-scheme: dark)': true,
      '(prefers-contrast: more)': false
    });
    const preferences = createMediaPreferences({ matchMedia: media.matchMedia });

    expect(preferences.prefersDark()).toBe(true);
    expect(preferences.prefersMoreContrast()).toBe(false);
  });

  // MoreContrastFromTheDeviceTurnsHighContrastOn is only as live as this: a
  // device that changes its mind has to be heard, the same as for the theme.
  it('reports a change of contrast preference', () => {
    const media = fakeMatchMedia({ '(prefers-contrast: more)': false });
    const preferences = createMediaPreferences({ matchMedia: media.matchMedia });
    let changes = 0;
    const stop = preferences.subscribe(() => {
      changes += 1;
    });

    media.change('(prefers-contrast: more)', true);

    expect(changes).toBe(1);
    expect(preferences.prefersMoreContrast()).toBe(true);

    stop();
    media.change('(prefers-contrast: more)', false);

    expect(changes).toBe(1);
  });

  // SystemFollowsTheDeviceAsItChanges: it keeps matching as it changes.
  it('reports a change, and stops once nobody is listening', () => {
    const media = fakeMatchMedia({ '(prefers-color-scheme: dark)': false });
    const preferences = createMediaPreferences({ matchMedia: media.matchMedia });
    let changes = 0;

    const stop = preferences.subscribe(() => {
      changes += 1;
    });

    media.change('(prefers-color-scheme: dark)', true);

    expect(changes).toBe(1);
    expect(preferences.prefersDark()).toBe(true);

    stop();
    media.change('(prefers-color-scheme: dark)', false);

    expect(changes).toBe(1);
  });

  it('has a fake a test can move', () => {
    const preferences = createFakePreferences({ prefersDark: false });
    let changes = 0;
    const stop = preferences.subscribe(() => {
      changes += 1;
    });

    preferences.set({ prefersDark: true, prefersReducedMotion: true, prefersMoreContrast: true });

    expect(preferences.prefersDark()).toBe(true);
    expect(preferences.prefersReducedMotion()).toBe(true);
    expect(preferences.prefersMoreContrast()).toBe(true);
    expect(changes).toBe(1);

    stop();
    preferences.set({
      prefersDark: false,
      prefersReducedMotion: false,
      prefersMoreContrast: false
    });

    expect(changes).toBe(1);
  });

  // A fake that starts with every answer given, and one that starts with none:
  // the two ends of what a test can ask for.
  it('starts the fake from whatever answers it is given', () => {
    const everything = createFakePreferences({
      prefersDark: true,
      prefersReducedMotion: true,
      prefersMoreContrast: true
    });

    expect(everything.prefersDark()).toBe(true);
    expect(everything.prefersReducedMotion()).toBe(true);
    expect(everything.prefersMoreContrast()).toBe(true);

    const nothing = createFakePreferences();

    expect(nothing.prefersDark()).toBe(false);
    expect(nothing.prefersReducedMotion()).toBe(false);
    expect(nothing.prefersMoreContrast()).toBe(false);
  });

  // A device changes one mind at a time. The answers it is not asked about
  // stay as they were, rather than falling back to "no".
  it('keeps the answers a partial change leaves out', () => {
    const preferences = createFakePreferences({ prefersReducedMotion: true });

    preferences.set({ prefersDark: true });

    expect(preferences.prefersDark()).toBe(true);
    expect(preferences.prefersReducedMotion()).toBe(true);
    expect(preferences.prefersMoreContrast()).toBe(false);

    preferences.set({ prefersMoreContrast: true });

    expect(preferences.prefersDark()).toBe(true);
    expect(preferences.prefersReducedMotion()).toBe(true);
    expect(preferences.prefersMoreContrast()).toBe(true);
  });

  /*
   * A host without `matchMedia` is a device that asked for nothing. Passed as
   * an argument, so the arm is reached the way every other one is, and then
   * left to default: jsdom supplies a window without `matchMedia`, so the
   * ambient fallback is the real code path here rather than a hypothetical one.
   */
  it('falls back to a device that asks for nothing where matchMedia is absent', () => {
    for (const preferences of [createMediaPreferences({}), createMediaPreferences()]) {
      const stop = preferences.subscribe(() => undefined);

      expect(preferences.prefersDark()).toBe(false);
      expect(preferences.prefersReducedMotion()).toBe(false);
      expect(preferences.prefersMoreContrast()).toBe(false);
      expect(() => {
        stop();
      }).not.toThrow();
    }
  });
});
