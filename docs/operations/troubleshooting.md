---
title: "Troubleshooting"
kind: "operations"
audience: [contributor, maintainer, operator, agent]
canonical_for: [troubleshooting]
requires: []
---

# Troubleshooting

Symptoms as headings, causes and fixes as bodies.

## `just check` reports that a recipe changed the worktree

The recipe is the defect, not your change. Checks are read-only; anything that writes
belongs in `.pre-commit-fix.yaml` and runs from `just fix`. The report names which paths
moved. Move the offending hook, or add the generated path to the ignore rules.

## `docs validation: frontmatter <field> disagrees with the manifest`

Almost always list order. The comparison between `docs/manifest.yml` and a page's
frontmatter is order-sensitive, so `[maintainer, contributor]` fails against
`["contributor", "maintainer"]`. Copy the order from the manifest.

If the field is `title`, check for a stray difference in punctuation — the level-one
heading must match it byte for byte as well.

## `docs validation: not reachable from docs/README.md`

The page exists and is registered, but nothing links to it. Add it to
[the documentation map](../README.md), or to a page that is already reachable.

## A page written here is already owned by Poodl

Two shapes, with opposite fixes. Decide which one you are in before editing anything.

If the subject is a game's — its rules, its data, its address, its deployment — it stays in
the game, and the page here is the mistake. Put it through the ownership test in
[What the hub owns](../project/what-the-hub-owns.md#the-test): would a second game need
this, unchanged? A game-specific fact does not become a platform fact by being written down
here, and the hub is not where things go when nobody knows where they go.

If the subject is genuinely the platform's — how it looks, what a token means, how a shared
surface behaves — then this repository is right and Poodl's copy is the fault. That is
[decision 0001](../decisions/0001-biscuit-games-is-the-source-of-truth.md), and nothing is
deleted from Poodl by it: the copy simply stops being authoritative. Write the item into
[Poodl handover](poodl-handover.md) and stop there. Editing another repository needs
explicit authorization for each action, and this repository records what Poodl has to
change rather than changing it.

No gate will tell you which of the two you are in. `canonical_for` is checked across one
tree, by one validator, reading one worktree; two repositories claiming the same topic is
not a state anything here can observe.

## `agent validation: unexpected managed file`

Something appeared under `.agents/`, `.claude/` or `.codex/` that is neither a declared
skill nor `.claude/settings.json`. If it is local tool state, add it to `.gitignore` —
the inventory reads Git, so an ignored file is invisible to it. If it is real content, it
belongs in `.agents/skills/` with bridges, or somewhere else entirely.

## `agent validation: must stay a thin pointer to the canonical skill`

A bridge under `.claude/` or `.codex/` has grown content, or its frontmatter has drifted
from the canonical skill. Regenerate it: the canonical frontmatter verbatim, one blank
line, one sentence pointing at the canonical path, under forty words.

## `just lint` fails on the specifications, and you changed no specification

`just lint` is `prek` over every file, and two of its hooks run the Allium checker over
`docs/specs/`. Both refuse to skip themselves, because a gate that stands down when its
tool or its input is missing asserts nothing. Two faults reach you this way.

The binary is absent or is not the pinned version. The message names what it found and what
the project pins — `allium is not installed`, or an older version where the pin has since
moved — and the repair for both is `just install-allium`. `just sync` will not do it: sync
installs exactly what the lockfiles say, and no lockfile can name a binary. The install is
per-worktree, into the gitignored `.tools/bin`, so a fresh worktree starts here.

`run_allium: allium check resolved no specification under docs/specs/` is the other. The
checker resolved no module at all, which is a gate that read nothing rather than a gate that
passed. allium exits with its own no-inputs status and the wrapper says so in words rather
than passing a bare number through, and it names the modules it did read against the ones
`docs/specs/` holds, so a module dropped in silence cannot pass inside a reassuring count.
This repository has exactly one module, `docs/specs/appearance.allium`. Restore it rather
than teaching the gate to accept an empty directory. See
[Work with the specifications](../how-to/work-with-the-specs.md).

## `svelte-check` reports an unused CSS selector

`npm run check` runs with `--fail-on-warnings`, so a warning fails `just frontend-static`
exactly as an error would. Svelte scopes a component's styles to that component's own
markup and reports a selector it cannot match there.

Porting is the usual cause: the styles came across from Poodl and the markup they were
written for did not. Delete the selector. `:global` is not the fix — it takes the rule out
of the scope that was protecting it, and buys silence rather than an answer. If the markup
belongs to another component, the rule belongs in that component; if the value is
vocabulary the platform shares, it belongs in `src/app.css` as a token. See
[Port a design system component](../how-to/port-a-design-system-component.md).

## Coverage fails but everything is tested

Distinguish two cases. If a real path is untested, add the test. If the uncovered branch
cannot be reached by any input — a bounds check after a modulo, a fallback after an
exhaustive assignment — delete the branch. Do not lower the threshold.

Svelte compiles text interpolation into update branches that only run on re-render, so a
component tested only with fresh renders shows uncovered branches. A test that updates
props covers them, and is worth having on its own merits.

## `just storybook-build` fails because `static/` does not exist

`.storybook/main.ts` names `../static` in `staticDirs`, and Storybook treats a listed
static directory that is not there as an error rather than as an empty one.

`static/` holds `.nojekyll` and nothing else, and Git does not track directories — so
deleting that one file deletes the directory with it. It is an easy file to delete: it
reads as a GitHub Pages artefact, and this repository publishes nothing
([decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md)). Restore it with
`git restore static/.nojekyll`, and see [Repository map](../project/repository-map.md).

## `just check` stops because Playwright cannot start Chromium

The story gate renders in a real browser, and the browser is in neither lockfile, so
`just sync` does not install it — `just sync` installs exactly what the lockfiles say. Run
`just storybook-browsers` once per machine, and again after the `playwright` pin moves. On
Linux, run `just storybook-browsers-deps` first. `just initialize` does both for you on a
fresh clone.

## Tests fail on `localStorage` or `navigator.clipboard`

They are not available. Node ships its own experimental `localStorage` that shadows the
one jsdom would provide and stays undefined; `navigator.clipboard` is absent entirely.

Nothing here touches either today — `src/` is a skeleton and its one component is
stateless — so this arrives with something ported from Poodl rather than on its own. It is
not a thing to work around with a stub. A side effect goes behind a port, and the adapter
takes its platform object as a defaulted argument, so a test passes one in. That is
[decision 0005](../decisions/0005-ports-and-fakes.md), which is a standing rule for the
first side effect to arrive rather than a description of code already present. See
[Testing](../reference/testing.md).

## Something works under `just dev` but not in the build

Prerendering. Every route is rendered at build time, so module-scope work runs once, in
Node, and the value it computes is baked into the output for every visitor. Anything that
must vary per visitor has to happen in the browser.

## Commits fail in another worktree after `just install-hooks`

`just install-hooks` was run by hand from a secondary worktree. Git keeps one `.git/hooks`
directory and shares it across every worktree of the repository, and the recipe passes
`--overwrite`, so the hook installed here replaced the one every other worktree also
commits through. `just initialize` is not a way in: it compares the common directory
against the git directory and skips the hook in a secondary worktree, saying so.

The installed hook records an absolute path into the virtual environment of the worktree
that installed it, which is why the fault surfaces late and somewhere else. While this
worktree exists that path resolves, so every other worktree keeps committing — through an
environment that is not its own. Remove this worktree and the path names nothing, and
commits fail everywhere at once, reading as a missing interpreter rather than as a hook
that was replaced weeks earlier.

Reinstall from the primary clone. One `just install-hooks` there fixes every worktree at
once, because there is only ever one hook. A commit that cannot wait for that can pass
`--no-verify`, which skips the gate outright rather than passing it, so run `just lint` by
hand first.

Nothing warned you at the time, and nothing will next time either. The check to run before
either command is in
[Develop locally](../how-to/develop-locally.md#do-not-install-the-hook-from-a-secondary-worktree).

## Related pages

- [Develop locally](../how-to/develop-locally.md)
- [Test and debug](../how-to/test-and-debug.md)
- [Commands](../reference/commands.md)
- [Quality gates](../reference/quality-gates.md)
- [Maintenance](maintenance.md)
