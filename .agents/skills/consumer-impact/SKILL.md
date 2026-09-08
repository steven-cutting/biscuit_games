---
name: consumer-impact
description: Work out what a change here breaks in a game repository that consumes it.
---

# Work out the cost to a consumer

1. Read `AGENTS.md`, `docs/project/what-the-hub-owns.md` and `docs/reference/published-artefacts.md`. Distribution has two halves and they fail differently: files travel as `@steven-cutting/biscuit-games` at a version, and pages travel as citations nothing resolves.
2. Sort what the change moved into those two halves. In the package: token names and values, component props and accessible names, the exported entry points, the typefaces, and the text of all three Allium modules — `appearance.allium`, `operation.allium` and `play-surfaces.allium` — each of which the package ships. Outside it: page paths, heading anchors, `canonical_for` topic slugs, and the published addresses themselves.
3. For the packaged half, name the version. A rename or a removal is major, an addition is minor, a value change is minor because it needs looking at. The table in `docs/reference/published-artefacts.md` decides, not your sense of how large the change felt.
4. Remember what a version does not do. It speaks to a consumer that took the bump and says nothing to one that did not. A game sitting on an old release is not protected, it is behind, and only its own gate can tell it so.
5. For the other half nothing has changed. A renamed page or a moved anchor is still a link that rots silently: the documentation contract skips `https://` links entirely, the offline link checker skips them too, and only `just check-links-online` resolves them — by hand, monthly. The same is true of a `@guarantee` a game restates, because Allium has no cross-repository import and shipping the module does not give it one.
6. Find the consumer. Poodl is the only one today, and `docs/operations/poodl-handover.md` is the ledger. Check whether the item is one a release now settles — a copied stylesheet, a copied Appearance surface, a copied typeface — because those are debts a version can retire rather than repeat.
7. Write each finding into `docs/operations/poodl-handover.md` in that page's own register — narrative prose grouped by shape, never a checkbox — naming the file to change, the value to change it to, and which release carries it. Do not edit another repository: that needs explicit authorization for each action, and this repository records rather than acts.
8. Run `just check-docs`, then `just check`. If a published surface moved, the change is not finished until `CHANGELOG.md` and the version in `package.json` agree with what `docs/reference/published-artefacts.md` says the level should be.
