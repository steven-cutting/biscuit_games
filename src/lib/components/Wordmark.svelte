<script lang="ts">
  import Monogram from './Monogram.svelte';

  /**
   * The brand lockup: the placeholder mark and the words, together.
   *
   * The mark is `Monogram`, which decision 0017 extracted from this file and
   * which is `aria-hidden` here — so the accessible text of the lockup is
   * exactly its words, with no stray "b" in front of them.
   *
   * `product` names a game after the platform: "biscuit games / poodl". A game
   * installing the package could not render its own lockup at all before, and
   * had to rebuild one while matching the display face, the weight, the tracking
   * and the `words` class `HeaderBar`'s collapse reaches into — a cost paid
   * twice the moment there are two games. The separator is inside `words` rather
   * than beside them, so the whole lockup collapses together under that rule
   * instead of leaving a slash behind on a phone.
   *
   * There is deliberately no size and no way to drop the mark, both of which the
   * design system offers. Nothing here draws the lockup at another size, and a
   * prop nothing passes is a branch with nothing to cover it.
   */
  let { product }: { product?: string } = $props();

  /*
   * Built here rather than in the template. Svelte trims whitespace at the start
   * of a block, so a literal " / " written inside one arrives as "/" and the
   * lockup reads "biscuit games/ poodl" — and a mustache holding nothing but a
   * string is a lint error besides. One expression says what the words are.
   */
  const words = $derived(product === undefined ? 'biscuit games' : `biscuit games / ${product}`);
</script>

<span class="lockup">
  <Monogram />
  <span class="words">{words}</span>
</span>

<style>
  .lockup {
    display: inline-flex;
    align-items: center;
    gap: var(--s-4);
  }

  .words {
    color: var(--text);
    font-family: var(--font-display);
    font-size: var(--fs-body);
    font-weight: 600;
    line-height: 1;
    letter-spacing: var(--track-display);
  }
</style>
