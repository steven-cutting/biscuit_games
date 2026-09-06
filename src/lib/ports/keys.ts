import type { KeyPress } from '../domain/typing.js';

/**
 * Bare key presses arriving from the device.
 *
 * The second port. `docs/specs/operation.allium`'s `TypedInput` says a surface
 * may claim keys and must be able to stop, and
 * `@guarantee DroppingTheClaimIsTotal` says stopping means no listener rather
 * than a listener that declines — so the subscription is the thing that goes
 * away, and this is the only file in the package that sees a `KeyboardEvent`.
 *
 * It is a port rather than a component reaching for `window` because
 * `docs/explanation/layering.md` forbids the components layer from reaching for
 * a browser global, and a subscription that outlives the render is a much
 * stronger claim than `Modal`'s read of its own document. It buys the guards a
 * unit test with no DOM, and it makes "no listener" an assertion rather than an
 * argument.
 */
export interface KeysPort {
  /**
   * Call `listener` on every key press. It returns whether the surface claimed
   * the key, and this port is what acts on that. The returned function stops
   * listening.
   */
  subscribe(listener: (press: KeyPress) => boolean): () => void;
}

/**
 * The part of the platform the adapter uses.
 *
 * Named rather than taken from `lib.dom` because the adapter has to accept a
 * stand-in, and because a prerendered page has no window at all — both methods
 * are optional so that absence is a shape the code can be honest about rather
 * than a crash.
 */
export interface KeyHost {
  addEventListener?: (type: 'keydown', listener: (event: KeyboardEvent) => void) => void;
  removeEventListener?: (type: 'keydown', listener: (event: KeyboardEvent) => void) => void;
}

/** Somewhere the reader is typing. Every key is theirs. */
const TEXT_ENTRY = 'input, textarea, select, [contenteditable]';

/**
 * Something the browser activates from the keyboard.
 *
 * A disclosure's summary is one of them: Enter opens it, and Enter taken from it
 * is a control that stops working while a surface is claiming keys — which is
 * what `AClaimNeverReachesAFocusedControl` forbids. `Modal`'s focusable list
 * already named it, and this is the same fact read from the other side, so the
 * two are spelled the same way on purpose.
 */
const ACTIVATABLE = 'button, a[href], details > summary:first-of-type';

/**
 * The device's own keyboard. The host is an argument rather than a global read,
 * so a test drives the real adapter without stubbing anything.
 */
export function createWindowKeys(host: KeyHost = globalThis): KeysPort {
  return {
    subscribe(listener) {
      const handle = (event: KeyboardEvent): void => {
        const target = event.target;
        const within = (selector: string): boolean =>
          target instanceof Element && target.closest(selector) !== null;

        const claimed = listener({
          key: event.key,
          modified: event.ctrlKey || event.metaKey || event.altKey,
          inTextEntry: within(TEXT_ENTRY),
          inActivatable: within(ACTIVATABLE)
        });

        if (claimed) {
          event.preventDefault();
        }
      };

      host.addEventListener?.('keydown', handle);

      return () => {
        host.removeEventListener?.('keydown', handle);
      };
    }
  };
}

/** A keyboard a test can press, and count listeners on. */
export interface FakeKeys extends KeysPort {
  /** Press a key. Returns whether any listener claimed it. */
  press(press: Partial<KeyPress> & { key: string }): boolean;
  /** How many listeners are attached. Zero is what "off" means. */
  readonly listening: number;
}

export function createFakeKeys(): FakeKeys {
  const listeners = new Set<(press: KeyPress) => boolean>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    press(partial) {
      const full: KeyPress = {
        modified: false,
        inTextEntry: false,
        inActivatable: false,
        ...partial
      };
      let claimed = false;
      for (const listener of listeners) {
        claimed = listener(full) || claimed;
      }
      return claimed;
    },
    get listening() {
      return listeners.size;
    }
  };
}
