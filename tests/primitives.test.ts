import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Badge from '../src/lib/components/Badge.svelte';
import Button from '../src/lib/components/Button.svelte';
import Card from '../src/lib/components/Card.svelte';
import CardLabel from '../src/lib/components/CardLabel.svelte';
import GameCard from '../src/lib/components/GameCard.svelte';
import HeaderBar from '../src/lib/components/HeaderBar.svelte';
import Icon from '../src/lib/components/Icon.svelte';
import IconButton from '../src/lib/components/IconButton.svelte';
import { ICONS } from '../src/lib/components/icons';
import type { IconName } from '../src/lib/components/icons';
import ButtonHost from './ButtonHost.svelte';

/** A snippet for `Button`'s children, the way a caller writes text inside it. */
function says(text: string) {
  return createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
}

/*
 * The icon map's one renderer. Decorative by construction: an icon never has a
 * role or a name, because the control it sits in carries both.
 */
describe('Icon', () => {
  it('renders a real svg for every name in the map', () => {
    for (const name of Object.keys(ICONS) as IconName[]) {
      const { container, unmount } = render(Icon, { name });

      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });

  it('is hidden from assistive technology', () => {
    const { container } = render(Icon, { name: 'check' });

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  // The square is the caller's to size, and the glyph inside follows it. 20 is
  // the default because a chrome control is the commonest place an icon sits.
  it('is drawn at the size it is asked for', () => {
    const { container } = render(Icon, { name: 'check', size: 16 });

    expect(container.querySelector('[aria-hidden="true"]')).toHaveStyle('--icon-size: 16px');
  });
});

/*
 * The square chrome control. Its name is a required prop rather than an
 * inference from the glyph, because these are exactly the controls a shape
 * alone would leave unnamed.
 */
describe('IconButton', () => {
  it('is a button named by its label, not its shape', async () => {
    const onclick = vi.fn();
    render(IconButton, { label: 'Settings', icon: 'settings', onclick });

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled, and a disabled one reports nothing', async () => {
    const onclick = vi.fn();
    render(IconButton, { label: 'Close', icon: 'x', onclick, disabled: true });
    const control = screen.getByRole('button', { name: 'Close' });

    expect(control).toBeDisabled();

    await userEvent.click(control);

    expect(onclick).not.toHaveBeenCalled();
  });

  it('stays quiet when no handler is supplied', async () => {
    render(IconButton, { label: 'Close', icon: 'x' });

    await expect(
      userEvent.click(screen.getByRole('button', { name: 'Close' }))
    ).resolves.toBeUndefined();
  });

  // A header action opens a dialog and says so; Modal's Close opens nothing.
  it('announces a popup only when told it opens one', () => {
    const { unmount } = render(IconButton, {
      label: 'Settings',
      icon: 'settings',
      popup: 'dialog'
    });

    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-haspopup',
      'dialog'
    );
    unmount();

    render(IconButton, { label: 'Close', icon: 'x' });

    expect(screen.getByRole('button', { name: 'Close' })).not.toHaveAttribute('aria-haspopup');
  });
});

describe('Button', () => {
  it('is named by its children and reports a press', async () => {
    const onclick = vi.fn();
    render(Button, { onclick, children: says('Continue') });

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  // The variants and sizes are paint: role and name never move with them.
  it('keeps its role and name across every variant and size', () => {
    for (const variant of ['primary', 'secondary', 'ghost'] as const) {
      for (const size of ['sm', 'md'] as const) {
        const { unmount } = render(Button, { variant, size, children: says('Continue') });

        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
        unmount();
      }
    }
  });

  it('submits a wrapping form when asked to', async () => {
    const onclick = vi.fn();
    render(Button, { type: 'submit', onclick, children: says('Save') });

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  // The selected one of a set is marked, so the sentence beside it can agree.
  it('announces the current choice only when told it is one', () => {
    const { unmount } = render(Button, { current: true, children: says('Dark') });

    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-current', 'true');
    unmount();

    render(Button, { children: says('Light') });

    expect(screen.getByRole('button', { name: 'Light' })).not.toHaveAttribute('aria-current');
  });

  it('can be disabled', async () => {
    const onclick = vi.fn();
    render(Button, { disabled: true, onclick, children: says('Continue') });
    const control = screen.getByRole('button', { name: 'Continue' });

    expect(control).toBeDisabled();

    await userEvent.click(control);

    expect(onclick).not.toHaveBeenCalled();
  });

  // A submit button inside a form has a job without a handler; a press on it
  // must not throw for want of one.
  it('stays quiet when no handler is supplied', async () => {
    render(Button, { children: says('Continue') });

    await expect(
      userEvent.click(screen.getByRole('button', { name: 'Continue' }))
    ).resolves.toBeUndefined();
  });

  /*
   * The bindable element is the caller's handle on the control that was
   * rendered, and it is the handle a child carries focus across its own swap
   * by — `Modal` says why nothing outside the child can catch that. The binding
   * is written in `ButtonHost`, because a binding is template syntax and this
   * file has none.
   */
  it('hands the caller the control it rendered', () => {
    const received = vi.fn<(element: HTMLButtonElement | undefined) => void>();
    render(ButtonHost, { children: says('Continue'), received });

    expect(received.mock.calls.at(-1)?.[0]).toBe(screen.getByRole('button', { name: 'Continue' }));
  });
});

/*
 * The platform chrome. The hub renders it with nothing but the lockup; a game
 * brings a chip and its actions, and the component is held to both shapes.
 */
describe('HeaderBar', () => {
  it('carries the platform lockup as the page heading, and nothing else by default', () => {
    render(HeaderBar, {});

    // The accessible name rather than the text content: the mark's "b" is in
    // the text and out of the name, and the name is what a reader is given.
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('biscuit games');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // A game's lockup is the platform's words and then its own.
  it('lets a product bring its own lockup', () => {
    render(HeaderBar, { brand: says('biscuit games / a game') });

    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'biscuit games / a game'
    );
  });

  it('offers the actions under the names given, in the order given', async () => {
    const onsettings = vi.fn();
    const onabout = vi.fn();
    render(HeaderBar, {
      actions: [
        { icon: 'settings', label: 'Settings', onclick: onsettings, popup: 'dialog' },
        { icon: 'info', label: 'About', onclick: onabout }
      ]
    });

    expect(
      screen.getAllByRole('button').map((control) => control.getAttribute('aria-label'))
    ).toEqual(['Settings', 'About']);

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    await userEvent.click(screen.getByRole('button', { name: 'About' }));

    expect(onsettings).toHaveBeenCalledTimes(1);
    expect(onabout).toHaveBeenCalledTimes(1);

    // An action that opens a dialog says so; one that does not, does not.
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-haspopup',
      'dialog'
    );
    expect(screen.getByRole('button', { name: 'About' })).not.toHaveAttribute('aria-haspopup');
  });

  /*
   * A chrome action is often a toggle, and a toggle is renamed by the press
   * that operates it. The control has to survive that rename, or the keyboard
   * loses its place every time the sound is muted.
   */
  it('keeps focus on an action that the press renames', async () => {
    const onmute = vi.fn();
    const { rerender } = render(HeaderBar, {
      actions: [
        { icon: 'settings', label: 'Mute', onclick: onmute },
        { icon: 'info', label: 'About', onclick: vi.fn() }
      ]
    });

    screen.getByRole('button', { name: 'Mute' }).focus();

    await rerender({
      actions: [
        { icon: 'settings', label: 'Unmute', onclick: onmute },
        { icon: 'info', label: 'About', onclick: vi.fn() }
      ]
    });

    expect(screen.getByRole('button', { name: 'Unmute' })).toHaveFocus();
  });

  /*
   * Two actions under one name is a poor name rather than a broken list, and
   * nothing in the contract forbids it, so the component renders what it was
   * given instead of refusing the whole header.
   */
  it('renders the list it is given, even where two actions share a name', () => {
    render(HeaderBar, {
      actions: [
        { icon: 'settings', label: 'Settings', onclick: vi.fn() },
        { icon: 'menu', label: 'Settings', onclick: vi.fn() }
      ]
    });

    expect(screen.getAllByRole('button', { name: 'Settings' })).toHaveLength(2);
  });

  /*
   * The chip's visible word is state readable as text, and its label says the
   * state and what pressing it does. The two are separate props because the
   * word is what a glance takes in and the label is what a screen reader says.
   */
  it('shows the chip word and says what pressing it does', async () => {
    const onclick = vi.fn();
    render(HeaderBar, {
      chip: { word: 'Dark', label: 'Theme: dark — change theme', onclick, popup: 'dialog' }
    });
    const chip = screen.getByRole('button', { name: 'Theme: dark — change theme' });

    expect(chip).toHaveTextContent('Dark');
    expect(chip).toHaveAttribute('aria-haspopup', 'dialog');

    await userEvent.click(chip);

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('announces a popup on the chip only when told it opens one', () => {
    render(HeaderBar, { chip: { word: 'Dark', label: 'Theme: dark', onclick: vi.fn() } });

    expect(screen.getByRole('button', { name: 'Theme: dark' })).not.toHaveAttribute(
      'aria-haspopup'
    );
  });

  /*
   * The divider between the chip and the actions is paint: drawn only when
   * there is something on both sides of it, and in the accessibility tree in
   * neither case. So what is asserted is that the tree holds exactly the
   * controls, whichever side is empty.
   */
  it('puts nothing but the controls in the accessibility tree, with or without a divider', () => {
    const chip = { word: 'Dark', label: 'Theme: dark — change theme', onclick: vi.fn() };
    const action = { icon: 'settings', label: 'Settings', onclick: vi.fn() } as const;

    const both = render(HeaderBar, { chip, actions: [action] });

    expect(screen.getAllByRole('button')).toHaveLength(2);
    both.unmount();

    const chipAlone = render(HeaderBar, { chip, actions: [] });

    expect(screen.getAllByRole('button')).toHaveLength(1);
    chipAlone.unmount();

    render(HeaderBar, { actions: [action] });

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});

/*
 * The grouping chrome, and the switcher the hub's front door is made of.
 *
 * What these three draw is held in `stories/` rather than here. A `Card`'s tone,
 * a `Badge`'s ink and the rule around either are paint, jsdom has no layout
 * engine and resolves none of it, and the story run reads the real thing in
 * Chromium — the same division `Tile` already makes for the marker bar. What is
 * asserted here is what the components are for: that they carry the words they
 * were given, and that a `GameCard` is a control exactly when there is somewhere
 * to go.
 */
describe('Card', () => {
  it('carries what it is given', () => {
    render(Card, { children: says('Nothing is kept anywhere else.') });

    expect(screen.getByText('Nothing is kept anywhere else.')).toBeInTheDocument();
  });

  it.each([['surface'], ['raised'], ['flat']] as const)('takes the %s tone', (tone) => {
    const { unmount } = render(Card, { tone, children: says('Grouped') });

    expect(screen.getByText('Grouped')).toBeInTheDocument();
    unmount();
  });
});

describe('CardLabel', () => {
  it('carries the words it labels a group with', () => {
    render(CardLabel, { children: says('The games') });

    expect(screen.getByText('The games')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  /*
   * `AppearanceNeverCarriesMeaningAlone` is why a badge has no tone that is only
   * a colour: whatever it is saying is in the word it carries, and the ink is
   * the second telling rather than the first.
   */
  it('says its state in words', () => {
    render(Badge, { children: says('Not built yet') });

    expect(screen.getByText('Not built yet')).toBeInTheDocument();
  });

  it.each([['neutral'], ['strong']] as const)('takes the %s tone', (tone) => {
    const { unmount } = render(Badge, { tone, children: says('Beta') });

    expect(screen.getByText('Beta')).toBeInTheDocument();
    unmount();
  });
});

describe('GameCard', () => {
  it('is a link named by the game, when there is a game to reach', () => {
    render(GameCard, {
      name: 'poodl',
      description: 'Guess a five-letter word in six attempts.',
      href: 'https://pnut.fans/poodl/'
    });

    const link = screen.getByRole('link', { name: /poodl/ });

    expect(link).toHaveAttribute('href', 'https://pnut.fans/poodl/');
    expect(link).toHaveTextContent('Guess a five-letter word in six attempts.');
  });

  /*
   * The reference draws a planned game as a dimmed `<a>` with no `href` and an
   * `aria-disabled`, and decision 0017 refuses it twice over. An anchor without
   * an `href` has no link role, so `aria-disabled` on it is not an allowed
   * attribute and axe judges that at error level; and
   * `AnUnavailableControlIsExempt` is spent "only while the control genuinely
   * cannot be operated, never on one that is merely quiet" — a game nobody has
   * built is not a control that has gone quiet, it is not a control.
   */
  it('is not a control at all when the game is only planned', () => {
    render(GameCard, { name: 'pawjong', description: 'A tile game.', status: 'planned' });

    expect(screen.queryByRole('link')).toBeNull();
    expect(document.querySelector('[aria-disabled]')).toBeNull();
  });

  it('says in words that a planned game is not built', () => {
    render(GameCard, { name: 'pawjong', description: 'A tile game.', status: 'planned' });

    expect(screen.getByText('Not built yet')).toBeInTheDocument();
  });

  it('says nothing of the kind about a game that is ready', () => {
    render(GameCard, { name: 'poodl', description: 'A word game.', href: '/poodl/' });

    expect(screen.queryByText('Not built yet')).toBeNull();
  });

  it('shows a line about the game when it is given one', () => {
    render(GameCard, {
      name: 'poodl',
      description: 'A word game.',
      href: '/poodl/',
      meta: '5 letters, 6 guesses'
    });

    expect(screen.getByText('5 letters, 6 guesses')).toBeInTheDocument();
  });

  it('draws no such line when it is given none', () => {
    render(GameCard, { name: 'poodl', description: 'A word game.', href: '/poodl/' });

    expect(screen.queryByText(/letters/)).toBeNull();
  });

  /*
   * Two cards nobody can ask for, and the type is what refuses them rather than
   * a branch. `href` and `status` used to be independent options, so a ready
   * game with nowhere to go compiled and drew an inert card that said nothing
   * about why, and a planned game handed a URL compiled and swallowed it. Both
   * are now unrepresentable, which is the whole of the fix: a state a caller
   * cannot write needs no arm to handle it, and an arm nothing reaches is a
   * branch nothing covers.
   *
   * `@ts-expect-error` is the assertion — `npm run check` fails on a directive
   * that suppressed nothing, so this is red exactly while the type admits the
   * card. Both are rendered anyway, because a consumer writing JavaScript is
   * held to none of it: neither draws a link, which is the runtime half of the
   * same refusal.
   */
  it('refuses the two cards that would say the wrong thing', () => {
    // @ts-expect-error A ready game owes an `href`. Without one there is nothing to reach.
    render(GameCard, { name: 'poodl', description: 'A word game.' });

    // @ts-expect-error A planned game is not a control, so a URL for one goes nowhere.
    render(GameCard, {
      name: 'pawjong',
      description: 'A tile game.',
      status: 'planned',
      href: '/pawjong/'
    });

    expect(screen.queryByRole('link')).toBeNull();
  });
});
