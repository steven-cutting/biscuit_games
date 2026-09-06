<script lang="ts">
  import { QWERTY_BINDINGS } from './layouts.js';
  import { claimKey } from '../domain/typing.js';
  import type { KeyBindings } from '../domain/typing.js';
  import type { KeysPort } from '../ports/keys.js';

  /**
   * The device's own keyboard, wired to a surface for as long as this is mounted
   * and not one instant longer.
   *
   * It renders nothing, and it holds the subscription rather than a handler:
   * `DroppingTheClaimIsTotal` says not claiming means not intercepting, so a
   * surface stops by not rendering this, the effect's teardown runs, and there is
   * no listener at all. A handler that checked a flag and returned early would
   * still be a handler.
   *
   * The port arrives as a prop rather than an import, because
   * `docs/explanation/layering.md` forbids a component from reaching for a
   * browser global. A game builds `createWindowKeys()` at its route; a test hands
   * in `createFakeKeys()` and stubs nothing.
   */
  let {
    keys,
    onpress,
    bindings = QWERTY_BINDINGS
  }: {
    keys: KeysPort;
    /** Called with the value the pressed key carries for this surface. */
    onpress: (value: string) => void;
    /**
     * What the physical keys mean here. Defaults to the same values `QWERTY`
     * draws, so the two agree by naming the same things rather than because
     * either component knows about the other.
     */
    bindings?: KeyBindings;
  } = $props();

  $effect(() =>
    keys.subscribe((press) => {
      const value = claimKey(press, bindings);

      if (value === null) {
        return false;
      }
      onpress(value);
      return true;
    })
  );
</script>
