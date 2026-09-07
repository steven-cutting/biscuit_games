import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Monogram from '../src/lib/components/Monogram.svelte';
import Wordmark from '../src/lib/components/Wordmark.svelte';

/*
 * The brand lockup and the mark it contains. One file because they are one
 * shape: `Wordmark` renders `Monogram`, and the figures below were `Wordmark`'s
 * own literals until decision 0017 pulled the mark out from under them.
 */

/* The mark has no role by default, so it is found by the one glyph it draws. */
function monogram(): HTMLElement {
  return screen.getByText('b');
}

describe('Monogram', () => {
  /*
   * The default, and the one `Wordmark` depends on. A mark with a voice would
   * put a stray "b" in front of the lockup's accessible text, which is the whole
   * reason the mark was `aria-hidden` while it lived inside `Wordmark`.
   */
  it('is silent unless it is given a name', () => {
    render(Monogram, {});

    expect(monogram()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('is a named image when it stands on its own', () => {
    render(Monogram, { label: 'Biscuit Games' });

    expect(screen.getByRole('img', { name: 'Biscuit Games' })).toBeInTheDocument();
    expect(monogram()).not.toHaveAttribute('aria-hidden');
  });

  /*
   * The extraction's whole risk. These four figures were written into
   * `Wordmark` as literals — 20px, a `2px 2px 8px 2px` radius, a 12px glyph and
   * a 1px nudge — and the design system derives them from the box. The two
   * agree at 20 and this pins that they do, so the port is a refactor rather
   * than a redraw. Asserted through the custom properties because jsdom has no
   * layout engine and the scoped rule that reads them resolves to nothing.
   */
  it('draws the figures Wordmark drew, at the size Wordmark asks for', () => {
    render(Monogram, {});
    const style = monogram().style;

    expect(style.getPropertyValue('--monogram-size')).toBe('20px');
    expect(style.getPropertyValue('--monogram-corner')).toBe('8px');
    expect(style.getPropertyValue('--monogram-glyph')).toBe('12px');
    expect(style.getPropertyValue('--monogram-nudge')).toBe('1px');
  });

  it('scales all four figures together', () => {
    render(Monogram, { size: 42 });
    const style = monogram().style;

    expect(style.getPropertyValue('--monogram-size')).toBe('42px');
    expect(style.getPropertyValue('--monogram-corner')).toBe('18px');
    expect(style.getPropertyValue('--monogram-glyph')).toBe('26px');
    expect(style.getPropertyValue('--monogram-nudge')).toBe('2px');
  });
});

describe('Wordmark', () => {
  it('reads as the platform lockup, with the mark silent', () => {
    render(Wordmark, {});

    // Two assertions because neither holds the claim alone. Testing Library
    // matches an element's own text nodes, so `/biscuit/` finds the words
    // whether or not the mark beside them is hidden — the anchors catch the
    // words gaining text, not the mark gaining a voice. The mark is therefore
    // asserted directly, and without this line an unhidden "b" passes.
    expect(screen.getByText('b')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(/biscuit/)).toHaveTextContent(/^biscuit games$/);
  });

  /*
   * The platform first, then the game. A game installing the package could not
   * render this at all before decision 0017 and had to rebuild the lockup to
   * match, which is the cost that record names. The separator is part of the
   * words rather than beside them, so it collapses with them under
   * `HeaderBar`'s 26rem rule instead of being left behind on its own.
   */
  it('names a game after the platform when one is given', () => {
    render(Wordmark, { product: 'poodl' });

    expect(screen.getByText(/biscuit/)).toHaveTextContent(/^biscuit games \/ poodl$/);
  });

  it('keeps the mark silent when it names a game too', () => {
    render(Wordmark, { product: 'poodl' });

    expect(screen.getByText('b')).toHaveAttribute('aria-hidden', 'true');
  });
});
