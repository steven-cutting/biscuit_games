---
title: "Security model"
kind: "explanation"
audience: [user, contributor, maintainer, operator, agent]
canonical_for: [security_model]
requires: []
---

# Security model

The hub has no server, no accounts and no data about anyone. It renders a page and points
away from itself, and the site itself is published nowhere. What this repository does publish
is a package and a component workshop, neither of which is the site and neither of which holds
anything about anyone. That removes most of the attack
surface a web application usually has, and it is worth being precise about what remains
rather than claiming the problem away.

## What there is to protect

Very little, and that is the point.

- **Nothing is collected.** No analytics, no telemetry, no error reporting, no cookies.
  Nothing leaves the browser.
- **Nothing is stored remotely.** There is nowhere to upload anything to. Nothing is stored
  on the device either: the front end has no persistence, and the appearance settings
  `docs/specs/appearance.allium` describes are stored nowhere here. The one thing code reads
  is the device's own preferences, through `src/lib/ports/preferences.ts`, and it writes
  nothing back. A game that keeps state keeps it in that game's own code and in the
  visitor's own browser.
- **There are no credentials in the product.** No sign-in, no tokens, nothing secret in
  the build or the bundle. The `ripsecrets` gate exists to keep it that way. The
  repository has exactly one secret and it belongs to the toolchain, not to the site: a
  Chromatic project token, held as a GitHub Actions secret and read from the environment,
  written into no file here. It is set, and builds publish. The workflow still reports the
  token's absence and skips the publish rather than going red over a publish nobody asked
  for, which is the path a fresh fork or a revoked secret takes.

There is no visitor data here to lose and no procedure for handling any, because there is
none to handle. What this repository holds that matters is the toolchain's one secret and
the integrity of what it builds. The scope that says so is
[Purpose and scope](../project/purpose-and-scope.md).

## Nothing is deployed

The hub deploys nothing. There is no address, no host and no deployment credential, so
there are no deployment scopes to defend: no workflow here holds `pages: write` or
`id-token: write`, because there is no Pages workflow to hold them. One workflow does hold a
write scope, and it is not a deployment one: the release workflow takes `packages: write` to
publish the package, using the run's own token rather than a stored credential. `just frontend-build`
produces a directory of files and nothing uploads it. The domain root the platform will
eventually want still belongs to Poodl, and the whole of that reasoning is
[Decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md). When the root
moves here, this is the first section that has to change.

## What the build defends

- **Supply chain.** Every dependency is pinned exactly and locked; `just lock-check`
  fails if a manifest and its lockfile disagree. The Allium binary is pinned by version
  and SHA-256 rather than fetched by tag. GitHub Actions are pinned to commit SHAs, not
  to mutable tags.
- **Workflow permissions.** Continuous integration runs with `contents: read` and nothing
  more. Only the Chromatic workflow holds anything beyond it — `issues: write` and
  `pull-requests: write` — which it needs to react to the comment that summoned it and to
  answer that comment afterwards. Both names are load-bearing: a pull request's
  conversation is an issue, so the endpoints are `issues/*`, while the resource the token
  is weighed against is the pull request. Each workflow declares its own scopes in its own
  file, so they are visible rather than inherited.
- **The comment trigger.** `/chromatic` on a pull request starts a job holding the
  Chromatic token, and an `issue_comment` workflow always runs against the base
  repository with its secrets — including when the comment sits on a fork's pull request.
  Two checks stand between the comment and the token, and they answer different questions.
  *Who asked* is the commenter's effective repository permission, queried and required to
  be write or better. `author_association` is a prefilter and never the authority: it
  reports a relationship, so an organisation member or a triage-level collaborator reports
  a value that sounds like authority and is not. It is worth keeping only because it is a
  superset of write access, which stops a stranger starting a runner at all.
  *Whose code runs* is the head repository: a cross-repository head is refused outright,
  because `just sync` would otherwise run that fork's install scripts beside the token,
  and a person deciding to type the word is not isolation. Both are settled in a job that
  checks nothing out and holds no secret, and the publishing job does not start until they
  pass.
- **Credential leakage.** `ripsecrets` scans every commit, and its output is suppressed so
  a match never copies the matched value into a log.
- **Third-party content at runtime.** There is none. The site loads no external script,
  font or image — both typefaces and the icon set are committed and served from the same
  origin as everything else, and every icon is inlined through `{@html}` from
  repository-owned SVG and never from input — so there is nothing to subvert between a
  host and the browser.

## What a version does not defend

Files travel as a package now, which is
[Decision 0013](../decisions/0013-shared-material-travels-as-a-package.md), and that
reverses the direction of the risk. There is a published artefact, so there is something to
tamper with; and this repository can push code into a game's build, so a compromise here
reaches a game's build machine rather than only its rendered page. What guards it is
narrow and worth stating: the artefact is built by a workflow here from a tagged commit,
with the run's own token rather than a stored one, over dependencies pinned exactly and
actions pinned to commit SHAs. The package ships no install script, so a consumer executes
nothing on install.

Two sharper edges are worth naming rather than implying. A tag-triggered publish is exactly
as strong as who may push a tag, and the default branch carries a ruleset that is currently
disabled — so today the answer is the owner alone, and adding a collaborator with write
access would silently add a publisher. And a consumer's read token is a long-lived
credential living in another repository; it belongs on the rotation list beside
`check-links-online`.

What has not changed is the half that never was a file. A page path, a heading anchor, a
topic slug and the prose of a guarantee still cross the boundary as text, and this
repository still cannot run a game's gate to find out whether a fix reached it. A consumer
that never takes the bump is a consumer that never took the fix. That is a property to know
rather than a hole to close, and it is why the proof obligation still sits with the
repository that renders.

## What is out of scope

Denial of service against GitHub's own infrastructure, and anything an attacker can do to
their own browser. There is no shared state and no address being served, so nothing one
visitor does can affect another.

## Reporting

See `SECURITY.md` at the repository root.

## Related pages

- [Architecture](architecture.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
- [Quality gates](../reference/quality-gates.md)
- [Decision 0012: The domain root stays with Poodl](../decisions/0012-the-domain-root-stays-with-poodl.md)
