<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Button from '../src/lib/components/Button.svelte';
  import Modal from '../src/lib/components/Modal.svelte';

  const onclose = fn();

  const OVERVIEW = [
    'The shell a dialog sits in.',
    '',
    'No governing surface of its own: every panel a product builds on it owes the keyboard the',
    'same three things, and this is where they are made true once. It takes focus when it opens,',
    'closes on Escape, and cycles Tab inside itself rather than letting the keyboard wander out to',
    'the page behind — over the stops the keyboard really makes, which are not the ones a selector',
    'matches: a group of radios is one stop between them, a control the layout does not draw is',
    'none at all, and a disclosure’s summary is one that no list of form controls names.',
    '`Modal.svelte` says which cases a selector still cannot settle. The play functions below are',
    'the evidence for the three promises.',
    '',
    'Not a native `<dialog>`: jsdom implements neither `showModal` nor `close`, so a component',
    'built on one could not be tested where the rest of the suite runs, and an untestable',
    'accessible shell is the wrong trade for behaviour this small.',
    '',
    'A caller that supplies no `onclose` gets no close control and no Escape; `footer` is where',
    'its actions go, rule-separated from the body so a dialog reads as content and then',
    'commitment.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/Modal',
    component: Modal,
    tags: ['autodocs'],
    args: { title: 'Settings', onclose },
    argTypes: {
      title: { control: 'text', description: 'Becomes the dialog’s accessible name.' },
      onclose: { description: 'Omit it and the dialog offers no way out of its own.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- The shell, with content and a commitment. -->
<Story name="Open">
  {#snippet template(args)}
    <Modal {...args}>
      {#snippet footer()}
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save</Button>
      {/snippet}
      <p>Whatever the panel puts here.</p>
      <button type="button">A control</button>
    </Modal>
  {/snippet}
</Story>

<!-- Focus arrives inside, and Escape closes it. -->
<Story
  name="Closes on Escape"
  play={async ({ canvasElement }) => {
    onclose.mockClear();
    await expect(within(canvasElement).getByRole('dialog')).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(onclose).toHaveBeenCalledTimes(1);
  }}
>
  {#snippet template(args)}
    <Modal {...args}>
      <button type="button">A control</button>
    </Modal>
  {/snippet}
</Story>

<!--
  Tab cycles inside. Two stops here — Close in the header row first, then the
  control — so a third Tab has to land back on Close rather than on the page
  behind the dialog.
-->
<Story
  name="Keeps the keyboard inside"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('button', { name: 'A control' });
    const close = canvas.getByRole('button', { name: 'Close' });

    await userEvent.tab();
    await expect(close).toHaveFocus();

    await userEvent.tab();
    await expect(control).toHaveFocus();

    await userEvent.tab();
    await expect(close).toHaveFocus();
  }}
>
  {#snippet template(args)}
    <Modal {...args}>
      <button type="button">A control</button>
    </Modal>
  {/snippet}
</Story>

<!--
  The stops the keyboard really makes, which are not the ones the selector
  matches: a group of radios is one stop between them, and the control the panel
  has styled away is no stop at all, so the order here is Close, Light, and back
  to Close. This is the settings shape the shell exists for, rendered where axe
  can see it: the panel a game builds on a choice with three answers.
-->
<Story
  name="Cycles past the stops the keyboard skips"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Close' });

    await userEvent.tab();
    await expect(close).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'Light' })).toHaveFocus();

    await userEvent.tab();
    await expect(close).toHaveFocus();
  }}
>
  {#snippet template(args)}
    <Modal {...args}>
      <fieldset>
        <legend>Theme</legend>
        <p><label><input type="radio" name="theme" value="light" checked /> Light</label></p>
        <p><label><input type="radio" name="theme" value="dark" /> Dark</label></p>
        <p><label><input type="radio" name="theme" value="system" /> Follow the device</label></p>
      </fieldset>
      <div style="display: none">
        <button type="button">Not drawn</button>
      </div>
    </Modal>
  {/snippet}
</Story>

<!-- A dialog a caller keeps open offers no control that pretends otherwise. -->
<Story name="No way out, by design" args={{ onclose: undefined, title: 'Well done' }}>
  {#snippet template(args)}
    <Modal {...args}>
      <p>The only way on is the button below.</p>
      <Button variant="primary">Continue</Button>
    </Modal>
  {/snippet}
</Story>

<!-- The scrim, the surface and its lift, where they were designed first. -->
<Story
  name="Dark theme"
  globals={{ theme: 'dark' }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
>
  {#snippet template(args)}
    <Modal {...args}>
      {#snippet footer()}
        <Button variant="primary">Save</Button>
      {/snippet}
      <p>Whatever the panel puts here.</p>
    </Modal>
  {/snippet}
</Story>
