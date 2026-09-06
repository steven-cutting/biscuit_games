<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Key from '../src/lib/components/Key.svelte';
  import { MINIMUM_TOUCH_TARGET } from '../src/lib/config';

  const onpress = fn();

  const EXACT = { name: 'exact', description: 'correct' } as const;
  const PRESENT = { name: 'present', description: 'in the word, wrong place' } as const;
  const ABSENT = { name: 'absent', description: 'not in the word' } as const;

  const OVERVIEW = [
    'One cell of a play surface that is pressed: a keyboard key, a crossword cell a reader types',
    'into, a rack tile they pick up. Same paint as `Tile` and the same marker bar, over a real',
    'button — so it takes focus, answers Enter and Space, and reports its own unavailability.',
    '',
    'Governed by `EntryKeyboard` in `docs/specs/play-surfaces.allium` and by `operation.allium`.',
    '',
    '- `@guarantee EveryKeyIsAControl`. A real button with a name; a key drawn as a glyph says',
    '  its action in words instead, because there is no text to fall back on.',
    '- `DirectManipulation.@invariant EveryControlIsAComfortableTarget`. Measured below, here',
    '  rather than in `tests/`, because jsdom has no layout engine.',
    '- `Appearance.@guarantee AnUnavailableControlIsExempt`. A key the reader can no longer',
    '  operate is dimmed and held to no ratio — and keeps its bar, its name and its state in the',
    '  accessibility tree, because that exemption is from the figures alone.',
    '',
    'How wide it comes out is its row’s business rather than its own: `flex` and a zero',
    'inline floor are what let a dense row divide equally instead of overflowing.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Play/Key',
    component: Key,
    tags: ['autodocs'],
    args: { label: 'A', content: 'A', onpress },
    argTypes: {
      label: { control: 'text', description: 'The accessible name, before the mark’s words.' },
      content: { control: 'text', description: 'What the key shows. Drawn exactly as given.' },
      icon: {
        control: 'text',
        description: 'Drawn instead of content, for a key that is a glyph.'
      },
      mark: { control: false, description: 'A mark and the game’s words for it, together.' },
      action: { control: 'boolean', description: 'Ends a turn rather than building one.' },
      disabled: { control: 'boolean' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- A key nothing is known about. It hugs the page, and its border is the one
     hairline that pays a control's boundary floor in the dark themes. -->
<Story
  name="Untried"
  play={async ({ canvasElement }) => {
    onpress.mockClear();
    const key = within(canvasElement).getByRole('button', { name: 'A' });
    const box = key.getBoundingClientRect();

    await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);

    await userEvent.click(key);
    await expect(onpress).toHaveBeenCalledOnce();
  }}
/>

<Story name="Exact" args={{ mark: EXACT }} />
<Story name="Present" args={{ mark: PRESENT }} />
<Story name="Absent" args={{ mark: ABSENT }} />

<!-- A key whose meaning is a glyph. The name is required: there is no text. -->
<Story
  name="A key drawn as a glyph"
  args={{ label: 'Enter', content: '', icon: 'corner-down-left', action: true }}
/>

<!--
  `AnUnavailableControlIsExempt`, and the half of it that is not a ratio: the
  bar and the name survive the dimming, so what the eye reads as unavailable a
  reader is told in words.
-->
<Story
  name="Switched off, and still legible"
  args={{ mark: PRESENT, disabled: true }}
  play={async ({ canvasElement }) => {
    const key = within(canvasElement).getByRole('button', {
      name: 'A, in the word, wrong place'
    });

    await expect(key).toBeDisabled();
    await expect(key.querySelector('[data-marker]')).not.toBeNull();
  }}
/>

<!--
  `ATapDoesOnlyWhatTheControlDoes` and `ATouchIsAcknowledged`, which
  `tests/operation.test.ts` holds over the stylesheet and this holds over a
  rendered key. `-webkit-tap-highlight-color` is here and nowhere else: jsdom's
  parser drops it entirely.
-->
<Story
  name="A key answers to a finger"
  play={async ({ canvasElement }) => {
    const key = within(canvasElement).getByRole('button', { name: 'A' });
    const painted = getComputedStyle(key);

    await expect(painted.touchAction).toBe('manipulation');
    await expect(painted.userSelect).toBe('none');
    // Read by name rather than by property: the tap highlight is not standard,
    // so `CSSStyleDeclaration` does not carry it and jsdom's parser drops it
    // entirely — which is why this assertion lives here and not in `tests/`.
    await expect(painted.getPropertyValue('-webkit-tap-highlight-color')).toBe('rgba(0, 0, 0, 0)');
  }}
/>

<Story
  name="Dark theme, high contrast"
  args={{ mark: EXACT }}
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
/>
