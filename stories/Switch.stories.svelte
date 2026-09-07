<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Switch from '../src/lib/components/Switch.svelte';
  import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';

  const FRAME_WIDTH = `${String(NARROWEST_SUPPORTED_WIDTH)}px`;
  const onchange = fn();

  const OVERVIEW = [
    'A setting that is either on or off.',
    '',
    'Governed by `Fields` in `docs/specs/operation.allium`:',
    '',
    '- `@guarantee AFieldIsNamedByALabelBoundToIt`. The whole `<label>` is the row, so the',
    '  name is inside the control rather than beside it.',
    "- `@guarantee AFieldsOwnWordsAreBoundToIt`. The line of consequence is the control's",
    '  description, not a sentence sitting under it.',
    '- `DirectManipulation.@invariant EveryControlIsAComfortableTarget`. The row is the target',
    '  and `src/app.css` floors it at 44px — **At the narrowest width** measures the row',
    '  rather than the 26px track, which is the whole point of the clause.',
    '- `Appearance.@guarantee AppearanceNeverCarriesMeaningAlone`. Position, word and',
    '  `checked` all say which way it is set; the fill is the fourth telling.',
    '',
    'The track is the checkbox itself under `appearance: none`, not a `<span>` beside a hidden',
    'input the way the design system draws it. A hidden control takes focus somewhere the',
    'reader cannot see it, and `Operation.@guarantee FocusIsVisibleWhereverItLands` asks for an',
    'indication a control inherits rather than asks for.',
    '',
    "The off state draws in `--key-untried-rule`, not the reference's `--rule-strong`: this is",
    "a live control's boundary, and `--rule-strong` stands 2.33 off the dark page against a",
    'boundary floor of 3.0.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Fields/Switch',
    component: Switch,
    tags: ['autodocs'],
    args: { label: 'Animations', onchange },
    argTypes: {
      label: { control: 'text' },
      description: { control: 'text' },
      checked: { control: 'boolean' },
      disabled: { control: 'boolean' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Off"
  play={async ({ canvasElement }) => {
    onchange.mockClear();
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Animations' });

    await expect(control).not.toBeChecked();
    await userEvent.click(control);
    await expect(onchange).toHaveBeenCalledWith(true);
  }}
/>

<Story name="On" args={{ checked: true }} />

<Story
  name="With a line of consequence"
  args={{ checked: true, description: 'Biscuit reduces to the mark.' }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('switch', { name: 'Animations' })).toHaveAccessibleDescription(
      'Biscuit reduces to the mark.'
    );
  }}
/>

<!--
  `AnUnavailableControlIsExempt`: dim is how unavailability reads, the state is
  in the accessibility tree, and every non-colour indication the live form
  carried is kept — the knob still sits where the setting is.
-->
<Story
  name="Unavailable"
  args={{ disabled: true, description: 'Not while the device asks for less motion.' }}
/>

<!--
  The figure, on the row rather than on the track. The track is 26px tall and no
  stylesheet makes it 44; the label that contains it is what the finger is aimed
  at, which is what EveryControlIsAComfortableTarget grants and what this
  measures.
-->
<Story
  name="At the narrowest width"
  args={{ checked: true, description: 'Biscuit reduces to the mark.' }}
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
    const control = canvas.getByRole('switch', { name: 'Animations' });
    const row = control.closest('label');
    if (row === null) {
      throw new Error('The switch is not inside a label');
    }

    const box = row.getBoundingClientRect();
    await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  }}
>
  <div style="inline-size: {FRAME_WIDTH}; padding-inline: var(--shell-pad);">
    <Switch label="Animations" description="Biscuit reduces to the mark." checked />
  </div>
</Story>

<Story
  name="Dark theme"
  args={{ checked: true }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>

<Story
  name="Dark theme, high contrast"
  args={{ checked: true }}
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
/>
