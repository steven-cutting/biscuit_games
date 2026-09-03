---
title: "Develop locally"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [local_development]
requires: []
---

# Develop locally

## Prerequisites

| Tool | Why |
| --- | --- |
| Node 26 | Runs the application, Vite and Vitest. |
| npm 11 | The package manager. Nothing else is supported. |
| `uv` | Provides the pinned Python tooling the hook gate runs on. |
| `just` | The task runner, and the only supported interface to the checks. |

Exact versions live in `package.json` (`engines`, `volta`) and in `.python-version`. A
`volta` block is present, so a Volta user gets the right Node automatically.

## First run

Both lockfiles are committed, so a fresh clone installs rather than locks. Four steps, in
this order:

```console
just sync                 # exactly what the lockfiles say
just storybook-browsers   # Chromium, into a per-user cache outside the repository
just install-allium       # the pinned checker, into .tools/bin/
just install-hooks        # primary checkout only — read the warning below first
```

The two downloads in the middle are not optional. `just storybook-test` refuses to run
without the browser, and `just check-specs` and `just analyse-specs` cannot reach the
specifications without the binary, so `just check` cannot go green until both are present.
Neither is repaired by `just sync`: sync installs exactly what the lockfiles say, and no
lockfile can name a binary.

`just initialize` is the single-command form of the same sequence, and it also relocks and
normalises formatting on the way through. It never stages, commits, tags or pushes, and it
is safe to run from any worktree: it installs the hook only when the checkout is the
primary one, and says so when it declines.

### Do not install the hook from a secondary worktree

The test is the one git itself makes: in a secondary worktree the common directory and the
git directory differ.

```console
git rev-parse --git-common-dir   # the shared .git
git rev-parse --git-dir          # .git/worktrees/<name> in a secondary worktree
```

Equal means this is the primary checkout and `just install-hooks` belongs here. Different
means it is secondary and the command is the wrong one to run. `.git` being a file rather
than a directory says the same thing for a worktree added with `git worktree add`, and is
quicker to eyeball. **Do not count the rows of `git worktree list`** — it enumerates every
worktree of the repository whatever it is run from, so the primary checkout prints more than
one row as soon as any secondary exists, which is exactly when you are reading this.

`scripts/initialize.sh` makes that same comparison and skips the hook when it differs, so
`just initialize` is safe to run anywhere.

Git keeps one `.git/hooks` directory and shares it across every worktree of the
repository. The installed hook records an absolute path into the virtual environment of the
worktree that installed it, and `just install-hooks` passes `--overwrite`, so installing
from here silently replaces the hook that every other worktree also commits through. Remove
this worktree afterwards and that path no longer exists, so commits fail everywhere until
somebody reinstalls the hook by hand. Install it from the primary clone, once.

Nothing warns you at the time. The hook installs cleanly, this worktree commits happily,
and the breakage surfaces somewhere else, later.

## Every day

```console
just dev
```

Vite serves the site with hot module replacement. There is no backend to start, no
database to bring up and no proxy to configure; the browser talks to Vite and to nothing
else.

The front door is one route, and it shows a component in one state. To see the other
appearances of that component — themes, high contrast, reduced motion — open the workshop
rather than reloading the page:

```console
just storybook
```

See [Work in the component workshop](work-in-the-component-workshop.md).

To see what the production build actually serves, build first and then preview:

```console
just frontend-build
just preview
```

The build serves at `/`, and that is the whole of it. This repository publishes nothing:
there is no staging step and no base path to set, because the domain root still belongs to
Poodl — see
[The domain root stays with Poodl](../decisions/0012-the-domain-root-stays-with-poodl.md).

## Before handing work back

```console
just fix       # formats and applies the safe automatic repairs
just check     # the whole gate, read-only
```

Every check is read-only, and `just check` proves it by comparing the worktree before and
after each recipe. `just fix` is the repair command to reach for, though not the only one that
writes: `just format` and the lock recipes do too, and
[Commands](../reference/commands.md) is the list.

## Keeping the workspace current

After pulling, re-sync so the installed dependencies match the lockfiles:

```console
just sync
```

That covers the two lockfiles and nothing else. If a pull moves the pinned `allium`
version, or the `playwright` pin that decides the browser, rerun `just install-allium` or
`just storybook-browsers` yourself; sync will not notice.

## Related pages

- [Commands](../reference/commands.md)
- [Test and debug](test-and-debug.md)
- [Work in the component workshop](work-in-the-component-workshop.md)
- [Troubleshooting](../operations/troubleshooting.md)
