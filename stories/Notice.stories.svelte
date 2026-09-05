<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Notice from '../src/lib/components/Notice.svelte';

  const ondismiss = fn();

  const OVERVIEW = [
    'What the product is telling the reader right now, where the reader is looking.',
    '',
    'No governing surface of its own: a product’s specification says what has to be announced,',
    'and this is how it is announced visibly and out loud at once. It is visible text inside a',
    '`role="status"` region, so the sentence itself is the announcement rather than being',
    'duplicated into `Announcer` and heard twice.',
    '',
    'The region is mounted whether or not there is anything to say, and only its contents come',
    'and go: a live region is heard when the text inside it changes, and one that arrives already',
    'carrying its text has not changed. `sequence` covers the other half — the same sentence',
    'twice changes no text either, so the nodes are replaced instead.',
    '',
    '`tone` picks the glyph beside the sentence and never the sentence: the words carry the',
    'meaning, which is `AppearanceNeverCarriesMeaningAlone`, and the tick is the one kind of',
    'news that earns it.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/Notice',
    component: Notice,
    tags: ['autodocs'],
    args: { ondismiss },
    argTypes: {
      message: { control: 'text', description: 'The one sentence being said, or null.' },
      tone: { control: 'radio', options: ['alert', 'success'] },
      sequence: { control: 'number', description: 'Advances so a repeat is announced again.' },
      ondismiss: { description: 'Omit it and no dismiss control is offered.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- A refusal, which is what most of these are. -->
<Story
  name="A refusal"
  args={{ message: 'That is not a word this game knows.', ondismiss: undefined }}
/>

<!-- The one kind of news that earns the tick. -->
<Story
  name="Good news"
  args={{ message: 'Copied to the clipboard.', tone: 'success', ondismiss: undefined }}
/>

<!-- Nothing to say. Present for the sake of being heard, and taking up nothing. -->
<Story name="Silent" args={{ message: null, ondismiss: undefined }} />

<!-- Dismissal is a control the caller opts into, and it is keyboard reachable. -->
<Story
  name="Dismissed from the keyboard"
  args={{ message: 'Copied to the clipboard.', tone: 'success' }}
  play={async ({ canvasElement }) => {
    ondismiss.mockClear();
    const dismiss = within(canvasElement).getByRole('button', { name: 'Dismiss' });

    await userEvent.tab();
    await expect(dismiss).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(ondismiss).toHaveBeenCalledTimes(1);
  }}
/>

<!-- The raised surface and its rule, on the ground they were designed for. -->
<Story
  name="Dark theme"
  args={{ message: 'That is not a word this game knows.', ondismiss: undefined }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
