---
title: "Make your first change"
kind: "tutorial"
audience: [contributor, agent]
canonical_for: [first_change_tutorial]
requires: []
---

# Make your first change

About half an hour, from a fresh clone to a green gate — the first run downloads a browser
and a checker. The change is small on purpose; what matters is that it passes through every
layer the repository has. There are fewer layers here than in a game — no rules, no state,
no data — so the loop is a specification, a component, its test, its story, and the gate.

## 1. Get the workspace running

```console
uv lock
uv sync --frozen
npm install --package-lock-only --ignore-scripts --no-audit
npm ci --no-audit
just storybook-browsers
just install-allium
```

The first four create the lockfiles and install both toolchains from exactly what those
lockfiles say; they are what `just lock` and `just sync` run. The last two are the two
downloads no lockfile can account for: the Chromium build the story gate renders in, and the
pinned Allium checker that reads `docs/specs/`. Without either, the gate cannot reach green.

`just initialize` runs that list, normalises formatting, and then installs the pre-commit
hook — but only when the checkout is the primary one. Git keeps one `.git/hooks` for every
worktree of a repository, so a hook installed from a secondary worktree quietly changes
what each of the others runs on commit; `just initialize` compares the two git directories
and declines rather than doing that. So it is the single command here whatever kind of
checkout this is, and `just install-hooks` on its own is the one to run only from the
primary checkout.

Then confirm you are starting from green:

```console
just check
```

If something is missing rather than failing, [Develop locally](../how-to/develop-locally.md)
lists the prerequisites.

## 2. See the site

```console
just dev
```

Open the address it prints. There is one page: the wordmark, a sentence saying what Biscuit
Games is, and a list of the games with Poodl on it. No board, no keyboard, no score — this
repository is the hub and the source of truth for what the games share, not a second game.
What is worth looking at is the surface itself. Every colour, space, rule and letterform on
that page comes from the token vocabulary in `src/app.css`, which is the thing this
repository actually owns.

## 3. Read what decides the behaviour

Open [`appearance.allium`](../specs/appearance.allium) and find
`EveryCombinationMeetsTheLegibilityFloor` inside `surface Appearance`. It states the floor in
all four combinations of theme and high contrast rather than in the one a change happened to
be looked at in; it names `config.minimum_text_contrast` (4.5) and
`config.minimum_boundary_contrast` (3.0) as the bars; and it is explicit that high contrast
raises the floor nowhere, being a second palette that clears the same bar rather than the
version where legibility is finally attended to.

Then note what this repository does with it. `tests/contrast.test.ts` recomputes those
ratios against the palette in all four combinations, so both figures are measured here on
every run of `just check`; the axe pass in the workshop sees only what a story actually
renders. Reading the guarantee is still the obligation — the test holds the figures, not
the reasoning.

## 4. Add a case to the test

`tests/wordmark.test.ts` holds one case: the lockup's accessible text is exactly
"biscuit games", because the mark's "b" is `aria-hidden`. Add a second for something the
component also owes and nothing yet asserts — that it renders no heading of its own, for
instance. `src/routes/+page.svelte` is what wraps the lockup in an `<h1>`; the component is a
lockup and nothing more.

```console
just frontend-unit
```

Work out by hand what the component owes before you write the assertion, and query by
accessible role and name wherever there is a role to query. If your expectation and the code
disagree, one of them is wrong — decide which by reading `Wordmark.svelte` again, not by
adjusting until it passes. The coverage floor over `src/lib/**` is 90%, and nothing lands
there without a test.

## 5. Add a story state

`stories/Wordmark.stories.svelte` has two stories: the lockup, and a dark-theme state whose
play function proves the theme attribute reached the document root, which is where every
palette in `src/app.css` is keyed. Add a third for a combination the guarantee in step 3
names and no story covers — dark with high contrast on. Set that story's `theme` global to
`dark` and its `highContrast` global to `on`, and have its play function assert that
`data-theme` and `data-high-contrast` both reached the root.

```console
just storybook-test
```

Every story renders in real Chromium with axe run over it, so a new state is a new axe pass
in that combination: evidence about what is rendered there, not about the ratios the
specification names, which `tests/contrast.test.ts` measures in the same gate. The rule is
the one every change here follows — the component change, its Testing Library assertion and
its story land in the same commit.

## 6. Run the whole gate

```console
just check
```

It runs every recipe in order — the lock check, the linters, the static and coverage passes,
both builds, the story tests, the documentation and agent validators, and the two spec
recipes — and proves the run did not modify the worktree. Read only the first failure; the
later ones are often consequences. If a gate fails, do not work around it —
[Troubleshooting](../operations/troubleshooting.md) covers the common causes.

## 7. Commit

Where the pre-commit hook is installed, it runs the read-only gate again. Where you skipped
it because this is a secondary worktree, step 6 is the whole of your evidence, so run it
before you commit rather than after. Nothing is pushed until you ask for it, and nothing is
published from your machine: a release happens from a tag, and the site has no address at all
because the domain root still belongs to Poodl
([decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md)). A green gate is
where this loop ends.

## What you just touched

A specification you read and did not change, one component, its test, its story, and the
gate. That is the whole loop; every change after this one is the same
shape, and adding a component to the design system is this shape with
[Port a design system component](../how-to/port-a-design-system-component.md) in front of it.

## Related pages

- [Develop locally](../how-to/develop-locally.md)
- [Test and debug](../how-to/test-and-debug.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
