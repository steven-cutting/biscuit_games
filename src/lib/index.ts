/**
 * The package's whole JavaScript surface.
 *
 * A consumer reaches every shipped component through this file and through no
 * other path: `package.json`'s `exports` map names `.`, the stylesheet, the
 * typefaces and the specification, and no deep path into `dist/components/`.
 * That is deliberate — a deep import couples a game to this repository's
 * layout, and the layout is not what a game was promised.
 *
 * Imports here, and everywhere under `src/lib/`, are relative rather than
 * `$lib`-aliased. `svelte-package` would rewrite the alias, but a relative
 * specifier is correct in this tree and in the emitted one with nothing
 * rewriting it, and a file that reads the same in both places is easier to
 * trust.
 *
 * The icon map itself is deliberately not exported. `Icon` takes an
 * `IconName`, and the type is the whole of what a consumer needs to draw one;
 * the markup behind it is the package's to change.
 *
 * The stylesheet is deliberately not imported here. Importing it would make
 * every consumer of a component take the global element rules whether or not it
 * wanted them, and would put a side effect in a module a bundler is entitled to
 * think has none. A consumer imports `@steven-cutting/biscuit-games/app.css`
 * itself, and docs/design/tokens.md says so.
 */
export { default as Announcer } from './components/Announcer.svelte';
export { default as Button } from './components/Button.svelte';
export { default as Explainer } from './components/Explainer.svelte';
export { default as HeaderBar } from './components/HeaderBar.svelte';
export { default as Icon } from './components/Icon.svelte';
export { default as IconButton } from './components/IconButton.svelte';
export { default as Key } from './components/Key.svelte';
export { default as Keyboard } from './components/Keyboard.svelte';
export { default as Modal } from './components/Modal.svelte';
export { default as Notice } from './components/Notice.svelte';
export { default as PhysicalKeyboard } from './components/PhysicalKeyboard.svelte';
export { default as Tile } from './components/Tile.svelte';
export { default as Wordmark } from './components/Wordmark.svelte';
export type { IconName } from './components/icons.js';
export { QWERTY, QWERTY_BINDINGS } from './components/layouts.js';
export type { KeyboardLayout, KeyboardRow, KeyDefinition } from './components/layouts.js';
export { animationsActive, darkActive, highContrastActive } from './domain/appearance.js';
export type { Mark, MarkName, ThemeChoice } from './domain/types.js';
export { claimKey, latinLetters } from './domain/typing.js';
export type { KeyBindings, KeyPress } from './domain/typing.js';
export { createFakeKeys, createWindowKeys } from './ports/keys.js';
export type { FakeKeys, KeyHost, KeysPort } from './ports/keys.js';
export { createFakePreferences, createMediaPreferences } from './ports/preferences.js';
export type {
  DeviceAnswers,
  FakePreferences,
  MatchMedia,
  MediaQueryListLike,
  PreferencesPort
} from './ports/preferences.js';
