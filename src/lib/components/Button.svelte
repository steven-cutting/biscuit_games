<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The one button.
   *
   * Three variants and two sizes, which is what the platform's own components
   * consume; the design system's other variants are recorded, unported, in
   * `docs/how-to/port-a-design-system-component.md`. Primary is the page's ink
   * as a fill. Secondary hugs the page, which is why its border is
   * `--key-untried-rule`: under `EveryCombinationMeetsTheLegibilityFloor` a
   * control's boundary owes `minimum_boundary_contrast` against the page, and
   * `--rule-strong` does not pay it in the dark themes — `tests/contrast.test.ts`
   * measures the one hairline that does, and this is one of the two platform
   * controls that draw in it. Ghost is for the one action that is truly
   * incidental. There is deliberately no destructive variant: a consequential
   * action is a secondary button whose confirmation carries the weight, not a
   * colour.
   *
   * `current` renders `aria-current` for the selected one of a set, so the
   * control and the sentence beside it can agree about which. No `box-shadow`
   * and no transition on one: the pressed ring is `app.css`'s alone.
   *
   * `element` is bindable for the caller that must move focus by hand. A
   * control that is removed while focused leaves focus on the body, where no
   * wrapper can reach it — `Modal` says why it cannot catch that from outside —
   * so the caller that swaps a control carries focus across its own swap.
   */
  let {
    variant = 'secondary',
    size = 'sm',
    type = 'button',
    disabled = false,
    current = false,
    onclick,
    children,
    element = $bindable()
  }: {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md';
    type?: 'button' | 'submit';
    disabled?: boolean;
    current?: boolean;
    onclick?: () => void;
    children: Snippet;
    element?: HTMLButtonElement;
  } = $props();
</script>

<button
  {type}
  {disabled}
  class={variant}
  class:md={size === 'md'}
  aria-current={current ? 'true' : undefined}
  bind:this={element}
  onclick={() => onclick?.()}
>
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-4);
    padding: 0 var(--s-5);
    border: var(--rule-w) solid transparent;
    border-radius: var(--radius-card);
    font: inherit;
    font-size: var(--fs-small);
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease),
      border-color var(--dur-1) var(--ease);
  }

  /*
   * 48px is a literal on purpose. It matches `--s-11` by value and not by
   * meaning: that is the spacing scale, and a control's height is not a gap.
   * Naming the token here would move the button when the scale moved for a
   * reason of its own.
   */
  .md {
    min-block-size: 48px;
    padding: 0 var(--s-7);
    font-size: var(--fs-body);
  }

  .primary {
    border-color: var(--text);
    background: var(--text);
    color: var(--text-inverse);
  }

  /*
   * The hover ground is `--text-2` rather than the design system's fixed
   * neutral, because the fill has to stay darker than its ink in light and
   * lighter in dark — a theme decides which end of the range the ink came
   * from, and `--text-2` moves with it.
   */
  .primary:hover:not(:disabled) {
    border-color: var(--text-2);
    background: var(--text-2);
  }

  .secondary {
    border-color: var(--key-untried-rule);
    background: transparent;
    color: var(--text);
  }

  .secondary:hover:not(:disabled) {
    background: var(--surface-hover);
  }

  .ghost {
    background: transparent;
    color: var(--text-2);
  }

  .ghost:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--text);
  }

  button[aria-current='true'] {
    border-color: var(--text);
    font-weight: 600;
  }

  /*
   * `AnUnavailableControlIsExempt`: the dim is held to no ratio, the state is
   * carried by the `disabled` attribute the browser reports, and the words
   * stay — nothing here is colour alone.
   */
  button:disabled {
    border-color: var(--rule);
    background: transparent;
    color: var(--text-disabled);
    cursor: not-allowed;
  }
</style>
