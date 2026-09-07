<script lang="ts">
  /**
   * The brand's reduced mark: the initial in a ruled square.
   *
   * The fourth corner is the one soft break — `docs/design/direction.md`'s
   * "perfect, broken once" — and the whole thing is set in type until an
   * illustrator draws the real one. It lived inside `Wordmark` as four literals
   * until decision 0017 pulled it out, and the ratios below reproduce those
   * literals exactly at the size `Wordmark` asks for, so the extraction is a
   * refactor rather than a redraw. `tests/brand.test.ts` pins that.
   *
   * Silent by default, because its first caller is a lockup whose words are the
   * whole accessible text and a mark with a voice would put a stray "b" in front
   * of them. A caller drawing the mark alone gives it a `label` and gets a named
   * image. Those are the only two shapes; there is deliberately no third where
   * it is both hidden and named, because that is a mark nobody can find and
   * everybody's screen reader announces.
   *
   * There is deliberately no `warm` tone, which the design system offers. The
   * warm family is rationed to `::selection`, and `--brand-warm` stands about
   * 2.1 off the light page against a text floor of 4.5 — so a warm mark could
   * not be measured and could not pass. `Button`'s warm variant was left for the
   * first reason; this one is left for both.
   *
   * The geometry is computed here rather than in `calc()`. The corner is 42% of
   * the box, which is 8.4px at the default size where the literal it replaces
   * was 8px, and a rounding difference is exactly the drift an extraction must
   * not introduce.
   */

  /*
   * Ratios rather than tokens, because none of these figures is a token by
   * meaning: they are proportions of a placeholder glyph's box, and they travel
   * with the glyph. The 2px corners below are the same kind of figure — 2px
   * coincides with `--s-1` by value and not by meaning, that being the spacing
   * scale, and naming it would move the mark whenever the scale moved.
   */
  const CORNER = 0.42;
  const GLYPH = 0.62;
  const NUDGE = 0.04;

  let { size = 20, label }: { size?: number; label?: string } = $props();

  const box = $derived(`${String(size)}px`);
  const corner = $derived(`${String(Math.round(size * CORNER))}px`);
  const glyph = $derived(`${String(Math.round(size * GLYPH))}px`);
  const nudge = $derived(`${String(Math.round(size * NUDGE))}px`);
</script>

<span
  class="monogram"
  role={label === undefined ? undefined : 'img'}
  aria-label={label}
  aria-hidden={label === undefined ? 'true' : undefined}
  style:--monogram-size={box}
  style:--monogram-corner={corner}
  style:--monogram-glyph={glyph}
  style:--monogram-nudge={nudge}>b</span
>

<style>
  .monogram {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--monogram-size);
    block-size: var(--monogram-size);
    padding-block-end: var(--monogram-nudge);
    border: var(--rule-w-strong) solid var(--text);
    /* Three machined corners, one animal one. */
    border-radius: 2px 2px var(--monogram-corner) 2px;
    color: var(--text);
    font-family: var(--font-display);
    font-size: var(--monogram-glyph);
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.04em;
  }
</style>
