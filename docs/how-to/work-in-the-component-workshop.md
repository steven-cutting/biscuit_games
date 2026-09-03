---
title: "Work in the component workshop"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [component_workshop]
requires: []
---

# Work in the component workshop

The workshop is Storybook, served locally. It renders one component at a time, in every
state its surface names, in either palette, with the accessibility check running as you
go. Here it is not a convenience. The hub has one route and one component, so the workshop
is the only way to see a component at all, and it is where the design system's components
get built before any game consumes one. Why it exists is in
[Decision 0008](../decisions/0008-component-workshop.md).

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

Stories live in `stories/` at the repository root, one file per component. The layout rule
and what the story run proves are in [Testing](../reference/testing.md).

Today there is exactly one file, `stories/Wordmark.stories.svelte`, because there is
exactly one component. That is
[Decision 0011](../decisions/0011-skeleton-not-a-second-application.md) rather than an
omission: this repository is a skeleton and a source of truth, and a component lands here
when a game needs it, not before.

No Foundations story exists yet. Poodl carried `stories/Foundations.stories.svelte` as the
one recorded exception to one-file-per-component, documenting the palette, type ramp,
spacing and radii rather than a component. Here the tokens are not an exception to
anything. `src/app.css` is the vocabulary this repository owns, so specimens of it are the
point rather than a deviation from it, and writing that story is the natural next
component-shaped change. What it would have to show is in [Tokens](../design/tokens.md).

One caution about specimens: they are for looking at. Nothing in this repository
recomputes a contrast ratio — `tests/contrast.test.ts` was not ported — so every figure
the handbook quotes is inherited from Poodl rather than measured here. A specimen that
printed a ratio beside a swatch would be printing a claim, and it would drift from the
colour the moment the colour moved.

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
    await expect(within(canvasElement).getByText(/biscuit/)).toHaveTextContent('biscuit games');
  }}
/>
```

`Wordmark` takes no props, so it needs no args. A component that takes props declares them
as a typed constant — `const pressed: ComponentProps<typeof Button> = { … }` — and passes
it to a story as `args`.

Imports reach into `src/` with a relative path, matching `tests/`.

Four rules on top of the format:

1. **Name the states the surface names.** Where a surface governs the component, a story
   set is a reading of the specification, so cover the states `docs/specs/` says the
   surface has, and say which surface and which `@guarantee` clauses it stands for. Cite
   them by name; the words live in one place. `appearance.allium` is the only module here,
   so most components will cite it for their theme and contrast states and for nothing
   else. Where nothing governs — `Wordmark` is brand rather than behaviour — say so in the
   story's description and name the authority it does answer to, which is
   [Design direction](../design/direction.md).
2. **A story is a fixture, not an assertion.** The evidence still lives in `tests/`, and the
   coverage floor is still earned there.
3. **Never touch a browser global.** There is no `src/lib/ports/` in this repository, and
   there will not be one until the first side effect arrives; when it does, it arrives
   behind a port with an in-memory fake beside it — that is
   [Decision 0005](../decisions/0005-ports-and-fakes.md), a standing rule rather than a
   description of existing code. The rule is stated here because the story run is a real
   browser, so `localStorage` and the clipboard exist and would work. A story that reached
   for one would pass and prove nothing. Construct the component against the fake, as
   `tests/` does.
4. **Reach for a play function when the guarantee is about interaction.** A story that tabs
   to a control and activates it is executable evidence in a way a rendered picture is not.
   The two on `Wordmark` are the worked examples of the smaller case: one asserts the
   lockup reads "biscuit games" and not "b biscuit games", because the mark is
   `aria-hidden`; the other asserts that pinning the dark theme reached
   `document.documentElement`, which is the element every palette in `src/app.css` is keyed
   on.

A story that needs composition — a wrapper, a sibling, children of its own — either sets
`asChild` and supplies children, which ignores args, or supplies a snippet named `template`,
which receives the args and the story context. The addon's own documentation covers both.

## Switch theme, contrast and motion

The toolbar carries four globals. Theme and high contrast set `data-theme` and
`data-high-contrast` on the preview's root element, which is what `src/app.css` keys on, so
a story sees the tokens the application will. The animations setting and reduced motion are
read together and write `data-animations` on the same terms a route would: the attribute is
present only when the setting is on and the device is not asking for less. A story pins a
value with a `globals` prop, which beats the toolbar and disables the matching control, as
the wordmark's "Dark theme" story does.

Reduced motion is a simulation, labelled as one: it freezes declarative motion in the
preview but cannot make the browser report the preference. Nothing in the hub animates yet
— every duration token is zero until `data-animations` says otherwise — so that control is
here for the components still to come.

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
   and remember that nothing in this repository will recompute the figure for you.
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
