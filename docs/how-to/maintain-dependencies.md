---
title: "Maintain dependencies"
kind: "how-to"
audience: [maintainer, agent]
canonical_for: [dependency_maintenance]
requires: []
---

# Maintain dependencies

Every dependency is pinned to an exact version, in `package.json` and in
`pyproject.toml`. No `^`, no `~`. Both lockfiles are committed and marked
`linguist-generated`. Nothing updates them for you: there is no Dependabot or Renovate
configuration here, and no scheduled job that opens a bump.

The one dependency block that is not pinned is `peerDependencies`. A peer declares what a
consumer may bring rather than what is installed here, so it constrains nothing in either
lockfile, and an exact peer would fail a game's install on every Svelte patch it took before
this repository moved. The range itself, and what narrowing or widening it costs a consumer,
is [Published artefacts](../reference/published-artefacts.md).

## Check that the lockfiles still match

```console
just lock-check
```

This runs `uv lock --check` and an npm install dry run. It is part of `just check`, so a
manifest edited without relocking fails the gate rather than drifting.

## Update deliberately

```console
just lock            # relock at the versions the manifests already state
just lock-upgrade    # move to newer versions within the manifests' constraints
```

Because the manifests pin exact versions, `just lock-upgrade` on its own changes very
little. Moving a dependency forward means editing the version in the manifest and then
relocking.

## Upgrading a package

1. Check what it is compatible with before choosing a version. This bites: the current
   TypeScript major is ahead of what `typescript-eslint` supports, so the repository
   pins the 6.x line deliberately, not by neglect.

   ```console
   npm view typescript-eslint peerDependencies
   ```

2. Edit the exact version in `package.json` or `pyproject.toml`.
3. Run `just lock`, then read the lockfile diff before accepting it.
4. Run `just check`. A type-checker or linter upgrade usually surfaces new findings; fix
   them rather than pinning back, unless the finding is wrong for this project.
5. If the change moved `playwright`, reinstall the browser with `just storybook-browsers`.
   The binary is versioned by that pin and is in neither lockfile — see
   [Work in the component workshop](work-in-the-component-workshop.md).

## Pins written in more than one place

Several versions are stated more than once, and nothing reconciles the copies.
`just lock-check` speaks for the two lockfiles and for nothing else. `actionlint` catches a
malformed workflow, not a stale version inside a well-formed one. `engines` is advisory
unless `engine-strict` is set, and there is no `.npmrc` here to set it. Drift therefore
surfaces as CI running a different toolchain from the one on your machine, or as no failure
at all until the difference starts to matter. Move each set in a single commit.

| Version | Every place it is written |
| --- | --- |
| Node 26 | `engines.node` and `volta.node` in `package.json`; the `node-version` given to `setup-node` in every job of both workflows |
| npm 11.17.0 | `packageManager`, `engines.npm` and `volta.npm` in `package.json`; the `npm install --global` step in every job of both workflows |
| Python 3.14 | `.python-version`; `requires-python` and `tool.ruff.target-version` in `pyproject.toml`; the `uv python install` step in every job of both workflows |
| uv 0.11.18 | the `version` given to `astral-sh/setup-uv` in every job of both workflows |
| rust-just 1.51.0 | the `uv tool install` step in every job of both workflows |
| lychee 0.24.2 | the `rev` comment on the lychee repository in `.pre-commit-config.yaml`, and the leading `LYCHEE_VERSION` argument of both hooks that repository declares |
| markdownlint-cli2 v0.23.2 | the `rev` in `.pre-commit-config.yaml` and the `rev` in `.pre-commit-fix.yaml` |

The two workflows are `.github/workflows/ci.yml` and `.github/workflows/chromatic.yml`, and
`ci.yml` sets its toolchain up once per job rather than once per file. Replace every
occurrence, not the first one the search finds.

The lychee argument is not redundant with the `rev`. Left to itself the hook derives its
own version by running `git describe`, which resolves against this repository during a
commit and exits non-zero; the comment above the hook records the whole story. The two
markdownlint-cli2 revs matter for a different reason: `.pre-commit-config.yaml` is the
read-only gate and `.pre-commit-fix.yaml` is what `just fix` runs, so moving one alone
would leave the repair answering to a different version of the rules from the check.

## Moving the Allium binary

`allium` is a checksummed binary, not a package, so no lockfile accounts for it and
`just lock-check` cannot speak for it. `scripts/install_allium.py` holds the version and
the SHA-256 of each supported artefact; see
[decision 0007](../decisions/0007-project-managed-allium-cli.md).

Before moving it, know which thing you are moving. Three version series carry the name
Allium and only one of them is this pin.

| Series | What it numbers | Where it is pinned |
| --- | --- | --- |
| `juxt/allium-tools` | The command-line binary this repository installs and runs. | `VERSION` in `scripts/install_allium.py` |
| `juxt/allium` | The language, and the editor and assistant plugin built from it. | `.claude/settings.json`, which enables the plugin and pins no version |
| The language version | Which dialect a module is written in. | The `-- allium: 3` header on each `.allium` file |

They advance independently, and the plugin's number runs well ahead of the tool's: an
assistant plugin at 3.8.0 alongside a binary at 3.6.1 is the normal state and not a
mismatch to correct. The binary is the only one of the three that `just check` executes, so
a plugin release is never a reason to move this pin. Move it when
`juxt/allium-tools` publishes a release, which is the repository the checksums below are
computed from.

Upstream publishes no checksums for these files — its `SHA256SUMS.txt` covers only the
editor extension and the language server — so all four have to be recomputed by hand:

```console
V=3.6.1
for t in aarch64-apple-darwin x86_64-apple-darwin \
         aarch64-unknown-linux-gnu x86_64-unknown-linux-gnu; do
  printf '%s  ' "$t"
  curl -sL "https://github.com/juxt/allium-tools/releases/download/v$V/allium-$t.tar.gz" \
    | shasum -a 256 | awk '{print $1}'
done
```

Replace `VERSION` and all four entries in `CHECKSUMS`, then reinstall and confirm:

```console
just install-allium
just check-specs
```

Reinstalling is always safe to retry. The download lands beside the installed copy under a
temporary name and is asked for both its checksum and its version there, so a failed
download, a mismatched checksum or a binary that will not run leaves the working
installation exactly where it was. `just install-allium` also replaces a binary that no
longer runs, so an installation damaged by other means repairs itself rather than needing
`.tools/` cleared by hand.

A version change can move what the checker reports, in both directions. After moving the
pin, run `just check-specs` and `just analyse-specs`: a new version can report something
the module was clean of, and it can also stop needing a waiver the module carries. The one
module in `docs/specs/` carries none at present, but the directive leans on behaviour
upstream documents nowhere and was verified against 3.6.1 only, so any waiver added later
must be re-verified on the commit that moves the pin, dropped where the new version no
longer needs it, and its count and shape updated in
[Work with the specifications](work-with-the-specs.md) in that same commit. Editing
`scripts/install_allium.py` is itself a trigger for both specification hooks, so the gate
re-reads the module against the new version on the commit that moves the pin — but only
after `just install-allium` has actually installed it.

## Actions in the workflows

GitHub Actions are pinned to commit SHAs with a version comment, not to tags. To move
one, resolve the new tag and replace both the SHA and the comment:

```console
gh api repos/actions/checkout/git/ref/tags/v7.0.1 --jq .object.sha
```

The same action appears in several jobs and in both workflow files, so this is the same
discipline as the table above: every occurrence, comment included. `actionlint` runs inside
`just lint`, so a malformed workflow fails locally, but it reads neither the comment nor
the age of the SHA.

## Related pages

- [Configuration](../reference/configuration.md)
- [Quality gates](../reference/quality-gates.md)
- [Maintenance](../operations/maintenance.md)
