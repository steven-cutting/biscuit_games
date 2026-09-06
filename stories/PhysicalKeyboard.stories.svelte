<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import PhysicalKeyboard from '../src/lib/components/PhysicalKeyboard.svelte';
  import { createWindowKeys } from '../src/lib/ports/keys';

  const onpress = fn();
  const keys = createWindowKeys();

  const OVERVIEW = [
    'The device’s own keyboard, wired to a surface for as long as this is mounted and not one',
    'instant longer. It renders nothing.',
    '',
    'Governed by `TypedInput` in `docs/specs/operation.allium`.',
    '',
    '- `@guarantee DroppingTheClaimIsTotal`. A surface stops claiming by not rendering this,',
    '  so the subscription goes away and there is no listener at all — not a listener that',
    '  declines. `tests/typing.test.ts` asserts that directly, by counting listeners.',
    '- `@guarantee AClaimNeverReachesAFocusedControl`. The two stories below are the executable',
    '  half: a key pressed in a field is the field’s, and the key that activates a focused',
    '  control activates it. They are here rather than in `tests/` because only a real engine',
    '  has real focus.',
    '- `@guarantee AModifiedKeyIsNeverClaimed`.',
    '',
    'The port arrives as a prop rather than an import, because a component may not reach for a',
    'browser global. A game builds `createWindowKeys()` at its route; a test hands in',
    '`createFakeKeys()` and stubs nothing.',
    '',
    'No palette is pinned here, and that is deliberate: a component that draws nothing looks',
    'the same in every one, so a pin would prove nothing. `Announcer` says the same.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Play/PhysicalKeyboard',
    component: PhysicalKeyboard,
    tags: ['autodocs'],
    args: { keys, onpress },
    argTypes: {
      keys: { control: false, description: 'The port. A game builds one at its route.' },
      onpress: { description: 'Called with the value the pressed key carries.' },
      bindings: { control: false, description: 'What the physical keys mean here.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Listening. Type anywhere that is not a field and the surface hears it. -->
<Story
  name="Typing reaches the surface"
  play={async () => {
    onpress.mockClear();

    await userEvent.keyboard('a');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Backspace}');
    await userEvent.keyboard('{Control>}a{/Control}');

    await expect(onpress).toHaveBeenNthCalledWith(1, 'a');
    await expect(onpress).toHaveBeenNthCalledWith(2, 'submit');
    await expect(onpress).toHaveBeenNthCalledWith(3, 'delete');
    await expect(onpress).toHaveBeenCalledTimes(3);
  }}
>
  {#snippet template(args)}
    <div>
      <PhysicalKeyboard {...args} />
      <p>This draws nothing. Type, and the surface behind it hears the keys it claimed.</p>
    </div>
  {/snippet}
</Story>

<!-- `AClaimNeverReachesAFocusedControl`, over real focus in a real engine. -->
<Story
  name="A field keeps every key, and a button keeps its own"
  play={async ({ canvasElement }) => {
    onpress.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('textbox', { name: 'Anything' }));
    await userEvent.keyboard('abc');
    await expect(onpress).not.toHaveBeenCalled();

    canvas.getByRole('button', { name: 'Something' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(onpress).not.toHaveBeenCalled();

    // Backspace is not activation, so the surface still hears it.
    await userEvent.keyboard('{Backspace}');
    await expect(onpress).toHaveBeenCalledOnce();
    await expect(onpress).toHaveBeenCalledWith('delete');
  }}
>
  {#snippet template(args)}
    <div style="display: grid; gap: var(--s-5)">
      <PhysicalKeyboard {...args} />
      <label>Anything <input type="text" /></label>
      <button type="button">Something</button>
    </div>
  {/snippet}
</Story>
