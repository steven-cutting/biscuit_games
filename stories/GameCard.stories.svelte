<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import GameCard from '../src/lib/components/GameCard.svelte';
  import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';

  const FRAME_WIDTH = `${String(NARROWEST_SUPPORTED_WIDTH)}px`;

  const OVERVIEW = [
    "One game in the platform's list of them — the switcher the hub's front door is made of.",
    '',
    'Governed by `Operation` in `docs/specs/operation.allium`, and by the `DirectManipulation`',
    'contract it fulfils:',
    '',
    '- `@invariant EveryControlIsAComfortableTarget`. A reachable card is a link and meets the',
    '  figure outright, which **At the narrowest width** measures — `src/app.css` floors',
    '  buttons and fields at 44px and deliberately not links, so this one answers for itself.',
    '- `@invariant ATouchIsAcknowledged`. A link is one of the controls `app.css` never takes',
    "  the platform's own tap flash from, so the acknowledgement is the browser's and the card",
    '  draws no ring of its own.',
    '- `Appearance.@guarantee AnUnavailableControlIsExempt`, which this component deliberately',
    '  does **not** spend. A game nobody has built is not a control that has gone quiet; it is',
    '  not a control. So a planned entry is no link at all, carries no `aria-disabled`, is not',
    '  dimmed, and says "Not built yet" in words at the full text floor.',
    '',
    'Hover strengthens the rule rather than darkening the ground. `--surface-hover` would put',
    "the card's quietest ink somewhere it may not be read — `--text-3` reaches 3.60 against it",
    'in light standard against a floor of 4.5 — and `docs/design/tokens.md` carries that as a',
    'rule about the token rather than a fact about this card.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/GameCard',
    component: GameCard,
    tags: ['autodocs'],
    args: {
      name: 'poodl',
      description: 'An unlimited-play word game. Guess a five-letter word in six attempts.',
      href: 'https://pnut.fans/poodl/'
    },
    argTypes: {
      name: { control: 'text' },
      description: { control: 'text' },
      href: { control: 'text' },
      status: { control: 'radio', options: ['ready', 'planned'] },
      meta: { control: 'text' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Ready"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('link', { name: /poodl/ })).toBeInTheDocument();
  }}
/>

<Story name="With a line about the game" args={{ meta: '5 letters, 6 guesses' }} />

<!--
  The departure from the design system, and the one worth looking at. Nothing is
  dimmed and nothing claims to be a disabled control: the words carry the state.
-->
<Story
  name="Planned"
  args={{ name: 'pawjong', description: 'A tile game.', status: 'planned', href: undefined }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.getByText('Not built yet')).toBeInTheDocument();
  }}
/>

<!--
  The figure, at the width every promise in operation.allium has to hold at. The
  story frames itself to `NARROWEST_SUPPORTED_WIDTH` rather than to a number
  written here, so raising the constant moves the frame instead of leaving a
  stale one green.
-->
<Story
  name="At the narrowest width"
  args={{ meta: '5 letters, 6 guesses' }}
  parameters={{
    viewport: {
      viewports: {
        narrowest: { name: 'Narrowest', styles: { width: FRAME_WIDTH, height: '568px' } }
      },
      defaultViewport: 'narrowest'
    }
  }}
  asChild
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('link', { name: /poodl/ });
    const box = card.getBoundingClientRect();

    await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    await expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);

    // And nothing scrolls sideways at that width, which is the other half of
    // EveryPromiseHereHoldsAtTheNarrowestWidth.
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  }}
>
  <div style="inline-size: {FRAME_WIDTH}; padding-inline: var(--shell-pad);">
    <GameCard
      name="poodl"
      description="An unlimited-play word game. Guess a five-letter word in six attempts."
      href="https://pnut.fans/poodl/"
      meta="5 letters, 6 guesses"
    />
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
