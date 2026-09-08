<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * One setting's line in a sheet of them.
   *
   * All this draws is the rule between one setting and the next, and the room
   * around it. That is less than the design system's row, which also carries the
   * setting's name and its line of consequence, and the difference is the whole
   * of what decision 0017 decided here: the row has to *be* the label for the
   * whole of it to be the 44px target, and only the control knows which element
   * that is — a `<label>` for a switch, a `<legend>` for a group of choices. A
   * row that named the control from outside would leave the name unbound, which
   * is exactly what `AFieldIsNamedByALabelBoundToIt` refuses.
   *
   * So each control carries its own `label` and `description`, and this is the
   * separator they sit between. There is deliberately no `last` prop: the rule
   * belongs to every row but the final one, and `:last-child` knows which that
   * is without being told.
   */
  let { children }: { children: Snippet } = $props();
</script>

<div class="row">{@render children()}</div>

<style>
  .row {
    display: flex;
    align-items: center;
    padding-block: var(--s-5);
    border-block-end: var(--rule-w) solid var(--rule);
  }

  .row:last-child {
    border-block-end: 0;
  }
</style>
