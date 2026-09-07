<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Card from '../src/lib/components/Card.svelte';
  import CardLabel from '../src/lib/components/CardLabel.svelte';

  const OVERVIEW = [
    'A thin-ruled panel that groups what is inside it. Cards are rules, not shadows: a',
    'hairline, a 4px radius, and nothing floating.',
    '',
    'No governing surface — a card is not a control and takes no operation. That is also why',
    'its edge is `--rule`, the decorative weight the porting guide forbids on anything a',
    'reader can operate and the correct one here for the same reason.',
    '',
    'Three tones. `surface` and `raised` are the two grounds `src/app.css` names; `flat` is',
    'the same panel with the ground left to whatever is behind it. What each one looks like is',
    'held here rather than in `tests/`, because jsdom resolves no paint — the play below reads',
    'the real thing in Chromium.',
    '',
    'They are not always three. `--surface` and `--surface-raised` resolve to the same colour',
    'in both light palettes and diverge only in dark, so `raised` buys nothing in light. That',
    "is the palette's decision rather than this component's, and it is why the play holds each",
    'tone against the token it names instead of holding the three apart.',
    '',
    'There is no `lift` and no `pad`, both of which the design system offers. A lift needs a',
    'shadow scale this repository has argued against having, and a `pad` taking a CSS string',
    'is an escape hatch out of the spacing scale.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Primitives/Card',
    component: Card,
    tags: ['autodocs'],
    argTypes: {
      tone: { control: 'radio', options: ['surface', 'raised', 'flat'] },
      children: { control: false, description: 'What the card groups.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story name="Surface" asChild>
  <Card>Small, exacting games that run in your browser.</Card>
</Story>

<Story name="Raised" asChild>
  <Card tone="raised">Small, exacting games that run in your browser.</Card>
</Story>

<Story name="Flat" asChild>
  <Card tone="flat">Small, exacting games that run in your browser.</Card>
</Story>

<!--
  The three tones side by side, and the one place what each one draws is actually
  decided. jsdom resolves no colour, so `tests/primitives.test.ts` asserts only
  that a card carries its words; this reads the real grounds in Chromium.

  It holds each tone against the token it names rather than holding the three
  apart from each other, because they are not always three. `--surface` and
  `--surface-raised` are the same colour in both light palettes and diverge only
  in dark, so `raised` buys nothing in light — a fact about the palette rather
  than about this component, and one an assertion that counted distinct grounds
  would have reported as a defect here.
-->
<Story
  name="Every tone side by side"
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const palette = getComputedStyle(document.documentElement);

    const ground = (word: string): string => {
      const panel = canvas.getByText(word).parentElement;
      if (panel === null) {
        throw new Error(`The ${word} card has no panel`);
      }
      return getComputedStyle(panel).backgroundColor;
    };

    // A card painted from a token it does not name is the defect worth catching,
    // and the one a screenshot cannot report.
    const named = (token: string): string => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = palette.getPropertyValue(token).trim();
      document.body.append(probe);
      const resolved = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return resolved;
    };

    await expect(ground('Surface')).toBe(named('--surface'));
    await expect(ground('Raised')).toBe(named('--surface-raised'));
    await expect(ground('Flat')).toBe('rgba(0, 0, 0, 0)');
  }}
>
  <div style="display: grid; gap: var(--s-5);">
    <CardLabel>Tones</CardLabel>
    <Card><span>Surface</span></Card>
    <Card tone="raised"><span>Raised</span></Card>
    <Card tone="flat"><span>Flat</span></Card>
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
  <div style="display: grid; gap: var(--s-5);">
    <Card><span>Surface</span></Card>
    <Card tone="raised"><span>Raised</span></Card>
    <Card tone="flat"><span>Flat</span></Card>
  </div>
</Story>

<!--
  The combination where the three grounds sit closest together — `--surface` is
  the page's own black under high contrast — so it is the one worth looking at
  for whether a card still reads as a panel at all.
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
  <div style="display: grid; gap: var(--s-5);">
    <Card><span>Surface</span></Card>
    <Card tone="raised"><span>Raised</span></Card>
    <Card tone="flat"><span>Flat</span></Card>
  </div>
</Story>
