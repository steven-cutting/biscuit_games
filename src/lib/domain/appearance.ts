import type { ThemeChoice } from './types.js';

/**
 * How Biscuit Games looks, decided jointly by the reader's settings and the
 * device.
 *
 * `docs/specs/appearance.allium` — the `Appearance` surface. Each derivation
 * is one line, and all three are here rather than inline in a component
 * because the negotiation between a setting and a device preference is
 * behaviour, and behaviour that a test can read. A game consumes them; the
 * hub's own route does not yet, because it has no settings to feed them.
 */

/**
 * `Appearance.dark_active`. While the theme is `system` the platform matches
 * the device and keeps matching it as it changes; once the reader picks a side
 * the device is no longer consulted.
 */
export function darkActive(theme: ThemeChoice, prefersDark: boolean): boolean {
  return theme === 'system' ? prefersDark : theme === 'dark';
}

/**
 * `Appearance.animations_active`. The device preference wins: a reader who
 * asked their system for less motion gets none from Biscuit Games, whatever
 * the setting says.
 */
export function animationsActive(animations: boolean, prefersReducedMotion: boolean): boolean {
  return animations && !prefersReducedMotion;
}

/**
 * `AppearanceSettings.high_contrast_active`. The device wins the same way it
 * does for motion, and for the same reason: a reader who asked their system
 * for more contrast should not have to find the setting and ask a second time.
 *
 * It never writes back. The reader's own answer stays exactly as they left it,
 * which is what lets a settings surface say which of the two is speaking. That
 * also leaves `appearance.allium`'s open question genuinely open: there is no
 * way yet to turn the palette off while the device is asking for it.
 */
export function highContrastActive(highContrast: boolean, prefersMoreContrast: boolean): boolean {
  return highContrast || prefersMoreContrast;
}
