<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect } from 'storybook/test';

  import Icon from '../src/lib/components/Icon.svelte';
  import { ICONS } from '../src/lib/components/icons';
  import type { IconName } from '../src/lib/components/icons';

  const NAMES = Object.keys(ICONS) as IconName[];

  const OVERVIEW = [
    'The icon set: Lucide, restroked to 1.5, inlined from `src/lib/assets/icons/` through the',
    'Vite import graph. The licence sits beside the files.',
    '',
    'No governing surface: an icon is decoration, which is the point. Every one is',
    '`aria-hidden`, draws in `currentColor`, and takes its name from the control it sits in —',
    'an `IconButton` label, a `Notice` sentence. The map in `icons.ts` is the package’s whole',
    'icon API, so a game reaches an icon by one of these names and no other way. Ported from',
    'Poodl by decision 0014; adding one is walked in',
    '`docs/how-to/port-a-design-system-component.md`.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Primitives/Icon',
    component: Icon,
    tags: ['autodocs'],
    args: { name: 'check' },
    argTypes: {
      name: { control: 'select', options: NAMES, description: 'Which icon, by file name.' },
      size: { control: { type: 'number', min: 12, max: 48 }, description: 'Square size in px.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Every icon in the set, named beside itself so the sheet reads without hovering. -->
<Story
  name="Every icon"
  asChild
  play={async ({ canvasElement }) => {
    // Decorative by construction: real SVGs, none of them in the accessibility tree.
    const drawn = canvasElement.querySelectorAll('svg');
    const hidden = canvasElement.querySelectorAll('[aria-hidden="true"] svg');

    await expect(drawn.length).toBe(NAMES.length);
    await expect(hidden.length).toBe(NAMES.length);
  }}
>
  <ul class="sheet">
    {#each NAMES as name (name)}
      <li>
        <Icon {name} />
        <span>{name}</span>
      </li>
    {/each}
  </ul>
</Story>

<!--
  The sizes the platform's own components draw: 16 beside a sentence in Notice
  and in the header chip, 20 on an IconButton. 24 is Lucide's native box.
-->
<Story name="Sizes" asChild>
  <div class="sizes">
    <Icon name="settings" size={16} />
    <Icon name="settings" size={20} />
    <Icon name="settings" size={24} />
  </div>
</Story>

<!-- The glyph is the ink around it, so the dark palette is where that is seen. -->
<Story
  name="Dark theme"
  asChild
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
>
  <div class="sizes">
    <Icon name="sun" />
    <Icon name="moon" />
    <Icon name="contrast" />
  </div>
</Story>

<style>
  .sheet {
    display: grid;
    grid-template-columns: repeat(2, minmax(9rem, 1fr));
    gap: var(--s-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sheet li {
    display: flex;
    gap: var(--s-4);
    align-items: center;
  }

  .sheet span {
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  .sizes {
    display: flex;
    gap: var(--s-5);
    align-items: center;
    color: var(--text);
  }
</style>
