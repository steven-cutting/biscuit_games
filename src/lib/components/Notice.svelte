<script lang="ts">
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';

  /**
   * What the product is telling the reader right now, where the reader is
   * looking.
   *
   * Visible text with `role="status"`: the sentence itself is the announcement,
   * so a message here is perceivable both by eye and to assistive technology
   * without being duplicated into `Announcer` and heard twice. A product
   * decides what its sentences are and passes one as `message`; the component
   * knows nothing about why it was said.
   *
   * The region is mounted whether or not there is anything to say, and only its
   * contents come and go. A live region is heard when the text inside it
   * changes; one that arrives already carrying its text has not changed, and is
   * not reliably announced at all. Empty it is a paragraph with nothing in it.
   *
   * `tone` picks the glyph beside the sentence, never instead of it — the
   * meaning is the words, which is `AppearanceNeverCarriesMeaningAlone` — and
   * `alert` is the default because most of what a product interrupts a reader
   * to say is a refusal. `success` is the one kind that earns the tick.
   *
   * One known cost of keying the whole block, carried across from Poodl
   * unchanged rather than decided again here: `Dismiss` is inside the key, so
   * advancing `sequence` for a message already on screen destroys and rebuilds
   * that button. A reader who had tabbed to it loses focus to the body, and the
   * repeat is announced with the button's own word after it. Lifting the button
   * out of the key fixes both, and it changes what a screen reader hears on a
   * repeat, so it is a product decision rather than a tidy-up — it belongs to
   * whoever owns the first surface that dismisses a repeated notice.
   */
  let {
    message = null,
    tone = 'alert',
    sequence = 0,
    ondismiss
  }: {
    message?: string | null;
    tone?: 'alert' | 'success';
    sequence?: number;
    ondismiss?: () => void;
  } = $props();

  const icon = $derived(tone === 'success' ? 'check' : 'circle-alert');
</script>

<p class="notice" class:silent={message === null} role="status">
  {#if message !== null}
    <!--
      Keyed so a repeat is heard. The same sentence twice would leave the text
      unchanged, and a live region reacts to nothing else; replacing the nodes
      is what makes the second one announce as well as the first.
    -->
    {#key sequence}
      <Icon name={icon} size={16} />
      <span>{message}</span>
      {#if ondismiss !== undefined}
        <Button variant="ghost" onclick={ondismiss}>Dismiss</Button>
      {/if}
    {/key}
  {/if}
</p>

<style>
  /*
   * 40px is a literal on purpose. It matches `--s-10` by value and not by
   * meaning: that is the spacing scale, and the height of a row of text is not
   * a gap. The figure is what keeps a one-line notice from jumping when a
   * Dismiss button arrives beside the sentence.
   */
  .notice {
    display: flex;
    gap: var(--s-4);
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-block: var(--s-6);
    padding: var(--s-2) var(--s-5);
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
    background: var(--surface-raised);
    min-block-size: 40px;
    font-size: var(--fs-small);
    text-align: center;
  }

  /* Present for the sake of being heard, and taking up nothing while silent. */
  .silent {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    min-block-size: 0;
  }
</style>
