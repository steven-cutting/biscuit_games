<script lang="ts">
  import Icon from './Icon.svelte';
  import Marker from './Marker.svelte';
  import type { IconName } from './icons.js';
  import { drawnMark } from '../domain/types.js';
  import type { Mark } from '../domain/types.js';

  /**
   * One cell of a play surface that is pressed.
   *
   * A keyboard key, a crossword cell a reader types into, a rack tile they pick
   * up. Same paint as `Tile` and the same marker bar, over a real `<button>`, so
   * it takes focus, answers Enter and Space, and reports its own unavailability
   * — `EveryKeyIsAControl`. `app.css` gives it the 44px floor and the pressed
   * ring, and this component sets no `box-shadow` of its own.
   *
   * The name is required and never inferred, as `IconButton`'s is: a key drawn
   * as a glyph has no text to fall back on, and a key drawn as a single
   * character is one of the controls a shape alone would leave unnamed.
   *
   * How wide it comes out is `operation.allium`'s
   * `EveryControlIsAComfortableTarget`, not this component's: a key that ends a
   * turn takes more of its row than one that builds it, and never less.
   */
  let {
    label,
    content = '',
    icon,
    mark = null,
    action = false,
    disabled = false,
    onpress
  }: {
    /** The accessible name, before the mark's words are added to it. */
    label: string;
    /** What the key shows. Drawn exactly as given. */
    content?: string;
    /** Drawn instead of `content`, for a key whose meaning is a glyph. */
    icon?: IconName;
    /** What the surface has made of this key, and the game's words for it. */
    mark?: Mark | null;
    /** Ends a turn rather than building one: takes more of its row, never less. */
    action?: boolean;
    disabled?: boolean;
    onpress?: () => void;
  } = $props();

  const shown = $derived(drawnMark(mark));
  const name = $derived(shown === null ? label : `${label}, ${shown.description}`);
</script>

<button
  type="button"
  class:action
  data-mark={shown?.name}
  aria-label={name}
  {disabled}
  onclick={() => onpress?.()}
>
  {#if icon !== undefined}
    <Icon name={icon} size={18} />
  {:else}
    {content}
  {/if}
  {#if shown !== null}
    <Marker name={shown.name} />
  {/if}
</button>

<style>
  /*
   * `flex: 1 1 0` with `min-inline-size: 0` is the equal division
   * `EveryControlIsAComfortableTarget` grants a dense row, and the floor it
   * replaces is what makes it work: a width floor here defeats flex-shrink and
   * pushes a ten-across row past a 320px screen. What a key gives up is bounded
   * by the width of the screen and by nothing else. `min-block-size` comes from
   * the base rule in `app.css` and is met at every width; the stories measure
   * both, because jsdom has no layout engine and can see neither.
   */
  button {
    position: relative;
    flex: 1 1 0;
    min-inline-size: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--s-5) var(--s-1);
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-key);
    background: var(--key-untried-bg);
    color: var(--text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  /* Wider, never narrower: a key that ends a turn is the last place to save width. */
  .action {
    flex: 1.5 1 0;
  }

  /*
   * `AnUnavailableControlIsExempt`: the dim is held to no ratio, the state is
   * carried by the `disabled` attribute the browser reports, and every
   * non-colour indication the live key carried stays.
   */
  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* A marked key steps off the page onto the raised ground. */
  button[data-mark] {
    background: var(--key-scored-bg);
  }

  button[data-mark='exact'] {
    border: var(--rule-w-strong) solid var(--result-exact);
    color: var(--result-exact);
  }

  button[data-mark='present'] {
    border: var(--rule-w-strong) solid var(--result-present);
    color: var(--result-present);
  }

  button[data-mark='absent'] {
    border-color: var(--result-absent);
    color: var(--result-absent-text);
  }
</style>
