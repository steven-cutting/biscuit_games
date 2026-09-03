---
title: "Work with the specifications"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [specification_workflow]
requires: []
---

# Work with the specifications

The Allium module under `docs/specs/` decides shared behaviour: what every Biscuit Games
surface owes the reader, whichever game is in front of them. This page is the procedure;
[Specifications](../explanation/specifications.md) is the reasoning.

## Find the module that owns the behaviour

| Module | Owns |
| --- | --- |
| [`appearance.allium`](../specs/appearance.allium) | The shared appearance surface: theme, high contrast and animations, how each negotiates with a preference the device has already expressed, and the legibility every combination has to reach. |

One module, and it is the platform's rather than a game's. Behaviour belonging to one game
belongs in that game's own specifications; what lands here is what every game inherits
instead of restating.

The module opens with `Scope`, `Includes`, `Excludes` and `Dependencies`. If your change
falls under `Excludes` it belongs elsewhere — the controls that change a setting to the
product that draws them, a colour value to `src/app.css`, a game's own states to the game.

It imports nothing, and that is deliberate rather than incidental: a module with no
governing import is one a game can inherit whole. It is also why the device preferences —
`prefers_dark_colour_scheme`, `prefers_reduced_motion` and `prefers_more_contrast` — are
declared as named booleans in the `given` block rather than gathered behind an external
entity. An external entity in a root module draws
`allium.externalEntity.missingSourceHint`, precisely because there is no governing
specification for it to have come from. The checker is right, so the shape is what has to
give. Keep it that way as the module grows: three named booleans say where a value comes
from as well as an entity would, and they say it without a warning attached.

## Change behaviour

1. Change the specification first. Add or amend the rule, its triggers, its guards and
   its outcomes.
2. Check what depends on it. Nothing in this repository does — there is one module and it
   imports nothing — so what depends on it is the games, and no gate here can see them.
   Run the `consumer-impact` skill: a changed `@guarantee` changes what a game already
   claims to satisfy. That asymmetry is
   [decision 0002](../decisions/0002-shared-material-travels-by-citation.md).
3. Derive tests from the changed clauses and confirm they fail before implementing. A
   test that is green before you write any code is either already covered or vacuous.
   Know the limit while you do it: `tests/contrast.test.ts` was not ported, so nothing
   here recomputes a contrast ratio. `config.minimum_text_contrast` and
   `config.minimum_boundary_contrast` are figures this repository states and a consumer
   proves.
4. Implement until they pass, without weakening any test. Some of what this module states
   has nothing here to implement — `src/` is a skeleton
   ([decision 0011](../decisions/0011-skeleton-not-a-second-application.md)) — and is
   answered in `src/app.css` or in a game. That is a reason to carry the change onward,
   never a reason to skip the tests this repository can run.
5. Run `just check-specs`. It fails on any diagnostic at all, whatever its severity, so
   a diagnostic is a regression: fix it, or — for a verified checker gap — waive it on the
   terms below. Then run `just analyse-specs`, which fails on a diagnostic or a finding;
   a finding cannot be waived.
6. Run `just frontend-unit`, then `just check`.

## Handle an open question

An `open question` block records a product decision nobody has made yet, so the gap is
visible rather than silently filled in. One is outstanding: whether a reader may turn high
contrast off while the device is asking for more of it. Leave it standing until somebody
entitled to answer it does.

- If your change depends on one, raise it. Do not answer it in code.
- If your change creates a new gap, add an `open question` rather than picking an answer.
- Answering one is a real change: edit the specification to state the decision and delete
  the question in the same commit.

## Tooling

The `allium` command-line tool validates and analyses these files, and this project owns a
pinned copy of it. `just initialize` installs it; afterwards, or after a version change,
`just install-allium` puts it in the gitignored `.tools/bin/`. It is a checksummed binary
rather than a package in either lockfile — see
[decision 0007](../decisions/0007-project-managed-allium-cli.md).

```console
just check-specs
just analyse-specs
```

The first runs `allium check` over every module, which reports on structure: syntax,
references, and names a module reaches for that no import defines. The second runs
`allium analyse`, which repeats every one of those diagnostics and adds process-level
findings on top — data flow, edge reachability, deadlocks, conflicts and invariants. The
`spec-change` skill in `.agents/skills/` carries the procedure for agents.

### Diagnostics and waivers

Both recipes are part of `just check`, and both run as hooks in the read-only gate, so a
commit that touches `docs/specs/` is held to them. That closes the follow-up
[decision 0007](../decisions/0007-project-managed-allium-cli.md) left open, and it means a
worktree needs `just install-allium` before `just lint` or `just check` will pass. Both are
clean on an untouched checkout: the module reports an empty `diagnostics` array and an
empty `findings` array, and both recipes print one JSON block per module and exit 0.

Neither recipe reads the exit code, because neither exit code carries what this project
means by clean. `allium check` exits 0 on an `info` diagnostic — `allium.field.unused` is
one — and `allium analyse` keys its status on findings alone, so a module that does not
parse passes it with the `error` sitting in the JSON it has just printed.
`scripts/run_allium.py` reads the arrays instead.

Either recipe reporting anything at all is therefore a regression in the change under
review. Fix it at the root. A finding cannot be waived. A diagnostic can, but only when the
diagnostic itself is wrong — the construct is valid Allium that the pinned checker cannot
resolve — and then it is waived in place:

```text
-- Why the checker is wrong here, in a sentence.
-- allium-ignore allium.reference.unknownName
```

The directive is a whole-line comment holding the full diagnostic code and nothing else —
prose on the directive line disables it, which is why the reason sits on its own line
above — and it covers only the line directly beneath it. One rule, one line, one stated
reason. Upstream documents none of this: the directive was found in the binary and
re-verified against 3.6.1, so every waiver must be re-verified whenever the pinned version
moves — see [Maintain dependencies](maintain-dependencies.md). No waiver stands in
`appearance.allium`, and none ever has.

The rest of this section is inherited rather than met here. Poodl's five modules ran into
these gaps under the same pinned 3.6.1, and they are recorded because a second module
written here may meet them again.

Where a shape can be retired rather than waived, retiring it is the better route. A surface
named in a `related:` clause across a module alias does not resolve, and the language
reference cannot be read to sanction the qualified form either: rule 31 asks only that a
surface in `related:` be defined, and no example anywhere qualifies a surface name with an
alias. Where a waiver would have asserted the checker was wrong, the honest form was prose,
and the adjacency moved into the guarantees.

The other retirement was an `allium.field.unused` on a field whose only readers sat in
another module. That waiver was legitimate — 3.6.1 counts uses within one module only, and
the language has always allowed a module to read another's fields — and it went anyway,
because the field turned out to have something to say in the module that declares it: a
guarantee stating the property the other module's guards existed to maintain, which the
specification was already true of and had asserted nowhere. Read a cross-module-only
definition twice before waiving it. The diagnostic can be wrong about the language and
still right that something is missing. Prefer both of these readings of a gap — waive only
what the reference plainly permits, and only when there is nothing truthful to say instead.

One gap is worth knowing about because it is fixed by restructuring rather than waived:
the checker sees a `.created(...)` call only when it stands alone as an ensures statement,
at 3.6.1 exactly as at 3.5.3. Bind the creation — `let thing = Thing.created(...)`, or
assign it straight into a field — and both the status it sets and every field it
establishes vanish from the checker's status scan and from the analyser's producer search.
Create unbound, and let a `.created` rule pick the entity up.

One more thing 3.6.1 changed cuts the other way. It resolves the alias but does not check
the name behind the dot, so a mistyped `other/config.minimum_text_contrst` draws nothing at
all — upstream calls field-level checking of `alias/config.field` unimplemented. A
cross-module config reference is read by eye or not at all. A local one is reported as
`allium.config.undefinedReference` from a derived value, a rule or a module-level
invariant, but not from inside an entity-level `invariant` block, so an entity invariant
naming a config value is read by eye too. The first of those cannot bite a module that
imports nothing, and returns with the second module; the second is live here the moment an
`invariant` block is added to `AppearanceSettings`.

## Related pages

- [Specifications](../explanation/specifications.md)
- [Terminology](../project/terminology.md)
- [Accessibility](../explanation/accessibility.md)
- [Decision 0004](../decisions/0004-specs-are-the-source-of-truth.md)
