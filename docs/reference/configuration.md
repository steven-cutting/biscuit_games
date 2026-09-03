---
title: "Configuration"
kind: "reference"
audience: [contributor, maintainer, operator, agent]
canonical_for: [configuration_reference]
requires: []
---

# Configuration

There is no runtime configuration. A static site has no process to configure, so
everything below is read at build time or is a fixed part of the source.

## Build-time environment

| Variable | Default | Effect |
| --- | --- | --- |
| `BASE_PATH` | empty | Where the hub would sit inside a domain. Read into `paths.base` by `svelte.config.js`. Nothing in this repository sets it, and nothing is meant to. |

That is the whole list for the site. SvelteKit's `PUBLIC_` convention is available but
unused: a value baked into a public static bundle is not configuration, it is a constant,
and constants belong in source where they can be reviewed.

### The base path

`BASE_PATH` is unset everywhere, which is a decision rather than an omission. This repository
publishes nothing — there is no Pages workflow, no `site-root/` and no staging script, and
the recipes `stage` and `stage-preview` do not exist here — because the domain root still
belongs to Poodl. That is
[decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md), and
`svelte.config.js` says so in a comment where a reader will find it.

The hook is kept so that adopting an address later is a workflow change rather than a
config change: one place to set a variable, not a build to re-reason about. Until then
`paths.base` is the empty string, `just frontend-build` produces a directory of files that
mounts at `/`, and nothing uploads it. SvelteKit emits relative asset URLs, so the build
is portable across base paths — see [Architecture](../explanation/architecture.md).

If you set the variable locally to see what a mounted build looks like, it belongs on the
preview as well as on the build. `svelte.config.js` reads it when the build is generated
and again when `just preview` decides where to mount the output, so a value given to one
and withheld from the other serves the site at a path the build was not made for. That is
an experiment, not a deployment. There is nothing here to deploy to.

## Tooling environment

Two variables are read by tools rather than by the build, and neither reaches the bundle.

| Variable | Read by | Effect |
| --- | --- | --- |
| `CHROMATIC_PROJECT_TOKEN` | `just chromatic` | Which Chromatic project the workshop publishes to. Export it locally; CI supplies it from the repository secret of the same name. Without it the recipe fails rather than publishing somewhere unexpected. |
| `STORYBOOK_DISABLE_TELEMETRY` | Storybook | Exported as `1` by the `Justfile`, because `just check` builds the workshop. It is the belt; `core.disableTelemetry` in `.storybook/main.ts` is the primary lever. |

The token is the only secret this repository has, and it is deliberately not written into
a file — see [Security model](../explanation/security-model.md). No Chromatic project
exists yet, so the CI secret is unset. The workflow reads it, records a notice that it is
missing and skips the publish, so a push to `main` does not go red over a publish nobody
asked for.

## Configuration files

| File | Governs |
| --- | --- |
| `svelte.config.js` | The static adapter, preprocessing, and the base path. |
| `vite.config.ts` | The dev server, the jsdom unit suite, and the coverage thresholds. |
| `vitest.config.ts` | Names both suites as projects and nothing else. It exists so the Storybook UI's test runner, which finds its configuration by filename, resolves the story project instead of failing on the unit one. |
| `tsconfig.json` | Strict TypeScript, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `isolatedModules` and `checkJs`. |
| `eslint.config.js` | Flat config over the recommended, `strictTypeChecked`, Svelte and Storybook presets, with type-aware linting turned off for plain JavaScript and the config files. It declares no rule overrides of its own. |
| `.storybook/main.ts` | Where stories are found, which addons load, the SvelteKit framework, telemetry off, and the dev server's permission to serve `stories/`. |
| `.storybook/preview.ts` | The design tokens, the four appearance toolbar globals, and the axe run applied to every story. |
| `vitest.storybook.config.ts` | The story run: browser mode, Chromium, axe. It declares no coverage block, and the run that measures the floor pins `vite.config.ts`, so a story cannot affect the number. |
| `chromatic.config.json` | Visual review: the build script to call, that a change reports rather than fails, and that `main` accepts its own changes as the new baseline. It holds no token. |
| `.prettierrc.json` | 100 columns, single quotes, no trailing commas, Svelte block order. |
| `.prettierignore` | Notably excludes Markdown, which markdownlint owns, and `docs/manifest.yml`, which is strict JSON despite the extension and which Prettier would rewrite as YAML. |
| `.markdownlint-cli2.jsonc` | Markdown rules, including the exemptions the documentation contract needs. |
| `.editorconfig` | Whitespace. LF, UTF-8, two spaces, four for the `Justfile` and the specifications. |
| `pyproject.toml` | The pinned Python tooling, Ruff's rules, and the `typos` exclusions. |
| `lychee.toml` | Link checking. |
| `.pre-commit-config.yaml` | The read-only gate. Installed as the hook. |
| `.pre-commit-fix.yaml` | The mutating counterpart. Run only by `just fix`. |

### Storybook appearance globals

Set from the workshop toolbar, or pinned by a story with a `globals` prop. The attributes
go on the preview document's root element, because `src/app.css` keys every palette on
`:root`. Together they make the inputs to `appearance.allium`'s `Appearance` surface
adjustable, which is how a component is inspected in all four combinations of theme and
high contrast.

| Global | Values | Effect |
| --- | --- | --- |
| `theme` | `system`, `light`, `dark` | `system` removes `data-theme` so the device preference decides; the other two set it. |
| `highContrast` | `off`, `on` | `on` sets `data-high-contrast="true"`, which selects the high-contrast palette for whichever theme is showing. |
| `animations` | `on`, `off` | `on` sets `data-animations="on"`, the only selector under which the motion durations are anything but `0ms`. |
| `reducedMotion` | `follow`, `reduce` | `reduce` injects a stylesheet that freezes declarative motion, and removes `data-animations` whatever the animations global says — the device wins, which is `Appearance.animations_active`. A simulation: nothing inside the page can change what `prefers-reduced-motion` reports. |

## Values the specifications decide

`docs/specs/` holds one module, `appearance.allium`, and it declares one `config` block.
These are not tunables: they are the two WCAG 2.2 AA bars, and the specification is the
only place they are declared.

| Entry | Value | Bounds |
| --- | --- | --- |
| `minimum_text_contrast` | 4.5 | Text on any control the reader can operate, and body copy, against what is behind it |
| `minimum_boundary_contrast` | 3.0 | A control's boundary against the page, where it draws one |

No TypeScript module mirrors them. `src/lib/config.ts` was not ported, and with `src/` a
skeleton there is nothing here for the figures to configure — see
[Layering](../explanation/layering.md). Nor does anything recompute a ratio:
`tests/contrast.test.ts` was not ported either, so both numbers are figures this
repository states and a consumer proves. Whether `src/app.css` meets them is an inherited
claim from Poodl's gate, not a measurement taken here.

What follows from that is a working rule rather than a gate. A change to a colour token
carries its own arithmetic, computed by hand against these two floors and recorded beside
the token — [Design tokens](../design/tokens.md) states the terms. The guarantee that
names them, `EveryCombinationMeetsTheLegibilityFloor`, holds in all four combinations of
theme and high contrast, and in this repository it is met by reading.

## Version pins

Exact versions, no ranges. Node and npm are additionally constrained by `engines` and
recorded in `volta` in `package.json`; Python by `.python-version`. See
[Maintain dependencies](../how-to/maintain-dependencies.md).

Two dependencies are outside that scheme, because no lockfile can name a binary. The
browser the story run drives is downloaded by Playwright into a cache outside the
repository; its version follows the `playwright` pin and appears in neither lockfile. The
`allium` checker is pinned by version and checksum in `scripts/install_allium.py` and
installed into the ignored `.tools/bin/` — that is
[decision 0007](../decisions/0007-project-managed-allium-cli.md).

## Related pages

- [Commands](commands.md)
- [Quality gates](quality-gates.md)
- [Design tokens](../design/tokens.md)
- [Decision 0012: The domain root stays with Poodl](../decisions/0012-the-domain-root-stays-with-poodl.md)
