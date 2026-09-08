<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The small uppercase label that names a group.
   *
   * `docs/design/tokens.md` states where the platform spends uppercase, and this
   * is the label that rule is named after. The list of places lives there and
   * not here: the copy this comment used to carry was already missing
   * `HeaderBar`'s chip. A second copy of a rule goes stale, and this one had.
   *
   * It is a level-two heading rather than the reference's plain `div`, because
   * what it does is label a section and the hub's front door was already drawing
   * it as one. The cost is stated rather than hidden: a consumer needing another
   * level cannot reach one, and gets a heading at level two or writes its own.
   * A `level` prop nothing here passes would be a branch with nothing to cover
   * it, which is the rule that decided it.
   */
  let { children }: { children: Snippet } = $props();
</script>

<h2>{@render children()}</h2>

<style>
  h2 {
    margin: 0;
    color: var(--text-3);
    font-family: var(--font-ui);
    font-size: var(--fs-mono-label);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
  }
</style>
