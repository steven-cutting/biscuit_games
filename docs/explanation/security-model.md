---
title: "Security model"
kind: "explanation"
audience: [user, contributor, maintainer, operator, agent]
canonical_for: [security_model]
requires: []
---

# Security model

The hub has no server, no accounts and no data about anyone. It renders a page and points
away from itself, and it is published nowhere at all. That removes most of the attack
surface a web application usually has, and it is worth being precise about what remains
rather than claiming the problem away.

## What there is to protect

Very little, and that is the point.

- **Nothing is collected.** No analytics, no telemetry, no error reporting, no cookies.
  Nothing leaves the browser.
- **Nothing is stored remotely.** There is nowhere to upload anything to. Nothing is
  stored on the device either: the front end is a skeleton with no persistence, and
  `docs/specs/appearance.allium` describes appearance settings that no code here reads or
  writes. A game that keeps state keeps it in that game's own code and in the visitor's
  own browser.
- **There are no credentials in the product.** No sign-in, no tokens, nothing secret in
  the build or the bundle. The `ripsecrets` gate exists to keep it that way. The
  repository has exactly one secret and it belongs to the toolchain, not to the site: a
  Chromatic project token, held as a GitHub Actions secret and read from the environment,
  written into no file here. No Chromatic project exists yet, so the secret is not set;
  the workflow reports its absence and skips the publish rather than going red over a
  publish nobody asked for.

There is no visitor data here to lose and no procedure for handling any, because there is
none to handle. What this repository holds that matters is the toolchain's one secret and
the integrity of what it builds. The scope that says so is
[Purpose and scope](../project/purpose-and-scope.md).

## Nothing is deployed

The hub deploys nothing. There is no address, no host and no deployment credential, so
there are no deployment scopes to defend: no workflow here holds `pages: write` or
`id-token: write`, because there is no Pages workflow to hold them. `just frontend-build`
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
  font or image — both typefaces are committed and served from the same origin as
  everything else — so there is nothing to subvert between a host and the browser.

## What citation does not defend

Shared material travels by citation rather than as a package, which is
[Decision 0002](../decisions/0002-shared-material-travels-by-citation.md). Nothing is
distributed, so there is no published artefact for anyone to tamper with and no
build-time coupling in either direction — and equally, no way to push a correction. A fix
made here reaches a game when somebody in that repository copies it across, and this
repository cannot run that repository's gate to find out whether they have. That is a
property to know rather than a hole to close, and it is why the proof obligation sits with
the copy rather than with the citation.

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
