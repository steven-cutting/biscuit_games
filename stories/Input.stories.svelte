<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Input from '../src/lib/components/Input.svelte';
  import { MINIMUM_FIELD_TEXT_SIZE } from '../src/lib/config';

  const oninput = fn();

  const OVERVIEW = [
    'A single line of text the reader writes.',
    '',
    'Governed by `Fields` in `docs/specs/operation.allium`:',
    '',
    '- `@guarantee AFieldIsNamedByALabelBoundToIt`. A real `<label for>`. A placeholder is',
    '  never the name — it is gone the moment the reader types — which is why **Named, and',
    '  hinted** gives both at once.',
    '- `@guarantee AFieldsOwnWordsAreBoundToIt`. The line under the field is bound with',
    '  `aria-describedby`, so it reaches a reader who arrived without seeing the page.',
    '- `@guarantee AFieldThatIsWrongSaysSo`. **Refused** carries three tellings and no colour:',
    '  `aria-invalid` in the tree, the sentence in words, the glyph as a shape, and the rule',
    '  thickened. There is no error ink in this system and none is invented for one state.',
    '- `@guarantee AFieldDoesNotMagnifyThePageWhenItTakesFocus`. **The text floor** measures it.',
    '',
    'That last one is the only figure in `src/lib/config.ts` no test in `tests/` can check:',
    "jsdom's own default input font is already 16px, so an assertion there would pass whether",
    'or not the rule existed. `src/app.css` has said so beside the rule since before this',
    'component existed, and noted that the hub had no text control to measure. It has one now,',
    'and this is the measurement.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Fields/Input',
    component: Input,
    tags: ['autodocs'],
    args: { label: 'Your link', oninput },
    argTypes: {
      label: { control: 'text' },
      hint: { control: 'text' },
      placeholder: { control: 'text' },
      invalid: { control: 'boolean' },
      value: { control: 'text' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Empty"
  play={async ({ canvasElement }) => {
    oninput.mockClear();
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox', { name: 'Your link' }), 'a');
    await expect(oninput).toHaveBeenCalledWith('a');
  }}
/>

<Story
  name="Named, and hinted"
  args={{ placeholder: 'https://', hint: 'Anything the browser can open.' }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Your link' });

    // The name is the label and stays the label, whatever the placeholder says.
    await expect(field).toHaveAccessibleDescription('Anything the browser can open.');
  }}
/>

<Story
  name="Refused"
  args={{ value: 'not a link', invalid: true, hint: 'That is not a link.' }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Your link' });

    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(field).toHaveAccessibleDescription('That is not a link.');
  }}
/>

<!--
  The one figure `tests/` cannot hold. Below it a mobile browser magnifies the
  page when the field takes focus and leaves it magnified, which is the platform
  guessing rather than the reader asking — the distinction
  DeliberateZoomIsNeverTakenAway draws, reached through the one control that can
  trip it without being tapped.

  Measured inside something that sets `--fs-body`, because that is the shape the
  rule is actually for: `app.css`'s `font: inherit` reaches the 16px body only
  when nothing between sets a size, and a field in a card that sets one would be
  15px with every gate green.
-->
<Story
  name="The text floor"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Your link' });
    const size = Number.parseFloat(getComputedStyle(field).fontSize);

    await expect(size).toBeGreaterThanOrEqual(MINIMUM_FIELD_TEXT_SIZE);
  }}
>
  <div style="font-size: var(--fs-body);">
    <Input label="Your link" hint="Anything the browser can open." />
  </div>
</Story>

<Story
  name="Dark theme"
  args={{ hint: 'Anything the browser can open.' }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>

<Story
  name="Dark theme, high contrast"
  args={{ value: 'not a link', invalid: true, hint: 'That is not a link.' }}
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
/>
