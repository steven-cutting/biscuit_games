import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { ICONS } from '../src/lib/components/icons';

/*
 * The icon map, held against the directory it is drawn from.
 *
 * The map is the package's whole icon API: `Icon` accepts a key of it and
 * nothing else, so a file that ships without a key is an icon no game can
 * reach, and a key without a file is a build error a consumer would meet
 * before this repository did. Reading the directory from disk is what makes
 * the first of those visible; the import graph already refuses the second.
 */
const ICON_DIR = resolve(process.cwd(), 'src', 'lib', 'assets', 'icons');

describe('the icon set', () => {
  it('maps every shipped file, and nothing else', () => {
    const shipped = readdirSync(ICON_DIR)
      .filter((file) => file.endsWith('.svg'))
      .map((file) => file.slice(0, -'.svg'.length))
      .sort();

    expect(Object.keys(ICONS).sort()).toEqual(shipped);
  });

  // `Icon` renders each through `{@html}`, so what the map holds has to be
  // markup rather than a URL. Vite's `?raw` is what makes it so, and a build
  // that resolved the suffix differently would fail here first.
  it('holds real svg markup under every name', () => {
    for (const [name, markup] of Object.entries(ICONS)) {
      expect(markup, name).toMatch(/^<svg/);
    }
  });

  /*
   * The restroke is the one edit made to Lucide's files, and `currentColor` is
   * what lets an icon be the ink of whatever it sits in — an `IconButton`'s
   * `--text-2`, a `Notice`'s `--text` — without a colour of its own to clear
   * `EveryCombinationMeetsTheLegibilityFloor` separately.
   */
  it('is restroked to 1.5 and draws in the ink around it', () => {
    for (const [name, markup] of Object.entries(ICONS)) {
      expect(markup, name).toContain('stroke="currentColor"');
      expect(markup, name).toContain('stroke-width="1.5"');
    }
  });

  // ISC asks for the notice to travel with the files. `package.json`'s `files`
  // ships the directory whole, so the text is beside them in the tarball too.
  it('ships the licence beside the files it covers', () => {
    expect(readFileSync(resolve(ICON_DIR, 'LICENSE-lucide.txt'), 'utf8')).toContain('ISC License');
  });
});
