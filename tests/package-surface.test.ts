import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import * as surface from '../src/lib/index.js';

/*
 * The published surface, tested from a consumer's point of view.
 *
 * `tests/wordmark.test.ts` imports the component directly and keeps doing so:
 * a component test that failed for a barrel reason would name the wrong defect.
 * So nothing else here loads `src/lib/index.ts`, and an export-only module
 * inside the coverage glob that no test loads is reported at zero and sinks the
 * run — that is invariant 7. Importing it above is what covers it.
 *
 * The assertions are what make the coverage honest rather than incidental. The
 * defect a barrel invites is a component added under `src/lib/components/` and
 * never re-exported: it has a test, it has a story, every gate here is green,
 * and no game can import it.
 */
describe('the package surface', () => {
  it('exports Wordmark by name', () => {
    expect(surface.Wordmark).toBeDefined();
  });

  it('exports components a consumer can render', () => {
    render(surface.Wordmark, {});

    expect(screen.getByText(/biscuit/)).toHaveTextContent(/^biscuit games$/);
  });
});
