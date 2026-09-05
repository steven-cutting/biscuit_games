<script lang="ts">
  import type { Snippet } from 'svelte';

  import Icon from './Icon.svelte';
  import IconButton from './IconButton.svelte';
  import Wordmark from './Wordmark.svelte';
  import type { IconName } from './icons.js';

  /**
   * The platform chrome: the brand lockup, an optional chip and the actions.
   *
   * The lockup is the page's `h1`, and by default it is the platform's own
   * `Wordmark`. A game passes its lockup as `brand` — the platform's words and
   * then its own — so the heading names what the page is.
   *
   * The chip is a product's one stateful control in the chrome. Its visible
   * `word` is state readable as text rather than signalled only by which
   * control looks selected; its `label` adds what pressing it does; `popup`
   * says what opens. It is optional because the hub has no state to put there.
   * The actions are named controls, an `IconButton` each, in the order given,
   * and the divider between the chip and the actions is drawn only when there
   * is something on both sides of it.
   *
   * Below ~26rem the lockup gives up its words and the divider goes: 44px
   * targets, a chip and the mark have to share a phone's width, and the
   * collapse is designed rather than discovered. The width story holds the
   * arithmetic. The collapse reaches into `brand` for an element of class
   * `words`, which is the one contract a `brand` snippet meets to collapse the
   * way `Wordmark` does; a snippet without one simply keeps its words.
   */
  let {
    brand,
    chip = null,
    actions = []
  }: {
    brand?: Snippet;
    chip?: { word: string; label: string; onclick: () => void; popup?: 'dialog' } | null;
    actions?: readonly { icon: IconName; label: string; onclick: () => void; popup?: 'dialog' }[];
  } = $props();
</script>

<header>
  <h1 class="brand">
    {#if brand !== undefined}
      {@render brand()}
    {:else}
      <Wordmark />
    {/if}
  </h1>
  <div class="controls">
    {#if chip !== null}
      <button
        type="button"
        class="chip"
        aria-haspopup={chip.popup}
        aria-label={chip.label}
        onclick={chip.onclick}
      >
        <span>{chip.word}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {#if actions.length > 0}
        <span class="divider" aria-hidden="true"></span>
      {/if}
    {/if}
    {#each actions as action (action.label)}
      <IconButton
        icon={action.icon}
        label={action.label}
        popup={action.popup}
        onclick={action.onclick}
      />
    {/each}
  </div>
</header>

<style>
  /*
   * 56px matches no token. It is the row height that keeps 44px controls
   * clear of the rule below them with the page's own breathing room, and it
   * goes with the controls rather than with the spacing scale.
   */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-5);
    flex-wrap: wrap;
    min-block-size: 56px;
    border-block-end: var(--rule-w) solid var(--rule);
  }

  h1 {
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }

  /*
   * The chip hugs the page the way `Button`'s secondary does, and for the same
   * reason draws its boundary in `--key-untried-rule`: it is the other of the
   * two platform controls `tests/contrast.test.ts` holds to the boundary floor.
   */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    padding: 0 var(--s-4);
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
    background: transparent;
    color: var(--text-2);
    font: inherit;
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
  }

  .chip:hover {
    background: var(--surface-hover);
    color: var(--text);
  }

  /*
   * 20px is a literal on purpose. It matches `--s-7` by value and not by
   * meaning: a hairline's height is not a gap, and it goes with the chip it
   * stands beside.
   */
  .divider {
    inline-size: var(--rule-w);
    block-size: 20px;
    margin-inline: var(--s-2);
    background: var(--rule);
  }

  @media (max-width: 26rem) {
    header {
      gap: var(--s-3);
    }

    /*
     * Out of the layout, not out of the accessibility tree: the mark beside
     * these words is aria-hidden, so `display: none` here would leave the
     * page's only h1 with an empty accessible name. The declarations are
     * `app.css`'s `.visually-hidden`, and `.words` is `Wordmark`'s class —
     * the reach-in the component comment above names.
     */
    .brand :global(.words) {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .divider {
      display: none;
    }

    .controls {
      gap: 0;
    }
  }
</style>
