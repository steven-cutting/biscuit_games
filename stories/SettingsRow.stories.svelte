<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import SegmentedControl from '../src/lib/components/SegmentedControl.svelte';
  import SettingsRow from '../src/lib/components/SettingsRow.svelte';
  import Switch from '../src/lib/components/Switch.svelte';

  const THEMES = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  const OVERVIEW = [
    "One setting's line in a sheet of them — the rule between one setting and the next, and",
    'the room around it. Nothing else.',
    '',
    "That is less than the design system's row, which also carries the setting's name and its",
    'line of consequence. [Decision 0017] moved both onto the controls: the row has to *be* the',
    'label for the whole of it to be the 44px target, and only the control knows which element',
    'that is — a `<label>` for a switch, a `<legend>` for a group of choices. A row naming the',
    'control from outside would leave the name unbound, which',
    '`Fields.@guarantee AFieldIsNamedByALabelBoundToIt` refuses.',
    '',
    'There is no `last` prop either: the rule belongs to every row but the final one, and',
    '`:last-child` knows which that is without being told.',
    '',
    '**This is not a settings panel and none of these controls is wired to anything.**',
    '`appearance.allium` excludes the controls that change its settings and carries an open',
    'question about whether a reader may turn high contrast off while the device asks for more.',
    'Wiring one of these to `high_contrast` would answer that question by building it, which',
    'AGENTS.md forbids and decision 0017 declines.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Fields/SettingsRow',
    component: SettingsRow,
    tags: ['autodocs'],
    argTypes: { children: { control: false, description: 'The control the row separates.' } },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!--
  A sheet of them, which is the only way the separator is worth looking at: the
  last row drops its rule without being told to, and each control carries its own
  name because each control is its own row.
-->
<Story
  name="A sheet of settings"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('switch', { name: 'Animations' })).toBeInTheDocument();
    await expect(canvas.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    await expect(canvas.getByRole('switch', { name: 'High contrast' })).toBeInTheDocument();

    // Two settings named in one panel have to be named in one shape, and this is
    // the only place that can be seen: a component test queries by role and name,
    // and the contrast test measures colour. Which shape the two agree on is
    // `docs/design/tokens.md`'s to say, and this only holds them to agreeing.
    const shape = (word: string): string[] => {
      const style = getComputedStyle(canvas.getByText(word));
      return [style.textTransform, style.fontSize];
    };

    await expect(shape('Theme')).toEqual(shape('Animations'));
  }}
>
  <div style="inline-size: min(100%, 28rem);">
    <SettingsRow>
      <Switch label="Animations" description="Biscuit reduces to the mark." checked />
    </SettingsRow>
    <SettingsRow>
      <Switch label="High contrast" description="A second palette, not a brighter one." />
    </SettingsRow>
    <SettingsRow>
      <SegmentedControl label="Theme" options={THEMES} value="dark" />
    </SettingsRow>
  </div>
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
  <div style="inline-size: min(100%, 28rem);">
    <SettingsRow>
      <Switch label="Animations" description="Biscuit reduces to the mark." checked />
    </SettingsRow>
    <SettingsRow>
      <SegmentedControl label="Theme" options={THEMES} value="dark" />
    </SettingsRow>
  </div>
</Story>
