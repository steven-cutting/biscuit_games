<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import SegmentedControl from '../src/lib/components/SegmentedControl.svelte';
  import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';

  const FRAME_WIDTH = `${String(NARROWEST_SUPPORTED_WIDTH)}px`;
  const onchange = fn();

  const THEMES = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  const OVERVIEW = [
    'A few exclusive choices, all of them visible at once.',
    '',
    'Governed by `Fields` in `docs/specs/operation.allium`:',
    '',
    '- `@guarantee AGroupOfExclusiveChoicesIsOneStopAndArrowsMoveWithinIt`. **One stop, arrows',
    '  within** measures both halves. The design system draws buttons wearing `role="radio"`',
    '  and implements neither: every segment is its own tab stop and no arrow key does',
    '  anything. Native radios in a `<fieldset>` answer the clause by being what they are.',
    '- `@guarantee AFieldIsNamedByALabelBoundToIt`. The `<legend>` names the group.',
    '- `DirectManipulation.@invariant EveryControlIsAComfortableTarget`, held at the narrowest',
    '  supported width.',
    '- `Appearance.@guarantee AppearanceNeverCarriesMeaningAlone`. The taken choice carries',
    "  `checked` and a heavier weight, which is `Button`'s `current` idiom.",
    '',
    'Each radio fills its own segment under `appearance: none` rather than hiding behind one,',
    'so focus is drawn where the reader is looking without this component drawing it.',
    '',
    'Nothing here is wired to a real setting, and that is deliberate: `appearance.allium`',
    'excludes the controls that change its settings and carries an open question about the',
    'contrast escape hatch, so binding one of these would answer it by building it.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Fields/SegmentedControl',
    component: SegmentedControl,
    tags: ['autodocs'],
    args: { label: 'Theme', options: THEMES, value: 'dark', onchange },
    argTypes: {
      label: { control: 'text' },
      description: { control: 'text' },
      value: { control: 'radio', options: ['system', 'light', 'dark'] },
      options: { control: false, description: 'The choices, in the order they are drawn.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="A choice taken"
  play={async ({ canvasElement }) => {
    onchange.mockClear();
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('radio', { name: 'Dark' })).toBeChecked();
    await userEvent.click(canvas.getByRole('radio', { name: 'Light' }));
    await expect(onchange).toHaveBeenCalledWith('light');
  }}
/>

<!--
  The clause the reference fails, measured in a real browser: Tab reaches the
  group once and stops, and the arrows move inside it. A group reachable in one
  stop with no way to move within it is a reachable first option rather than a
  reachable choice.
-->
<Story
  name="One stop, arrows within"
  args={{ value: 'system' }}
  play={async ({ canvasElement }) => {
    onchange.mockClear();
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'System' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(onchange).toHaveBeenCalledWith('light');
    await expect(canvas.getByRole('radio', { name: 'Light' })).toHaveFocus();

    /*
     * And the ring that lands there can be seen. `app.css` offsets it 2px
     * outside the control, and a radio fills its segment exactly, so the ring
     * is entirely outside the row's padding box: a clipping ancestor eats all
     * of it but the slivers overlapping a neighbour, which is what rounding the
     * row with `overflow: hidden` did until this assertion. No test can see a
     * ring, so this states the condition that hides one.
     */
    const focused = canvas.getByRole('radio', { name: 'Light' });
    for (
      let node = focused.parentElement;
      node !== null && node.tagName !== 'FIELDSET';
      node = node.parentElement
    ) {
      await expect(getComputedStyle(node).overflow).toBe('visible');
    }
  }}
/>

<Story
  name="With a line of consequence"
  args={{ description: 'Dark is where Biscuit Games starts.' }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('group', { name: 'Theme' })).toHaveAccessibleDescription(
      'Dark is where Biscuit Games starts.'
    );
  }}
/>

<Story
  name="At the narrowest width"
  asChild
  parameters={{
    viewport: {
      viewports: {
        narrowest: { name: 'Narrowest', styles: { width: FRAME_WIDTH, height: '568px' } }
      },
      defaultViewport: 'narrowest'
    }
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvasElement.querySelector('[data-frame]');
    if (frame === null) {
      throw new Error('The story has no frame');
    }

    for (const word of ['System', 'Light', 'Dark']) {
      const segment = canvas.getByRole('radio', { name: word }).closest('label');
      if (segment === null) {
        throw new Error(`The ${word} radio is not inside a segment`);
      }
      await expect(segment.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        MINIMUM_TOUCH_TARGET
      );
    }

    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  }}
>
  <div data-frame style="inline-size: {FRAME_WIDTH}; padding-inline: var(--shell-pad);">
    <SegmentedControl label="Theme" options={THEMES} value="dark" />
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

<Story
  name="Dark theme, high contrast"
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
/>
