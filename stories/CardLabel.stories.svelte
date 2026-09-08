<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import CardLabel from '../src/lib/components/CardLabel.svelte';

  const OVERVIEW = [
    "The small uppercase label that names a group, and the label the platform's rule about",
    'uppercase is named after. `docs/design/tokens.md` says where the device is spent and',
    "where it is not — a field's name is not one of the places — and the list stays there",
    'rather than being copied here.',
    '',
    "It is a level-two heading rather than the design system's plain `div`, because what it",
    "does is label a section and the hub's front door was already drawing it as one. The cost",
    'is real and stated: a consumer needing another level cannot reach one from here.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Primitives/CardLabel',
    component: CardLabel,
    tags: ['autodocs'],
    argTypes: { children: { control: false, description: 'The words that name the group.' } },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Label"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // A heading, and at the level the front door needs. The uppercase is paint:
    // the accessible name is the words as they were written.
    await expect(canvas.getByRole('heading', { level: 2, name: 'The games' })).toBeInTheDocument();
  }}
>
  <CardLabel>The games</CardLabel>
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
  <CardLabel>The games</CardLabel>
</Story>
