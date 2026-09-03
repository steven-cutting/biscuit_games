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

This is the platform's model rather than a survey of this repository's code. `src/` is a
skeleton — one route, one component, one stylesheet, per
[decision 0011](../decisions/0011-skeleton-not-a-second-application.md) — so most of what is
stated below has nothing here to implement. It is stated anyway. An obligation nobody has
written down is one the first implementation gets to decide by accident.

## Every figure here is inherited, not measured

`tests/contrast.test.ts` was not ported. Nothing in this repository recomputes a contrast
ratio, in any theme, for any pair of colours. Read that before reading anything below,
because almost every number on this page, and every number in `src/app.css`'s comments, is a
figure Poodl measured against a palette this repository copied.

The consequences are worth stating plainly rather than discovering.

- **A ratio quoted in a comment is a claim.** `src/app.css` still cites `game.allium`,
  `src/lib/config.ts` and test files that do not exist here. Those citations are provenance —
  where the value came from — never evidence that anything checks it now.
- **Nothing catches drift.** A token edited here resolves to whatever it resolves to and the
  gate stays green. That is the copy-and-cite cost
  [decision 0002](../decisions/0002-shared-material-travels-by-citation.md) accepts, seen from
  its sharp end.
- **A review computes by hand and says so.** The `accessibility-review` skill in
  `.agents/skills/` asks for exactly that, and a review that quotes a figure without saying
  where it came from has added a second unmeasured claim.
- **A game proves the copy where a test can run.** A value leaves here as a number with a
  citation attached; the repository that renders it is the one that can measure it.

The two floors themselves are different in kind. `config.minimum_text_contrast` at 4.5 and
`config.minimum_boundary_contrast` at 3.0 are thresholds the specification states, as ratios
naming no colour. They are true without a gate. What no gate here can tell you is whether a
rendering meets them.

## What the specification decides

**Colour never carries meaning alone.** Neither the theme nor high contrast is what makes
anything readable. Nothing on any surface is distinguished by colour alone, in any
combination of the settings: every state a colour helps to show also carries a shape, a word,
or both, and every one has an accessible name that says it in words. This holds in every
theme and in both palettes.

The platform states the rule and stops there. What discharges it belongs to whoever has the
states. Poodl's marker bars, and the separations Poodl declares between one key state and
another, are Poodl's answer to this clause rather than the platform's — as is every figure
those separations are stated in. `appearance.allium` says so twice: a game that adds states of
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
of step with itself. In Poodl a test read both blocks as text and held them equal. Here
nothing does, so the two blocks are kept in step by whoever edits them.

**More contrast asked of the operating system turns high contrast on.** The device wins the
same way it does for motion, so a reader who has already asked their system does not have to
find the setting and ask again. It never overwrites the reader's own answer: `high_contrast`
stays exactly as they left it, and `high_contrast_active` is what anything rendering reads.
What a reader cannot yet do is overrule the device, and `appearance.allium` carries that as an
open question rather than a decision. There is no settings panel here to carry either half —
the module excludes one deliberately, because a panel belongs to the product that owns it — so
today the whole of this is a rule waiting for a control.

**Motion respects the operating system.** Animations run only when the animations setting is
on *and* the operating system expresses no reduced-motion preference. The operating system
wins. `src/app.css` holds every duration at zero until `data-animations` is present on the
root, so a component may write its transition unconditionally and one derived answer stays the
single gate; a media query of a component's own is a second opinion on the same question,
which is how the two come apart. `src/app.html` states the default in the markup, and the
workshop writes the same attribute from its own toolbar. Nothing here derives
`animations_active` from a live device preference, because there is no preferences port and no
surface asking for one. The derivation arrives with the first component that animates.

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
the two inks Poodl's contrast test deliberately never measured — and being unmeasured is
exactly why they are the values the design system states rather than values chosen here. Here
that distinction has gone flat: nothing measures anything, so those two inks are no longer
distinguishable from the rest of the palette by what checks them.

This is also the one place a silent gate agrees with the specification rather than merely
failing to reach it. Axe declines to judge a disabled control — `is_disabled_default` in its
contrast rule — and a label whose own control is disabled, which is the shape of what is
exempt.

## What the stylesheet carries and the specification does not

Three obligations came across with the tokens and answer to no clause in `appearance.allium`.
In Poodl they were stated in the game's own modules — a direct-manipulation contract, two
config values this repository does not have, and a keyboard clause repeated on every surface
that provides an operation. They are kept as standing rules — in `src/app.css`, and
in the `accessibility-review` skill — because the stylesheet still spends them and because
they are platform habits rather than one game's. Where they are finally stated is not yet
decided: the first surface here that needs them, or a game's own module, is what will force
the answer.

**Everything is keyboard operable.** Every operation a surface provides can be reached and
invoked from the keyboard alone, with visible focus. `:focus-visible` in `src/app.css` draws a
2px outline in `--focus` at a 2px offset, so a control inherits the indication rather than
asking for it. Keyboard operability costs most in a dialog, and the cost should be paid once
rather than per caller: focus goes into the panel when it opens, Escape closes it, Tab cycles
inside rather than wandering out to whatever is behind, and focus returns to whatever opened
it on the way out. That last one is easy to leave out and invisible until someone tries —
closing destroys the element focus is on, the browser falls back to the document body, and the
reader who tabbed to a control and pressed Escape resumes from the top of the page. There is
no dialog here yet. When one arrives it carries the whole of that.

`.visually-hidden` is in the stylesheet too, with nothing yet to announce through it. A
surface that changes something without moving focus owes an announcement; the platform states
none, and the class is here so that the first one does not invent its own.

**Every control is big enough to hit.** 44px, in both directions, down to the 320px viewport
that is the narrowest supported width. Both figures are inherited — Poodl's
`config.minimum_touch_target` and `config.narrowest_supported_width` — and `appearance.allium`
declares neither. What spends them is in `src/app.css`: a `min-block-size` floor on buttons
and text controls, and a 34rem shell rather than the design system's 480px, because a 480px
shell caps a key in a ten-across row at about 40px on a screen with room for 44. Across is
deliberately not declared, since a floor in that direction would be wrong for a dense row and
would have to be fought back wherever it applied. A game that genuinely cannot meet the figure
in both directions says so in its own specification and states what the width of the screen is
allowed to take away.

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

By test, not by audit — and there is very little here to test. `tests/` holds
`wordmark.test.ts` and `stories/` holds `Wordmark.stories.svelte`. The conventions below are
inherited rules waiting for material rather than a description of a body of evidence, and
[Testing](../reference/testing.md) says which they are.

**Query by accessible role and name.** A component test finds a control the way a screen
reader does, so an assertion fails when a name is missing or wrong. Never by class, never by
test id.

**Axe runs on every story.** `.storybook/preview.ts` sets the accessibility addon's test mode
to `error`, where the addon's own default only reports, and the story run renders each story
in real Chromium. That catches a class of defect a role-and-name query cannot see at all:
contrast below threshold, a landmark used twice, a control with no computed name. Today it
covers one component. The workshop toolbar can drive all four combinations of theme and high
contrast, but each story is checked only in the appearance its globals select, so a palette is
covered when a story pins it and never automatically. See
[Decision 0008](../decisions/0008-component-workshop.md).

**A gate's silence is not a pass.** Axe skips what it cannot attribute and declines to judge
what it cannot compute, and both blind spots fall exactly where a game's play surface lives.

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

Those are the smaller gaps. The larger one is the whole of the section above: no runner here
recomputes a ratio at all, so a palette change is reviewed by reading and by hand.

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
