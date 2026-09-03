---
title: "Decision 0007: A project-managed Allium binary"
kind: "decision"
audience: [maintainer, agent]
canonical_for: [decision_allium_cli]
requires: []
---

# Decision 0007: A project-managed Allium binary

*Ported from Poodl's decision 0011 at `c26cc4642afa6b1349db70a0f497203db3986599`, and restated for the platform. Poodl's own record stands where it is.*

## Context

The specifications under `docs/specs/` decide the behaviour every game shares — see
[decision 0004](0004-specs-are-the-source-of-truth.md) — and a specification nobody can
check mechanically is prose. `allium` is the tool that checks them. The directory holds one
module today, `appearance.allium`, and it will grow as shared behaviour is written down;
reading either state by eye is not a check.

`allium` is a Rust binary published by [`juxt/allium-tools`][upstream]. It is not a package
either lockfile can name, which is the whole difficulty: this repository pins every
dependency exactly and proves the pins with `just lock-check`.

Two packages share the name and are not this tool. On PyPI, `allium-cli` is a client for
the Allium *blockchain data* APIs. On npm, `allium` is a Gherkin parser. Neither has any
relationship to the specification language, and adding either would be a supply-chain
mistake wearing the right name.

## Decision

Install the prebuilt release binary, pinned by version and by SHA-256, into a gitignored
`.tools/bin/`. `scripts/install_allium.py` holds the version, the release URL and the
checksum of each supported artefact, and `just install-allium` runs it. `just check-specs`
and `just analyse-specs` run the result.

The pin sits in the script beside the URL it pins, which is the shape
`.pre-commit-config.yaml` already uses for `lychee`: the version travels with the thing it
describes rather than in a manifest with no second reader.

Both recipes are gates here from the start. They are hooks in `.pre-commit-config.yaml`,
triggered by a change under `docs/specs/` and by the pin itself — a waiver is only ever
valid against the version it was verified on — steps in the `documents` job in CI, and
recipes inside `just check`.

`cargo install allium-cli` was the alternative. It was rejected because it drags a third
toolchain into a repository that already pays deliberately for an unusual second one — see
[decision 0006](0006-python-toolchain.md) — and compiles from source on every cold runner.
A 1.6 MB download with a checksum is cheaper and proves more.

## Consequences

The binary is not in either lockfile, so `just lock-check` cannot speak for it. This is the
same shape as the Chromium build the story tests render in: a versioned artefact that
`just initialize` installs and a documented procedure keeps current. The procedure is in
[Maintain dependencies](../how-to/maintain-dependencies.md).

Checksums have to be produced by hand, because upstream publishes none that cover these
files. The release's own `SHA256SUMS.txt` lists only the editor extension and the language
server, and the Homebrew formula fills in two of the four unix targets and leaves the
`x86_64` entries as empty strings — `x86_64` Linux being exactly what continuous
integration runs on. The four recorded values were computed by downloading each artefact;
the two Homebrew does publish match. Moving the version means recomputing all four.

`.tools/` must stay ignored by Git. `just check` snapshots the worktree between recipes, so
a binary Git could see would abort the run before any recipe's exit code was read.

Gating took more than naming the subcommands in the `Justfile`, because neither exit code
carries the verdict. `allium check` exits non-zero on errors and on warnings, but severity
`info` exits 0, so a diagnostic nobody has read can leave the status green. `allium analyse`
sits further from the purpose again: its status keys on findings alone and ignores
diagnostics entirely, so a module that fails to parse passes it with the `error` sitting in
the JSON it has just printed. Neither status means clean, so `scripts/run_allium.py` runs
the subcommand, prints its output whole, and asserts what the contract says — an empty
`diagnostics` array and an empty `findings` array in every module. A diagnostic can be
waived on the line it fires on; a finding cannot. The waiver terms are in
[Work with the specifications](../how-to/work-with-the-specs.md).

The cost is a per-worktree install in a gitignored directory, so a worktree that has not run
`just initialize` fails `just lint` and `just check` until `just install-allium` puts a
binary there. That is accepted rather than softened: a gate that skips itself when its tool
is missing asserts nothing.

Only the four unix targets are supported. The release also carries a Windows zip; a target
nobody here runs would be a checksum nobody re-verifies.

## What would reopen this

Upstream publishing checksums for the platform binaries, which would remove the hand
computation. A distribution channel that a lockfile can name — which would also let
`just sync` install the checker, and so remove the per-worktree install the gate costs
every new worktree.

[upstream]: https://github.com/juxt/allium-tools

## Related pages

- [Work with the specifications](../how-to/work-with-the-specs.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
- [Quality gates](../reference/quality-gates.md)
