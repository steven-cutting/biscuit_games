/*
 * What Vite's `?raw` hands back, stated inside `src/lib/` so the package's
 * declaration emit can see it.
 *
 * The type-check proper already knows: `vite/client` declares `*?raw` as a
 * string, and SvelteKit's ambient types bring it in. But `svelte-package`
 * emits declarations from a program rooted at `src/lib/` alone, where that
 * ambient file is out of reach, and an unresolvable module quietly becomes
 * `any` — so `dist/components/icons.d.ts` would type every icon as `any` and
 * `IconName` would still be right while the values were not. This narrower
 * pattern wins over `vite/client`'s wider one wherever both are in scope, so
 * the two never disagree.
 */
declare module '*.svg?raw' {
  const markup: string;
  export default markup;
}
