<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The small uppercase label that names a group.
   *
   * Uppercase is the platform's one decorative typographic device and it is
   * spent on micro-labels — this, a `Badge`, a `GameCard`'s meta line — and
   * nowhere else: everything else is sentence case, and a sentence is never
   * uppercased. `docs/design/tokens.md` states that rule; this is the label the
   * rule is named after.
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
