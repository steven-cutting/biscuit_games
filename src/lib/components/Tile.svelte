<script lang="ts">
  import Marker from './Marker.svelte';
  import { drawnMark } from '../domain/types.js';
  import type { Mark } from '../domain/types.js';

  /**
   * One cell of a play surface that is read rather than pressed.
   *
   * A board cell, a rack slot on show, a revealed answer. The pressable form of
   * the same paint is `Key`: same box, same ink, same bar, and a role a reader
   * can operate. A crossword's typing cell is a `Key`; a crossword's printed
   * answer is a `Tile`.
   *
   * The content is drawn exactly as it was given. Nothing here uppercases it:
   * the content may be a digit, a punctuation mark or two letters of a rebus,
   * and `text-transform` would rewrite "ß" to "SS" and dot a Turkish "i". A
   * caller who wants capitals passes capitals, and the paint and the accessible
   * name then agree by construction rather than by coincidence.
   *
   * `PlaySurface.@guarantee ACellReadsAsOneThing`: the cell reaches assistive
   * technology as one named thing, so the glyph and the bar are both hidden and
   * the name carries the whole of it.
   */
  let {
    content = '',
    mark = null,
    label
  }: {
    /** What the cell shows. Any character, or none. */
    content?: string;
    /** What the surface has made of the content, and the game's words for it. */
    mark?: Mark | null;
    /**
     * Where this cell is, in the game's words — "Position 3", "5 across, letter
     * 2". The platform never composes it: a row of attempts and a crossword grid
     * do not describe a place the same way.
     */
    label?: string;
  } = $props();

  const shown = $derived(drawnMark(mark));

  /*
   * `Empty` is the platform's word, and it is capitalised because it stands
   * alone as the whole name. Where the caller has placed the cell its own
   * sentence leads, so the word joins mid-name and is lowercase.
   */
  const name = $derived.by(() => {
    const parts = [label, content === '' ? (label === undefined ? 'Empty' : 'empty') : content];
    if (shown !== null) {
      parts.push(shown.description);
    }
    return parts.filter((part) => part !== undefined && part !== '').join(', ');
  });
</script>

<span
  class="tile"
  class:filled={content !== '' && shown === null}
  data-mark={shown?.name}
  role="img"
  aria-label={name}
>
  <span aria-hidden="true">{content}</span>
  {#if shown !== null}
    <Marker name={shown.name} />
  {/if}
</span>

<style>
  /*
   * The ink carries the mark three ways at once — the glyph, the border and the
   * marker bar are all painted in it — which is what lets the bar draw in
   * `currentColor` and stay right in every palette. An unmarked cell is the
   * faintest rule on the page; content thickens it and no more; a marked cell
   * answers in its mark's ink; absent keeps a plain drawn border and dims its
   * glyph.
   *
   * `AnUnmarkedCellStandsOffAMarkedOne` states the figures and
   * `tests/contrast.test.ts` computes them.
   *
   * 3rem is a literal on purpose, and it is the same carve-out `Button`'s 48px
   * takes. It matches `--s-11` by value and not by meaning: that is the spacing
   * scale, and a cell's size is not a gap between things. Naming the token here
   * would resize every board when the scale moved for a reason of its own. The
   * padding inside a `Key` is not in that carve-out and does name its tokens,
   * because padding is spacing.
   */
  .tile {
    position: relative;
    display: grid;
    place-items: center;
    inline-size: 3rem;
    block-size: 3rem;
    border: var(--rule-w) solid var(--rule);
    border-radius: var(--radius-tile);
    background: transparent;
    color: var(--text);
    font-family: var(--font-board);
    font-size: var(--fs-board);
    font-weight: 600;
    letter-spacing: var(--track-board);
    line-height: 1;
  }

  .filled {
    border: var(--rule-w-strong) solid var(--rule);
  }

  .tile[data-mark='exact'] {
    border: var(--rule-w-strong) solid var(--result-exact);
    background: var(--result-exact-fill);
    color: var(--result-exact);
  }

  .tile[data-mark='present'] {
    border: var(--rule-w-strong) solid var(--result-present);
    background: var(--result-present-fill);
    color: var(--result-present);
  }

  .tile[data-mark='absent'] {
    border: var(--rule-w) solid var(--result-absent);
    color: var(--result-absent-text);
  }
</style>
