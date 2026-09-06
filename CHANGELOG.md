# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The design system's implementation, ported from Poodl at
  `a24f6c7112fbd8bf7a814c655ccaa81108a92b30`: `Icon` and the 22 restroked Lucide SVGs with
  their ISC text; `IconButton`, `Button`, `HeaderBar`, `Modal`, `Notice` and `Announcer`,
  each with a test and a story; `createMediaPreferences` and `createFakePreferences`, the
  first port; `darkActive`, `animationsActive` and `highContrastActive`, the three
  derivations `appearance.allium` states; the types `IconName`, `ThemeChoice`,
  `PreferencesPort`, `FakePreferences`, `MatchMedia`, `MediaQueryListLike` and
  `DeviceAnswers`; `tests/contrast.test.ts`, which measures every pair the stylesheet
  declares in all four combinations of theme and high contrast against the floors
  `src/lib/config.ts` mirrors from the specification; and `stories/Foundations.stories.svelte`,
  the token sheet. See
  [decision 0014](docs/decisions/0014-the-hub-holds-the-design-system.md).

- The play surface. `Tile` and `Key` are the two units every game renders and no game renders
  differently — a cell that is read and a cell that is pressed, same paint and the same marker
  bar. `Keyboard` lays keys out from data the caller supplies, with `QWERTY` as a default
  rather than a rule and one callback carrying the pressed key's value, because a rack needs
  shuffle, recall, play, pass and exchange and two named callbacks cannot express five.
  `PhysicalKeyboard` wires the device's own keyboard to a surface over `keys.ts`, the second
  port, whose guards are a pure predicate in `typing.ts`. `Explainer` is the shape a "how to
  play" turns out to be, with the words left to whoever is explaining themselves.

  A mark is `exact`, `present` or `absent`, after `--result-exact`, `--result-present` and
  `--result-absent` — the tokens this repository has declared and measured since decision
  0010, which is the argument for the move and why it did not wait for a second game. A mark
  arrives with the game's own sentence for it, and a mark whose sentence is blank is drawn as
  no mark at all — `play-surfaces.allium`'s `EveryMarkIsNamedInWords` says the platform draws
  no state it has no words for, and `drawnMark` is where it declines. A game whose vocabulary
  says `correct` maps at its call site.

  `tests/play.test.ts` and `tests/typing.test.ts` are the evidence, five story files are the
  specimens, and `docs/reference/testing.md` grants this repository's first structural-hook
  exception — `[data-marker]`, on stated terms, for `aria-hidden` decoration alone. See
  [decision 0016](docs/decisions/0016-the-play-surface-is-the-platforms.md).

- Two more specifications, and the figures they state. `docs/specs/operation.allium` says how
  a Biscuit Games surface is *worked* — every operation reachable from the keyboard with
  visible focus, what a surface owes when it replaces the control a reader is standing on,
  what a dialog owes on the way in and on the way out, `minimum_touch_target` at 44 and
  `narrowest_supported_width` at 320, the four `DirectManipulation` invariants a finger is
  owed, and what a surface owes when it claims bare key presses for itself.
  `docs/specs/play-surfaces.allium` says what a surface *played on* owes: `PlayMark` with
  `unmarked`, `exact`, `present` and `absent`, named after the tokens that paint them; that a
  mark is never conveyed by colour alone and never drawn without the game's own words for it;
  and `minimum_state_separation` at 3.0 and `minimum_mark_separation` at 2.0. Both are root
  modules importing nothing, both ship at `@steven-cutting/biscuit-games/specs/*.allium`, and
  both report empty diagnostics and empty findings with no waiver.

  `src/lib/config.ts` mirrors the four new figures and `stories/fixtures.ts` is deleted, so a
  play now measures against the specification rather than beside it. `tests/operation.test.ts`
  reads `src/app.css` and `src/app.html` from disk and measures what these rules resolve to on
  a real control — twelve of its fourteen cases passed on arrival, because every rule was
  already in the stylesheet and nothing here had ever asserted one. `tests/contrast.test.ts`
  measures a state separation for the first time, which is the block
  [decision 0014](docs/decisions/0014-the-hub-holds-the-design-system.md) declined to port
  while the figures were a game's, and gains two pairs the play surface newly renders — the
  absent glyph on the page, and the hue results as text where the dark themes leave them
  unfilled. No guarantee in `appearance.allium` is amended; only its header changes. This
  closes the gap `docs/explanation/accessibility.md` had carried since the port as "the next
  specification question this repository owes an answer to". See
  [decision 0015](docs/decisions/0015-operation-and-play-are-specified-here.md).

- A published package. `@steven-cutting/biscuit-games` on GitHub Packages carries the token
  vocabulary, the shared components and the icons they draw, the preferences port and the
  appearance derivations, the two committed typefaces and
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
  `.github/workflows/release.yml`, which publishes from a `v*` tag using the run's own token.
  It refuses a tag that disagrees with `package.json` or that `CHANGELOG.md` does not name, and
  it will not publish a specification that fails `check-specs` or `analyse-specs` or a tarball
  that fails `package-smoke` in a scaffolded consumer. `CHANGELOG.md` becomes the document a
  consumer reads to decide whether to take a bump.

- Two gates. `package-build` proves `svelte-package` still emits the library, and
  `package-check` runs `publint --strict` over the files `npm pack` would ship. `just check`
  now runs fourteen gates rather than twelve. What neither can prove is that the package
  resolves once installed; `just package-smoke` does that, and needs the network, so it sits
  outside the gate.

### Changed

- Decision 0011 is superseded by 0014 and marked rather than deleted: a platform-shaped
  component is built here first, whether or not a second consumer exists. Decision 0010 is
  narrowed, and its contrast-test reopener and decision 0005's first-port paragraph each
  carry a *carried out* mark.

- `HeaderBar` and `Notice` are generalised from Poodl's contracts — a `brand` snippet, a chip
  and a list of actions; a `message` and a `tone` — so a game supplies its own words, and the
  preferences adapter takes its host object rather than a `matchMedia` function, so every
  arm is reached by argument. `docs/operations/poodl-handover.md` carries what each costs
  Poodl when it consumes the package.

- `package.json`'s `files` excludes `dist/assets/fonts` rather than all of `dist/assets`, so
  the icons reach the tarball, and `just package-smoke` renders an icon and a button in the
  scaffolded consumer and asserts the SVG markup arrived. `src/lib/assets/icons/raw.d.ts`
  keeps the emitted declarations typed as strings.

- The handbook describes the repository as it now is. The tokens, accessibility, testing,
  layering, repository-map, workshop and porting pages are rewritten around the port, and
  every page that said nothing here measured a ratio is corrected. Five heading anchors
  changed; the handover page lists them.

- Chromatic is live. `CHROMATIC_PROJECT_TOKEN` was set on 2026-09-03 and build 1 published and
  auto-accepted on `main`. Six places still said no project existed; each has been corrected,
  and the application id and permalink are recorded once in
  `docs/reference/published-artefacts.md`. The workflow's absent-token guard stays, because it
  is still the path a fork and a revoked secret take.

- Invariant 4 now says what it always meant. `peerDependencies` carries a range rather than a
  pin, because a peer states what a consumer may bring rather than what is installed here, and
  an exact peer would fail a game on every Svelte patch it took before this repository moved.
  `AGENTS.md`, `docs/how-to/maintain-dependencies.md` and
  `docs/reference/configuration.md` say so; `docs/reference/published-artefacts.md` still owns
  the range and what moving it costs.

- Decision 0002 is superseded by 0013 and marked rather than deleted, which is the first
  supersession in this repository and therefore the first statement of the convention —
  `docs/decisions/README.md` now says how one is written.

- `src/app.css` did **not** move, and that is the notable part. `svelte-package` emits
  `src/lib/` and nothing else, so the obvious reading is that the stylesheet had to move to be
  shippable. It did not: CSS needs no compilation, so `files` and `exports` publish it from
  where it lives, the three `@font-face` URLs need no edit, and the stylesheet stayed put.
  The alternative was eighty edits to prose that was true at the time.

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
  texts. `docs/design/tokens.md` is the owning page. The application around it was, at
  first, a skeleton — one route and one component, `Wordmark`, with its test and its story —
  which was [decision 0011](docs/decisions/0011-skeleton-not-a-second-application.md); the
  platform primitives followed under 0014, above.

- Ten agent skills under `.agents/skills/`, with the thin `.claude/` and `.codex/` bridges.
  `word-list-change` did not come over, `svelte-change` became `component-change`, and
  `token-change` and `consumer-impact` are new — the second was written when nothing was
  published and nothing imported, so drift between this repository and a game was possible and
  invisible, which was
  [decision 0002](docs/decisions/0002-shared-material-travels-by-citation.md). Under
  [0013](docs/decisions/0013-shared-material-travels-as-a-package.md) it sorts the halves that
  decision created: what a version bump carries, and what still travels by citation and no
  number describes.

### Fixed

Three defects the automated reviewers on pull request 3 found in the ported primitives, none
of which any gate here could see. Nothing is released, so no version moves and no consumer
took any of them; the entries are here because the components above are the artefact.

- `Modal`'s focus trap works out which of a panel's controls the keyboard really stops on
  rather than trusting `querySelectorAll` to say. A CSS selector is not the sequential focus
  order: it matches every radio of a group where the keyboard stops on one, it matches a
  control the layout does not draw, one a disabled `fieldset` has turned off, one carrying
  `tabindex="-1"`, and an `input[type="hidden"]`, none of which the keyboard visits; and it
  misses a disclosure's `<summary>` and an editable region, which it does. A match of the
  first kind standing last meant the wrap never fired and the Tab that should have returned to
  Close carried focus out to the page the dialog had declared `aria-modal` over — where Escape
  no longer closes it either, because the handler is on the panel; one of the second kind was
  simply unreachable. Three contracts were generalised on the way over; this is the first
  place the ported *behaviour* parts from Poodl at
  `a24f6c7112fbd8bf7a814c655ccaa81108a92b30`, whose copy carries the same defect;
  [the Poodl handover](docs/operations/poodl-handover.md) records what that costs Poodl.
- `HeaderBar` keys its actions by position rather than by label. A label is the name a reader
  hears and nothing in the contract asks two of them to differ, so keying on it took the whole
  header down on a repeated name and threw away the focused control whenever a toggle was
  renamed by the press that operated it — which is the ordinary shape of a chrome action.
- The 4px lift in `Modal`'s arrival carries the comment the coincident-literal rule asks for.
  It matches `--s-2` by value and not by meaning, and the component now says so, the way
  `Button`'s 48px and `HeaderBar`'s 56px already did.

Two gaps in the evidence rather than in the code, found by the same review:

- `tests/contrast.test.ts` measures text on `--surface` — the ground a `Modal` panels itself
  in — and the pressed ring on the four grounds beyond the two a game's keys sit on. Neither
  can fail under the palette as it stands; they are here because this file's method is to
  enumerate the pairs the stylesheet paints rather than to reason about which of them a
  tighter pair already implies.
- `Button`'s bindable `element` has a test. It is the library's only bindable prop and the
  handle `Modal` says a child carries focus across its own swap by, and deleting the binding
  left the whole suite green.

Eight defects the automated reviewers on pull request 4 found in the play surface and the
specifications that arrived with it, and three gates that were cited but never written. Again
nothing is released, so no version moves and no consumer took any of them.

- `latinLetters` no longer claims two keys it does not name. `/^[a-z]$/iu` folds case under
  Unicode, which also matches U+017F, the long s, and U+212A, the Kelvin sign — and the long s
  lowercases to itself, so the platform's default alphabet handed a game back a character no
  game has a letter for. The cases are enumerated instead, as `/^[a-zA-Z]$/u`.
- The keys port reads a focused `<summary>` as something the browser activates. Enter opens a
  disclosure, so a surface claiming keys was taking Enter from one and calling
  `preventDefault()` on it — `AClaimNeverReachesAFocusedControl` broken on a native control
  `Modal`'s own focusable list already named. Poodl's copy of the guard carries it too.
- `Explainer` keys its rows by position rather than by the sentence in them. Nothing asks two
  of a game's explanations to differ, so two rows saying the same thing collided and threw
  `each_key_duplicate` instead of rendering — the same defect, and the same cause, as
  `HeaderBar`'s labels on the review before this one.
- A mark with no words is not drawn. `{ name, description }` makes the pair what a caller
  passes; it does not make a wordless mark unrepresentable, because `description` is a
  `string` and `''` type-checks. Left there, a blank sentence painted the cell, drew the bar
  and said nothing about either, which is the exact failure `EveryMarkIsNamedInWords` names.
  `drawnMark` decides it once for `Tile` and `Key` both, and trims, because "supplied no words
  for" is what a run of spaces is.
- A layout with no keys draws no keyboard. `ALayoutIsSuppliedRatherThanFixed` says as much and
  `Keyboard` had drawn a named, empty group instead. The empty layout stays type-valid on
  purpose: a game builds its rows with `map`, and a non-empty tuple would stop type-checking
  exactly there.
- The row a preference is set from carries the 44px floor it had been promised in prose. A
  native checkbox is thirteen pixels and no stylesheet makes it forty-four, so
  `EveryControlIsAComfortableTarget` now states outright that such a control meets the figure
  in the label bound to it — and `src/app.css` now declares it, with the `inline-flex` that
  makes `min-block-size` apply to a `<label>` at all.
- The tap-highlight suppression reaches only the controls that get a replacement. It was one
  rule with the callout suppression, so a bare checkbox lost the platform's own flash and no
  rule gave one back: `ATouchIsAcknowledged` inverted on the control least likely to be looked
  at. `touch-action`, the callout and the selection suppression stay on all four kinds.
- `Key`'s padding names `--s-5` and `--s-1`. Padding is spacing, not the coincident-literal
  carve-out a control's own dimension takes, and the literals were the same figure only at the
  root font size. `Tile`'s 3rem *is* in the carve-out and now carries the comment the rule
  asks for, the way `Button`'s 48px does.

And three gates named in a comment, in a claim, or in nothing at all:

- `tests/typing.test.ts` holds `QWERTY` and `QWERTY_BINDINGS` equal. `layouts.ts` said
  `tests/package-surface.test.ts` did, and it did not: the drawn keys and the typed ones could
  have come to name different operations with every gate green.
- `tests/package-surface.test.ts` asserts the play surface's runtime exports and writes against
  its types. A game that could import `Keyboard` and not `QWERTY` has a keyboard it cannot lay
  out, and removing either from the barrel left the whole suite green.
- `tests/typing.test.ts` drives the real adapter with each modifier flag. The `claimKey` table
  hands `modified` in already computed, so only `ctrlKey` had ever reached the adapter's own
  short-circuit. Green on arrival, and now driven rather than assumed.

Two clauses were reworded rather than repaired, because the specification was wrong and the
code was right:

- `EveryControlIsAComfortableTarget` names its second exemption: a control inside a line of
  running text takes its size from the text around it. This repository's only route has a link
  in a sentence, so the invariant as first written was false of the hub itself on the day it
  was published.
- `AModifiedKeyIsNeverClaimed` names Control, Meta and Alt rather than "a platform modifier".
  Shift is not one of them: it carries no shortcut of its own, so a shifted letter is still the
  reader typing a letter — which is what `latinLetters` had always assumed, and what the loose
  wording contradicted.

### Deliberately not included

- Any deployment. There is no Pages workflow, no `site-root/`, no staging script and no
  `BASE_PATH` set anywhere: the `pnut.fans` root still belongs to Poodl, and moving it is a
  move rather than an addition. See
  [decision 0012](docs/decisions/0012-the-domain-root-stays-with-poodl.md).

- `Board` and `DistributionChart`, and a game's rules with them. An arrangement of cells
  encodes a rule — six rows of five is one game's — and a distribution chart draws a game's
  own data, so both stay where they are rendered.
  [Decision 0016](docs/decisions/0016-the-play-surface-is-the-platforms.md) refuses each on
  the same test that admitted the pieces they are built from, rather than by leaving them
  out.

- Poodl's own edits. This repository records what Poodl has to change in
  `docs/operations/poodl-handover.md`; it does not change it.
