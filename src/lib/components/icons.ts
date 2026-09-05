/**
 * The icon set, inlined through the Vite import graph.
 *
 * `?raw` hands back the SVG source as a string, so the markup ships inside the
 * bundle: no runtime URL for a consumer's base path to break, and a real
 * `<svg>` in the DOM for a test to find. Each file is a Lucide icon restroked
 * to 1.5 — see `src/lib/assets/icons/LICENSE-lucide.txt` — and uses
 * `stroke="currentColor"`, so an icon is always the ink of the control it sits
 * in.
 *
 * Every shipped file is imported, because this map is the package's whole icon
 * API: a game reaches an icon by name through `Icon`, and a name that is not
 * here is a type error rather than a missing file. Adding one is a file in
 * `src/lib/assets/icons/`, an import here and a key —
 * `docs/how-to/port-a-design-system-component.md` walks it.
 *
 * The specifiers are relative and keep Vite's `?raw` suffix. `svelte-package`
 * copies the files to `dist/assets/icons/` and leaves the suffix alone, so a
 * consumer needs a Vite-class build to resolve them; decision 0014 records
 * that cost. `tests/icons.test.ts` holds the map and the directory equal.
 */
import arrowRight from '../assets/icons/arrow-right.svg?raw';
import chartColumn from '../assets/icons/chart-column.svg?raw';
import check from '../assets/icons/check.svg?raw';
import chevronDown from '../assets/icons/chevron-down.svg?raw';
import chevronLeft from '../assets/icons/chevron-left.svg?raw';
import chevronRight from '../assets/icons/chevron-right.svg?raw';
import circleAlert from '../assets/icons/circle-alert.svg?raw';
import contrast from '../assets/icons/contrast.svg?raw';
import copy from '../assets/icons/copy.svg?raw';
import cornerDownLeft from '../assets/icons/corner-down-left.svg?raw';
import del from '../assets/icons/delete.svg?raw';
import dices from '../assets/icons/dices.svg?raw';
import grid2x2 from '../assets/icons/grid-2x2.svg?raw';
import info from '../assets/icons/info.svg?raw';
import keyboard from '../assets/icons/keyboard.svg?raw';
import menu from '../assets/icons/menu.svg?raw';
import moon from '../assets/icons/moon.svg?raw';
import settings from '../assets/icons/settings.svg?raw';
import share from '../assets/icons/share.svg?raw';
import sun from '../assets/icons/sun.svg?raw';
import typeIcon from '../assets/icons/type.svg?raw';
import x from '../assets/icons/x.svg?raw';

// Keys are the file names. Two bindings differ from their key because the key
// is a reserved word: `delete` and `type`.
export const ICONS = {
  'arrow-right': arrowRight,
  'chart-column': chartColumn,
  check,
  'chevron-down': chevronDown,
  'chevron-left': chevronLeft,
  'chevron-right': chevronRight,
  'circle-alert': circleAlert,
  contrast,
  copy,
  'corner-down-left': cornerDownLeft,
  delete: del,
  dices,
  'grid-2x2': grid2x2,
  info,
  keyboard,
  menu,
  moon,
  settings,
  share,
  sun,
  type: typeIcon,
  x
} as const;

export type IconName = keyof typeof ICONS;
