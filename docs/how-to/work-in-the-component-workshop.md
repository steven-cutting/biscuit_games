---
title: "Work in the component workshop"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [component_workshop]
requires: []
---

# Work in the component workshop

The workshop is Storybook, served locally. It renders one component at a time, in every
state its surface names, in either palette, with the accessibility check running as you go.
Here it is not a convenience. The hub has one route, and its front door mounts none of the
platform primitives yet, so the workshop is the only way to see a component at all, and it
is where the design system's components are built before any game consumes one. Why it
exists is in [Decision 0008](../decisions/0008-component-workshop.md).

## Run it

```console
just storybook
```

The workshop opens on port 6006 with hot module replacement, the same as `just dev`.

To render every story in Chromium and run axe over each one:

```console
just storybook-test
```

The same run is available from the workshop itself: **Run tests** at the foot of the
sidebar, with interactions, coverage and accessibility as separate toggles, marks each story
in the sidebar as it finishes. It is the same story suite the recipe runs — the panel starts
its own Vitest, which is why `vitest.config.ts` exists — but `just check` reads the recipe,
so the button is for working, not for evidence.

Both `just storybook-build` and `just storybook-test` are part of `just check`, so a story
that stops rendering, or a component that picks up an accessibility violation, fails the
gate rather than waiting to be noticed.

## Install the browser

The story run needs a real Chromium, which is in neither lockfile.

```console
just storybook-browsers
```

This downloads a browser over the network into a cache outside the repository. It is the
one thing here that cannot run offline. `just initialize` does it for you; run it again
by hand after the `playwright` pin moves. On Linux, `just storybook-browsers-deps`
installs the system libraries Chromium links against.

## Where stories live

Stories live in `stories/` at the repository root, one file per component. The figures a
play measures against come from `src/lib/config.ts`, which mirrors the specification that
states them. The layout rule and what the story run proves are in
[Testing](../reference/testing.md).

`stories/Foundations.stories.svelte` is the one exception to one-file-per-component, and it
is recorded here as one: it documents the palette, the type ramp, the spacing scale and the
radii rather than a component. Poodl carried the same exception; here the tokens are the
vocabulary this repository owns, so specimens of them are the point rather than a deviation
from it. The palette is pinned in its dark and dark high-contrast forms, where the values
were designed first.

One caution about specimens: they are for looking at. `tests/contrast.test.ts` measures
every pair in all four combinations, so a specimen that printed a ratio beside a swatch
would be printing a figure the test already holds — and one that would drift from the
colour the moment the colour moved. The sheet shows the colour; the test states the
number.

## Write a story

Svelte CSF means the story file is itself a Svelte component. Call `defineMeta` in a module
script, destructure the `Story` component out of what it returns, and write one `Story`
element per state.

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Wordmark from '../src/lib/components/Wordmark.svelte';

  const { Story } = defineMeta({ title: 'Brand/Wordmark', component: Wordmark, tags: ['autodocs'] });
</script>

<!-- The comment above a story becomes its description on the docs page. -->
<Story
  name="Lockup"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('b')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByText(/biscuit/)).toHaveTextContent(/^biscuit games$/);
  }}
/>
```

`Wordmark` takes no props, so it needs no args. A component that takes props declares them
as typed constants and passes them to a story as `args`;
`stories/HeaderBar.stories.svelte` is the worked example, including a `template` snippet
that passes a `brand` snippet through.

Imports reach into `src/` with a relative path, matching `tests/`.

Four rules on top of the format:

1. **Name the states the surface names.** Where a surface governs the component, a story
   set is a reading of the specification, so cover the states `docs/specs/` says the
   surface has, and say which surface and which `@guarantee` clauses it stands for. Cite
   them by name; the words live in one place. Three modules are here, so a component cites
   the one that governs it: `appearance.allium` for theme and contrast states,
   `operation.allium` where a story proves a control's size or its keyboard reach, and
   `play-surfaces.allium` where a story proves a mark reads without its hue. Most chrome
   still cites the first and nothing else. Where nothing governs — `Wordmark` is brand rather than behaviour — say so in the
   story's description and name the authority it does answer to, which is
   [Design direction](../design/direction.md). The shells govern nothing of their own
   either: `Modal`, `Notice` and `Announcer` each say which kind of product guarantee they
   exist to discharge, and cite `appearance.allium` for the colour clause.
2. **A story is a fixture, not an assertion.** The evidence still lives in `tests/`, and the
   coverage floor is still earned there.
3. **Never touch a browser global.** `src/lib/ports/preferences.ts` is the port that
   exists, with `createFakePreferences` beside the real adapter — that is
   [Decision 0005](../decisions/0005-ports-and-fakes.md) carried out. The rule is stated
   here because the story run is a real browser, so `matchMedia`, `localStorage` and the
   clipboard exist and would work. A story that reached for one would pass and prove
   nothing. Construct the component against the fake, as `tests/` does.
4. **Reach for a play function when the guarantee is about interaction.** A story that tabs
   to a control and activates it is executable evidence in a way a rendered picture is not.
   The two on `Wordmark` are the worked examples of the smaller case. The first takes two
   assertions rather than one, because a text query matches an element's own text nodes:
   `getByText(/biscuit/)` resolves to the span holding the words and never to the lockup
   around it, so it would pass with the mark audible however tightly it is anchored. The
   mark's silence is a separate claim and takes a separate assertion —
   [Testing](../reference/testing.md) is the full account. The second asserts that pinning
   the dark theme reached `document.documentElement`, which is the element every palette in
   `src/app.css` is keyed on. `Modal`'s focus trap and `HeaderBar`'s narrowest-width story
   are the worked examples of the larger case.

A story that needs composition — a wrapper, a sibling, children of its own — either sets
`asChild` and supplies children, which ignores args, or supplies a snippet named `template`,
which receives the args and the story context. The addon's own documentation covers both.

## Switch theme, contrast and motion

The toolbar carries four globals. Theme and high contrast set `data-theme` and
`data-high-contrast` on the preview's root element, which is what `src/app.css` keys on, so
a story sees the tokens the application will. The animations setting and reduced motion are
read together and write `data-animations` on the terms `Appearance.animations_active` sets:
the attribute is present only when the setting is on and the device is not asking for less.
The route does less than that — `src/app.html` writes the attribute flat and reads no device
preference — so the workshop is the more faithful of the two, and this is one place a story
is not showing you what the hub does today. A story pins a value with a `globals` prop, which
beats the toolbar and disables the matching control, as the dark pin in every story file
that draws something does.

Reduced motion is a simulation, labelled as one: it freezes declarative motion in the
preview but cannot make the browser report the preference. `Modal`'s arrival is the one
keyframed animation here and the controls' colour transitions are the rest, all of them
gated on `data-animations` — every duration token is zero until the attribute says
otherwise — so that control has something to freeze.

Check both palettes before you finish. Colour never carries meaning alone here, which is
`AppearanceNeverCarriesMeaningAlone` in `appearance.allium`, and high contrast changes
which colours carry it — see [Accessibility](../explanation/accessibility.md).

## When the accessibility check fails

The accessibility panel names the axe rule that failed and the node that failed it. The
story run fails on a violation because `.storybook/preview.ts` sets the addon's test mode
to error; its own default only reports.

1. **Fix the component, not the story.** A story is a fixture; turning a rule off to make
   one pass leaves the defect in the application and deletes the report.
2. **A missing or wrong accessible name is a test failure too.** It is the same information
   a role-and-name query matches on, so add the assertion in `tests/` while you are there.
3. **A contrast failure is usually a token, not a component.** Check the light palette, the
   dark palette and high contrast in `src/app.css` before changing any markup; all four
   combinations are one toolbar click apart.
4. **Silence is not always a pass.** Axe skips what it cannot attribute, including anything
   behind `aria-hidden` — the wordmark's ruled square is hidden, so the contrast rule never
   inspects it at all. It also downgrades an element whose visible text is a single
   character to *incomplete*, which reports without failing, and that square holds one
   letter. Measure by hand when a guarantee rests on something the tool does not report,
   and if the thing is a colour pair, add it to `tests/contrast.test.ts`, which will.
5. **If a rule is genuinely wrong for this project**, configure it once, where the
   configuration lives, with a stated reason. The rule about suppressions does not bend for
   this tool; see [Quality philosophy](../explanation/quality-philosophy.md).

## Publish it for visual review

Axe answers whether a rule is broken. Whether the thing looks right is a different
question, and it is answered by comparing the render against the last accepted one, in
Chromatic. Why, and what it costs, is in
[Decision 0009](../decisions/0009-visual-review-in-chromatic.md).

**On a pull request**, comment:

```text
/chromatic
```

That publishes the branch and replies with a link. It is deliberately something you ask
for, so a change that touches no component spends nothing. It has to be the whole word, on
a pull request whose branch lives in this repository, from someone whose repository
permission is write or better — a fork's pull request is refused, for the reason
[the security model](../explanation/security-model.md) gives. A 🚀 on your comment means it
was accepted; silence means one of those checks said no, and the reason is a notice on the
run. The workflow also has to be on `main` before the comment does anything at all.

An accepted request always replies, and the reply says which of three things happened: the
build was published, or `CHROMATIC_PROJECT_TOKEN` is not set so nothing was, or the run
ended before it reached the publish step. The first is the expected answer, because the
token is set and the project is live; a 🚀 followed by *no build was published* is a fault to
chase rather than a state to expect. The reply is the only report there is: an
`issue_comment` run appears in no checks list.

**From a laptop**, with the project token exported:

```console
export CHROMATIC_PROJECT_TOKEN=…
just chromatic
```

The recipe builds the workshop and publishes it. It is not part of `just check` — it needs
the network and a token, so it sits beside `just check-links-online` rather than in the
gate. It takes one optional argument, the branch name, which only CI passes: it checks a
pull request out at a detached head and Chromatic would otherwise have no branch to file
the build under.

This is the one thing about the workshop that leaves the machine, and it is not publishing
the hub. The site itself goes nowhere; that is
[Decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md).

A visual change never fails the run. It is recorded for you to look at and accept in
Chromatic, and a push to `main` accepts its own changes, so the baseline follows the branch
without anyone maintaining it. The corollary is worth holding on to: a regression that gets
merged becomes the baseline. The review is the pull request, and there is no second one.

## Related pages

- [Testing](../reference/testing.md)
- [Test and debug](test-and-debug.md)
- [Port a design system component](port-a-design-system-component.md)
- [Decision 0008: A component workshop](../decisions/0008-component-workshop.md)
- [Decision 0009: Visual review in Chromatic](../decisions/0009-visual-review-in-chromatic.md)
