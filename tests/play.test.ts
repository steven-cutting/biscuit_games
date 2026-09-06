/*
 * `docs/specs/play-surfaces.allium` — the `Marking` contract and the surfaces
 * that fulfil it.
 *
 * jsdom holds what is present: a name, a mark attribute, a marker bar on the
 * two marks that draw one and none on the one that does not. What only a layout
 * engine can answer — that the two bars differ in length at a glance — is held
 * by the stories in real Chromium.
 */
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Key from '../src/lib/components/Key.svelte';
import Keyboard from '../src/lib/components/Keyboard.svelte';
import type { KeyboardLayout } from '../src/lib/components/layouts.js';
import Tile from '../src/lib/components/Tile.svelte';
import Explainer from '../src/lib/components/Explainer.svelte';
import ExplainerHost from './ExplainerHost.svelte';
import type { Mark } from '../src/lib/domain/types.js';

const EXACT: Mark = { name: 'exact', description: 'correct' };
const PRESENT: Mark = { name: 'present', description: 'in the word, wrong place' };
const ABSENT: Mark = { name: 'absent', description: 'not in the word' };

describe('Tile', () => {
  it('names a cell by what it carries', () => {
    render(Tile, { content: 'A' });

    expect(screen.getByRole('img', { name: 'A' })).toBeInTheDocument();
  });

  /*
   * `Empty` is the platform's word rather than a game's: a cell with nothing in
   * it is a fact about the surface, not about anybody's rules. A game that wants
   * its own passes `label`.
   */
  it('names a cell with nothing in it', () => {
    render(Tile, {});

    expect(screen.getByRole('img', { name: 'Empty' })).toBeInTheDocument();
  });

  // `AMarkIsNeverOnlyAColour`, the half a name carries: what the shape says to
  // the eye is said to a reader in the game's own words.
  it('says what a mark means in the game words, not the platform words', () => {
    render(Tile, { content: 'A', mark: EXACT });

    expect(screen.getByRole('img', { name: 'A, correct' })).toBeInTheDocument();
  });

  /*
   * `label` is where the cell is, in the game's words — "Position 3", "5 across,
   * letter 2" — and the platform never composes it, because a row of attempts
   * and a crossword grid do not describe a position the same way.
   */
  it('takes the caller sentence about where the cell is', () => {
    render(Tile, { content: 'A', mark: PRESENT, label: 'Position 3' });

    expect(
      screen.getByRole('img', { name: 'Position 3, A, in the word, wrong place' })
    ).toBeInTheDocument();
  });

  it('names an empty cell the caller has placed', () => {
    render(Tile, { label: 'Position 5' });

    expect(screen.getByRole('img', { name: 'Position 5, empty' })).toBeInTheDocument();
  });

  /*
   * `AMarkIsNeverOnlyAColour`, the half a name cannot carry. The bar is
   * `aria-hidden` decoration, so it is reached through `[data-marker]` from
   * inside the cell found by role and name — the bounded exception
   * `docs/reference/testing.md` states. jsdom holds presence; the story holds
   * that the two bars differ in length, which needs a layout engine.
   */
  it.each([
    ['exact', EXACT, true],
    ['present', PRESENT, true],
    ['absent', ABSENT, false]
  ])('draws a marker bar for %s: %s', (_name, mark: Mark, drawn: boolean) => {
    const { unmount } = render(Tile, { content: 'A', mark });
    const cell = screen.getByRole('img', { name: `A, ${mark.description}` });

    expect(cell.querySelector('[data-marker]') !== null).toBe(drawn);
    unmount();
  });

  it('draws no marker bar on a cell nothing is known about', () => {
    render(Tile, { content: 'A' });

    expect(screen.getByRole('img', { name: 'A' }).querySelector('[data-marker]')).toBeNull();
  });
});

describe('Key', () => {
  it('is a control a reader can operate, named by the caller', () => {
    render(Key, { label: 'A', content: 'A' });

    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
  });

  it('reports the press', async () => {
    const onpress = vi.fn();
    render(Key, { label: 'A', content: 'A', onpress });

    await userEvent.click(screen.getByRole('button', { name: 'A' }));

    expect(onpress).toHaveBeenCalledOnce();
  });

  it('stays silent when no handler is supplied', async () => {
    render(Key, { label: 'A', content: 'A' });

    await expect(
      userEvent.click(screen.getByRole('button', { name: 'A' }))
    ).resolves.toBeUndefined();
  });

  it('says what a mark means, as a tile does', () => {
    render(Key, { label: 'A', content: 'A', mark: EXACT });

    expect(screen.getByRole('button', { name: 'A, correct' })).toBeInTheDocument();
  });

  /*
   * A key drawn as a glyph has no text to fall back on, which is why the name is
   * required and never inferred — the same reason `IconButton`'s is.
   */
  it('names a key that draws a glyph instead of words', () => {
    const { container } = render(Key, { label: 'Enter', icon: 'corner-down-left' });

    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  /*
   * `Appearance.@guarantee AnUnavailableControlIsExempt`. The exemption is from
   * the figures alone: a key the reader can no longer operate still reports that
   * to the accessibility tree, and still keeps every non-colour indication its
   * live form carried.
   */
  it('keeps a marked key legible to a reader once the surface switches it off', async () => {
    const onpress = vi.fn();
    render(Key, { label: 'A', content: 'A', mark: PRESENT, disabled: true, onpress });
    const key = screen.getByRole('button', { name: 'A, in the word, wrong place' });

    expect(key).toBeDisabled();
    expect(key.querySelector('[data-marker]')).not.toBeNull();

    await userEvent.click(key);
    expect(onpress).not.toHaveBeenCalled();
  });
});

/*
 * A layout that is not a word game's, and the reason the layout prop exists at
 * all. `docs/explanation/quality-philosophy.md` refuses a prop nothing here
 * exercises, so the generalisation earns its keep by being rendered rather than
 * by being argued for.
 */
const RACK: KeyboardLayout = [
  [
    { value: 'r', label: 'R, 1 point' },
    { value: 'q', label: 'Q, 10 points' },
    { value: 'blank', content: ' ', label: 'Blank tile' }
  ],
  [
    { value: 'shuffle', kind: 'action', label: 'Shuffle', icon: 'dices' },
    { value: 'play', kind: 'action', label: 'Play word', icon: 'corner-down-left' }
  ]
];

describe('Keyboard', () => {
  it('draws the platform layout when the caller supplies none', () => {
    render(Keyboard, {});

    expect(screen.getAllByRole('button')).toHaveLength(28);
    expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('names the group, because a rack is not a keyboard', () => {
    render(Keyboard, { label: 'Your rack', layout: RACK });

    expect(screen.getByRole('group', { name: 'Your rack' })).toBeInTheDocument();
  });

  /*
   * `ALayoutIsSuppliedRatherThanFixed`. The component names no key: a layout it
   * has never seen renders exactly the keys that layout names and nothing else,
   * which is what a crossword's entry pad and a rack of scored tiles need.
   */
  it('draws a layout it has never seen, and nothing else', () => {
    render(Keyboard, { layout: RACK });

    expect(screen.getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Q, 10 points' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shuffle' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enter' })).not.toBeInTheDocument();
  });

  /*
   * One callback carrying the pressed key's value, rather than one named
   * callback per action. A rack needs shuffle, recall, play, pass and exchange;
   * two named callbacks cannot express five, and the game already knows its own
   * values because it wrote the layout.
   */
  it('reports the value of the key that was pressed', async () => {
    const onpress = vi.fn();
    render(Keyboard, { layout: RACK, onpress });

    await userEvent.click(screen.getByRole('button', { name: 'Shuffle' }));

    expect(onpress).toHaveBeenCalledExactlyOnceWith('shuffle');
  });

  /*
   * The marks are separate from the layout because one is a constant a game
   * declares once and the other changes every turn. Folding them together would
   * make a game rebuild its whole layout to colour one key.
   */
  it('takes the marks separately from the layout, keyed by value', () => {
    render(Keyboard, { layout: RACK, marks: { q: EXACT } });

    expect(screen.getByRole('button', { name: 'Q, 10 points, correct' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'R, 1 point' })).toBeInTheDocument();
  });

  /*
   * A key is never nameless. The label is what a key drawn as a glyph must
   * supply, and where a key draws its own words those words are already the
   * name — so the fallback runs content, then value, and a layout that says
   * nothing about naming still produces a keyboard a reader can use.
   */
  it('never leaves a key nameless', () => {
    render(Keyboard, {
      layout: [[{ value: 'q', content: 'Q' }, { value: 'wild' }]]
    });

    expect(screen.getByRole('button', { name: 'Q' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'wild' })).toBeInTheDocument();
  });

  it('can be turned off as a whole', () => {
    render(Keyboard, { layout: RACK, disabled: true });

    for (const key of screen.getAllByRole('button')) {
      expect(key).toBeDisabled();
    }
  });

  /*
   * `ALayoutIsSuppliedRatherThanFixed` closes with "a layout with no keys is not
   * a keyboard", and this is what makes that a refusal rather than a sentence.
   * The empty layout is type-valid and always will be — a game builds its rows
   * with `map` and a non-empty tuple would stop type-checking there — so the
   * component declines to draw the group instead of naming one with nothing in
   * it. Both shapes, because a layout of empty rows has no keys either.
   */
  it.each([
    ['has no rows at all', []],
    ['has rows with no keys in them', [[], []]]
  ])('draws no keyboard when the layout %s', (_what, layout: KeyboardLayout) => {
    render(Keyboard, { layout });

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

describe('Explainer', () => {
  /*
   * `Primer.@guarantee TheMarksAreShownInTheirOwnInk`: the example beside each
   * sentence is the surface's own cell, and it is hidden from assistive
   * technology because the sentence is the content — hearing "A, correct" read
   * out before "Correct — right letter, right place" would be noise.
   *
   * The sentences therefore carry the whole explanation on their own, which is
   * why each is asserted by the row it sits in.
   */
  it('gives a reader the sentences and not the examples', () => {
    render(ExplainerHost, {});

    expect(screen.getAllByRole('listitem', { name: /marker bar\.$/iu })).toHaveLength(2);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(2);
  });

  /*
   * Every part is optional and none is inferred: an explanation that is only
   * prose, or only a list, is a shape a caller is allowed to want.
   */
  it('draws only the parts it was given', () => {
    const { container, unmount } = render(Explainer, {});

    expect(container.querySelector('ul')).toBeNull();
    expect(container.textContent.trim()).toBe('');
    unmount();
  });

  /*
   * Nothing makes a game's sentences unique, and the list was keyed by them: two
   * rows explaining the same thing collided on the key and Svelte threw
   * `each_key_duplicate` rather than rendering. A sentence is content, so it is
   * not what a list is keyed by.
   */
  it('renders two rows that say the same thing', () => {
    const said = 'Correct \u2014 right letter, right place. Marker bar.';
    render(ExplainerHost, { first: said, second: said });

    expect(screen.getAllByRole('listitem', { name: said })).toHaveLength(2);
  });

  it('takes the words from whoever is explaining themselves', () => {
    render(ExplainerHost, {});

    expect(
      screen.getByText('Correct — right letter, right place. Marker bar.')
    ).toBeInTheDocument();
    expect(screen.getByText(/Guess the word/)).toBeInTheDocument();
    expect(screen.getByText(/saved in this browser/)).toBeInTheDocument();
  });
});

/*
 * `Marking.@invariant EveryMarkIsNamedInWords` closes with "a mark the game
 * supplied no words for is not a mark the platform will draw", and this is what
 * draws it. Bundling the name with the sentence makes the pair what a caller
 * passes; it does not make a wordless mark unrepresentable, because `string`
 * admits the empty one and TypeScript has no way to refuse it. Left there, a
 * blank sentence painted the cell, drew the bar, and said nothing about either
 * \u2014 the exact failure the invariant names. So the paint is asserted here and
 * not only the name: `Tile` already dropped an empty sentence out of its
 * accessible name, which is what made the mismatch silent.
 */
describe('a mark the game supplied no words for', () => {
  it.each([
    ['nothing at all', ''],
    ['only whitespace', '   ']
  ])('draws a cell given %s as an unmarked one', (_what, description) => {
    const { container } = render(Tile, {
      content: 'A',
      mark: { name: 'exact', description }
    });

    expect(container.querySelector('[data-mark]')).toBeNull();
    expect(container.querySelector('[data-marker]')).toBeNull();
    expect(screen.getByRole('img', { name: 'A' })).toBeInTheDocument();
  });

  it.each([
    ['nothing at all', ''],
    ['only whitespace', '   ']
  ])('draws a key given %s as an unmarked one', (_what, description) => {
    const { container } = render(Key, {
      label: 'A',
      content: 'A',
      mark: { name: 'present', description }
    });

    expect(container.querySelector('[data-mark]')).toBeNull();
    expect(container.querySelector('[data-marker]')).toBeNull();
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
  });

  // The mark that draws no bar of its own is the one this could have been read
  // as already holding, so it is asserted by its attribute rather than its bar.
  it('draws an absent cell with no words as an unmarked one', () => {
    const { container } = render(Tile, {
      content: 'A',
      mark: { name: 'absent', description: '' }
    });

    expect(container.querySelector('[data-mark]')).toBeNull();
  });

  // And a mark that does carry words is untouched by any of it.
  it('leaves a mark that says something alone', () => {
    const { container } = render(Tile, { content: 'A', mark: EXACT });

    expect(container.querySelector('[data-mark]')).not.toBeNull();
    expect(container.querySelector('[data-marker]')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'A, correct' })).toBeInTheDocument();
  });
});
