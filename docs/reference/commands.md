---
title: "Commands"
kind: "reference"
audience: [contributor, maintainer, operator, agent]
canonical_for: [command_reference]
requires: []
---

# Commands

`just --list` prints the live set, and that is what `just` on its own does: the `default`
recipe is the listing. This page says what each recipe is for. The `Justfile` is the only
supported interface: if something is worth running twice, it belongs here rather than in a
shell history.

## Setup

| Recipe | Purpose |
| --- | --- |
| `just initialize` | One explicit first run. Creates both lockfiles, installs both toolchains, the pinned `allium` binary and the browser the story tests need, normalises formatting, and installs the hook when the checkout is the primary one. Never stages, commits, tags or pushes. Safe in any worktree: it skips the hook rather than installing a shared one from the wrong place. |
| `just sync` | Install exactly what the lockfiles say. Run after pulling. |
| `just install-hooks` | Install the read-only pre-commit gate. Primary checkout only — see the warning below. |
| `just install-allium` | Download, verify and install the pinned `allium` binary into `.tools/bin/`. Over the network; no lockfile can name a binary. |
| `just storybook-browsers` | Download the Chromium the story tests render in. Over the network, into a cache outside the repository. |
| `just storybook-browsers-deps` | The system libraries Chromium links against. Linux only; CI runs it first. |

### Do not install the hook from a secondary worktree

Git keeps one `.git/hooks` directory and shares it across every worktree of the
repository. The installed hook records an absolute path into the virtual environment of
the worktree that installed it, and `just install-hooks` passes `--overwrite`, so
installing from a secondary worktree silently replaces the hook every other worktree also
commits through. Check first: this is a secondary worktree when
`git rev-parse --git-common-dir` and `git rev-parse --git-dir` differ, and then
`just install-hooks` is the wrong command here. Counting the rows of `git worktree list` is
not that test — it prints every worktree whatever it is run from. `just initialize` already
knows: it makes the same comparison and skips the hook, saying so, rather than installing one
from the wrong place. Run it freely; run `just install-hooks` by hand only from the primary
checkout. Nothing else warns you, and the breakage surfaces in another worktree, later.
The full account is in [Develop locally](../how-to/develop-locally.md#do-not-install-the-hook-from-a-secondary-worktree).

## Dependencies

| Recipe | Purpose |
| --- | --- |
| `just lock` | Relock at the versions the manifests state. |
| `just lock-upgrade` | Move within the manifests' constraints. |
| `just lock-check` | Fail if a manifest and its lockfile disagree. |

## Develop

| Recipe | Purpose |
| --- | --- |
| `just dev` | Vite development server with hot module replacement, on port 5173. |
| `just preview` | Serve the built output in `build/`. Build first; there is nothing else to set. |
| `just storybook` | The component workshop on port 6006, with hot module replacement. |
| `just frontend-watch [path]` | Vitest in watch mode over one path, or over everything. The iteration loop; it never exits, so it is not a gate. Pins `vite.config.ts`, so the browser project stays out of it. |

The hub is one route that mounts none of the components it holds, so `just storybook` is
where most work happens and `just dev` is where you confirm the route still assembles. See
[The hub holds the design system](../decisions/0014-the-hub-holds-the-design-system.md).

## Format and repair

| Recipe | Purpose |
| --- | --- |
| `just format` | Ruff and Prettier, writing. |
| `just fix` | The mutating hook set, then ESLint autofix, then `just lint`. The aggregate repair command: reach for it rather than the individual writers. |

`just fix` is the repair command, not the only one that writes. `just format`, `just lock`,
`just lock-upgrade` and `just initialize` all modify tracked files too — the first three by
design, the last as part of a first run. What is read-only is the **check** set: every recipe
`just check` runs reports and never repairs, and `scripts/run_project_check.py` proves it per
run by comparing the worktree before and after each one. That is the guarantee worth relying
on, and it is the one the other pages cite.

## Check

| Recipe | Purpose |
| --- | --- |
| `just lint` | The whole read-only hook gate over every file. |
| `just frontend-static` | ESLint, `prettier --check`, and `svelte-check --fail-on-warnings`. |
| `just frontend-unit` | Vitest, once. |
| `just frontend-coverage` | Vitest with the 90% floor over `src/lib/**` enforced. This is the one `just check` runs. |
| `just frontend-build` | Production build into `build/`. `svelte.config.js` reads `BASE_PATH` into `paths.base` and nothing sets it here — see [Configuration](configuration.md). |
| `just package-build` | Compile `src/lib/` into `dist/` with `svelte-package`, types included. Ignored by Git. |
| `just package-check` | `publint --strict` over the files `npm pack` would ship. Proves the package is consumable, not merely built. |
| `just storybook-build` | Build the workshop into `storybook-static/`. Ignored by Git; this build is discarded, and `just chromatic` is what publishes one. |
| `just storybook-test` | Every story in real Chromium: axe over each render, play functions as interaction tests. |

## Documents and agents

| Recipe | Purpose |
| --- | --- |
| `just check-docs` | markdownlint, `typos`, offline link check, then the documentation contract. |
| `just check-agents` | The agent contract: inventory, adapters, and skill bridges. |
| `just check-specs` | `allium check` over `docs/specs/`. Asserts that every module reports an empty `diagnostics` array; anything reported is a regression. Waiver terms: [Work with the specifications](../how-to/work-with-the-specs.md). |
| `just analyse-specs` | `allium analyse` over `docs/specs/`: the same structural diagnostics plus data flow, reachability, deadlocks and conflicts. Asserts that both arrays are empty; a finding cannot be waived, so any finding is a regression. |
| `just check-links-online` | Follow external links. Manual; needs the network. |

Both spec recipes go through `scripts/run_allium.py`, which reads the JSON rather than
trusting the exit code — `allium check` exits 0 on an `info` diagnostic and `allium
analyse` ignores diagnostics altogether. Both need the pinned binary, so a worktree that
has not run `just initialize` must run `just install-allium` first. `docs/specs/` currently
holds one module, `appearance.allium`, and both recipes must come back empty.

## Publish

| Recipe | Purpose |
| --- | --- |
| `just chromatic [branch]` | Build the workshop and publish it to Chromatic for visual review. Manual; needs the network and `CHROMATIC_PROJECT_TOKEN`. Never part of `just check`. The argument overrides the branch name, which only CI needs, because it checks a pull request out at a detached head. |
| `just package-smoke` | Pack the library, install it into a throwaway Vite project and build that. Needs the network, so it sits outside `just check` — and it is the only check that proves the `exports` map resolves and the typefaces are found from inside a consumer's `node_modules`. The release workflow runs this same recipe. |
| `just package-version <tag>` | Assert a tag names the version `package.json` carries and `CHANGELOG.md` has a heading for. The release workflow runs this same recipe. |
| `just publish-package` | Publish the package to GitHub Packages. Over the network, and a separately authorized action; CI runs it from a tag. |
| `just publish-package-dry-run` | Rehearse that publish against the real registry without creating a version. |

What each publishes, and what a version promises, is in
[Published artefacts](published-artefacts.md). The site is in none of them.
The hub site has no deployment: no staging step and no address. The
domain root belongs to Poodl — see
[The domain root stays with Poodl](../decisions/0012-the-domain-root-stays-with-poodl.md).

## Aggregate

| Recipe | Purpose |
| --- | --- |
| `just check` | Every gate in order, proving the worktree is unchanged between each. |
| `just check-clean` | Assert the worktree is clean, or matches a supplied baseline. |

## Related pages

- [Quality gates](quality-gates.md)
- [Develop locally](../how-to/develop-locally.md)
- [Configuration](configuration.md)
