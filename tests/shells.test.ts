import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Announcer from '../src/lib/components/Announcer.svelte';
import Modal from '../src/lib/components/Modal.svelte';
import Notice from '../src/lib/components/Notice.svelte';

/** A snippet a caller would write inside a dialog. */
function content(html: string) {
  return createRawSnippet(() => ({ render: () => `<div>${html}</div>` }));
}

/*
 * The live region: what has to be said and not shown. Every sentence a product
 * puts here is already on its screen in another form.
 */
describe('Announcer', () => {
  it('carries the message where assistive technology will find it', () => {
    render(Announcer, { message: 'Theme set to dark.', sequence: 1 });

    expect(screen.getByRole('status')).toHaveTextContent('Theme set to dark.');
  });

  it('says nothing when there is nothing to say', () => {
    render(Announcer, { message: null, sequence: 0 });

    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('announces politely rather than interrupting', () => {
    render(Announcer, { message: 'Saved.', sequence: 1 });

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  // Two identical sentences in a row change no text, so the node is replaced.
  it('is heard again when the same thing is said twice', async () => {
    const { rerender } = render(Announcer, { message: 'Saved.', sequence: 1 });
    const region = screen.getByRole('status');
    const said = region.firstChild;

    await rerender({ message: 'Saved.', sequence: 2 });

    expect(screen.getByRole('status')).toBe(region);
    expect(region.firstChild).not.toBe(said);
    expect(region).toHaveTextContent('Saved.');
  });
});

/*
 * What the product is telling the reader right now, visibly and out loud at
 * once. The component carries the sentence; the product decides what it says.
 */
describe('Notice', () => {
  it('says what it is given, where assistive technology will find it', () => {
    render(Notice, { message: 'That is not a word this game knows.' });

    expect(screen.getByRole('status')).toHaveTextContent('That is not a word this game knows.');
  });

  /*
   * The glyph agrees with the words and never replaces them. Both tones say
   * their sentence in full — `AppearanceNeverCarriesMeaningAlone` — and the
   * tick is the one thing that changes between them, so a reader who cannot
   * see it has lost nothing.
   */
  it('draws a different glyph for good news, and the same kind of sentence', () => {
    const alert = render(Notice, { message: 'Copied to the clipboard.' });
    const alertGlyph = alert.container.querySelector('svg')?.outerHTML;

    expect(screen.getByRole('status')).toHaveTextContent('Copied to the clipboard.');
    alert.unmount();

    const success = render(Notice, { message: 'Copied to the clipboard.', tone: 'success' });
    const successGlyph = success.container.querySelector('svg')?.outerHTML;

    expect(screen.getByRole('status')).toHaveTextContent('Copied to the clipboard.');
    expect(successGlyph).toBeDefined();
    expect(successGlyph).not.toBe(alertGlyph);
  });

  /*
   * The region has to be there before it says anything, or the first thing it
   * says arrives with it and a live region that has not changed is not read.
   * So "nothing to say" is an empty region, not an absent one.
   */
  it('keeps an empty region waiting when there is nothing to say', () => {
    render(Notice, { message: null });

    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  /*
   * Two identical sentences in a row change no text, so the nodes are replaced
   * instead. The sequence is what a caller advances for exactly this.
   */
  it('is heard again when the same thing is said twice', async () => {
    const { rerender } = render(Notice, { message: 'Not a word.', sequence: 1 });
    const region = screen.getByRole('status');
    const said = region.firstElementChild;

    await rerender({ message: 'Not a word.', sequence: 2 });

    expect(screen.getByRole('status')).toBe(region);
    expect(region.firstElementChild).not.toBe(said);
  });

  it('can be dismissed when a caller offers to take it back', async () => {
    const ondismiss = vi.fn();
    render(Notice, { message: 'Copied to the clipboard.', tone: 'success', ondismiss });

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(ondismiss).toHaveBeenCalledTimes(1);
  });

  it('offers no dismissal unless a caller does', () => {
    render(Notice, { message: 'Copied to the clipboard.' });

    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });
});

/*
 * The shell a dialog sits in. Every panel a product builds on it owes the
 * keyboard the same three things, so the shell is where they are made true once.
 */
describe('Modal', () => {
  it('is a dialog with a name', () => {
    render(Modal, { title: 'Settings' });

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('takes focus when it opens, so the keyboard arrives inside it', () => {
    render(Modal, { title: 'Settings' });

    expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveFocus();
  });

  it('renders what a caller puts in it, and its actions below', () => {
    render(Modal, {
      title: 'Settings',
      children: content('<p>Whatever the panel puts here.</p>'),
      footer: content('<button type="button">Save</button>')
    });

    expect(screen.getByText('Whatever the panel puts here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  /*
   * The other half of the keyboard's due: the reader is put back where they
   * were. Closing destroys the element focus is on, and the browser falls back
   * to the body, so without this the next Tab starts again from the top of the
   * page.
   */
  it('gives focus back to whatever opened it', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();

    const modal = render(Modal, { title: 'Settings' });

    expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveFocus();

    modal.unmount();

    expect(opener).toHaveFocus();
    opener.remove();
  });

  // An opener that has gone in the meantime is left alone rather than chased.
  it('survives an opener that is no longer there', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();

    const modal = render(Modal, { title: 'Settings' });
    opener.remove();

    expect(() => {
      modal.unmount();
    }).not.toThrow();
  });

  it('closes on Escape', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });

    await userEvent.keyboard('{Escape}');

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  // A caller that offers no way to close gets no control that pretends to,
  // and Escape is as quiet as the missing control.
  it('offers no close at all when a caller keeps it open', async () => {
    render(Modal, { title: 'Well done' });

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('dialog', { name: 'Well done' })).toBeInTheDocument();
  });

  it('closes from its own control', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it('keeps the keyboard inside itself', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });
    const close = screen.getByRole('button', { name: 'Close' });

    await userEvent.tab();

    expect(close).toHaveFocus();

    await userEvent.tab();

    expect(close).toHaveFocus();
  });

  /*
   * Backwards as well as forwards. The panel itself is the starting point, so a
   * shift-Tab from it wraps to the last stop rather than escaping to whatever
   * is behind the dialog, and a shift-Tab from the first stop does the same.
   * From anywhere else inside, the browser's own order is left alone.
   */
  it('wraps a shift-Tab from its start to its end, and otherwise leaves it be', async () => {
    render(Modal, {
      title: 'Settings',
      onclose: vi.fn(),
      children: content('<button type="button">A control</button>')
    });
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    const close = screen.getByRole('button', { name: 'Close' });
    const control = screen.getByRole('button', { name: 'A control' });

    expect(dialog).toHaveFocus();

    await userEvent.tab({ shift: true });

    expect(control).toHaveFocus();

    await userEvent.tab({ shift: true });

    expect(close).toHaveFocus();

    await userEvent.tab({ shift: true });

    expect(control).toHaveFocus();
  });

  // With nothing inside that can take focus there is nothing to cycle, and the
  // handler steps aside rather than trapping the reader on the panel.
  it('leaves Tab alone when nothing inside can take focus', async () => {
    render(Modal, { title: 'Well done' });

    expect(screen.getByRole('dialog', { name: 'Well done' })).toHaveFocus();

    await expect(userEvent.tab()).resolves.toBeUndefined();
  });

  it('ignores keys that are neither Escape nor Tab', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });

    await userEvent.keyboard('a');

    expect(onclose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveFocus();
  });

  /*
   * The trap listens on the panel, so it works only while focus is on it or in
   * it — and a removed element fires no `focusout` for this to answer. So the
   * shell cannot catch a child that removes the control the reader just used;
   * each child carries focus across its own swap, and this records why Escape
   * is worth testing again from wherever focus lands.
   */
  it('answers Escape from anywhere inside itself', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });

    screen.getByRole('button', { name: 'Close' }).focus();
    await userEvent.keyboard('{Escape}');

    expect(onclose).toHaveBeenCalledTimes(1);
  });
});
