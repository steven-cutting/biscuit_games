<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Monogram from '../src/lib/components/Monogram.svelte';

  const OVERVIEW = [
    "The brand's reduced mark: the initial in a ruled square whose fourth corner is the one",
    'soft break — `docs/design/direction.md`\'s "perfect, broken once" — set in type until an',
    'illustrator draws the real one.',
    '',
    'No governing surface: this is brand, not behaviour. It lived inside `Wordmark` as four',
    'literals until [decision 0017] pulled it out, and the ratios reproduce those literals',
    'exactly at size 20 — `tests/brand.test.ts` pins that, because a redraw dressed as a',
    'refactor is the failure this extraction could have had.',
    '',
    'It has two shapes and no third. Silent by default, which is what a lockup needs, since a',
    'mark with a voice would put a stray "b" in front of "biscuit games". Given a `label` it is',
    'a named image instead.',
    '',
    'There is no `warm` tone, which the design system offers: the warm family is rationed to',
    '`::selection`, and `--brand-warm` stands about 2.1 off the light page against a text floor',
    'of 4.5, so a warm mark could neither be measured nor pass.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Brand/Monogram',
    component: Monogram,
    tags: ['autodocs'],
    argTypes: {
      size: {
        control: { type: 'number', min: 16, max: 64 },
        description: "The square's edge in px. Every other figure is a ratio of it."
      },
      label: {
        control: 'text',
        description: 'An accessible name. Omitted, the mark is hidden from assistive technology.'
      }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Silent"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The shape `Wordmark` depends on, asserted in a real browser as well as in
    // jsdom: the mark carries no name at all, so the lockup around it reads as
    // its words alone.
    await expect(canvas.getByText('b')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.queryByRole('img')).toBeNull();
  }}
/>

<Story
  name="Named"
  args={{ label: 'Biscuit Games' }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('img', { name: 'Biscuit Games' })).toBeInTheDocument();
  }}
/>

<!--
  Verified legible from 16px up, which is the smallest the design system draws
  it. The corner, the glyph and the nudge all move with the box, so the break
  stays the same shape rather than becoming a notch at the top and a curve at
  the bottom.
-->
<Story name="At every size it is drawn at" asChild>
  <div style="display: flex; align-items: center; gap: var(--s-6);">
    <Monogram size={16} />
    <Monogram size={20} />
    <Monogram size={26} />
    <Monogram size={42} />
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
