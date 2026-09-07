<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A thin-ruled panel that groups what is inside it.
   *
   * Cards are rules rather than shadows, which is the design direction's whole
   * position on elevation: a hairline and a small radius, and nothing floating.
   * A card is not a control, so its edge is `--rule` — the decorative weight the
   * porting guide forbids on anything the reader can operate, and the right one
   * here for exactly that reason.
   *
   * Three tones and no fourth: `surface` and `raised` are the two grounds
   * `app.css` names, and `flat` is the same panel with the ground left to
   * whatever is behind it. They are not always three — `--surface` and
   * `--surface-raised` resolve to the same colour in both light palettes and
   * diverge only in dark, so `raised` buys nothing in light. That is the
   * palette's decision rather than this component's, and it is stated here
   * because a caller reaching for `raised` to separate two panels in light will
   * get nothing and has no other way to find out.
   *
   * There is deliberately no `lift` and no `pad`, both of which the design system
   * offers. A lift would need a shadow scale this repository does not have and
   * has argued against having; a `pad` taking a CSS string would be an escape
   * hatch out of the spacing scale, and the component contract forbids the
   * `...rest` spreading that made one look reasonable.
   */
  let {
    tone = 'surface',
    children
  }: {
    tone?: 'surface' | 'raised' | 'flat';
    children: Snippet;
  } = $props();
</script>

<div class={tone}>{@render children()}</div>

<style>
  div {
    border: var(--rule-w) solid var(--rule);
    border-radius: var(--radius-card);
    padding: var(--s-6);
    color: var(--text);
  }

  .surface {
    background: var(--surface);
  }

  .raised {
    background: var(--surface-raised);
  }

  .flat {
    background: transparent;
  }
</style>
