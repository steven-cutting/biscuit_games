import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Input from '../src/lib/components/Input.svelte';
import SegmentedControl from '../src/lib/components/SegmentedControl.svelte';
import Select from '../src/lib/components/Select.svelte';
import SettingsRow from '../src/lib/components/SettingsRow.svelte';
import Switch from '../src/lib/components/Switch.svelte';

/*
 * `docs/specs/operation.allium` — the `Fields` surface.
 *
 * Every control here answers the same four clauses, so they are tested together
 * rather than one file each: a name bound to the control rather than beside it,
 * the control's own words bound to it too, a refusal reported and not only
 * inked, and a group of exclusive choices that is one stop with the arrows
 * moving inside it. What each one draws is the story run's, as always.
 *
 * None of these is wired to a setting anywhere, and that is deliberate.
 * `appearance.allium` excludes the controls that change its settings and carries
 * an open question about the contrast escape hatch; binding one of these to
 * `high_contrast` would answer it by building it. Decision 0017 says so.
 */

/** A snippet for `SettingsRow`'s children, the way a caller writes a control inside it. */
function says(text: string) {
  return createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
}

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
] as const;

describe('Switch', () => {
  it('is a switch named by its label, reporting the state it is in', () => {
    render(Switch, { label: 'Animations', checked: true });

    expect(screen.getByRole('switch', { name: 'Animations' })).toBeChecked();
  });

  /*
   * `AppearanceNeverCarriesMeaningAlone`. The knob's position is one non-colour
   * indication and the word beside it is the other, and the word is `aria-hidden`
   * for the same reason `Marker`'s bar is: a reader who is told "Animations,
   * switch, on" does not also need "On" read to them, and a name that changed as
   * the control was operated would be a different control each time.
   */
  it('says which way it is set in words as well as in position', () => {
    const { unmount } = render(Switch, { label: 'Animations', checked: true });

    const on = screen.getByText('On');
    expect(on).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('switch', { name: 'Animations' })).toBeInTheDocument();
    unmount();

    render(Switch, { label: 'Animations', checked: false });
    expect(screen.getByText('Off')).toHaveAttribute('aria-hidden', 'true');
  });

  it('hands back the setting it was moved to', async () => {
    const onchange = vi.fn();
    render(Switch, { label: 'Animations', checked: false, onchange });

    await userEvent.click(screen.getByRole('switch', { name: 'Animations' }));

    expect(onchange).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('binds its own line of consequence to itself', () => {
    render(Switch, {
      label: 'Animations',
      description: 'Biscuit reduces to the mark.',
      checked: true
    });

    expect(screen.getByRole('switch', { name: 'Animations' })).toHaveAccessibleDescription(
      'Biscuit reduces to the mark.'
    );
  });

  it('cannot be moved when it is unavailable', async () => {
    const onchange = vi.fn();
    render(Switch, { label: 'Animations', checked: false, disabled: true, onchange });

    const control = screen.getByRole('switch', { name: 'Animations' });
    expect(control).toBeDisabled();

    await userEvent.click(control);
    expect(onchange).not.toHaveBeenCalled();
  });

  it('asks nothing of a caller that supplied no handler', async () => {
    render(Switch, { label: 'Animations' });

    await expect(
      userEvent.click(screen.getByRole('switch', { name: 'Animations' }))
    ).resolves.toBeUndefined();
  });
});

describe('SegmentedControl', () => {
  it('is a named group of exclusive choices, with the taken one taken', () => {
    render(SegmentedControl, { label: 'Theme', options: THEMES, value: 'dark' });

    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Light' })).not.toBeChecked();
  });

  it('hands back the choice that was taken', async () => {
    const onchange = vi.fn();
    render(SegmentedControl, { label: 'Theme', options: THEMES, value: 'system', onchange });

    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));

    expect(onchange).toHaveBeenCalledExactlyOnceWith('light');
  });

  /*
   * `AGroupOfExclusiveChoicesIsOneStopAndArrowsMoveWithinIt`, which is the whole
   * argument for native radios over the design system's buttons wearing
   * `role="radio"`. The reference implements neither half — every button is its
   * own tab stop and no arrow key does anything — and a group reachable in one
   * stop with no way to move inside it is a reachable first option rather than a
   * reachable choice.
   */
  it('is one tab stop, whatever the group holds', async () => {
    render(SegmentedControl, { label: 'Theme', options: THEMES, value: 'system' });

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'System' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Light' })).not.toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toHaveFocus();
  });

  it('moves between the choices on an arrow key', async () => {
    const onchange = vi.fn();
    render(SegmentedControl, { label: 'Theme', options: THEMES, value: 'system', onchange });

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');

    expect(onchange).toHaveBeenCalledExactlyOnceWith('light');
  });

  it('binds its own line of consequence to the group', () => {
    render(SegmentedControl, {
      label: 'Theme',
      description: 'Dark is where Biscuit Games starts.',
      options: THEMES,
      value: 'dark'
    });

    expect(screen.getByRole('group', { name: 'Theme' })).toHaveAccessibleDescription(
      'Dark is where Biscuit Games starts.'
    );
  });
});

describe('SettingsRow', () => {
  /*
   * All it is. The design system's row also carries the setting's name and its
   * line of consequence, and decision 0017 moved both onto the controls: the row
   * has to *be* the label for the whole of it to be the target, and only the
   * control knows which element that is. What is left is the rule between one
   * setting and the next, which is genuinely the row's own.
   */
  it('carries the control it separates', () => {
    render(SettingsRow, { children: says('A control goes here') });

    expect(screen.getByText('A control goes here')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('is a field named by a label bound to it', () => {
    render(Input, { label: 'Your link' });

    expect(screen.getByRole('textbox', { name: 'Your link' })).toBeInTheDocument();
  });

  /*
   * A placeholder is not a name: it is gone the moment the reader types, so a
   * name carried there disappears exactly when the field is in use. It is a
   * hint about the shape of an answer and nothing more, which is what
   * `AFieldIsNamedByALabelBoundToIt` says.
   */
  it('is still named by its label when it also carries a placeholder', () => {
    render(Input, { label: 'Your link', placeholder: 'https://' });

    expect(screen.getByRole('textbox', { name: 'Your link' })).toHaveAttribute(
      'placeholder',
      'https://'
    );
  });

  it('binds its helper line to itself', () => {
    render(Input, { label: 'Your link', hint: 'Anything the browser can open.' });

    expect(screen.getByRole('textbox', { name: 'Your link' })).toHaveAccessibleDescription(
      'Anything the browser can open.'
    );
  });

  /*
   * `AFieldThatIsWrongSaysSo`. The sentence is bound and the refusal is in the
   * accessibility tree, so neither the ink nor the words alone are carrying it.
   */
  it('reports a refusal rather than only drawing one', () => {
    render(Input, { label: 'Your link', invalid: true, hint: 'That is not a link.' });

    const field = screen.getByRole('textbox', { name: 'Your link' });

    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('That is not a link.');
  });

  it('says nothing of the kind when it is taking what it is given', () => {
    render(Input, { label: 'Your link' });

    expect(screen.getByRole('textbox', { name: 'Your link' })).not.toHaveAttribute('aria-invalid');
  });

  it('hands back what was typed into it', async () => {
    const oninput = vi.fn();
    render(Input, { label: 'Your link', oninput });

    await userEvent.type(screen.getByRole('textbox', { name: 'Your link' }), 'ab');

    expect(oninput).toHaveBeenCalledTimes(2);
    expect(oninput).toHaveBeenLastCalledWith('ab');
  });

  it('asks nothing of a caller that supplied no handler', async () => {
    render(Input, { label: 'Your link' });

    await expect(
      userEvent.type(screen.getByRole('textbox', { name: 'Your link' }), 'a')
    ).resolves.toBeUndefined();
  });
});

describe('Select', () => {
  it('is a field named by a label bound to it, holding what it was given', () => {
    render(Select, { label: 'Theme', options: THEMES, value: 'dark' });

    const field = screen.getByRole('combobox', { name: 'Theme' });

    expect(field).toHaveValue('dark');
    expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument();
  });

  it('hands back the option that was chosen', async () => {
    const onchange = vi.fn();
    render(Select, { label: 'Theme', options: THEMES, value: 'system', onchange });

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Theme' }), 'light');

    expect(onchange).toHaveBeenCalledExactlyOnceWith('light');
  });

  it('binds its own line of consequence to itself', () => {
    render(Select, {
      label: 'Theme',
      description: 'Dark is where Biscuit Games starts.',
      options: THEMES,
      value: 'dark'
    });

    expect(screen.getByRole('combobox', { name: 'Theme' })).toHaveAccessibleDescription(
      'Dark is where Biscuit Games starts.'
    );
  });

  it('asks nothing of a caller that supplied no handler', async () => {
    render(Select, { label: 'Theme', options: THEMES, value: 'system' });

    await expect(
      userEvent.selectOptions(screen.getByRole('combobox', { name: 'Theme' }), 'dark')
    ).resolves.not.toThrow();
  });

  /*
   * A field whose list has not arrived yet. It stays a named control with
   * nothing in it rather than disappearing, which is the opposite of what
   * `Keyboard` does with an empty layout and deliberately so: a keyboard is a
   * group a reader navigates into and finds empty, while a select still reports
   * what it is for and what it currently holds. The name survives either way,
   * which is the part that matters.
   */
  it('is still a named control when there is nothing to choose', () => {
    render(Select, { label: 'Theme', options: [] });

    expect(screen.getByRole('combobox', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.queryByRole('option')).toBeNull();
  });

  /*
   * Given no value, the binding writes nothing — it has nothing to write and
   * nothing it last wrote — so the browser's own rule stands and the first
   * option is the taken one, exactly as in a `<select>` nobody has touched.
   * Worth naming because the case below looks the same from a caller's side and
   * is not: a value *taken away* leaves none taken at all.
   */
  it('leaves the first option standing when it is given no value', () => {
    render(Select, { label: 'Theme', options: THEMES });

    expect(screen.getByRole('option', { name: 'System', selected: true })).toBeInTheDocument();
  });

  /*
   * A value taken away. Svelte's `<select value>` binding writes only when the
   * value differs from what it last wrote, and it starts holding nothing — so
   * the arm that handles the value becoming nothing *again* is reachable from a
   * rerender and from nowhere else. What it does is drop the selection rather
   * than fall back to the first option: the field ends up holding none of them,
   * which is the state a fresh `<select>` cannot be in and the reason this is
   * worth stating. The name and the list survive it, which is the part a reader
   * depends on.
   */
  it('takes no choice at all when its value is taken away', async () => {
    const { rerender } = render(Select, { label: 'Theme', options: THEMES, value: 'dark' });

    expect(screen.getByRole('option', { name: 'Dark', selected: true })).toBeInTheDocument();

    await rerender({ label: 'Theme', options: THEMES, value: undefined });

    expect(screen.queryByRole('option', { selected: true })).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Theme' })).toBeInTheDocument();
  });
});
