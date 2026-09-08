<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Select from '../src/lib/components/Select.svelte';
  import { MINIMUM_FIELD_TEXT_SIZE, MINIMUM_TOUCH_TARGET } from '../src/lib/config';

  const onchange = fn();

  const THEMES = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  const OVERVIEW = [
    'A choice from a list too long to draw all of at once. `SegmentedControl` is the shape for',
    'a few choices worth showing together; this is the shape for the rest.',
    '',
    'Governed by `Fields` in `docs/specs/operation.allium`:',
    '',
    '- `@guarantee AFieldIsNamedByALabelBoundToIt`, by a real `<label for>`.',
    '- `@guarantee AFieldsOwnWordsAreBoundToIt`, by `aria-describedby`.',
    '- `@guarantee AFieldDoesNotMagnifyThePageWhenItTakesFocus`, measured below.',
    '- `DirectManipulation.@invariant EveryControlIsAComfortableTarget`. A `<select>` is',
    "  already in `src/app.css`'s 44px floor and `tests/operation.test.ts` measures it there;",
    '  this holds the rendered control to the same figure.',
    '',
    'A native `<select>` because the platform already owes one everything it needs, and',
    "because the reader's own device draws the list in whatever way that device is best at."
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Fields/Select',
    component: Select,
    tags: ['autodocs'],
    args: { label: 'Theme', options: THEMES, value: 'dark', onchange },
    argTypes: {
      label: { control: 'text' },
      description: { control: 'text' },
      value: { control: 'radio', options: ['system', 'light', 'dark'] },
      options: { control: false, description: 'The choices, in the order they are offered.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="A choice held"
  play={async ({ canvasElement }) => {
    onchange.mockClear();
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Theme' });

    await expect(field).toHaveValue('dark');
    await userEvent.selectOptions(field, 'light');
    await expect(onchange).toHaveBeenCalledWith('light');
  }}
/>

<Story
  name="With a line of consequence"
  args={{ description: 'Dark is where Biscuit Games starts.' }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('combobox', { name: 'Theme' })).toHaveAccessibleDescription(
      'Dark is where Biscuit Games starts.'
    );
  }}
/>

<!-- The two figures a field answers to, on the rendered control. -->
<Story
  name="The figures"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', { name: 'Theme' });

    await expect(Number.parseFloat(getComputedStyle(field).fontSize)).toBeGreaterThanOrEqual(
      MINIMUM_FIELD_TEXT_SIZE
    );
    await expect(field.getBoundingClientRect().height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
  }}
>
  <div style="font-size: var(--fs-body);">
    <Select label="Theme" options={THEMES} value="dark" />
  </div>
</Story>

<Story
  name="Dark theme"
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
