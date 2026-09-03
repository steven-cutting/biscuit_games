---
title: "Decision 0008: A component workshop"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_component_workshop]
requires: []
---

# Decision 0008: A component workshop

*Ported from Poodl's decision 0006 at `c26cc4642afa6b1349db70a0f497203db3986599`, and restated for the platform. Poodl's own record stands where it is.*

## Context

In Poodl this was a convenience. The specifications named thirteen surfaces, three
components existed, and the other ten had to be built — each one an accessibility contract
as much as a rendering job: a shape for every mark, a name for every control, a keyboard
path to every operation, and four combinations of theme and high contrast to satisfy. That
much carries over unchanged. The assumption underneath it does not, because it was that
the application would eventually render every component itself.

Here the application will not. The hub has one route and one component, which is
[Decision 0011](0011-skeleton-not-a-second-application.md) rather than an omission, and
the components this repository owns are the design system's — built as much for the games
to consume as for the front door to show. A component the hub never renders has
nowhere in the hub to be seen. The workshop is therefore not a layer over an application;
it is the only way to see a component at all, and it is where a shared component is built,
looked at in all four palettes and checked before any game takes a copy of it.

Nothing else in the repository renders a component on its own. In Poodl the states that
matter — an empty board, a board mid-guess, a keyboard that has learned three letters,
high contrast — were reached by playing the game until it produced them. Here there is no
game to play into and no second route to reach. The component tests assert accessible
names in jsdom, which is exactly the right evidence and is not something anybody looks at.

## Decision

Add Storybook as a local component workshop. Stories live in a root-level `stories/`
directory, written in Svelte CSF as `*.stories.svelte`, one file per component, covering
the states its surface names.

`@storybook/addon-vitest` renders every story in real Chromium through Playwright, and
`@storybook/addon-a11y` runs axe over each one in the same pass, failing the run on a
violation rather than filing a note. Toolbar globals write `data-theme`,
`data-high-contrast` and `data-animations` on the root element, which is what `src/app.css`
already keys on, so all four combinations of theme and high contrast are one click apart.
No control anywhere in this repository changes any of those settings today, and
`appearance.allium` says nothing about where one would live: it states what the settings
mean and excludes the switches on purpose, because a settings panel belongs to the product
that owns it. So the device decides the palette here through `prefers-color-scheme`, and
the toolbar is the only other thing that writes any of those three attributes.

The workshop is local. A recipe serves it, two recipes gate it, and nothing publishes it.
There is no Pages workflow here to leave untouched, because nothing publishes the hub
either — that is
[Decision 0012](0012-the-domain-root-stays-with-poodl.md).

> The last clause is superseded in part by
> [Decision 0009](0009-visual-review-in-chromatic.md). The workshop is still built and
> gated locally, and the site itself still goes nowhere, but `just chromatic` and a
> workflow of its own are wired to publish the workshop to Chromatic for visual review.
> What remains before a build has ever actually run is that record's own account.

## Consequences

Every state of a component becomes a thing you can open, in either palette, and the
accessibility check for it runs without anyone remembering to ask for it. Today that is one
component and two stories. The arrangement is here before the components are, on the same
reasoning as the rest of the gate.

The three defects below were found in Poodl, at the commit named above, against a palette
this repository does not carry: `--mark-text`, `--mark-absent` and `--key-text` are its
tokens, not these, and [Decision 0010](0010-biscuit-games-design-system.md) has since
replaced the palette they belonged to. They are kept whole anyway, because what they teach
is about the tool and not about a word game, and because nothing here has learned any of it
a second time.

**It found a real defect on the first run, and the palette changed.** Measured against a
white `--mark-text`: correct `#538d4e` is 3.97 to 1, present `#b59f3b` is 2.63 to 1,
absent `#787c7e` is 4.22 to 1. The keyboard's keys are sixteen pixels at weight six
hundred, which is normal text needing 4.5 to 1, so all three failed. `--mark-text` became
black, measured at 5.29, 7.99 and 4.98 to 1. No hue moved, so the green and yellow squares
`sharing.allium` specifies still matched what the player saw, and `settings.allium` listed
palette mechanics as an explicit non-goal — `appearance.allium` carries that exclusion
here, naming a floor without naming a colour — so this was a code decision rather than a
specification one. No axe rule is disabled anywhere, there or here: `.storybook/preview.ts`
sets the addon's test mode to error and turns nothing off.

**One defect the tool cannot see was fixed by hand.** The tile's mark glyph is
`aria-hidden`, and axe's contrast rule never inspects it — forcing the glyph to an opacity
of 0.12 produced no finding at all, so the rule's silence is not evidence. Composited at
its former 0.85 opacity the glyph measured 4.43 to 1 against `--mark-absent`, under the
bar. It was made fully opaque. The glyph is what discharges "colour never carries meaning
alone", so it has to be legible to the readers it exists for.

**A third defect took a second pass, because the gate could not reach it.** In the dark
theme a plain keyboard key was `#f5f5f5` on `#818384`, measured at 3.49 to 1. No story
pinned the dark theme with a keyboard in it and headless Chromium reports a light
preference, so the gate stayed green while the defect was real; flipping the Theme control
in the workshop showed it. It was repaired: the key background became `#6b6d6e`, where the
text measures 4.77 to 1 and the key's own boundary still stands off the page background at
3.60, over the 3.0 that a control's boundary answers to. No hue moved, and palette
mechanics were an explicit non-goal in `settings.allium`, so this was a code decision like
`--mark-text` above. `Keyboard`'s "Dark theme" story then pinned the palette that had none.

**That last sentence was wrong, and the way it was wrong is the most useful thing in this
record.** Pinning the dark theme in a keyboard story did not turn the measurement into
something the gate holds, because axe was never going to judge a key either way. Its
contrast rule downgrades any element whose visible text is a single character to
*incomplete* — `shortTextContent` in axe-core — and reports incomplete without failing.
Every key shows one letter. So does every tile. Both of the palette repairs above were
found on `WelcomeScreen` and its siblings, which share the mark tokens but carry words; the
keyboard and the board were never in scope for the rule at all. In Poodl that is checkable
in about a minute: put an unreadable `--key-text` in `app.css` and every other component's
stories fail while `Keyboard`'s stay green. Here the two blind spots meet in the only
component there is. The wordmark's mark is a ruled square holding the single letter `b`,
and it is `aria-hidden` as well, so axe declines to judge it twice over — which is why
[Work in the component workshop](../how-to/work-in-the-component-workshop.md) tells you to
measure by hand when a guarantee rests on something the tool does not report.

Two lessons, and the second is the one that changed on the way here. A gate's silence is
not a pass — the same lesson the `aria-hidden` glyph taught, arriving by a different route,
and it holds without qualification. And a figure recorded in prose beside a colour will
drift from the colour. In Poodl the second one was answered: `tests/contrast.test.ts`
computes the figures over all four combinations of theme and high contrast, from the
stylesheet on disk, so no number in a comment or a decision record is load-bearing there.
That test was not ported. Nothing in this repository recomputes a contrast ratio, so every
figure in this record, every figure in `src/app.css`'s comments and every figure the
handbook quotes is an inherited claim rather than a measurement. The lesson came across and
its remedy did not, which leaves this repository worse placed than Poodl rather than level
with it. [Design tokens](../design/tokens.md) owns what follows from that and says which
numbers are provenance.

What the stories are evidence of here is correspondingly narrow. `Wordmark`'s "Dark theme"
story pins the dark palette and asserts that the pin reached `document.documentElement`,
which is the element every palette in `src/app.css` is keyed on. That is evidence the
toolbar's contract holds and that the combination renders and is looked at. It is not
evidence about any ratio, and no story here should be read as if it were.

The dependency surface grows sharply in a repository that pins every version by hand. Each
direct package is pinned exactly, as invariant 4 requires, but the transitive tree under
Storybook is held by `package-lock.json` and by nothing else. Two consequences are worth
naming: the autodocs addon depends on React, which lives in the tree although it never
enters `src/` or the build; and the Svelte framework package pins TypeScript to a 5.x line,
so npm nests a second copy of the compiler beside the 6.x one this repository uses.

The story run needs a real browser, and a real browser is in neither lockfile. Playwright
downloads a Chromium build over the network into a cache outside the repository, versioned
by the `playwright` pin rather than by anything `package.json` records. This repository
prefers evidence that runs offline, and the gate itself still is:
`scripts/check_playwright_browsers.js` launches Chromium before the story run and fails
with the recipe to run rather than fetching anything mid-gate, so the download is
`just storybook-browsers`, once, outside `just check`. The cost is accepted because axe on
a real browser reports contrast, landmarks and computed names that a jsdom render cannot
produce at all.

Component behaviour is expressed in two places: an assertion in `tests/` and a fixture in
`stories/`. They can disagree, and when they do neither is the arbiter — the specification
is. Each story cites the surface and the `@guarantee` clauses it stands for by name.
`appearance.allium` is the only module here, so most components will cite it for their
theme and contrast states and for nothing else; where nothing governs — `Wordmark` is brand
rather than behaviour — the story says so and names
[Design direction](../design/direction.md) as the authority it does answer to. Either way a
story says which authority governs it rather than becoming one.

Coverage is unaffected on purpose. The floor over `src/lib/**` is measured from the jsdom
suite alone, and the story run lives in its own Vitest configuration with no coverage
block, so a story that renders a component cannot make that number look better than the
tests have earned.

Everything Storybook writes is ignored by Git, because a gate that changes one byte of the
worktree fails the run before its own exit code is read.

## What would reopen this

The Svelte CSF addon falling behind a Svelte major, which would make the story format the
reason not to upgrade the framework. Storybook majors moving past the Vite and Svelte line
this repository pins.

Poodl's third reopener was the ten surfaces getting built and the workshop costing more to
keep than it returns — a tool for building, deletable once the building is finished. That
one does not run in the same form here. The workshop cannot finish its job while the hub
owns a design system it does not render, and a nearly empty `src/lib/components/` is an
argument for the workshop rather than against it. What would end it is a replacement:
somewhere else that shows a component in every palette with an accessibility check over it.
Deleting it without one takes the only view of a component with it, and takes visual review
along with it too.

## Related pages

- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Port a design system component](../how-to/port-a-design-system-component.md)
- [Design tokens](../design/tokens.md)
- [Testing](../reference/testing.md)
- [Accessibility](../explanation/accessibility.md)
- [Decision 0009: Visual review in Chromatic](0009-visual-review-in-chromatic.md)
- [Decision 0011: A skeleton, not a second application](0011-skeleton-not-a-second-application.md)
