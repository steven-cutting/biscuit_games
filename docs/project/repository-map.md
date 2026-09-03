---
title: "Repository map"
kind: "project"
audience: [contributor, maintainer, agent]
canonical_for: [repository_layout]
requires: []
---

# Repository map

The site sits at the repository root. There is no `frontend/` directory because there is
no backend to be a sibling of.

`src/` is a skeleton, and deliberately so: one route, one component, and `src/app.css`,
which is the artefact this repository exists for. The toolchain around it came over from
Poodl whole, so the checkers, the workshop and the specifications look larger than the
application they guard. That is the intended shape; see
[decision 0011](../decisions/0011-skeleton-not-a-second-application.md).

```text
.
├── AGENTS.md            Engineering conventions and the agent working agreement
├── CLAUDE.md            One line, deferring to AGENTS.md
├── Justfile             Every supported command
├── package.json         The site: Svelte, SvelteKit, Vite, Vitest, Storybook
├── pyproject.toml       Repository tooling only: prek and ruff
├── src/
│   ├── app.css          The design system: every token, and the @font-face blocks
│   ├── app.d.ts         SvelteKit's ambient types
│   ├── app.html         The page shell
│   ├── lib/
│   │   ├── assets/
│   │   │   └── fonts/   Two committed variable faces, and their licence texts
│   │   └── components/  PascalCase Svelte components; Wordmark.svelte is the only one
│   └── routes/          One route, prerendered: the front door
├── tests/               Vitest suites, never colocated with src/
├── stories/             Svelte CSF stories, one per component
├── static/              Copied verbatim into the build: .nojekyll, and nothing else
├── scripts/             The repository checkers, the installers, the Allium wrapper
├── docs/                This handbook, plus specs/
├── .agents/skills/      Canonical agent procedures, ten of them
├── .claude/skills/      A bridge per skill, each deferring to .agents/
├── .codex/skills/       The same bridge, for a different reader
├── .github/workflows/   The same checks in CI, and the Chromatic publish
└── .storybook/          The component workshop, served and built locally
```

Other directories appear once the tools have run, and none of them are tracked:
`.tools/bin/` holds the pinned Allium binary, and `build/`, `coverage/` and
`storybook-static/` hold output. They are gitignored because `just check` snapshots the
worktree between recipes, and a generated file Git can see aborts the run before the
recipe's own exit code is read.

## What each part is responsible for

| Path | Responsibility |
| --- | --- |
| `src/app.css` | The token vocabulary, the `@font-face` blocks and the four combinations of theme and high contrast. This is the platform's design system and the reason the repository exists; [Design tokens](../design/tokens.md) is the page that owns it. |
| `src/lib/assets/` | Vendored fonts with their licence texts, per [decision 0010](../decisions/0010-biscuit-games-design-system.md); provenance sits in the `src/app.css` header. |
| `src/lib/components/` | Rendering and interaction. Components take callbacks as props and hold no application state of their own. There is one today, and nothing lands here without a test and a story. |
| `src/routes/` | Assembling components into pages, and the only place a store would be built. Prerendered, so nothing here may assume a request. |
| `tests/` | Vitest suites named for what they cover, not for the file they mirror. |
| `stories/` | Every state of a component, as something that can be looked at. Rendered in Chromium with axe over each. |
| `static/` | Copied verbatim into the build. It holds `.nojekyll` and nothing else, and that one file is what keeps the directory in Git: `.storybook/main.ts` names `../static` in `staticDirs`, and Storybook treats a listed static directory that does not exist as an error. Nothing publishes the file today. |
| `scripts/` | `validate_docs.py`, `validate_agents.py`, `run_project_check.py`, `run_ripsecrets_redacted.py`, `install_allium.py`, `run_allium.py`, `check_playwright_browsers.js` and `initialize.sh`. |
| `docs/specs/` | The Allium specifications. Shared behaviour is decided here, not in code. One module today, `appearance.allium`, and it imports nothing. |
| `.agents/skills/` | The ten agent procedures, canonical. `.claude/skills/` and `.codex/skills/` mirror them one file per skill, each pointing at the `.agents/` original and adding nothing of its own. |
| `.storybook/` | The workshop's configuration. Served locally, and built both by the gate, which discards it, and by `just chromatic`, which publishes it. |

Which of these may import which is not a matter of taste; see
[Layering and dependency direction](../explanation/layering.md).

## What is not here

The absences are as deliberate as the contents, and describing any of them as present is
wrong rather than merely early.

- No `src/lib/app/`, `src/lib/domain/` or `src/lib/ports/`. The hub holds no rules and
  touches no browser global. Ports are a standing rule for the first side effect that
  arrives, not a description of existing code; see
  [decision 0005](../decisions/0005-ports-and-fakes.md).
- No `src/lib/data/`. Word lists belong to the game that plays them.
- No `site-root/`, no staging script, no Pages workflow and no `BASE_PATH`. Nothing here
  is published, and the domain root stays with Poodl; see
  [decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md).
- No `tests/contrast.test.ts`. It has not been ported, so nothing in this repository
  recomputes a contrast ratio, and every figure quoted in `src/app.css` is an inherited
  claim rather than a measurement.

## Related pages

- [Purpose and scope](purpose-and-scope.md)
- [What the hub owns](what-the-hub-owns.md)
- [Architecture](../explanation/architecture.md)
- [Commands](../reference/commands.md)
