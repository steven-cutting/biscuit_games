# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- A published package. `@steven-cutting/biscuit-games` on GitHub Packages carries the token
  vocabulary, the shared components, the two committed typefaces and
  `docs/specs/appearance.allium`. A game repository installs an exact version rather than
  holding a copy, so drift becomes a version bump instead of a silent divergence.
  `docs/reference/published-artefacts.md` is the interface and
  `docs/how-to/consume-the-hub.md` is the procedure. Reading the registry needs a token
  carrying `read:packages` — there is no anonymous install, even of a public package, and that
  cost is real and lands on every contributor. See
  [decision 0013](docs/decisions/0013-shared-material-travels-as-a-package.md), which
  supersedes 0002.

- A release process. `just package-build`, `just package-check`, `just package-smoke`,
  `just package-version`, `just publish-package` and `just publish-package-dry-run`, plus
  `.github/workflows/release.yml`, which publishes from a `v*` tag using the run's own token
  and refuses a tag that disagrees with `package.json`. `CHANGELOG.md` becomes the document a
  consumer reads to decide whether to take a bump.

- Two gates. `package-build` proves `svelte-package` still emits the library, and
  `package-check` runs `publint --strict` over the files `npm pack` would ship. `just check`
  now runs fourteen gates rather than twelve. What neither can prove is that the package
  resolves once installed; `just package-smoke` does that, and needs the network, so it sits
  outside the gate.

### Changed

- Chromatic is live. `CHROMATIC_PROJECT_TOKEN` was set on 2026-09-03 and build 1 published and
  auto-accepted on `main`. Six places still said no project existed; each has been corrected,
  and the application id and permalink are recorded once in
  `docs/reference/published-artefacts.md`. The workflow's absent-token guard stays, because it
  is still the path a fork and a revoked secret take.

- Decision 0002 is superseded by 0013 and marked rather than deleted, which is the first
  supersession in this repository and therefore the first statement of the convention —
  `docs/decisions/README.md` now says how one is written.

- `src/app.css` did **not** move, and that is the notable part. `svelte-package` emits
  `src/lib/` and nothing else, so the obvious reading is that the stylesheet had to move to be
  shippable. It did not: CSS needs no compilation, so `files` and `exports` publish it from
  where it lives, the three `@font-face` URLs need no edit, and the file this repository calls
  frozen stayed frozen. The alternative was eighty edits to prose that is currently true.

- The repository itself, bootstrapped from Poodl at commit
  `c26cc4642afa6b1349db70a0f497203db3986599`. Biscuit Games is now the platform's source of
  truth: the aesthetic charter, the character, the token vocabulary, the design research and
  every cross-cutting decision are decided here, and a game repository answers to them for
  everything it does not own itself. `docs/project/what-the-hub-owns.md` is the boundary and
  `docs/decisions/0001-biscuit-games-is-the-source-of-truth.md` is the record.

- Poodl's engineering apparatus, whole: the documentation contract and its validator, the
  agent contract and its validator, the `Justfile`, the `prek` hook gate under `uv`, the
  SvelteKit toolchain with every dependency pinned exactly, Storybook as the component
  workshop, and the pinned Allium checker. `just check` runs the same twelve gates in the
  same order, and both specification gates are inside it from the first commit.

- A shared specification. `docs/specs/appearance.allium` lifts the Appearance surface out of
  Poodl's `settings.allium` — theme, high contrast, animations, and the guarantees
  `EveryCombinationMeetsTheLegibilityFloor` and `AnUnavailableControlIsExempt` — as the
  design system's own behaviour contract, which every game inherits rather than restates. It
  imports nothing, so the device preferences are stated as named booleans in its `given`
  block rather than behind an external entity a root module has no governing import to name.
  Both `just check-specs` and `just analyse-specs` report empty diagnostics and empty
  findings, with no waiver.

- The design system's token vocabulary. `src/app.css` comes over whole, with Bricolage
  Grotesque and Instrument Sans as committed latin-subset variable woff2 files and their OFL
  texts. `docs/design/tokens.md` is the owning page. The application around it is
  deliberately a skeleton — one route and one component, `Wordmark`, with its test and its
  story — which is
  [decision 0011](docs/decisions/0011-skeleton-not-a-second-application.md).

- Ten agent skills under `.agents/skills/`, with the thin `.claude/` and `.codex/` bridges.
  `word-list-change` did not come over, `svelte-change` became `component-change`, and
  `token-change` and `consumer-impact` are new — the second exists because nothing published
  and nothing imported means drift between this repository and a game is possible and
  invisible, which is
  [decision 0002](docs/decisions/0002-shared-material-travels-by-citation.md).

### Deliberately not included

- Any deployment. There is no Pages workflow, no `site-root/`, no staging script and no
  `BASE_PATH` set anywhere: the `pnut.fans` root still belongs to Poodl, and moving it is a
  move rather than an addition. See
  [decision 0012](docs/decisions/0012-the-domain-root-stays-with-poodl.md).

- `tests/contrast.test.ts`. Nothing in this repository recomputes a contrast ratio, so every
  figure in `src/app.css` is inherited from the tree where it was measured rather than
  measured here. It is the most valuable single thing that could be added next, and until it
  lands the stylesheet should be treated as frozen for anything larger than one considered
  change.

- Poodl's own edits. This repository records what Poodl has to change in
  `docs/operations/poodl-handover.md`; it does not change it.
