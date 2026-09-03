<script lang="ts">
  import '../app.css';

  /*
   * Only the stylesheet lives here. It is the platform's token file, and
   * importing it once at the root is what puts every route inside the same
   * palette; see docs/design/tokens.md.
   */
  let { children }: { children?: import('svelte').Snippet } = $props();
</script>

{@render children?.()}
