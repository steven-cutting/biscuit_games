import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * The hub is a static site with no server, so every route is prerendered and the
 * build output is a directory of files a host can serve as-is.
 *
 * `paths.base` reads BASE_PATH and nothing sets it. That is deliberate rather
 * than unfinished: the hub site is published nowhere, because the domain root
 * still belongs to Poodl. See decision 0012. The package this repository does
 * publish carries no route and never reads this value. The hook stays so that
 * adopting an address later is a workflow change rather than a config change.
 */

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
    paths: { base: process.env.BASE_PATH ?? '' },
    typescript: {
      /**
       * SvelteKit generates `.svelte-kit/tsconfig.json` covering `src`, `test`,
       * `tests` and `vite.config.*`. The root `tsconfig.json` extends it, and a
       * derived config's `include` replaces the inherited one rather than adding
       * to it, so the workshop is added here instead of there. Without this,
       * `.storybook/`, `stories/` and `vitest.storybook.config.ts` belong to no
       * TypeScript project: `svelte-check` skips them silently and
       * typescript-eslint's project service fails outright. Paths are relative
       * to the generated file.
       */
      config: (generated) => {
        generated.include.push(
          '../.storybook/**/*.ts',
          '../stories/**/*.ts',
          '../stories/**/*.svelte',
          '../vitest.storybook.config.ts'
        );
      }
    }
  }
};

export default config;
