<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Keyboard from '../src/lib/components/Keyboard.svelte';
  import { QWERTY } from '../src/lib/components/layouts';
  import type { KeyboardLayout } from '../src/lib/components/layouts';
  import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';

  const onpress = fn();

  const EXACT = { name: 'exact', description: 'correct' } as const;
  const PRESENT = { name: 'present', description: 'in the word, wrong place' } as const;
  const ABSENT = { name: 'absent', description: 'not in the word' } as const;

  const MARKS = { a: EXACT, p: PRESENT, d: ABSENT, o: ABSENT, t: ABSENT };

  /*
   * A layout that is not a word game's. It is here because
   * `ALayoutIsSuppliedRatherThanFixed` is only a claim until something renders a
   * layout this component has never seen — and because a prop nothing here
   * exercises is a branch with nothing to cover it.
   */
  const RACK: KeyboardLayout = [
    [
      { value: 'r', content: 'R', label: 'R, 1 point' },
      { value: 'e', content: 'E', label: 'E, 1 point' },
      { value: 'q', content: 'Q', label: 'Q, 10 points' },
      { value: 'blank', content: ' ', label: 'Blank tile' },
      { value: 'i', content: 'I', label: 'I, 1 point' },
      { value: 'n', content: 'N', label: 'N, 1 point' },
      { value: 'g', content: 'G', label: 'G, 2 points' }
    ],
    [
      { value: 'shuffle', label: 'Shuffle', icon: 'dices', kind: 'action' },
      { value: 'recall', label: 'Recall tiles', icon: 'chevron-left', kind: 'action' },
      { value: 'play', label: 'Play word', icon: 'corner-down-left', kind: 'action' }
    ]
  ];

  const SHELL_GUTTER = '1rem';
  const SHELL_WIDTH = '34rem';

  const OVERVIEW = [
    'A laid-out grid of pressable keys. The layout is what the surface is; the marks are what',
    'this turn has made of it, and they are separate props because one is a constant a game',
    'declares once and the other changes every turn.',
    '',
    'Governed by `EntryKeyboard` in `docs/specs/play-surfaces.allium`.',
    '',
    '- `@guarantee ALayoutIsSuppliedRatherThanFixed`. This component names no key. **A rack,',
    '  not a keyboard** is the executable evidence: a layout it has never seen renders exactly',
    '  the keys that layout names, and the width story proves the row still divides.',
    '- `DirectManipulation.@invariant EveryControlIsAComfortableTarget`. **At the narrowest',
    '  supported width** is the evidence: the row meets the figure top to bottom, divides its',
    '  width equally among the keys that build a turn, keeps a gap between them, and does not',
    '  scroll sideways. A key that ends a turn is wider and never narrower.',
    '- `Operation.@guarantee FullyKeyboardOperable`. Every key is a tab stop and both activation',
    '  keys work, which the two interaction stories hold.',
    '',
    'One callback rather than one per action: a rack needs shuffle, recall, play, pass and',
    'exchange, and two named callbacks cannot express five. `onpress` carries the key’s own',
    'value, and the game already knows its values because it wrote the layout.',
    '',
    'Axe judges none of the contrast here: it downgrades an element whose visible text is one',
    'character to *incomplete*, so no key has ever been judged by its contrast rule.',
    '`tests/contrast.test.ts` is what holds those figures.'
  ].join('\n');

  interface MeasuredKey {
    box: DOMRect;
    /*
     * Read from the layout that was passed rather than from the DOM, because
     * nothing puts `kind` on the element and a name-shaped guess does not
     * survive a rack of scored tiles or a two-character key.
     */
    action: boolean;
  }

  /*
   * Which keys share a line is a rendering fact, so it is read from geometry
   * rather than from a class name: a story that measures layout should not
   * depend on the class names the layout happens to use.
   */
  function keyRows(canvasElement: HTMLElement, layout: KeyboardLayout): MeasuredKey[][] {
    const kinds = layout.flatMap((row) => row.map((key) => key.kind === 'action'));
    const rows: MeasuredKey[][] = [];
    let line = Number.NaN;

    within(canvasElement)
      .getAllByRole('button')
      .forEach((key, index) => {
        const box = key.getBoundingClientRect();
        const top = Math.round(box.top);
        const current = rows.at(-1);

        if (current === undefined || top !== line) {
          rows.push([{ box, action: kinds[index] ?? false }]);
          line = top;
        } else {
          current.push({ box, action: kinds[index] ?? false });
        }
      });

    return rows;
  }

  function frameOf(canvasElement: HTMLElement): HTMLElement {
    const frame = canvasElement.querySelector<HTMLElement>('[data-frame]');

    if (frame === null) {
      throw new Error('This story has no frame to measure the keyboard against');
    }
    return frame;
  }

  async function divides(canvasElement: HTMLElement, layout: KeyboardLayout): Promise<void> {
    const frame = frameOf(canvasElement);

    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);

    for (const row of keyRows(canvasElement, layout)) {
      const builders = row.filter((key) => !key.action).map((key) => key.box.width);

      /*
       * "Divides its width equally among the controls that build a turn" says
       * nothing about a row that has none — a rack's action row is one, and it
       * is why this story renders a layout the component has never seen. The
       * keys still owe the figure top to bottom, and the row still owes its
       * gaps.
       */
      if (builders.length > 0) {
        await expect(Math.max(...builders) - Math.min(...builders)).toBeLessThan(1);
      }

      for (const key of row) {
        await expect(key.box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);

        // Wider, never narrower: a key that ends a turn is the last place to
        // save width, so it is measured against the narrowest key beside it
        // that builds one.
        if (key.action && builders.length > 0) {
          await expect(key.box.width).toBeGreaterThanOrEqual(Math.min(...builders));
        }
      }

      for (let index = 1; index < row.length; index += 1) {
        const left = row[index];
        const before = row[index - 1];

        if (left === undefined || before === undefined) {
          throw new Error('A measured row lost a key between reads');
        }
        // A gap between every pair, which is the half of the clause an equal
        // division alone would not give.
        await expect(left.box.left).toBeGreaterThan(before.box.right);
      }
    }
  }

  const { Story } = defineMeta({
    title: 'Play/Keyboard',
    component: Keyboard,
    tags: ['autodocs'],
    args: { onpress },
    argTypes: {
      layout: { control: false, description: 'Rows of keys. Defaults to QWERTY.' },
      marks: { control: false, description: 'What this turn made of each key, by value.' },
      label: { control: 'text', description: 'The group’s accessible name.' },
      disabled: { control: 'boolean', description: 'Turns every key off at once.' },
      onpress: { description: 'Called with the value of the key that was pressed.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story name="Fresh" />
<Story name="With marks from a turn" args={{ marks: MARKS }} />
<Story name="Switched off" args={{ marks: MARKS, disabled: true }} />

<!-- The claim `ALayoutIsSuppliedRatherThanFixed` makes, rendered. -->
<Story
  name="A rack, not a keyboard"
  args={{ layout: RACK, label: 'Your rack' }}
  play={async ({ canvasElement }) => {
    onpress.mockClear();
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('group', { name: 'Your rack' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('button')).toHaveLength(10);
    await expect(canvas.queryByRole('button', { name: 'Enter' })).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Shuffle' }));
    await expect(onpress).toHaveBeenCalledOnce();
    await expect(onpress).toHaveBeenCalledWith('shuffle');
  }}
/>

<Story
  name="Every key is reachable by Tab"
  play={async ({ canvasElement }) => {
    const keys = within(canvasElement).getAllByRole('button');

    for (const key of keys) {
      await userEvent.tab();
      await expect(key).toHaveFocus();
    }
  }}
/>

<Story
  name="A focused key answers Enter and Space"
  play={async ({ canvasElement }) => {
    onpress.mockClear();
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button', { name: 'Q' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('[Space]');

    await expect(onpress).toHaveBeenCalledTimes(2);
    await expect(onpress).toHaveBeenCalledWith('q');
  }}
/>

<!--
  The one place `EveryControlIsAComfortableTarget` cannot be met in both
  directions, and what it says happens instead. Here rather than in `tests/`
  because jsdom returns zeros for every one of these numbers.
-->
<Story
  name="At the narrowest supported width"
  play={async ({ canvasElement }) => {
    await divides(canvasElement, QWERTY);
  }}
>
  {#snippet template(args)}
    <div
      data-frame
      style="inline-size: {NARROWEST_SUPPORTED_WIDTH}px; padding-inline: {SHELL_GUTTER}"
    >
      <Keyboard {...args} />
    </div>
  {/snippet}
</Story>

<!-- The same rule over a layout the component has never seen. -->
<Story
  name="A rack at the narrowest supported width"
  args={{ layout: RACK, label: 'Your rack' }}
  play={async ({ canvasElement }) => {
    await divides(canvasElement, RACK);
  }}
>
  {#snippet template(args)}
    <div
      data-frame
      style="inline-size: {NARROWEST_SUPPORTED_WIDTH}px; padding-inline: {SHELL_GUTTER}"
    >
      <Keyboard {...args} />
    </div>
  {/snippet}
</Story>

<!-- At the width a page shell gives it, where every key meets the figure both ways. -->
<Story
  name="At the width the page gives it"
  play={async ({ canvasElement }) => {
    await divides(canvasElement, QWERTY);

    for (const row of keyRows(canvasElement, QWERTY)) {
      for (const key of row) {
        await expect(key.box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
      }
    }
  }}
>
  {#snippet template(args)}
    <div data-frame style="inline-size: {SHELL_WIDTH}; padding-inline: {SHELL_GUTTER}">
      <Keyboard {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Dark theme"
  args={{ marks: MARKS }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>

<Story
  name="Light theme, high contrast"
  args={{ marks: MARKS }}
  globals={{ theme: 'light', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
/>

<Story
  name="Dark theme, high contrast"
  args={{ marks: MARKS }}
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
/>
