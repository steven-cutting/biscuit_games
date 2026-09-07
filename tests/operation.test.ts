/*
 * `docs/specs/operation.allium` — the `DirectManipulation` contract and the
 * `Operation` surface.
 *
 * Every surface a reader operates fulfils this contract and not one of them
 * owns it, which is why its rules live in `src/app.css` rather than in a
 * component. This file reads that stylesheet, puts it in the document and
 * measures what it resolves to on a real control.
 *
 * What jsdom can answer decides what is asserted here. There is no layout
 * engine, so `getBoundingClientRect()` returns zeros and every figure that
 * depends on layout — a row of keys divided across the narrowest supported
 * width, a control's measured height — is taken in real Chromium by the
 * stories instead. The cascade is real, though: `touch-action`, `user-select`,
 * the logical size floors and custom properties all resolve.
 *
 * Two properties do not survive jsdom's CSS parser at all, and they are not
 * covered alike. `-webkit-tap-highlight-color` is the story run's to carry.
 * `-webkit-touch-callout` is carried by neither gate: desktop Chromium does not
 * report it and the platform it is declared for is iOS Safari, so it is
 * declared and never verified. `docs/explanation/accessibility.md` states that
 * gap rather than leaving it to be discovered.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  MINIMUM_FIELD_TEXT_SIZE,
  MINIMUM_TOUCH_TARGET,
  NARROWEST_SUPPORTED_WIDTH
} from '../src/lib/config';

/*
 * Read from disk rather than imported. A `.css` file is claimed by Vite's
 * stylesheet pipeline first, which hands back a module whose default export is
 * the empty string. A test that injected that would assert against an empty
 * cascade and pass on every property at once, which is exactly the shape of a
 * test that cannot fail.
 *
 * Resolved from the working directory, which Vitest sets to the project root,
 * and not from `import.meta.url` — under the SSR transform that is a served
 * path rooted at `/`, so `new URL('../src/…')` walks out of the repository.
 */
function source(name: string): string {
  return readFileSync(resolve(process.cwd(), 'src', name), 'utf8');
}

const appCss = source('app.css');
const appHtml = source('app.html');

/*
 * One of each kind of control the platform draws or expects a game to draw. A
 * label wrapping a checkbox is here because the row is the target where one
 * exists, and it is the shape `app.css` grants the pressed ring to; no surface
 * in this repository renders one yet, which is why this fixture states it
 * rather than a component demonstrating it.
 */
const CONTROLS = `
  <button type="button">Play</button>
  <input type="text" />
  <textarea></textarea>
  <label><input type="checkbox" /> High contrast</label>
  <input type="radio" />
  <label for="dark">Dark</label>
  <input id="dark" type="checkbox" />
  <select><option>Light</option></select>
  <details><summary>How to play</summary><p>Guess a word.</p></details>
  <input type="number" />
  <input type="search" />
  <input type="submit" value="Send" />
  <input type="button" value="Undo" />
  <input type="reset" value="Reset" />
  <input type="hidden" />
  <input id="typeless" />
`;

let stylesheet: HTMLStyleElement;
let host: HTMLDivElement;

beforeEach(() => {
  stylesheet = document.createElement('style');
  stylesheet.textContent = appCss;
  document.head.append(stylesheet);

  host = document.createElement('div');
  host.innerHTML = CONTROLS;
  document.body.append(host);
});

afterEach(() => {
  stylesheet.remove();
  host.remove();
});

function resolved(selector: string, property: string): string {
  const element = host.querySelector(selector);
  if (element === null) {
    throw new Error(`The fixture has no ${selector}`);
  }
  return getComputedStyle(element).getPropertyValue(property);
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

/**
 * The rule a selector belongs to, read back from the parsed stylesheet.
 *
 * Matched against each selector in a rule's list rather than against the whole
 * of `selectorText`, because a rule that answers for two kinds of control
 * writes both of them there and an equality test would stop finding either. The
 * split is naive about a comma nested inside `:is()` or `:where()`; this
 * stylesheet has none, and a nested one would fail loudly here rather than
 * quietly pass. Non-style rules — the dark-theme `@media` block — have no
 * `selectorText` at all, which is why the read admits `undefined`.
 */
function ruleFor(selector: string): CSSStyleRule {
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      const styleRule = rule as CSSStyleRule;
      const selectors = (styleRule.selectorText as string | undefined)?.split(',') ?? [];

      if (selectors.some((one) => one.trim() === selector)) {
        return styleRule;
      }
    }
  }
  throw new Error(`No rule for ${selector}`);
}

/**
 * A rule's selector with `:active` taken out, so a fixture at rest can be asked
 * which controls it reaches.
 *
 * Exactly `:active` and nothing else. Cutting at the first colon instead — which
 * is what an earlier version of the test below did — turns
 * `label:has(input:not(:disabled)):active` into `label`, and two rules that
 * reach demonstrably different elements then compare equal as text. That is the
 * shape of the defect this whole block exists to catch, so the helper is written
 * not to have it.
 */
function atRest(rule: CSSStyleRule): string {
  return rule.selectorText.replace(/:active/gu, '');
}

/** Every element of the fixture, so a rule is asked rather than read. */
function controls(): Element[] {
  return Array.from(host.querySelectorAll('*'));
}

describe('ATapDoesOnlyWhatTheControlDoes', () => {
  it('sends a tap to the control rather than to the platform', () => {
    expect(resolved('button', 'touch-action')).toBe('manipulation');
    expect(resolved('input[type="checkbox"]', 'touch-action')).toBe('manipulation');
    expect(resolved('input[type="radio"]', 'touch-action')).toBe('manipulation');
  });

  /*
   * A text control included, and by a rule of its own. Two fast taps in a text
   * field are a caret placed twice rather than a zoom, which is this invariant
   * exactly — what a text control cannot take is the rest of that rule, for the
   * reason the fourth case below measures.
   */
  it('sends a tap in a text control there too', () => {
    expect(resolved('input[type="text"]', 'touch-action')).toBe('manipulation');
    expect(resolved('textarea', 'touch-action')).toBe('manipulation');
  });

  /*
   * And every control the floor rule names, which is what "owed to every control
   * alike" has to mean if the two rules answer to the same invariant. The floor
   * was widened to a select, a disclosure summary and every input but three, and
   * these rules were left naming the shapes they always had — so a second fast
   * tap on a `<summary>` still opened the disclosure once and then zoomed the
   * page, which is the sentence this invariant is written in.
   */
  it.each([
    ['a select', 'select'],
    ['a disclosure summary', 'summary'],
    ['a number input', 'input[type="number"]'],
    ['a search input', 'input[type="search"]'],
    ['a submit drawn as an input', 'input[type="submit"]'],
    ['a button drawn as an input', 'input[type="button"]'],
    ['a reset drawn as an input', 'input[type="reset"]'],
    ['an input written with no type at all', '#typeless']
  ])('sends a tap on %s to the control too', (_what, selector) => {
    expect(resolved(selector, 'touch-action')).toBe('manipulation');
  });

  /*
   * And the same split the file already makes, over the wider set. A control
   * whose words are a label loses the callout and the selection; a control whose
   * words are the reader's own text keeps both, because text a reader copies by
   * hand has to stay selectable. A number and a search box are text controls; a
   * select, a summary and a submit are labels.
   */
  it.each([
    ['a select', 'select'],
    ['a disclosure summary', 'summary'],
    ['a submit drawn as an input', 'input[type="submit"]'],
    ['a button drawn as an input', 'input[type="button"]'],
    ['a reset drawn as an input', 'input[type="reset"]']
  ])('does not select the label on %s', (_what, selector) => {
    expect(resolved(selector, 'user-select')).toBe('none');
  });

  it.each([
    ['a number input', 'input[type="number"]'],
    ['a search input', 'input[type="search"]'],
    ['an input written with no type at all', '#typeless']
  ])('leaves the text in %s selectable', (_what, selector) => {
    expect(resolved(selector, 'user-select')).not.toBe('none');
  });

  /*
   * The label included, not only the control: where a checkbox is wrapped in
   * one the row is the target, so the row is where a held finger would
   * otherwise start selecting text.
   */
  it('does not select a control label', () => {
    expect(resolved('button', 'user-select')).toBe('none');
    expect(resolved('button', '-webkit-user-select')).toBe('none');
    expect(resolved('label', 'user-select')).toBe('none');
    expect(resolved('input[type="checkbox"]', 'user-select')).toBe('none');
  });

  /*
   * The invariant says the *label* is not selected, which is as far as it goes.
   * Text a reader has to select by hand before sending it — a shared grid, a
   * link to copy — stays selectable, and a blanket rule would satisfy one
   * clause by breaking the other.
   */
  it('leaves text the reader has to select alone', () => {
    expect(resolved('textarea', 'user-select')).not.toBe('none');
    expect(resolved('input[type="text"]', 'user-select')).not.toBe('none');
  });
});

describe('DeliberateZoomIsNeverTakenAway', () => {
  /*
   * The one assertion in this file that reads source text rather than a
   * resolved value, because the artefact is a static file: `app.html` is
   * copied into the build, and there is no cascade to ask.
   */
  it('never refuses to be zoomed', () => {
    const viewport = /<meta name="viewport" content="([^"]*)"/u.exec(appHtml)?.[1] ?? '';

    expect(viewport).toContain('width=device-width');
    expect(viewport).not.toContain('user-scalable');
    expect(viewport).not.toContain('maximum-scale');
  });

  // `manipulation` drops the platform's double-tap guess and keeps the pinch.
  // `none` would take both, which is the trap this invariant names.
  it('asks only for what the previous invariant needs', () => {
    expect(resolved('button', 'touch-action')).not.toBe('none');
  });

  /*
   * Below 16px iOS Safari zooms the page when an input takes focus — the
   * platform magnifying on its own initiative, which is the thing this
   * invariant protects the reader from. `font: inherit` on every text control
   * is what holds it, and the declaration is asserted rather than the resolved
   * figure: jsdom's own default input font is already 16px, so a computed
   * measurement here would pass whether or not the stylesheet said anything at
   * all.
   */
  it('does not make the platform zoom to read an input', () => {
    const inherited = ruleFor('input');

    expect(inherited.style.getPropertyValue('font')).toBe('inherit');
    expect(inherited.selectorText).toContain('textarea');
  });
});

describe('EveryControlIsAComfortableTarget', () => {
  /*
   * Top to bottom, which every control meets outright. Across is measured in
   * Chromium by the stories: a row of many like controls sharing the full width
   * is the one place the figure cannot be met in that direction, so a declared
   * floor would be wrong for those and redundant for everything else, whose
   * text already carries it past the figure.
   */
  it('gives every control the figure the specification states, top to bottom', () => {
    const floor = `${String(MINIMUM_TOUCH_TARGET)}px`;

    expect(resolved('button', 'min-block-size')).toBe(floor);
    expect(resolved('input[type="text"]', 'min-block-size')).toBe(floor);
    expect(resolved('textarea', 'min-block-size')).toBe(floor);
  });

  /*
   * "Every other control" is every other control the platform can name, and the
   * rule named three of them. A `<select>` is a control `Modal`'s own focusable
   * list already names and this rule did not, a `<summary>` is one the browser
   * activates exactly as it activates a button, and an `<input>` is not only
   * `type="text"` — a number, a search box and a submit drawn as an input are
   * each a control a game will put on a page, and each one of them stood at
   * whatever height the user agent chose. The guarantee was the specification's
   * and the stylesheet was where it was not kept.
   */
  it.each([
    ['a select', 'select'],
    ['a disclosure summary', 'summary'],
    ['a number input', 'input[type="number"]'],
    ['a search input', 'input[type="search"]'],
    ['a submit drawn as an input', 'input[type="submit"]'],
    // A text field to the browser, and matched by no selector here before:
    // `input[type='text']` reads the attribute rather than the default.
    ['an input written with no type at all', '#typeless']
  ])('gives %s the figure too', (_what, selector) => {
    expect(resolved(selector, 'min-block-size')).toBe(`${String(MINIMUM_TOUCH_TARGET)}px`);
  });

  /*
   * And the shapes the rule leaves alone, each for a stated reason rather than
   * because a selector happened to miss them. A floor on a native checkbox or
   * radio would size the box the finger is not aimed at — the invariant grants
   * those the label that contains them, which the test below measures — and a
   * hidden input is not a control at all.
   */
  it.each([
    ['a checkbox, whose row carries the figure instead', 'input[type="checkbox"]'],
    ['a radio, for the same reason', 'input[type="radio"]'],
    ['a hidden input, which is not a control at all', 'input[type="hidden"]']
  ])('leaves the figure off %s', (_what, selector) => {
    expect(resolved(selector, 'min-block-size')).not.toBe(`${String(MINIMUM_TOUCH_TARGET)}px`);
  });

  /*
   * A native checkbox is thirteen pixels and no stylesheet can make it the
   * figure, so the invariant grants it the label that activates it instead: a
   * label bound to a control activates it across its whole area, so the row is
   * what the finger is aimed at and the row is what has to answer. `app.css` had
   * argued exactly that in prose beside the pressed ring and then declared no
   * floor for it, which is a target the reader was promised and never given.
   *
   * The display is asserted with the figure rather than beside it: a `<label>`
   * is inline by default and `min-block-size` does not apply to a non-replaced
   * inline element, so the floor alone would be a declaration that does nothing.
   */
  it.each(['checkbox', 'radio'])('gives the row that activates a %s the figure too', (kind) => {
    const row = ruleFor(`label:has(input[type='${kind}'])`).style;

    expect(row.getPropertyValue('min-block-size')).toBe(`${String(MINIMUM_TOUCH_TARGET)}px`);
    expect(row.getPropertyValue('display')).toBe('inline-flex');
    // Flex trims the white space around the label's text run, so the word-space
    // between the native box and its words has to be declared or it is gone.
    expect(row.getPropertyValue('gap')).not.toBe('');
  });

  /*
   * And the shape the invariant hands back to the surface. `:has()` reaches a
   * descendant, so a label bound by `for` to a control outside it is reached by
   * no rule here — which is what the invariant now says rather than something
   * this test discovered.
   */
  it('leaves a label bound to a control outside it to the surface that wrote it', () => {
    expect(() => ruleFor('label[for]')).toThrow(/No rule for/u);
  });

  /*
   * And the control the invariant exempts outright. A link inside a sentence
   * takes its size from the text around it, so a floor here would break the line
   * it sits in \u2014 which is why the invariant now names that shape rather than
   * leaving the repository's own route in violation of it.
   */
  it('leaves a link in a line of text to the text around it', () => {
    expect(() => ruleFor('a')).toThrow(/No rule for a/u);
  });

  /*
   * All three figures, because each is consumed somewhere a green run would not
   * notice it drifting. Every target holds "down to
   * config.narrowest_supported_width", and only the stories consume that one — a
   * story frames itself to whatever the constant says, so raising it would widen
   * the frame and keep the run green. `Fields.@guarantee
   * AFieldDoesNotMagnifyThePageWhenItTakesFocus` is worse still: the rule it
   * answers cannot be measured in jsdom at all, because jsdom's own default
   * input font is already the figure and the assertion would pass whether or not
   * `app.css` declared anything — which is why `src/app.css` says so beside the
   * rule, and why `stories/Input.stories.svelte` measures it in Chromium. Pinned
   * here so that all three are held against the specification in one place.
   */
  it('states the three figures once, where the specification can be checked against them', () => {
    expect(MINIMUM_TOUCH_TARGET).toBe(44);
    expect(NARROWEST_SUPPORTED_WIDTH).toBe(320);
    expect(MINIMUM_FIELD_TEXT_SIZE).toBe(16);
  });
});

describe('ATouchIsAcknowledged', () => {
  /*
   * Suppressing the platform's tap highlight without replacing it is the defect
   * the invariant names, so the replacement is asserted here rather than the
   * suppression — jsdom's parser drops `-webkit-tap-highlight-color` entirely,
   * and the story run holds that half.
   *
   * Two tones, because no single tone stands off every ground a control can
   * carry at once. And no transition and no animation, because the
   * acknowledgement "owes nothing to whether animations are running" —
   * `data-animations` must not reach it.
   */
  it.each([
    ['a button', 'button:active:not(:disabled)'],
    ['a labelled preference row', 'label:has(input:not(:disabled)):active']
  ])('replaces the platform feedback on %s rather than only removing it', (_what, selector) => {
    const pressed = ruleFor(selector).style;
    const ring = pressed.getPropertyValue('box-shadow');

    expect(ring).toContain('var(--text)');
    expect(ring).toContain('var(--background)');
    expect(pressed.getPropertyValue('transition')).toBe('');
    expect(pressed.getPropertyValue('animation')).toBe('');
  });

  /*
   * Every control the suppression reaches, and no more. Removing the platform's
   * flash is what creates the debt, so the two lists have to answer to each
   * other \u2014 and they are compared as lists here rather than by asking whether
   * each mentions the word "label", which both of them did for unrelated reasons
   * while a bare radio lost its flash and got nothing back.
   *
   * A text control is on neither list, because nothing takes its flash away in
   * the first place. `-webkit-tap-highlight-color` is jsdom's blind spot, so
   * what is asserted is which selectors the rule that declares it carries; the
   * story run measures the ring itself.
   */
  it('owes an acknowledgement to every control it took one from', () => {
    const took = ruleFor('label:has(input)').selectorText;
    const gives = atRest(ruleFor('button:active:not(:disabled)'));
    const suppressed = controls().filter((control) => control.matches(took));

    expect(suppressed).not.toHaveLength(0);

    for (const control of suppressed) {
      // Its own ring, or the row's: a native box inside a label shares that
      // label's rather than carrying one of its own.
      const answered = control.matches(gives) || control.closest(gives) !== null;

      expect(answered, control.outerHTML).toBe(true);
    }
  });

  /*
   * The control that keeps the platform's own flash, which is the other half of
   * the same sum. A checkbox nobody wrapped in a label is not a control this
   * platform draws, and taking its acknowledgement away while offering it no
   * replacement was the one way to leave a control reading as dead. Suppressing
   * the callout and the selection is a different rule and still reaches it \u2014
   * `ATapDoesOnlyWhatTheControlDoes` is owed to every control alike.
   */
  it.each([
    ['a checkbox nobody wrapped in a label', 'input[type="radio"]'],
    ['a label bound to a control outside it', 'label[for]']
  ])('leaves the platform its own flash to %s', (_what, selector) => {
    const took = ruleFor('label:has(input)').selectorText;
    const control = host.querySelector(selector);

    expect(control).not.toBeNull();
    expect(control?.matches(took)).toBe(false);
  });

  /*
   * And the first rule still reaches them, because
   * `ATapDoesOnlyWhatTheControlDoes` is owed to every control alike — only the
   * flash narrowed, and only because a flash taken is a flash owed back.
   */
  it('keeps every control the tap rules it is owed', () => {
    expect(resolved('input[type="radio"]', 'touch-action')).toBe('manipulation');
    expect(resolved('input[type="radio"]', 'user-select')).toBe('none');
    expect(resolved('label[for]', 'user-select')).toBe('none');
  });

  /*
   * A filter would have been the cheaper cue and it is deliberately absent: it
   * dims the content along with the control, and on a mark that has no hue of
   * its own that costs `AMarkIsNeverOnlyAColour` more than this invariant
   * gains. A shadow paints under the content instead.
   */
  it('does not dim the control it is acknowledging', () => {
    expect(ruleFor('button:active:not(:disabled)').style.getPropertyValue('filter')).toBe('');
  });

  // Ink and paper, so the cue turns over with the palette rather than carrying
  // a colour of its own that one of the two would have to accommodate.
  it('turns over with the palette', () => {
    const light = { text: token('--text'), background: token('--background') };

    document.documentElement.setAttribute('data-theme', 'dark');
    try {
      expect(token('--text')).not.toBe(light.text);
      expect(token('--background')).not.toBe(light.background);
    } finally {
      document.documentElement.removeAttribute('data-theme');
    }
  });
});
