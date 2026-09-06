<script lang="ts">
  import Icon from './Icon.svelte';
  import type { IconName } from './icons.js';

  /**
   * A square 44px chrome control: a header action, a dialog's Close.
   *
   * Ghost by design — the glyph is the affordance — and one variant, because
   * that is all the platform's own chrome consumes; the design system's
   * outline variant is recorded, unported, in
   * `docs/how-to/port-a-design-system-component.md`. The accessible name is
   * required, never inferred: these are exactly the controls a shape alone
   * would leave unnamed, and `AppearanceNeverCarriesMeaningAlone` asks for the
   * word beside the glyph.
   *
   * Sets no `box-shadow`, so the pressed ring `app.css` draws on every control
   * arrives untouched.
   */
  let {
    label,
    icon,
    onclick,
    disabled = false,
    popup
  }: {
    label: string;
    icon: IconName;
    onclick?: () => void;
    disabled?: boolean;
    /** What pressing this opens, when it opens something — rendered as `aria-haspopup`. */
    popup?: 'dialog';
  } = $props();
</script>

<button
  type="button"
  aria-label={label}
  aria-haspopup={popup}
  {disabled}
  onclick={() => onclick?.()}
>
  <Icon name={icon} />
</button>

<style>
  /*
   * 44px matches no token, and is not meant to: it is
   * `operation.allium`'s `config.minimum_touch_target`, mirrored in
   * `src/lib/config.ts` and measured by the story both ways. Only the width is set here. The height is `app.css`'s, whose shared
   * rule gives every button that same minimum, so the two figures agree by
   * being the same figure and the control comes out square.
   */
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 44px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-card);
    background: transparent;
    color: var(--text-2);
    font: inherit;
    cursor: pointer;
    transition:
      background-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease);
  }

  button:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--text);
  }

  /* `AnUnavailableControlIsExempt`, as `Button` spends it. */
  button:disabled {
    color: var(--text-disabled);
    cursor: not-allowed;
  }
</style>
