# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
