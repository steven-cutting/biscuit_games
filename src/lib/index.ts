/**
 * The package's whole JavaScript surface.
 *
 * A consumer reaches every shipped component through this file and through no
 * other path: `package.json`'s `exports` map names `.`, the stylesheet, the
 * typefaces and the specification, and no deep path into `dist/components/`.
 * That is deliberate — a deep import couples a game to this repository's
 * layout, and the layout is not what a game was promised.
 *
 * Imports here are relative rather than `$lib`-aliased, because
 * `svelte-package` runs outside SvelteKit's resolver and a relative specifier
 * is the form that is correct both in this tree and in the emitted one.
 *
 * The stylesheet is deliberately not imported here. Importing it would make
 * every consumer of a component take the global element rules whether or not it
 * wanted them, and would put a side effect in a module a bundler is entitled to
 * think has none. A consumer imports `@steven-cutting/biscuit-games/app.css`
 * itself, and docs/design/tokens.md says so.
 */
export { default as Wordmark } from './components/Wordmark.svelte';
