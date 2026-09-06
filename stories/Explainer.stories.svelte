<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Explainer from '../src/lib/components/Explainer.svelte';
  import Modal from '../src/lib/components/Modal.svelte';
  import Tile from '../src/lib/components/Tile.svelte';

  const EXACT = { name: 'exact', description: 'correct' } as const;
  const PRESENT = { name: 'present', description: 'in the word, wrong place' } as const;
  const ABSENT = { name: 'absent', description: 'not in the word' } as const;

  const OVERVIEW = [
    'How something works, shown beside what it means: opening prose, a list pairing a live',
    'example with the sentence that explains it, and a quiet closing note.',
    '',
    'Governed by `Primer` in `docs/specs/play-surfaces.allium`.',
    '',
    '- `@guarantee TheMarksAreShownInTheirOwnInk`. Each example is the surface’s own component',
    '  wearing the mark it explains, in every theme and both palettes — not a picture of one.',
    '  An explanation drawn separately can come to disagree with the surface it describes.',
    '- `@guarantee TheWordsAreTheGamesAndTheFrameIsThePlatforms`. Every sentence below is one',
    '  game’s, passed in. The component supplies the shape and never a sentence.',
    '- `@guarantee TheExplanationIsReachableAgain`. Where it is reached as a dialog it owes',
    '  everything `operation.allium`’s `Dialog` states, which `Modal` carries — so there is no',
    '  panel component here, only the two composed at a call site.',
    '',
    'The examples are hidden from assistive technology: the sentence beside one is the whole of',
    'the content, and the cell’s own name read out first would be noise. That leaves the',
    'sentences carrying the explanation alone, which is why each row is named by its own.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Play/Explainer',
    component: Explainer,
    tags: ['autodocs'],
    argTypes: {
      rows: { control: false, description: 'An example and the sentence that explains it.' },
      children: { control: false, description: 'The opening prose.' },
      footnote: { control: false, description: 'The quiet sentence under the list.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

{#snippet exact()}
  <Tile content="C" mark={EXACT} />
{/snippet}
{#snippet present()}
  <Tile content="R" mark={PRESENT} />
{/snippet}
{#snippet absent()}
  <Tile content="N" mark={ABSENT} />
{/snippet}

<Story
  name="A surface explained"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    // The examples are silent; the sentences are the content.
    await expect(canvas.queryAllByRole('img')).toHaveLength(0);
    await expect(canvas.getAllByRole('img', { hidden: true })).toHaveLength(3);
  }}
>
  <div style="inline-size: min(26rem, 100%)">
    <Explainer
      rows={[
        { show: exact, says: 'Correct — right letter, right place. Marker bar.' },
        { show: present, says: 'Present — right letter, wrong place. Shorter marker bar.' },
        { show: absent, says: 'Absent — not in the word. No marker bar.' }
      ]}
    >
      <p style="margin: 0">Guess the word in six attempts.</p>
      {#snippet footnote()}
        <p style="margin: 0">Your statistics are saved in this browser.</p>
      {/snippet}
    </Explainer>
  </div>
</Story>

<!-- Only prose, which is a shape a caller is allowed to want. -->
<Story name="Without a list" asChild>
  <div style="inline-size: min(26rem, 100%)">
    <Explainer>
      <p style="margin: 0">One word a day, and everybody gets the same one.</p>
    </Explainer>
  </div>
</Story>

<!-- The dialog a game composes rather than a panel this package ships. -->
<Story
  name="Inside a dialog"
  asChild
  parameters={{ docs: { story: { inline: false } } }}
  play={async ({ canvasElement }) => {
    const dialog = within(canvasElement).getByRole('dialog', { name: 'How to play' });

    await expect(dialog).toHaveFocus();
    await expect(within(dialog).getAllByRole('listitem')).toHaveLength(3);
  }}
>
  <Modal title="How to play">
    <Explainer
      rows={[
        { show: exact, says: 'Correct — right letter, right place. Marker bar.' },
        { show: present, says: 'Present — right letter, wrong place. Shorter marker bar.' },
        { show: absent, says: 'Absent — not in the word. No marker bar.' }
      ]}
    >
      <p style="margin: 0">Guess the word in six attempts.</p>
      {#snippet footnote()}
        <p style="margin: 0">Your statistics are saved in this browser.</p>
      {/snippet}
    </Explainer>
  </Modal>
</Story>

<Story
  name="Dark theme"
  asChild
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
>
  <div style="inline-size: min(26rem, 100%)">
    <Explainer
      rows={[
        { show: exact, says: 'Correct — right letter, right place. Marker bar.' },
        { show: present, says: 'Present — right letter, wrong place. Shorter marker bar.' },
        { show: absent, says: 'Absent — not in the word. No marker bar.' }
      ]}
    >
      <p style="margin: 0">Guess the word in six attempts.</p>
      {#snippet footnote()}
        <p style="margin: 0">Your statistics are saved in this browser.</p>
      {/snippet}
    </Explainer>
  </div>
</Story>
