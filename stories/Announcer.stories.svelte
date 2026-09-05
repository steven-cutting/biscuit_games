<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Announcer from '../src/lib/components/Announcer.svelte';

  const OVERVIEW = [
    'The live region. It has nothing to show and everything to say.',
    '',
    'No governing surface of its own: it is how a product meets an announcement guarantee its',
    'own specification states — a game’s board reporting a scored guess, a dialog reporting a',
    'conclusion. `appearance.allium` asks only that nothing be carried by colour alone, and a',
    'sentence read aloud is the far end of that.',
    '',
    'It is visually hidden on purpose, through `app.css`’s `.visually-hidden`. Everything it',
    'says is already on the screen in another form, so repeating it in sight would be noise,',
    'and omitting it would leave a reader without the screen.',
    '',
    'The sequence number is the whole of the design. A live region is heard when its text',
    'changes, so the same sentence twice would be announced once; the `{#key}` replaces the',
    'node instead. Nothing on this page can show that, which is why `tests/shells.test.ts`',
    'owns it.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/Announcer',
    component: Announcer,
    tags: ['autodocs'],
    argTypes: {
      message: { control: 'text', description: 'What the region says next, or null for nothing.' },
      sequence: {
        control: 'number',
        description: 'Advances on every announcement, so a repeat is heard again.'
      }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Nothing to say yet. The region exists so that it is there when there is. -->
<Story name="Silent" args={{ message: null, sequence: 0 }} />

<!-- Something said. Hidden, so the play is the only place its content is checked by eye. -->
<Story
  name="Something to say"
  args={{
    message: 'Theme set to dark. High contrast is on because your device asked for it.',
    sequence: 1
  }}
  play={async ({ canvasElement }) => {
    const region = within(canvasElement).getByRole('status');

    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region).toHaveTextContent('Theme set to dark.');
  }}
/>
