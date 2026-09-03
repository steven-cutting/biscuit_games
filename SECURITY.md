# Security policy

## Reporting a vulnerability

Report suspected vulnerabilities privately, through GitHub's private vulnerability
reporting on this repository. Please do not open a public issue for anything you believe
is exploitable.

Include what you did, what happened, and what you expected. A link that reproduces the
behaviour is worth more than a description of it.

## Supported versions

There are no released versions to support and no backports. This repository publishes
nothing today; a fix lands on `main` and stands there.

## What is in scope

- Credential material committed to the repository.
- A dependency or GitHub Action that has been tampered with, or a lockfile that does not
  match its manifest.
- A flaw in the workflow permissions that would let a build publish something it should
  not, or reach a secret it should not.

## Out of scope

- Denial of service against GitHub.
- Anything a person can do to their own browser.

## What this project already does

- No server, no accounts, no database, and no data collected about anyone.
- No external scripts, fonts or images at runtime; both typefaces are committed and served
  from the same origin as everything else.
- Every dependency pinned to an exact version and locked; `just lock-check` fails if a
  manifest and its lockfile disagree.
- The Allium checker is pinned by version and SHA-256 rather than fetched by tag.
- Every GitHub Action pinned to a commit SHA rather than a mutable tag.
- Continuous integration runs with `contents: read`. One workflow holds a secret — the
  Chromatic visual review — and it lives in its own file.
- `ripsecrets` scans every commit, with its output suppressed so a match never copies the
  matched value into a log.

The reasoning behind all of this is in
[Security model](docs/explanation/security-model.md).
