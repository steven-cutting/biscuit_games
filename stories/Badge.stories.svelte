<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Badge from '../src/lib/components/Badge.svelte';

  const OVERVIEW = [
    'A small rule-drawn label carrying a word.',
    '',
    'Governed by `Appearance` in `docs/specs/appearance.allium`:',
    '',
    '- `@guarantee AppearanceNeverCarriesMeaningAlone`. The word is the meaning and the ink is',
    '  the second telling, never the first — which is why there is no tone here that says',
    '  anything a reader cannot also read.',
    '- `@guarantee EveryCombinationMeetsTheLegibilityFloor`. Both inks are measured against',
    '  every ground a badge is drawn on, in all four combinations, by `tests/contrast.test.ts`.',
    '',
    'Two tones, where the design system offers five. `exact` and `present` are a play',
    "surface's marks and a badge is not a play cell: drawing one in a result ink would say a",
    'mark where no cell was marked. `warm` fails twice over — the warm family is rationed to',
    '`::selection`, and `--brand-warm` stands about 2.1 off the light page against a text floor',
    'of 4.5, so warm words could neither be measured nor pass.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Primitives/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
      tone: { control: 'radio', options: ['neutral', 'strong'] },
      children: { control: false, description: 'The word the badge carries.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Neutral"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The whole contract: whatever a badge is saying is readable as words.
    await expect(canvas.getByText('Not built yet')).toBeInTheDocument();
  }}
>
  <Badge>Not built yet</Badge>
</Story>

<Story name="Strong" asChild>
  <Badge tone="strong">Beta</Badge>
</Story>

<Story name="Both tones together" asChild>
  <div style="display: flex; align-items: center; gap: var(--s-4);">
    <Badge>Not built yet</Badge>
    <Badge tone="strong">Beta</Badge>
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
  <div style="display: flex; align-items: center; gap: var(--s-4);">
    <Badge>Not built yet</Badge>
    <Badge tone="strong">Beta</Badge>
  </div>
</Story>

<!--
  Both inks invert, and `--rule-strong` moves furthest of the three. The figures
  are held by `tests/contrast.test.ts`; this is the standing evidence that the
  combination renders and is looked at.
-->
<Story
  name="Dark theme, high contrast"
  asChild
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
>
  <div style="display: flex; align-items: center; gap: var(--s-4);">
    <Badge>Not built yet</Badge>
    <Badge tone="strong">Beta</Badge>
  </div>
</Story>
