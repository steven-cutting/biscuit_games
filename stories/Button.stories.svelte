<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Button from '../src/lib/components/Button.svelte';
  import { MINIMUM_TOUCH_TARGET } from './fixtures';

  const onclick = fn();

  const OVERVIEW = [
    'The one button.',
    '',
    'Three variants and two sizes — what the platform’s own components consume; the design',
    'system’s others are recorded, unported, in `docs/how-to/port-a-design-system-component.md`.',
    'Primary is the page ink as a fill. Secondary hugs the page, and its border is',
    '`--key-untried-rule` because a control’s boundary owes `minimum_boundary_contrast` against',
    'the page under `EveryCombinationMeetsTheLegibilityFloor` — `tests/contrast.test.ts`',
    'computes it in all four combinations. Ghost is for the one action that is truly incidental.',
    '',
    'There is deliberately no destructive variant: a consequential action is a secondary button',
    'whose confirmation carries the weight, not a colour. `current` renders `aria-current` for',
    'the selected one of a set, so the control and the sentence beside it agree.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Primitives/Button',
    component: Button,
    tags: ['autodocs'],
    args: { onclick },
    argTypes: {
      variant: { control: 'radio', options: ['primary', 'secondary', 'ghost'] },
      size: { control: 'radio', options: ['sm', 'md'] },
      disabled: { control: 'boolean' },
      current: { control: 'boolean', description: 'Renders aria-current="true".' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- The six shapes, side by side. -->
<Story
  name="Every variant"
  asChild
  play={async ({ canvasElement }) => {
    // Every control is a comfortable target, and every one answers the
    // keyboard: measured here because jsdom has no layout engine.
    onclick.mockClear();
    const canvas = within(canvasElement);

    for (const name of ['Continue', 'Learn more', 'Dismiss']) {
      const control = canvas.getByRole('button', { name });
      const box = control.getBoundingClientRect();

      await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    }

    canvas.getByRole('button', { name: 'Continue' }).focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('[Space]');

    await expect(onclick).toHaveBeenCalledTimes(2);
  }}
>
  <div class="row">
    <Button variant="primary" {onclick}>Continue</Button>
    <Button variant="secondary" {onclick}>Learn more</Button>
    <Button variant="ghost" {onclick}>Dismiss</Button>
  </div>
  <div class="row">
    <Button variant="primary" size="md" {onclick}>Continue where you left off</Button>
    <Button variant="secondary" size="md" {onclick}>Not now</Button>
  </div>
</Story>

<!-- The selected choice of a set: marked, and announced as current. -->
<Story
  name="Current, among its choices"
  asChild
  play={async ({ canvasElement }) => {
    // The control half of a choice that must be perceivable: the sentence
    // beside it says which, and this says the same to assistive technology.
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Dark' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    await expect(canvas.getByRole('button', { name: 'Light' })).not.toHaveAttribute('aria-current');
  }}
>
  <div class="row">
    <Button current>Dark</Button>
    <Button>Light</Button>
    <Button>System</Button>
  </div>
</Story>

<!--
  `AnUnavailableControlIsExempt`: dim is how unavailability reads, the state is
  in the accessibility tree, and the words stay.
-->
<Story name="Disabled" asChild>
  <div class="row">
    <Button disabled>Continue</Button>
    <Button variant="primary" disabled>Save</Button>
  </div>
</Story>

<!--
  Primary inverts its ink, so the pair worth pinning is the darkest ground under
  the strongest palette. The figures are held by `tests/contrast.test.ts`; this
  story is the standing evidence that the combination renders and is looked at.
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
  <div class="row">
    <Button variant="primary">Continue</Button>
    <Button variant="secondary">Learn more</Button>
    <Button variant="ghost">Dismiss</Button>
  </div>
</Story>

<style>
  .row {
    display: flex;
    gap: var(--s-4);
    align-items: center;
    flex-wrap: wrap;
    margin-block-end: var(--s-4);
  }
</style>
