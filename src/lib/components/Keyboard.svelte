<script lang="ts">
  import Key from './Key.svelte';
  import { QWERTY } from './layouts.js';
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
</script>

<div class="keyboard" role="group" aria-label={label}>
  {#each layout as row, index (index)}
    <div class="row">
      {#each row as key (key.value)}
        <Key
          label={key.label ?? key.content ?? key.value}
          content={key.content ?? key.value}
          icon={key.icon}
          mark={marks[key.value] ?? null}
          action={key.kind === 'action'}
          {disabled}
          onpress={() => onpress?.(key.value)}
        />
      {/each}
    </div>
  {/each}
</div>

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
