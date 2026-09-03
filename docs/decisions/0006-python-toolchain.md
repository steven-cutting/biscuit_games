---
title: "Decision 0006: A Python toolchain in a frontend repository"
kind: "decision"
audience: [maintainer, agent]
canonical_for: [decision_python_toolchain]
requires: []
---

# Decision 0006: A Python toolchain in a frontend repository

*Ported from Poodl's decision 0004 at `c26cc4642afa6b1349db70a0f497203db3986599`, and restated for the platform. Poodl's own record stands where it is.*

## Context

Biscuit Games ships no Python. The hook gate it inherits runs on `prek` under `uv`, and the
documentation and agent contracts are enforced by two Python scripts. A frontend repository
could avoid Python entirely by moving the hook runner to a Node equivalent and rewriting
both validators in TypeScript.

## Decision

Keep the Python toolchain. `pyproject.toml` declares a virtual project — `package = false`
— whose only dependencies are `prek` and `ruff`, both pinned exactly and locked in
`uv.lock`.

Ruff is added on top of the inherited gate list because the scripts under `scripts/` are
real Python that would otherwise go unlinted in a repository that gates everything else.

## Consequences

Contributors need `uv` as well as Node. `just initialize` sets both sides up in one
command, and no Python reaches the site or its build output.

The two contracts stay as they are, rather than being rewritten and re-debugged. That is
most of the value: `validate_docs.py` and `validate_agents.py` are ported from Poodl's
working implementation, so their behaviour is known rather than newly invented.

Python's footprint here is wider than those two validators, which makes the decision easier
rather than harder. `run_allium.py` is what turns `allium check` and `allium analyse` into
recipes that actually fail on a diagnostic, and `run_project_check.py` is the runner behind
`just check` itself.

`prek` brings pinned third-party hooks with it — `typos`, `lychee`, `shellcheck`,
`actionlint`, `ripsecrets`, `editorconfig-checker` — each locked to a commit SHA. Assembling
an equivalent set on Node would be a project in itself.

The cost is an extra toolchain to install, keep current, and explain. It is accepted
deliberately rather than by drift.

## What would reopen this

A Node-native hook runner with the same pinned-hook ecosystem, or the Python surface here
shrinking far enough that rewriting all of it is cheaper than keeping Python around.

## Related pages

- [Quality gates](../reference/quality-gates.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
- [Decision 0007: A project-managed Allium binary](0007-project-managed-allium-cli.md)
