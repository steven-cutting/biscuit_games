---
name: consumer-impact
description: Work out what a change here breaks in a game repository that consumes it.
---

# Work out the cost to a consumer

1. Read `AGENTS.md` and `docs/project/what-the-hub-owns.md`. Nothing here is published or imported: a game repository holds copies and cites them, so drift is possible and silent.
2. List what the change moved: token names and values, component props and accessible names, `@guarantee` clauses, page paths, heading anchors, and `canonical_for` topic slugs. A slug is what a cross-repository reference names, so renaming one breaks a link nothing here checks.
3. For each, find the consumer. Poodl is the only one today, and `docs/operations/poodl-handover.md` is the ledger.
4. Classify each as silent (a renamed token resolving to nothing), loud (a failing test over there), or cosmetic. Silent is the one worth writing down.
5. Remember what checks what. The documentation contract skips `https://` links entirely, the offline link checker skips them too, and only `just check-links-online` resolves them — by hand, monthly.
6. Write each finding into the handover page as a checklist item naming the file to change and the value to change it to. Do not edit another repository: that needs explicit authorization for each action, and this repository records rather than acts.
7. Run `just check-docs`, then `just check` before handoff.
