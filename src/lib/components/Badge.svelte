<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * A small rule-drawn label carrying a word.
   *
   * The word is the meaning and the ink is the second telling, never the first —
   * `Appearance.@guarantee AppearanceNeverCarriesMeaningAlone` admits no
   * exemption, so there is no tone here that says anything a reader cannot also
   * read.
   *
   * Two tones. The design system offers five, and the other three are refused
   * rather than postponed. `exact` and `present` are a play surface's marks, and
   * a badge is not a play cell: drawing one in a result ink would say a mark
   * where no cell was marked. `warm` fails twice — the warm family is rationed
   * to `::selection`, and `--brand-warm` stands about 2.1 off the light page
   * against a text floor of 4.5, so warm words could not be measured and could
   * not pass.
   *
   * Not a control, so `--rule-strong` and `--text-3` are legal as its edge.
   */
  let {
    tone = 'neutral',
    children
  }: {
    tone?: 'neutral' | 'strong';
    children: Snippet;
  } = $props();
</script>

<span class={tone}>{@render children()}</span>

<style>
  /*
   * 22px is a literal on purpose. It matches no token at all — the spacing scale
   * steps 20 to 24 straight past it — and it is not a spacing figure anyway: it
   * is the height of a word set at `--fs-micro` with a rule around it, sized to
   * sit on the same baseline as the text beside it. The 2px radius is the same
   * kind of figure, coinciding with `--s-1` by value and not by meaning.
   */
  span {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    block-size: 22px;
    padding: 0 var(--s-3);
    border: var(--rule-w) solid;
    border-radius: 2px;
    font-family: var(--font-ui);
    font-size: var(--fs-micro);
    font-weight: 500;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
  }

  .neutral {
    border-color: var(--rule-strong);
    color: var(--text-2);
  }

  .strong {
    border-color: var(--text-3);
    color: var(--text);
  }
</style>
