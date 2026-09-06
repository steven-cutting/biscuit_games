<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * How something works, shown beside what it means.
   *
   * The shape a "how to play" turns out to be, with one game's words taken out:
   * opening prose, a list pairing a live example with the sentence that explains
   * it, and a quiet closing note. Every game explains itself somewhere and every
   * one of them explains it this way, which is what makes the scaffold the
   * platform's and the sentences the game's —
   * `Primer.@guarantee TheWordsAreTheGamesAndTheFrameIsThePlatforms`.
   *
   * Each example is drawn from the real component it is about — a `Tile` wearing
   * a mark, a `Key` — so the bar a reader is told about is the bar the surface
   * draws, in every theme and both palettes. An explanation drawn separately is
   * one that can come to disagree with the surface it describes.
   *
   * The examples are hidden from assistive technology: the sentence beside one is
   * the whole of the content. That leaves the sentences carrying the explanation
   * alone, which is why each row is named by its own sentence.
   *
   * There is deliberately no dialog here. A caller that wants one writes
   * `<Modal title="How to play" {onclose}><Explainer … /></Modal>`, which is
   * three lines and no shared shape; a wrapper would only hard-code a title the
   * game owns.
   */
  interface ExplainerRow {
    /** The thing being explained, drawn and hidden from assistive technology. */
    show: Snippet;
    /** What it means. The whole of what a reader hears for this row. */
    says: string;
  }

  let {
    rows = [],
    children,
    footnote
  }: {
    rows?: readonly ExplainerRow[];
    /** The opening prose. */
    children?: Snippet;
    /** The quiet sentence under the list. */
    footnote?: Snippet;
  } = $props();
</script>

<div class="explainer">
  {#if children !== undefined}
    {@render children()}
  {/if}
  {#if rows.length > 0}
    <ul>
      {#each rows as row (row.says)}
        <li aria-label={row.says}>
          <span class="example" aria-hidden="true">{@render row.show()}</span>
          <span>{row.says}</span>
        </li>
      {/each}
    </ul>
  {/if}
  {#if footnote !== undefined}
    <div class="note">{@render footnote()}</div>
  {/if}
</div>

<style>
  /*
   * `text-wrap: pretty` is inherited by every sentence here. At a dialog's width
   * a row's sentence runs to two lines, and without it the second line is as
   * likely as not to be one word; where the browser does not know the value it
   * wraps as it always did.
   */
  .explainer {
    display: grid;
    gap: var(--s-6);
    text-wrap: pretty;
  }

  ul {
    display: grid;
    gap: var(--s-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--s-5);
    align-items: center;
  }

  .note {
    color: var(--text-2);
  }
</style>
