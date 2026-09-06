---
title: "Accessibility"
kind: "explanation"
audience: [user, contributor, maintainer, agent]
canonical_for: [accessibility_model]
requires: []
---

# Accessibility

Accessibility is specified, not retrofitted. [`appearance.allium`](../specs/appearance.allium)
carries six named `@guarantee` clauses on its `Appearance` surface, and those clauses are
acceptance criteria for any change that touches a surface — here, and in every game wearing
the design system. The module imports nothing, so a game inherits these obligations whole
rather than restating them, and owes an account of any state it adds on top.

This is the platform's model, and since
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md) the platform
primitives that implement it are here too: `Button`, `IconButton`, `HeaderBar`, `Modal`,
`Notice` and `Announcer`, the preferences port that reads the device, and the contrast test
that measures the palette. What is stated below names, for each obligation, what here
discharges it and what still waits. An obligation nobody has written down is one the first
implementation gets to decide by accident.

## How the figures are measured

`tests/contrast.test.ts` reads `src/app.css` from disk, drives all four combinations of theme
and high contrast through the root attributes, and recomputes every pair the palette declares
against the floors `appearance.allium` states. Read that before reading anything below,
because every number on this page and every number in the stylesheet's comments is a figure
that test measures here, in this palette, on every run of `just check`.

What it measures is the stylesheet's declarations, not the surfaces this repository renders.
The result and key tokens are a game's to spend, and they are measured here anyway because
the palette is decided here: a token that fails this test fails on a board this repository
has never seen. It measures the platform's own separations too, since
[decision 0015](../decisions/0015-operation-and-play-are-specified-here.md):
`play-surfaces.allium`'s `config.minimum_state_separation` and
`config.minimum_mark_separation` are the windows `--n-65` and `--n-75` were pinned by, so the
token and the figure that pins it are held in the same repository at last. What it still does
not measure is a separation between two of a game's *own* states, beyond the four marks the
platform names — a game that adds one owes a distance and states that figure itself, which is
what `appearance.allium`'s legibility clause has always said and what it still says.

The consequences are worth stating plainly.

- **A ratio quoted in a comment is provenance for a measurement.** The comment says why the
  value was chosen; the test says whether it still clears the floor.
- **Drift is caught.** A token edited here either clears the floor in all four combinations
  or fails the run.
- **A review reads the test, not the arithmetic.** The `accessibility-review` skill in
  `.agents/skills/` asks whether a new pair was added to the test, not for a figure computed
  by hand.
- **A game proves what only it renders.** A game's separations, and any pair its own
  components introduce, are measured where those components run.

The two floors themselves are different in kind. `config.minimum_text_contrast` at 4.5 and
`config.minimum_boundary_contrast` at 3.0 are thresholds the specification states, as ratios
naming no colour, and `src/lib/config.ts` mirrors them for the test to read. They are true
without a gate. The gate is what says whether a rendering meets them.

## What the specification decides

**Colour never carries meaning alone.** Neither the theme nor high contrast is what makes
anything readable. Nothing on any surface is distinguished by colour alone, in any
combination of the settings: every state a colour helps to show also carries a shape, a word,
or both, and every one has an accessible name that says it in words. This holds in every
theme and in both palettes.

The platform states the rule and now discharges part of it. The marker bar on a cell and on a
key is the platform's answer — a bar on `exact`, a shorter one on `present`, none on
`absent`, drawn in `currentColor` so the bar is always the ink of the glyph and the border —
and `play-surfaces.allium`'s `AMarkIsNeverOnlyAColour` is the clause it answers, together with
the two separations beside it. What still belongs to whoever has the states is any state
beyond those four, and the sentence each mark is read out as: "in the word, wrong place" is
one game's rule spoken aloud, and it arrives at the call site rather than being inferred. `appearance.allium` says so twice: a game that adds states of
its own inherits the obligation and states how it meets them, and a game that puts two of its
own states side by side owes a distance between them and states that figure itself. Two games
will never agree on what a state is. They can agree that a state is never only a colour.

**The floor holds in all four combinations of theme and high contrast**, not in the one a
change happened to be looked at in. Text on a control the reader can operate reaches 4.5 to
one against what is behind it, and so does body copy. Every such control is identifiable as
one: by a boundary reaching 3.0 against the page where it draws a boundary, and by its own
words where it draws none, since a control with no drawn edge is found by reading it and an
edge that is not there cannot be measured. High contrast raises the floor nowhere. It is a
second palette that has to clear the same bar, not the version where legibility is finally
attended to.

Four combinations, because theme and contrast are separate questions and a device can ask for
either one on its own. Dark itself is reached two ways — by the `dark` choice, which is where
Biscuit Games starts, and by `system`, which follows the device as it changes and keeps
following it, which is `SystemFollowsTheDeviceAsItChanges`. `src/app.css` therefore declares
the dark palette twice, once under `[data-theme='dark']` and once under
`prefers-color-scheme: dark`, and that duplication is the one way this palette can drift out
of step with itself. `tests/contrast.test.ts` reads both blocks as text and holds them
equal, and holds the two high-contrast blocks to the same set of names, which is what makes
every ratio it measures cover both routes.

**More contrast asked of the operating system turns high contrast on.** The device wins the
same way it does for motion, so a reader who has already asked their system does not have to
find the setting and ask again. It never overwrites the reader's own answer: `high_contrast`
stays exactly as they left it, and `high_contrast_active` is what anything rendering reads.
What a reader cannot yet do is overrule the device, and `appearance.allium` carries that as an
open question rather than a decision.

That is the rule. What holds here is less, in both halves. There is no settings panel to carry
the reader's own answer, and the module excludes one deliberately, because a panel belongs to
the product that owns it. And the route does not yet derive `high_contrast_active` from a
live device preference either. The pieces exist — `src/lib/ports/preferences.ts` asks
`prefers-contrast: more`, and `highContrastActive` in `src/lib/domain/appearance.ts` makes
the derivation, both tested against a fake — but nothing on the route calls them, and
`prefers-contrast: more` reaches no selector in `src/app.css`, which keys the high-contrast
palette on `data-high-contrast='true'` and on nothing else. A media query in the stylesheet
would answer the device half without the port, so it is the smaller of the two debts and
the one to pay first. Today a reader who asked their system for more contrast gets the
standard palette.

**Motion respects the operating system.** Animations run only when the animations setting is
on *and* the operating system expresses no reduced-motion preference. The operating system
wins. `src/app.css` holds every duration at zero until `data-animations` is present on the
root, so a component may write its transition unconditionally and one derived answer stays the
single gate; a media query of a component's own is a second opinion on the same question,
which is how the two come apart. `src/app.html` states the default in the markup, and the
workshop writes the same attribute from its own toolbar. The derivation exists —
`animationsActive` in `src/lib/domain/appearance.ts`, fed by the reduced-motion answer the
preferences port reads — and nothing on the route calls it yet. `Modal` is the one component
whose arrival is keyframed, and `Button` and `IconButton` transition their colours; all
three are gated on the same attribute, which the route writes flat.

## The one exemption, and how narrow it is

A control the reader cannot operate is held to none of those figures. That is
`Appearance.@guarantee AnUnavailableControlIsExempt`, and it adopts the carve-out WCAG 2.2
already makes at 1.4.3 and 1.4.11 for an inactive component. The reason is that dimming is
*how* unavailability reads: a dim that had to clear the bar a live control clears would not
read as one. The text naming the control is exempt too, because a label that stayed bright
beside a control that had gone quiet would disagree with it about whether the thing can be
used.

The exemption is from the figures and from nothing else.

- **The state reaches the accessibility tree.** Unavailability is carried where a screen
  reader is told it in words, never resting on the dim.
- **Every non-colour indication survives.** A dimmed control keeps whatever shape or wording
  its live form carried, because the colour clause admits no exemption at all.
- **It is spent only where it applies.** A control that is merely quiet, incidental or
  low-priority is not unavailable, and the exemption does not stretch to reach it.

In `src/app.css` this is why `--text-disabled` and the disabled button's `--rule` border are
the two inks `tests/contrast.test.ts` deliberately never measures, here as in Poodl — and
being unmeasured is exactly why they are the values the design system states rather than
values chosen here. `Button` and `IconButton` spend them, with the state carried by the
`disabled` attribute and the words kept, which `tests/primitives.test.ts` holds.

This is also the one place a silent gate agrees with the specification rather than merely
failing to reach it. Axe declines to judge a disabled control — `is_disabled_default` in its
contrast rule — and a label whose own control is disabled, which is the shape of what is
exempt.

## What the specifications carry beyond appearance

Three obligations came across with the tokens and answered to no clause in
`appearance.allium` for as long as this page said so. They are stated now.
[`operation.allium`](../specs/operation.allium) carries all three — `FullyKeyboardOperable`,
`EveryControlIsAComfortableTarget` with `config.minimum_touch_target` at 44 and
`config.narrowest_supported_width` at 320, and the four `DirectManipulation` invariants — and
[decision 0015](../decisions/0015-operation-and-play-are-specified-here.md) is the record.
`src/lib/config.ts` mirrors the two figures and the stories read them from it rather than
from a fixture beside them, so a play measures against the specification rather than beside
it, and `tests/operation.test.ts` measures the rest against the stylesheet that spends them.

What follows is what each obligation now obliges, and what still answers to nobody, which is
a shorter list than it was.

**Everything is keyboard operable.** Every operation a surface provides can be reached and
invoked from the keyboard alone, with visible focus. `:focus-visible` in `src/app.css` draws a
2px outline in `--focus` at a 2px offset, so a control inherits the indication rather than
asking for it. Keyboard operability costs most in a dialog, and the cost should be paid once
rather than per caller: focus goes into the panel when it opens, Escape closes it, Tab cycles
inside rather than wandering out to whatever is behind, and focus returns to whatever opened
it on the way out. That last one is easy to leave out and invisible until someone tries —
closing destroys the element focus is on, the browser falls back to the document body, and the
reader who tabbed to a control and pressed Escape resumes from the top of the page. `Modal`
is that dialog and carries the whole of that: focus into the panel on arrival, Escape to
`onclose`, Tab cycling over the stops the panel's contents really make rather than everything
a selector matches, and focus handed back to the opener on the way out if it is still in the
document. `tests/shells.test.ts` holds each.
What the shell cannot do is catch a child that removes the control the reader just used — a
removed element fires no `focusout` — so a child that swaps a control carries focus across
its own swap, which is what `Button`'s bindable `element` is for.

`.visually-hidden` is in the stylesheet, and `Announcer` is the live region that uses it: a
`role="status"` paragraph keyed on a sequence number, so the same sentence twice is heard
twice. `Notice` is its visible counterpart — the sentence where the reader is looking, with
`role="status"` so it is heard as well as seen, and never duplicated into `Announcer`. A
surface that changes something without moving focus owes an announcement through one of the
two; the platform states which shapes, and a game states which sentences.

**Every control is big enough to hit.** 44px, in both directions, down to the 320px viewport
that is the narrowest supported width. Both figures are stated here now, in
`operation.allium`'s `config` block, and that module exists because a target size is how a
surface is *operated* rather than how it looks — which is `appearance.allium`'s scope and the
reason it was the wrong home. Poodl's `game.allium` states the same two figures and will keep
its copy until a check in Poodl's own gate compares the two, which is a handover item rather
than something a version bump settles. What spends the figures is in
`src/app.css`: a `min-block-size` floor on buttons and text controls, and a 34rem shell rather
than the design system's 480px, because a 480px shell caps a key in a ten-across row at about
40px on a screen with room for 44. Across is
deliberately not declared, since a floor in that direction would be wrong for a dense row and
would have to be fought back wherever it applied. A game that genuinely cannot meet the figure
in both directions says so in its own specification and states what the width of the screen is
allowed to take away. `src/lib/config.ts` holds both figures, mirrored from the module that
states them, for the plays that measure a rendered control: `Button`'s and `IconButton`'s boxes against the 44, and `HeaderBar` laid
out at 320px with nothing scrolling sideways and every target whole. `IconButton` sets its
own 44px width and takes its height from the stylesheet's floor.

A text control is included on purpose: a 37px input is as much a target as a 37px button. It
also needs a font no smaller than 16px, below which iOS Safari magnifies the page when the
field takes focus — the platform zooming on its own initiative, which is the thing the rule
below refuses.

**A tap does only what the control does, and says that it landed.** Touch is the primary way
these games are played, and a gesture the platform interprets for itself is a gesture that did
not reach the game. Every control declines the platform's guess: `touch-action: manipulation`,
so a second fast tap is a second action rather than a zoom; no text selection on a label; no
callout under a held finger. What is declined is the platform's guess and never the reader's
intent — `manipulation` keeps the pinch, and the viewport meta in `src/app.html` has never
carried `user-scalable=no` or a `maximum-scale`, both of which would satisfy the first half of
this by breaking the second.

A text control takes that first declaration and none of the others. Two fast taps in a field
are a caret placed twice rather than a zoom, which is the rule exactly; but text meant to be
copied has to be selectable by hand, and on a phone the callout is how a selection is copied,
so suppressing either would buy this rule by spending that one. Nothing is taken from a text
control, so nothing is owed back: the caret, the focus outline and the platform's own flash
all arrive on contact.

Removing the platform's tap flash without replacing it would leave a control that reads as
dead under exactly the finger the rule exists for, so a pressed control draws a ring in the
page's own ink, backed by its own paper. Two tones rather than one, because no single tone
stands off every ground a control can carry, and ink and paper between them always do — one of
the two is always at the far end of the range. A filter was the first thing tried and is the
reason this is a shadow: `filter` dims the content along with the control, which costs the
colour clause the contrast it depends on, buying one guarantee by spending another. The ring
goes wherever the flash was taken from, which is wider than the buttons: a preference row
suppressed along with everything else would otherwise stay visually unchanged until the finger
lifted, so the row draws the ring too — the row and not the box inside it, for the same reason
the row is what grows to 44px. A label that merely points at a text field with `for` is left
out of both, because pressing it moves focus into the field and the focus outline lands on the
control that took the tap rather than on the words pointing at it.

## How this is checked

By test, not by audit. `tests/` holds a suite per component group, the contrast test, the
port's and the derivations'; `stories/` holds a file per component and the token sheet.
[Testing](../reference/testing.md) says what each proves.

**Query by accessible role and name.** A component test finds a control the way a screen
reader does, so an assertion fails when a name is missing or wrong. Never by class, never by
test id, with one bounded exception: an element that is `aria-hidden` because the guarantee it
discharges is the *visual* half of a claim whose spoken half is carried elsewhere. The marker
bar on a cell and a key is that element — it has no name precisely because the name beside it
already says the same thing in the game's words — and [Testing](../reference/testing.md)
states the terms it is granted on. An accessible name is no substitute there: the words arrive
through a prop, so asserting the name ends in them proves the prop was plumbed and nothing
about whether a reader who cannot separate the two inks has anything to separate them by.

**Axe runs on every story.** `.storybook/preview.ts` sets the accessibility addon's test mode
to `error`, where the addon's own default only reports, and the story run renders each story
in real Chromium. That catches a class of defect a role-and-name query cannot see at all:
contrast below threshold, a landmark used twice, a control with no computed name. It covers
every component, but each story is checked only in the appearance its globals select, so a
palette is covered when a story pins it and never automatically — which is why every story
file pins dark, and dark high contrast where the look inverts. See
[Decision 0008](../decisions/0008-component-workshop.md).

**A gate's silence is not a pass.** Axe skips what it cannot attribute and declines to judge
what it cannot compute, and both blind spots fall exactly on the play surface — which is here
now, which is why the contrast test grew rather than the axe run.

- Anything behind `aria-hidden` is never checked for contrast, at any opacity. A decorative
  mark, a bar or an icon is invisible to the rule.
- Any element whose visible text is a single character is downgraded to *incomplete* —
  `shortTextContent` in axe-core — and an incomplete result is reported without failing. A
  board of letters and a keyboard of letters are the whole of that. Axe has never judged a
  tile or a key, and cannot.
- `target-size` answers to 24px rather than the 44 stated above, so a control it passes can
  still be too small to hit.
- No rule anywhere knows that one state must stand off another. Standards ask a colour to
  stand off its background rather than off a second state, so a game that needs that pair
  states it and holds it itself.

Those gaps are why the contrast test exists beside axe: it measures the palette, in every
combination, including the pairs axe never attributes.

Some things need a person, and always did. `-webkit-touch-callout` is declared and verified by
neither runner, because jsdom's parser drops it, desktop Chromium does not report it, and the
platform it is for is iOS Safari. `:active` is a state only real input produces, so no
synthetic event reaches the pressed ring and whether a finger on a real phone sees it still
takes a real phone. The workshop's reduced-motion control is a simulation and says so: nothing
running inside the page can make `matchMedia` report `reduce`, so it freezes declarative
motion for a reviewer rather than proving the preference is honoured. Focus order, announcement
timing and whether a description is actually useful need a screen reader. That a palette stays
legible on a phone at minimum backlight is what prompted several of the figures on this page,
and it still takes a phone.

## Related pages

- [Specifications](specifications.md)
- [Testing](../reference/testing.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
