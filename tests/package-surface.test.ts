import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import * as surface from '../src/lib/index.js';
import type {
  DeviceAnswers,
  FakePreferences,
  IconName,
  MatchMedia,
  MediaQueryListLike,
  PreferencesPort,
  ThemeChoice
} from '../src/lib/index.js';

/*
 * The published surface, tested from a consumer's point of view.
 *
 * The component and port suites import their subjects directly and keep doing
 * so: a component test that failed for a barrel reason would name the wrong
 * defect. So nothing else here loads `src/lib/index.ts`, and an export-only
 * module inside the coverage glob that no test loads is reported at zero and
 * sinks the run — that is invariant 7. Importing it above is what covers it.
 *
 * The assertions are what make the coverage honest rather than incidental. The
 * defect a barrel invites is a component added under `src/lib/components/` and
 * never re-exported: it has a test, it has a story, every gate here is green,
 * and no game can import it. The type-only exports are held the same way, at
 * compile time: a type that stopped being exported fails `svelte-check` on the
 * import above before any assertion runs.
 */
const COMPONENTS = [
  'Announcer',
  'Button',
  'HeaderBar',
  'Icon',
  'IconButton',
  'Modal',
  'Notice',
  'Wordmark'
] as const;

describe('the package surface', () => {
  it('exports every component by name', () => {
    for (const name of COMPONENTS) {
      expect(surface[name], name).toBeDefined();
    }
  });

  it('exports the preferences port and the appearance derivations', () => {
    expect(surface.createMediaPreferences).toBeTypeOf('function');
    expect(surface.createFakePreferences).toBeTypeOf('function');
    expect(surface.darkActive).toBeTypeOf('function');
    expect(surface.animationsActive).toBeTypeOf('function');
    expect(surface.highContrastActive).toBeTypeOf('function');
  });

  it('exports components a consumer can render', () => {
    render(surface.Wordmark, {});

    expect(screen.getByText(/biscuit/)).toHaveTextContent(/^biscuit games$/);

    const { container } = render(surface.Icon, { name: 'check' });

    expect(container.querySelector('svg')).not.toBeNull();
  });

  // The names a consumer writes against, used rather than merely imported so
  // that each is a real value in the emitted declarations and not a stale one.
  it('names the types a consumer writes against', () => {
    const theme: ThemeChoice = 'dark';
    const icon: IconName = 'check';
    const answers: DeviceAnswers = { prefersDark: true };
    const fake: FakePreferences = surface.createFakePreferences(answers);
    const port: PreferencesPort = fake;
    const list: MediaQueryListLike = {
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined
    };
    const matchMedia: MatchMedia = () => list;

    expect(surface.darkActive(theme, port.prefersDark())).toBe(true);
    expect(surface.createMediaPreferences({ matchMedia }).prefersMoreContrast()).toBe(false);
    expect(icon).toBe('check');
  });
});
