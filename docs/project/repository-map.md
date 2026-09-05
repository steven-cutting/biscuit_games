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

`src/` is one route and the design system: `src/app.css`, the platform primitives under
`src/lib/components/`, the port that reads the device and the domain that derives
appearance from it. The toolchain came over from Poodl whole, and so, by
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md), did the primitives;
the site is still one page, which is the part of
[decision 0011](../decisions/0011-skeleton-not-a-second-application.md) that stands.

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
│   │   │   ├── fonts/   Two committed variable faces, and their licence texts
│   │   │   └── icons/   The 22 restroked Lucide SVGs, and their licence text
│   │   ├── components/  PascalCase Svelte components, and icons.ts, the icon map
│   │   ├── domain/      The appearance derivations, and the ThemeChoice type
│   │   ├── ports/       The preferences port: interface, adapter, fake
│   │   ├── config.ts    The two floors appearance.allium declares
│   │   └── index.ts     The package's whole JavaScript surface
│   └── routes/          One route, prerendered: the front door
├── tests/               Vitest suites, never colocated with src/
├── stories/             Svelte CSF stories, one per component, plus the token sheet
├── static/              Copied verbatim into the build: .nojekyll, and nothing else
├── scripts/             The repository checkers, the installers, the Allium wrapper
├── docs/                This handbook, plus specs/
├── .agents/skills/      Canonical agent procedures, ten of them
├── .claude/skills/      A bridge per skill, each deferring to .agents/
├── .codex/skills/       The same bridge, for a different reader
├── .github/workflows/   The same checks in CI, the Chromatic publish and the package release
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
| `src/lib/assets/` | Vendored fonts with their licence texts, per [decision 0010](../decisions/0010-biscuit-games-design-system.md), with provenance in the `src/app.css` header; and the icon set with its ISC text, per [decision 0014](../decisions/0014-the-hub-holds-the-design-system.md). |
| `src/lib/components/` | Rendering and interaction. Components take callbacks as props and hold no application state of their own. Eight today — the lockup, the icon renderer and the six platform primitives — and nothing lands here without a test and a story. |
| `src/lib/domain/` | The three derivations `appearance.allium`'s `Appearance` surface states, as pure functions, and the `ThemeChoice` type. |
| `src/lib/ports/` | The preferences port: what the reader asked their operating system for, read through `matchMedia` and watched, with the fake a test injects. |
| `src/lib/config.ts` | The two contrast floors, mirrored from the specification for the contrast test to read. Not exported. |
| `src/routes/` | Assembling components into pages, and the only place a store would be built. Prerendered, so nothing here may assume a request. |
| `tests/` | Vitest suites named for what they cover, not for the file they mirror. |
| `stories/` | Every state of a component, as something that can be looked at, and the token sheet. Rendered in Chromium with axe over each; `fixtures.ts` holds the two figures the plays measure against. |
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

- No `src/lib/app/`. The hub holds no rules to reduce and no state that outlives a render;
  see [Layering](../explanation/layering.md).
- No play-surface primitives. A board, a tile, a keyboard and a result mark are a game's,
  and stay in the game that renders them; the ledger in
  [Port a design system component](../how-to/port-a-design-system-component.md) says which
  rows those are.
- No `src/lib/data/`. Word lists belong to the game that plays them.
- No `site-root/`, no staging script, no Pages workflow and no `BASE_PATH`. The hub *site*
  is published nowhere, and the domain root stays with Poodl; see
  [decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md). The package and the
  workshop are what leave this repository, and neither is the site — see
  [Published artefacts](../reference/published-artefacts.md).

## Related pages

- [Purpose and scope](purpose-and-scope.md)
- [What the hub owns](what-the-hub-owns.md)
- [Architecture](../explanation/architecture.md)
- [Commands](../reference/commands.md)
