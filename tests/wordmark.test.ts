import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Wordmark from '../src/lib/components/Wordmark.svelte';

describe('Wordmark', () => {
  it('reads as the platform lockup, with the mark silent', () => {
    render(Wordmark, {});

    // The mark's "b" is aria-hidden, so the words are the whole accessible
    // text. The anchors are the assertion: a leading "b" would fail them.
    expect(screen.getByText(/biscuit/)).toHaveTextContent(/^biscuit games$/);
  });
});
