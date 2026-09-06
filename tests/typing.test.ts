/*
 * `docs/specs/operation.allium` — the `TypedInput` surface.
 *
 * Every guard is a call to a pure function over a value type, with no DOM, no
 * focus and no dispatched event: `claimKey` decides, and the port is what reads
 * a real event down to a `KeyPress`. That split is what makes each clause here
 * one assertion rather than a rendered fixture.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import PhysicalKeyboard from '../src/lib/components/PhysicalKeyboard.svelte';
import { createFakeKeys, createWindowKeys } from '../src/lib/ports/keys';
import type { KeyHost } from '../src/lib/ports/keys';

import { claimKey, latinLetters } from '../src/lib/domain/typing';
import type { KeyBindings, KeyPress } from '../src/lib/domain/typing';

const WIRING: KeyBindings = {
  actions: { Enter: 'submit', Backspace: 'delete' },
  content: latinLetters
};

function press(key: string, over: Partial<KeyPress> = {}): KeyPress {
  return { key, modified: false, inTextEntry: false, inActivatable: false, ...over };
}

describe('claimKey', () => {
  it('claims a key the surface has an alphabet for', () => {
    expect(claimKey(press('a'), WIRING)).toBe('a');
  });

  // Immediately after the case above, because it is what refuses `return key`.
  it('leaves a key the alphabet does not name', () => {
    expect(claimKey(press(';'), WIRING)).toBeNull();
  });

  it('takes a letter in whatever case it arrives in', () => {
    expect(claimKey(press('A'), WIRING)).toBe('a');
  });

  it('claims the keys the surface has bound to an action', () => {
    expect(claimKey(press('Enter'), WIRING)).toBe('submit');
    expect(claimKey(press('Backspace'), WIRING)).toBe('delete');
  });

  // `AModifiedKeyIsNeverClaimed`.
  it.each(['ctrl', 'meta', 'alt'])('leaves the browser its own shortcuts (%s)', () => {
    expect(claimKey(press('a', { modified: true }), WIRING)).toBeNull();
  });

  // `AClaimNeverReachesAFocusedControl`: somewhere the reader is typing keeps
  // every key it needs.
  it('leaves every key to somewhere the reader is typing', () => {
    expect(claimKey(press('a', { inTextEntry: true }), WIRING)).toBeNull();
    expect(claimKey(press('Enter', { inTextEntry: true }), WIRING)).toBeNull();
  });

  // The other half of the same clause: the key that activates a control stays
  // the control's.
  it('surrenders the activating key to a control that has focus', () => {
    expect(claimKey(press('Enter', { inActivatable: true }), WIRING)).toBeNull();
  });

  /*
   * The pair that makes the surrender narrow rather than blanket. Taking every
   * key while a control held focus would silence the surface for as long as
   * anything was focused, which the clause grants unconditionally.
   */
  it('still hears the other keys while a control has focus', () => {
    expect(claimKey(press('Backspace', { inActivatable: true }), WIRING)).toBe('delete');
    expect(claimKey(press('a', { inActivatable: true }), WIRING)).toBe('a');
  });

  // Space is absent from every default binding on purpose: nothing intercepts
  // it, so a focused control is activated by the browser as it always was.
  it('never claims space', () => {
    expect(claimKey(press(' '), WIRING)).toBeNull();
  });

  // The alphabet is the surface's, not the platform's. A game of numbers says so
  // here, and a game with no content channel at all passes one that never claims.
  it('takes the alphabet from the surface rather than assuming one', () => {
    const digits: KeyBindings = {
      actions: {},
      content: (key) => (/^[0-9]$/.test(key) ? key : null)
    };

    expect(claimKey(press('5'), digits)).toBe('5');
    expect(claimKey(press('a'), digits)).toBeNull();
  });

  it('takes the action keys from the surface too', () => {
    const crossword: KeyBindings = { actions: { Escape: 'clear' }, content: () => null };

    expect(claimKey(press('Escape'), crossword)).toBe('clear');
  });
});

describe('the keys port', () => {
  /*
   * The adapter is reached by argument, so nothing here stubs a global. That is
   * decision 0005 and it is not a jsdom workaround: the story run is a real
   * browser, where a stubbed global would work and prove less.
   */
  function host(): { on: (event: KeyboardEvent) => void; removed: number } & KeyHost {
    let listener: ((event: KeyboardEvent) => void) | undefined;
    return {
      removed: 0,
      addEventListener(_type, fn) {
        listener = fn;
      },
      removeEventListener(this: { removed: number }) {
        this.removed += 1;
      },
      on(event) {
        listener?.(event);
      }
    };
  }

  function keydown(key: string, target: EventTarget | null, over: Partial<KeyboardEventInit> = {}) {
    const event = new KeyboardEvent('keydown', { key, cancelable: true, ...over });
    if (target !== null) {
      Object.defineProperty(event, 'target', { value: target });
    }
    return event;
  }

  it('reads the reader typing off the event, so the rule never has to', () => {
    const platform = host();
    const seen: KeyPress[] = [];
    createWindowKeys(platform).subscribe((press) => {
      seen.push(press);
      return false;
    });
    const field = document.createElement('input');
    document.body.append(field);

    platform.on(keydown('a', field));

    expect(seen[0]?.inTextEntry).toBe(true);
    field.remove();
  });

  it('reads a focused control off the event too', () => {
    const platform = host();
    const seen: KeyPress[] = [];
    createWindowKeys(platform).subscribe((press) => {
      seen.push(press);
      return false;
    });
    const button = document.createElement('button');
    document.body.append(button);

    platform.on(keydown('Enter', button, { ctrlKey: true }));

    expect(seen[0]).toMatchObject({ inActivatable: true, modified: true });
    button.remove();
  });

  /*
   * A key press dispatched at the window itself has the window as its target,
   * which is not an `Element` and has no `closest`. A real trigger for a real
   * branch, rather than a guard nothing reaches.
   */
  it('survives a press that began at no element at all', () => {
    const platform = host();
    const seen: KeyPress[] = [];
    createWindowKeys(platform).subscribe((press) => {
      seen.push(press);
      return false;
    });

    platform.on(keydown('a', null));

    expect(seen[0]).toMatchObject({ inTextEntry: false, inActivatable: false });
  });

  it('takes the key from the platform only when the surface claimed it', () => {
    const platform = host();
    const port = createWindowKeys(platform);
    const claimed = keydown('a', null);
    const ignored = keydown('a', null);

    const stop = port.subscribe(() => true);
    platform.on(claimed);
    stop();

    port.subscribe(() => false);
    platform.on(ignored);

    expect(claimed.defaultPrevented).toBe(true);
    expect(ignored.defaultPrevented).toBe(false);
  });

  it('stops listening when told to', () => {
    const platform = host();
    createWindowKeys(platform).subscribe(() => false)();

    expect(platform.removed).toBe(1);
  });

  /*
   * A prerendered page has no window to listen on. Absence is a shape rather
   * than a crash, which is the arrangement `createMediaPreferences` already uses
   * for a missing `matchMedia`.
   */
  it('is inert where the platform offers nothing to listen on', () => {
    const stop = createWindowKeys({}).subscribe(() => true);

    expect(() => {
      stop();
    }).not.toThrow();
  });
});

describe('PhysicalKeyboard', () => {
  it('reports the value a claimed key carries', () => {
    const keys = createFakeKeys();
    const onpress = vi.fn();
    render(PhysicalKeyboard, { keys, onpress });

    expect(keys.press({ key: 'a' })).toBe(true);
    expect(keys.press({ key: 'Enter' })).toBe(true);

    expect(onpress).toHaveBeenNthCalledWith(1, 'a');
    expect(onpress).toHaveBeenNthCalledWith(2, 'submit');
  });

  it('reports nothing for a key the surface leaves alone', () => {
    const keys = createFakeKeys();
    const onpress = vi.fn();
    render(PhysicalKeyboard, { keys, onpress });

    expect(keys.press({ key: 'a', inTextEntry: true })).toBe(false);
    expect(onpress).not.toHaveBeenCalled();
  });

  /*
   * `DroppingTheClaimIsTotal`, as an assertion rather than an argument. A
   * surface stops claiming by not rendering this, and what is left behind is no
   * listener at all — not a listener that declines.
   */
  it('leaves no listener behind when the surface stops claiming', () => {
    const keys = createFakeKeys();
    const { unmount } = render(PhysicalKeyboard, { keys, onpress: vi.fn() });

    expect(keys.listening).toBe(1);

    unmount();

    expect(keys.listening).toBe(0);
    expect(keys.press({ key: 'a' })).toBe(false);
  });
});
