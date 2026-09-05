<script lang="ts">
  /**
   * The live region.
   *
   * For what has to be said and not shown: a game's board already shows its
   * marks and a dialog already shows its conclusion, so the sentence that
   * reports either is visually hidden and read aloud. The declarations are
   * `app.css`'s `.visually-hidden`, which is the one rule in the stylesheet
   * this component depends on by name — a consumer that did not load the
   * stylesheet would see the sentence.
   *
   * The `{#key}` is what makes a repeat heard. A live region reacts to its text
   * changing, so the same sentence twice would be announced once; keying on the
   * sequence a caller advances replaces the node instead.
   */
  let { message = null, sequence = 0 }: { message?: string | null; sequence?: number } = $props();
</script>

<p class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
  {#key sequence}{message ?? ''}{/key}
</p>

<style>
  p {
    margin: 0;
  }
</style>
