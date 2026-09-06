<script lang="ts">
  import type { MarkName } from '../domain/types.js';

  /**
   * The non-colour indication, once.
   *
   * `Marking.@invariant AMarkIsNeverOnlyAColour` asks marks that sit side by
   * side to be distinguishable from each other and not merely from the page, so
   * exact fills most of a cell's bottom edge, present shows a centred fraction
   * of it, and absent shows none at all — bar, shorter bar, and no bar. This is
   * one component rather than a rule in each caller's scoped styles because two
   * copies is exactly how the figures drifted apart before: a tile drew 62% and
   * 22% at 3px, a key drew 56% and 20% at 2px, and nothing held the two equal.
   *
   * Not exported from the package. The bar is the platform's to change, the same
   * way the icon map is.
   */
  let { name }: { name: MarkName } = $props();
</script>

{#if name !== 'absent'}
  <span class="marker" class:short={name === 'present'} data-marker aria-hidden="true"></span>
{/if}

<style>
  /*
   * The widths only have to differ at a glance; the exact figures are the design
   * system's. 4px coincides with `--s-2` and 1px with `--rule-w`, by value and
   * not by meaning — the spacing scale is a gap between things and `--rule-w` is
   * a border, and this is neither.
   *
   * Centred by its own inset and transform rather than by its parent, because a
   * tile is a grid and a key is not, and one bar centred two ways is the other
   * half of how the two drifted.
   *
   * Drawn in `currentColor`, so it is always the same ink as the glyph and the
   * border, and right in every palette without naming one.
   */
  .marker {
    position: absolute;
    inset-block-end: 4px;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    inline-size: 62%;
    block-size: 3px;
    border-radius: 1px;
    background: currentColor;
  }

  .short {
    inline-size: 22%;
  }
</style>
