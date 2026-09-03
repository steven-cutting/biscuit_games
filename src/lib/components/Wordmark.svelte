<script lang="ts">
  /**
   * The brand lockup: the placeholder mark and the words, together.
   *
   * The mark is the brand initial in a ruled square whose fourth corner is the
   * one soft break — `docs/design/direction.md`'s "perfect, broken once" — set
   * in type until an illustrator draws the real one. It is `aria-hidden`, so
   * the accessible text of the lockup is exactly "biscuit games" with no stray
   * "b" in front of it.
   *
   * It takes no props. A game's own lockup adds its name after the platform's;
   * this one is the platform's alone, and a prop for a name nothing here has
   * would be a branch with nothing to cover it.
   */
</script>

<span class="lockup">
  <span class="mark" aria-hidden="true">b</span>
  <span class="words">biscuit games</span>
</span>

<style>
  .lockup {
    display: inline-flex;
    align-items: center;
    gap: var(--s-4);
  }

  /*
   * The box is in pixels on purpose, against the usual rule. 20px, 12px and the
   * 1px nudge each match a token by value — `--s-7`, `--s-5`, `--rule-w` — and
   * none of them by meaning: two are the spacing scale and one is a rule weight,
   * so naming them here would tie the brand mark's geometry to scales that move
   * for unrelated reasons. The radii match no token at all. This is placeholder
   * geometry for a placeholder glyph and it goes with the glyph.
   */
  .mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 20px;
    block-size: 20px;
    padding-block-end: 1px;
    border: var(--rule-w-strong) solid var(--text);
    /* Three machined corners, one animal one. */
    border-radius: 2px 2px 8px 2px;
    color: var(--text);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .words {
    color: var(--text);
    font-family: var(--font-display);
    font-size: var(--fs-body);
    font-weight: 600;
    line-height: 1;
    letter-spacing: var(--track-display);
  }
</style>
