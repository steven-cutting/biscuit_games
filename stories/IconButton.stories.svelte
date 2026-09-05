<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import IconButton from '../src/lib/components/IconButton.svelte';
  import { MINIMUM_TOUCH_TARGET } from './fixtures';

  const onclick = fn();

  const OVERVIEW = [
    'A square 44px chrome control: a header action, a dialog’s Close.',
    '',
    'Consumed by `HeaderBar` and `Modal`. The control is a real button and its name is a',
    'required prop rather than an inference from the glyph — `AppearanceNeverCarriesMeaningAlone`',
    'asks for the word, and these are exactly the controls a shape alone would leave unnamed.',
    '',
    'It is a comfortable target both ways, and the play below measures that here because jsdom',
    'has no layout engine. The figure is a story fixture rather than a `config.ts` value: no',
    'specification in this repository states it yet, and `stories/fixtures.ts` says so. The',
    "pressed ring is `app.css`'s and deliberately not asserted."
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Primitives/IconButton',
    component: IconButton,
    tags: ['autodocs'],
    args: { label: 'Settings', icon: 'settings', onclick },
    argTypes: {
      label: { control: 'text', description: 'The accessible name. Required, never inferred.' },
      icon: { control: 'text', description: 'One of the icon names in icons.ts.' },
      disabled: { control: 'boolean' },
      popup: { control: false, description: 'What pressing it opens, rendered as aria-haspopup.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Default"
  play={async ({ canvasElement }) => {
    onclick.mockClear();
    const control = within(canvasElement).getByRole('button', { name: 'Settings' });
    const box = control.getBoundingClientRect();

    await expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);

    await userEvent.click(control);
    await expect(onclick).toHaveBeenCalledTimes(1);
  }}
/>

<!-- A header action opens a dialog and says so before it is pressed. -->
<Story
  name="Opens a dialog"
  args={{ popup: 'dialog' }}
  play={async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-haspopup',
      'dialog'
    );
  }}
/>

<!-- `AnUnavailableControlIsExempt`: dim, still named, still reported as disabled. -->
<Story name="Disabled" args={{ disabled: true }} />

<Story
  name="Dark theme"
  args={{ icon: 'x', label: 'Close' }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
