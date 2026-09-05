<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Wordmark from '../src/lib/components/Wordmark.svelte';

  const OVERVIEW = [
    'The brand lockup: the placeholder mark and "biscuit games", always lowercase, always in',
    'the display face.',
    '',
    'No governing surface — this is brand, from `docs/design/direction.md`. The mark is the',
    'brand initial in a ruled square whose fourth corner is the one soft break ("perfect,',
    'broken once"), set in type until an illustrator draws the real one, and it is',
    '`aria-hidden`: the words are the whole accessible text, which the play holds.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Brand/Wordmark',
    component: Wordmark,
    tags: ['autodocs'],
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
