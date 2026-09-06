<script lang="ts">
  import Key from './Key.svelte';
  import { keyName, QWERTY } from './layouts.js';
  import type { KeyboardLayout } from './layouts.js';
  import type { Mark } from '../domain/types.js';

  /**
   * A laid-out grid of pressable keys.
   *
   * The layout is what the surface is; the marks are what this turn has made of
   * it. They are separate props because one is a constant a game declares once
   * and the other changes every turn.
   *
   * One callback rather than one per action. Poodl's three named callbacks do
   * not survive a second consumer: a crossword needs *clear* and *check*, a rack
   * needs *shuffle*, *recall*, *play*, *pass* and *exchange*, and two named
   * callbacks cannot express five. `onpress` carries the key's own value, and
   * the game already knows its values because it wrote the layout.
   */
  let {
    layout = QWERTY,
    marks = {},
    label = 'Keyboard',
    disabled = false,
    onpress
  }: {
    /** Rows of keys, top to bottom, each row left to right. */
    layout?: KeyboardLayout;
    /**
     * What the surface has made of each key, by the key's `value`. A value with
     * no entry is a key nothing is known about yet.
     */
    marks?: Readonly<Record<string, Mark>>;
    /** The group's accessible name. A rack is not a keyboard and says so. */
    label?: string;
    /** Turns every key off at once. */
    disabled?: boolean;
    /** Called with the `value` of the key that was pressed. */
    onpress?: (value: string) => void;
  } = $props();

  /*
   * `ALayoutIsSuppliedRatherThanFixed` closes with "a layout with no keys is not
   * a keyboard", and this is the refusal. An empty layout is type-valid and
   * stays so on purpose: a game builds its rows with `map`, and a non-empty
   * tuple would stop type-checking exactly there. So the group is not drawn
   * rather than drawn with nothing in it — a named group a reader can reach and
   * find nothing inside is worse than no group at all.
   */
  const anyKeys = $derived(layout.some((row) => row.length > 0));

  /*
   * Own entries only. `marks` is a plain object a game builds, so a bare index
   * also answers for everything `Object.prototype` carries — a key valued
   * `constructor` or `toString` found a built-in function under it, `?? null`
   * had nothing to refuse, and `drawnMark` threw reading `description` off a
   * function. A game names its own key values, and nothing stops one of them
   * being a word JavaScript has already used.
   *
   * Written so neither arm is dead. `Object.hasOwn(…) ? (marks[value] ?? null)`
   * needs the `??` to compile under `noUncheckedIndexedAccess` and can never
   * take it, which is a branch the coverage run reports and
   * `docs/explanation/quality-philosophy.md` says should not exist. Asking
   * whether an entry is there and whether it is the game's own are two
   * questions, and both answers occur.
   */
  function markFor(value: string): Mark | null {
    const supplied = marks[value];

    return supplied !== undefined && Object.hasOwn(marks, value) ? supplied : null;
  }
</script>

{#if anyKeys}
  <div class="keyboard" role="group" aria-label={label}>
    {#each layout as row, index (index)}
      <div class="row">
        {#each row as key (key.value)}
          <Key
            label={keyName(key)}
            content={key.content ?? key.value}
            icon={key.icon}
            mark={markFor(key.value)}
            action={key.kind === 'action'}
            {disabled}
            onpress={() => onpress?.(key.value)}
          />
        {/each}
      </div>
    {/each}
  </div>
{/if}

<style>
  .keyboard {
    display: grid;
    gap: var(--gap-row);

    /*
     * Never asks for less room than the narrowest screen a surface supports, and
     * never more than it is given. Without the floor a parent that sizes to its
     * content — the workshop's centred layout is one — squeezes rows whose own
     * width is now zero down to the width of their glyphs.
     */
    min-inline-size: min(100%, 20rem);
  }

  .row {
    display: flex;
    gap: var(--gap-key);
  }
</style>
