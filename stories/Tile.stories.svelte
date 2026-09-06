<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Tile from '../src/lib/components/Tile.svelte';

  const EXACT = { name: 'exact', description: 'correct' } as const;
  const PRESENT = { name: 'present', description: 'in the word, wrong place' } as const;
  const ABSENT = { name: 'absent', description: 'not in the word' } as const;

  const OVERVIEW = [
    'One cell of a play surface that is read rather than pressed: a board cell, a rack slot on',
    'show, a revealed answer. The pressable form of the same paint is `Key`.',
    '',
    'Governed by `PlaySurface` in `docs/specs/play-surfaces.allium`, and by the `Marking`',
    'contract it fulfils.',
    '',
    '- `@invariant AMarkIsNeverOnlyAColour`. The three marks are told apart as bar, shorter bar',
    '  and no bar, which is what **Every mark side by side** measures — and it measures it here',
    '  rather than in `tests/` because only a layout engine can compare two widths.',
    '- `@invariant EveryMarkIsNamedInWords`. A mark arrives with the game’s own sentence for it',
    '  and cannot arrive without one; the name is what a reader hears.',
    '- `@guarantee ACellReadsAsOneThing`. The glyph and the bar are both hidden, and the',
    '  accessible name carries the whole of it.',
    '',
    'The content is drawn exactly as given — a digit, a symbol or a blank, never uppercased,',
    'because `text-transform` would rewrite “ß” to “SS” and disagree with the name beside it.',
    'The cell is a fixed 3rem square set in `--fs-board`, which fits one glyph of the board face.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Play/Tile',
    component: Tile,
    tags: ['autodocs'],
    args: { content: 'A' },
    argTypes: {
      content: { control: 'text', description: 'What the cell shows. Any character, or none.' },
      mark: { control: false, description: 'A mark and the game’s words for it, together.' },
      label: { control: 'text', description: 'Where the cell is, in the game’s words.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- A cell nothing has been put in. It hugs the page: the faintest rule on it. -->
<Story name="Empty" args={{ content: '' }} />

<!-- Content, and nothing known about it yet. The rule thickens and no more. -->
<Story name="Filled, unmarked" />

<Story name="Exact" args={{ mark: EXACT }} />
<Story name="Present" args={{ mark: PRESENT }} />
<Story name="Absent" args={{ mark: ABSENT }} />

<!--
  Content that is not a letter, which is the whole reason `content` is a string
  rather than a character: a number game, a crossword and a rack all need one.
-->
<Story name="A digit, a symbol and a blank" asChild>
  <div style="display: flex; gap: var(--gap-tile)">
    <Tile content="7" label="Row 1, column 3" />
    <Tile content="?" label="Row 1, column 4" />
    <Tile content="" label="Blank tile" />
  </div>
</Story>

<!--
  The non-colour indication, measured. `AMarkIsNeverOnlyAColour` asks the marks
  to differ from each other and not merely from the page, so the two bars are
  compared to each other rather than to a figure.
-->
<Story
  name="Every mark side by side"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = (name: string) =>
      canvas.getByRole('img', { name }).querySelector('[data-marker]')?.getBoundingClientRect();

    const wide = bar('C, correct');
    const short = bar('R, in the word, wrong place');

    if (wide === undefined || short === undefined) {
      throw new Error('A mark that should carry a bar drew none');
    }
    await expect(wide.width).toBeGreaterThan(short.width * 2);
    await expect(
      canvas.getByRole('img', { name: 'N, not in the word' }).querySelector('[data-marker]')
    ).toBeNull();
  }}
>
  <div style="display: flex; gap: var(--gap-tile)">
    <Tile content="C" mark={EXACT} />
    <Tile content="R" mark={PRESENT} />
    <Tile content="N" mark={ABSENT} />
  </div>
</Story>

<!--
  The same three in the palette where the look inverts. The bars are unchanged,
  which is the point: the indication is a shape and does not depend on the hue.
-->
<Story
  name="Every mark side by side, high contrast"
  asChild
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
    await expect(
      canvas.getByRole('img', { name: 'C, correct' }).querySelector('[data-marker]')
    ).not.toBeNull();
    await expect(
      canvas.getByRole('img', { name: 'N, not in the word' }).querySelector('[data-marker]')
    ).toBeNull();
  }}
>
  <div style="display: flex; gap: var(--gap-tile)">
    <Tile content="C" mark={EXACT} />
    <Tile content="R" mark={PRESENT} />
    <Tile content="N" mark={ABSENT} />
  </div>
</Story>

<Story
  name="Dark theme"
  args={{ mark: EXACT }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
