<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import HeaderBar from '../src/lib/components/HeaderBar.svelte';
  import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';

  // The gutter a page shell gives at every width, so a frame here leaves the
  // header exactly the room a route would.
  const SHELL_GUTTER = '1rem';
  const FRAME_WIDTH = `${String(NARROWEST_SUPPORTED_WIDTH)}px`;

  const onchip = fn();
  const onsettings = fn();
  const onabout = fn();

  const CHIP = {
    word: 'Dark',
    label: 'Theme: dark — change theme',
    onclick: onchip,
    popup: 'dialog'
  } as const;
  const ACTIONS = [
    { icon: 'settings', label: 'Settings', onclick: onsettings, popup: 'dialog' },
    { icon: 'info', label: 'About', onclick: onabout, popup: 'dialog' }
  ] as const;

  const OVERVIEW = [
    'The platform chrome: brand lockup left, an optional chip and the actions right.',
    '',
    'No governing surface of its own: the chip and the actions are a product’s, named and',
    'wired by the product, and the component holds the shape. The lockup is the page’s `h1` —',
    '`Wordmark` by default, or a `brand` snippet a game passes so the heading names what the',
    'page is. A chip’s visible word is state readable as text rather than signalled only by which',
    'control looks selected; its label says what pressing it does.',
    '',
    'The narrow story is the executable evidence that the collapse — words hidden, divider gone,',
    'icon gaps closed — keeps every target whole rather than shrinking one. The figures it',
    'measures against are `operation.allium`’s, mirrored in `src/lib/config.ts`.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/HeaderBar',
    component: HeaderBar,
    tags: ['autodocs'],
    argTypes: {
      brand: { control: false, description: 'The lockup, when it is not the platform’s own.' },
      chip: { control: false, description: 'The one stateful control, or null.' },
      actions: { control: false, description: 'The named actions, in order.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- The hub's own shape: the lockup, and nothing to press. -->
<Story name="Platform only" />

<!-- A product's shape: state in the chip, its actions after the divider. -->
<Story name="With a chip and actions" args={{ chip: CHIP, actions: ACTIONS }} />

<!-- Actions without a chip draw no divider, because there is nothing to divide. -->
<Story name="Actions only" args={{ actions: ACTIONS }} />

<!-- A game's lockup: the platform's words and then its own, with `.words` so the collapse reaches it. -->
<Story name="A product's own lockup" args={{ chip: CHIP, actions: ACTIONS }}>
  {#snippet template(args)}
    <HeaderBar {...args}>
      {#snippet brand()}
        <span class="words">biscuit games / a game</span>
      {/snippet}
    </HeaderBar>
  {/snippet}
</Story>

<!-- Chip first, then the actions, in reading order. -->
<Story
  name="Every control is reachable by Tab"
  args={{ chip: CHIP, actions: ACTIONS }}
  play={async ({ canvasElement }) => {
    onchip.mockClear();
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Theme: dark — change theme' });

    await expect(chip).toHaveAttribute('aria-haspopup', 'dialog');

    await userEvent.tab();
    await expect(chip).toHaveFocus();

    for (const name of ['Settings', 'About']) {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name })).toHaveFocus();
    }

    chip.focus();
    await userEvent.keyboard('{Enter}');
    await expect(onchip).toHaveBeenCalledTimes(1);
  }}
/>

<!--
  The narrowest viewport a surface has to lay out on, framed to exactly that
  width with the gutters a page shell gives. The collapse — words hidden,
  divider gone, icon gaps closed — must keep every target whole rather than
  shrinking one.
-->
<Story
  name="At the narrowest supported width"
  args={{ chip: CHIP, actions: ACTIONS }}
  parameters={{
    docs: { story: { inline: false } },
    /*
     * The collapse keys on the viewport (`max-width: 26rem`), and the story
     * run's default viewport is 1200px wide. Without this pin the play would
     * measure the uncollapsed header inside a narrow frame, and the state a
     * phone actually renders would be evidence nowhere.
     */
    viewport: {
      viewports: {
        narrowest: {
          name: 'Narrowest supported',
          styles: { width: FRAME_WIDTH, height: '568px' }
        }
      },
      defaultViewport: 'narrowest'
    }
  }}
  play={async ({ canvasElement }) => {
    const frame = canvasElement.querySelector<HTMLElement>('[data-frame]');

    if (frame === null) {
      throw new Error('This story has no frame to measure the header against');
    }

    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);

    for (const control of within(canvasElement).getAllByRole('button')) {
      const box = control.getBoundingClientRect();

      await expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
      await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    }

    // The wordmark's words leave the layout here, not the accessibility tree:
    // the page's only h1 keeps its name when the lockup collapses to the mark.
    const heading = within(canvasElement).getByRole('heading', {
      level: 1,
      name: 'biscuit games'
    });

    /*
     * And they do leave it. Measured rather than read off a declaration,
     * because the box is what the viewport pin above decides: at the story
     * run's default 1200px the media query never matches, the words lay out at
     * their natural width, and every other assertion in this play passes
     * anyway — the frame does not overflow, the targets are whole, the heading
     * has its name. Without this line a pin that silently stopped applying
     * would leave the collapse evidence of nothing.
     */
    await expect(
      within(heading)
        .getByText(/^biscuit/)
        .getBoundingClientRect().width
    ).toBeLessThanOrEqual(1);
  }}
>
  {#snippet template(args)}
    <div data-frame style="inline-size: {FRAME_WIDTH}; padding-inline: {SHELL_GUTTER}">
      <HeaderBar {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Dark theme"
  args={{ chip: CHIP, actions: ACTIONS }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
