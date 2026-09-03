import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Wordmark from '../src/lib/components/Wordmark.svelte';

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
});
