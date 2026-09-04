set positional-arguments := true
set shell := ["sh", "-eu", "-c"]

# Storybook phones home unless told not to, and `just check` runs it. The core
# preset in .storybook/main.ts is the primary lever; this is the belt.
export STORYBOOK_DISABLE_TELEMETRY := "1"

default:
    @just --list

# ------------------------------------------------------------------ setup ---

# One explicit first-run command. Never stages, commits, tags, or pushes.
initialize:
    sh scripts/initialize.sh

sync:
    uv sync --frozen
    test -f package-lock.json || { printf '%s\n' 'package-lock.json is missing; run just initialize first' >&2; exit 2; }
    npm ci --no-audit

lock:
    uv lock
    npm install --package-lock-only --ignore-scripts --no-audit

lock-upgrade:
    uv lock --upgrade
    npm update --package-lock-only --ignore-scripts --no-audit

lock-check:
    uv lock --check
    npm ci --ignore-scripts --dry-run --no-audit

install-hooks:
    git rev-parse --is-inside-work-tree >/dev/null
    test -f uv.lock || { printf '%s\n' 'uv.lock is missing; run just initialize first' >&2; exit 2; }
    uv run --frozen prek install --overwrite --hook-type=pre-commit

# The Allium checker for docs/specs/, pinned and checksummed in the script.
# Downloads over the network into .tools/bin, which Git ignores. It is not part
# of `just sync` for the same reason the browser below is not: sync installs
# exactly what the lockfiles say, and no lockfile can name a binary.
install-allium:
    uv run --frozen python scripts/install_allium.py

# The Chromium build the story tests render in. Downloads over the network into
# a per-user cache outside the repository, so the worktree never sees it.
# `just initialize` runs this; `just sync` deliberately does not, because sync
# installs exactly what the lockfiles say and no lockfile names a browser.
storybook-browsers:
    npm run storybook:browsers

# Linux only: an apt front end for the libraries Chromium links against. CI runs
# it; macOS has nothing to add.
storybook-browsers-deps:
    npm run storybook:browsers:deps

# ---------------------------------------------------------------- develop ---

dev:
    npm run dev

# Serves the build in build/.
preview:
    npm run preview

# The component workshop on port 6006. This serves it; `just chromatic` is what
# publishes a build of it for visual review.
storybook:
    npm run storybook

# The iteration loop. Here rather than in the check section because it never
# exits; `just frontend-unit` is the recipe that answers. It pins `vite.config.ts`
# for the same reason both other test recipes do — left to its own discovery
# Vitest finds `vitest.config.ts`, which names the browser project too and would
# pull Chromium into a run that wanted one jsdom file.
# Watch one path, or everything: `just frontend-watch tests/wordmark.test.ts`.
frontend-watch target="":
    npm run test:watch -- ${1:+"$1"}

# ----------------------------------------------------------------- format ---

format:
    uv run --frozen ruff check --fix-only .
    uv run --frozen ruff format .
    npm run format

fix:
    -uv run --frozen prek run --all-files --config .pre-commit-fix.yaml
    uv run --frozen prek run --all-files --config .pre-commit-fix.yaml
    npm run lint:fix
    just lint

# ------------------------------------------------------------------ check ---

lint:
    uv run --frozen prek run --all-files

frontend-static:
    npm run lint
    npm run check

frontend-unit:
    npm run test

frontend-coverage:
    npm run coverage

frontend-build:
    npm run build

# Builds the workshop, autodocs included, into the gitignored storybook-static/.
# This is the only gate that renders the documentation pages.
storybook-build:
    npm run storybook:build

# Every story in real Chromium: axe over each render, play functions executed as
# interaction tests. It checks for the browser first, so a missing download
# reports itself as a missing download rather than as a failing story. Never
# measured for coverage — the floor over src/lib/** stays a claim about tests/.
storybook-test:
    npm run storybook:test

# --------------------------------------------------------------- documents ---

check-docs:
    uv run --frozen prek run --all-files markdownlint-cli2 typos lychee
    uv run --frozen python scripts/validate_docs.py

check-agents:
    uv run --frozen python scripts/validate_agents.py

# The specifications, checked mechanically rather than by review: syntax,
# references, and names a module reaches for that no import defines. Every
# module must report an empty `diagnostics` array; anything reported is a
# regression. Waiver terms: docs/how-to/work-with-the-specs.md.
#
# The wrapper is what asserts that, because neither subcommand's exit code
# does. `allium check` exits 0 on an `info` diagnostic and `allium analyse`
# ignores diagnostics altogether, so both recipes read the JSON instead of
# trusting the status. Both need the pinned binary, which `just initialize`
# installs and `just install-allium` repairs.
check-specs:
    uv run --frozen python scripts/run_allium.py check

# The same modules read for process completeness rather than structure: data
# flow, reachability, deadlocks, conflicts and invariants. It repeats everything
# `check-specs` reports and adds findings of its own, and findings cannot be
# waived, so anything reported is a regression.
analyse-specs:
    uv run --frozen python scripts/run_allium.py analyse

check-links-online:
    uv run --frozen prek run --all-files --hook-stage manual lychee-online

# ---------------------------------------------------------------- aggregate ---

check-clean baseline="":
    uv run --frozen python scripts/run_project_check.py clean "$1"

# The complete gate.
check:
    uv run --frozen python scripts/run_project_check.py run

# ---------------------------------------------------------------- package ---

# Compiles src/lib/ into the gitignored dist/: each component through the
# preprocessor `svelte.config.js` names, with a .d.ts emitted beside it.
# The stylesheet and the specification are not compiled and are published from
# where they already live, which is why neither appears in the output and why
# `src/app.css` never had to move to be shippable.
package-build:
    npm run package

# Proves the package is consumable rather than merely built. publint reads the
# manifest the way a registry and a bundler do — an `exports` target nothing
# emits, a `files` entry that packs nothing, a condition in a position
# TypeScript will not look at — and `--strict` makes a warning fail. It packs
# into a temporary directory and leaves no tarball behind, which is what lets it
# sit inside `just check` at all.
#
# Guarded rather than made to depend on `package-build`, so running it alone in
# a clean checkout says what is missing instead of failing somewhere inside
# publint.
package-check:
    test -d dist || { printf '%s\n' 'dist/ is missing; run just package-build first' >&2; exit 2; }
    npm run package:lint

# Packs the library and builds it inside a throwaway Vite project. It is the one
# check that answers the question the package exists to answer: whether the
# exports resolve, whether the stylesheet arrives, and whether the three
# @font-face URLs still find the typefaces from inside a consumer's
# node_modules — which nothing else here can see, because the hub reaches its
# own stylesheet by relative path and never through the package. Needs the
# network, so it sits outside `just check` beside `check-links-online`. It works
# in a temporary directory and touches nothing in this worktree.
package-smoke:
    sh scripts/smoke_package.sh

# ---------------------------------------------------------------- publish ---

# Publishes the workshop to Chromatic for visual review, building it on the way.
# Needs the network and CHROMATIC_PROJECT_TOKEN, so it is deliberately outside
# `just check` — the same reason check-links-online sits outside it. Pass a
# branch name when HEAD is detached, which is how CI reaches a pull request.
chromatic branch="":
    npm run chromatic -- ${1:+--branch-name "$1"}

# Publishes the package to GitHub Packages. `prepack` rebuilds dist/ on the way,
# running the same `npm run package` that `just package-build` does, so a stale
# build cannot be shipped. Needs the network and a token holding
# `packages: write`, which the release workflow supplies as the run's own
# GITHUB_TOKEN — minted per run and discarded with it, so this repository still
# holds exactly one stored secret and it is Chromatic's. Outside `just check`,
# for the same reason `just chromatic` is.
publish-package:
    npm publish

# Rehearses the publish against the real registry — authentication, whether the
# version is still free, and what the tarball holds — without creating a
# version. GitHub Packages refuses to republish a version and restricts deleting
# one, so a botched release is spent. This is how you find out first.
publish-package-dry-run:
    npm publish --dry-run

# Asserts a release tag names the version package.json carries. The release
# workflow runs this same recipe, so the guard a publish depends on is one you
# can run yourself and it fails in the same words in both places.
package-version tag:
    uv run --frozen python scripts/check_release.py "$1"
