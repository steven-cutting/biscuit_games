<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Wordmark from '../src/lib/components/Wordmark.svelte';

  const OVERVIEW = [
    'The brand lockup: the placeholder mark and "biscuit games", always lowercase, always in',
    'the display face.',
    '',
    'No governing surface — this is brand, from `docs/design/direction.md`. The mark is',
    '`Monogram`, and it is `aria-hidden` here: the words are the whole accessible text, which',
    'the play holds.',
    '',
    '`product` names a game after the platform. Before [decision 0017] a game installing the',
    'package could not render its own lockup at all and had to rebuild one, matching the',
    'display face, the weight, the tracking and the `words` class `HeaderBar` reaches into —',
    'a cost paid twice the moment there are two games. The separator lives inside `words`, so',
    'the whole lockup collapses together under that 26rem rule rather than leaving a slash',
    'behind on a phone.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Brand/Wordmark',
    component: Wordmark,
    tags: ['autodocs'],
    argTypes: {
      product: {
        control: 'text',
        description: "A game named after the platform. Omitted, the lockup is the platform's alone."
      }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Lockup"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The same pair the unit test takes, for the same reason: a text query
    // matches an element's own text nodes, so the anchored assertion below
    // would pass with the mark audible. The mark is held hidden on its own.
    await expect(canvas.getByText('b')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByText(/biscuit/)).toHaveTextContent(/^biscuit games$/);
  }}
/>

<Story
  name="With a game"
  args={{ product: 'poodl' }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The platform first, then the game, in one accessible string — and the mark
    // still silent, which is the half a text query cannot see.
    await expect(canvas.getByText(/biscuit/)).toHaveTextContent(/^biscuit games \/ poodl$/);
    await expect(canvas.getByText('b')).toHaveAttribute('aria-hidden', 'true');
  }}
/>

<Story
  name="Dark theme"
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    // The first story to prove preview.ts's attribute contract reaches the
    // document root, which is where every palette in app.css is keyed; every
    // dark pin in the other story files rests on the same line.
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
